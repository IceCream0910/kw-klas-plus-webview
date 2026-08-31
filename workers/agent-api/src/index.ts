import { AGENT_INSTRUCTIONS } from "./prompt";
import { AGENT_TOOLS, WRITE_TOOL_NAMES } from "./tools";
export { AgentConversation } from "./conversation";

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  OPENAI_TITLE_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  AGENT_RATE_LIMITER: { limit(input: { key: string }): Promise<{ success: boolean }> };
  AGENT_CONVERSATIONS: {
    idFromName(name: string): unknown;
    get(id: unknown): { fetch(request: Request): Promise<Response> };
  };
}

interface AgentAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

type AgentRequest =
  | { type: "message"; message: string; attachments?: AgentAttachment[]; messageId: string; assistantMessageId: string; conversationId: string; userId: string; previousResponseId?: string }
  | { type: "tool_output"; callId: string; output: unknown; assistantMessageId: string; conversationId: string; userId: string; previousResponseId: string };

const encoder = new TextEncoder();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: cors ? 204 : 403, headers: cors ?? undefined });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ ok: true, service: "klas-plus-agent-api" }, { headers: cors ?? undefined });
    }

    if (url.pathname === "/v1/conversations" && request.method === "GET") {
      if (!cors) return json({ error: "Origin is not allowed" }, 403, null);
      const userId = url.searchParams.get("userId") ?? "";
      if (!validId(userId)) return json({ error: "A valid userId is required" }, 400, cors);
      const ownerKey = await hashIdentifier(userId);
      return userIndexRequest(env, ownerKey, { action: "list", ownerKey }, cors);
    }

    const historyMatch = url.pathname.match(/^\/v1\/conversations\/([a-zA-Z0-9-]{16,80})$/);
    if (historyMatch && ["GET", "PATCH", "DELETE"].includes(request.method)) {
      if (!cors) return json({ error: "Origin is not allowed" }, 403, null);
      let userId = url.searchParams.get("userId") ?? "";
      let title = "";
      if (request.method === "PATCH") {
        try {
          const patch = await request.json() as { userId?: string; title?: string };
          userId = patch.userId ?? "";
          title = patch.title?.trim() ?? "";
        } catch {
          return json({ error: "Invalid request" }, 400, cors);
        }
      }
      if (!validId(userId)) return json({ error: "A valid userId is required" }, 400, cors);
      const ownerKey = await hashIdentifier(userId);
      if (request.method === "GET") return conversationRequest(env, historyMatch[1], { action: "history", ownerKey }, cors);
      if (request.method === "PATCH") {
        if (!title || title.length > 48) return json({ error: "title must contain 1 to 48 characters" }, 400, cors);
        return userIndexRequest(env, ownerKey, {
          action: "rename_index", ownerKey, conversationId: historyMatch[1], title
        }, cors);
      }
      const removed = await conversationRequest(env, historyMatch[1], { action: "delete_conversation", ownerKey });
      if (!removed.ok) return json({ error: "Conversation could not be deleted" }, removed.status, cors);
      return userIndexRequest(env, ownerKey, {
        action: "delete_index", ownerKey, conversationId: historyMatch[1]
      }, cors);
    }

    if (url.pathname !== "/v1/agent/stream" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }
    if (!cors) return json({ error: "Origin is not allowed" }, 403, null);
    if (!env.OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY is not configured" }, 503, cors);

    let body: AgentRequest;
    try {
      body = await request.json() as AgentRequest;
      validateRequest(body);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid request" }, 400, cors);
    }

    const ownerKey = await hashIdentifier(body.userId);
    const rateLimit = await env.AGENT_RATE_LIMITER.limit({ key: ownerKey });
    if (!rateLimit.success) return json({ error: "Too many agent requests" }, 429, cors);

    if (body.type === "message") {
      const stored = await conversationRequest(env, body.conversationId, {
        action: "append",
        ownerKey,
        message: {
          id: body.messageId,
          role: "user",
          content: body.message.trim(),
          attachments: (body.attachments ?? []).map(({ name, mimeType }) => ({ name, mimeType })),
          createdAt: Date.now()
        }
      });
      if (!stored.ok) return json({ error: "Conversation could not be saved" }, stored.status, cors);
      await userIndexRequest(env, ownerKey, {
        action: "upsert_index",
        ownerKey,
        conversation: { id: body.conversationId, title: "새 대화", updatedAt: Date.now() }
      });
    }

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toOpenAIRequest(body, env.OPENAI_MODEL ?? "gpt-5.6-terra", ownerKey))
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      return json({ error: "OpenAI request failed", detail: detail.slice(0, 1000) }, upstream.status, cors);
    }

    return new Response(normalizeOpenAIStream(upstream.body, async (content, responseId, hasPendingTool) => {
      const payload = content
        ? { action: "append", ownerKey, latestResponseId: responseId,
            message: { id: body.assistantMessageId, role: "assistant", content, createdAt: Date.now() } }
        : { action: "set_response", ownerKey, latestResponseId: responseId };
      await conversationRequest(env, body.conversationId, payload);
      if (content && !hasPendingTool) {
        try {
          await refreshConversationTitle(env, body.conversationId, ownerKey);
        } catch (error) {
          console.warn("Conversation title generation failed", error);
        }
      }
    }), {
      headers: {
        ...cors,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no"
      }
    });
  }
};

function toOpenAIRequest(body: AgentRequest, model: string, safetyIdentifier: string) {
  const input = body.type === "message"
    ? [{ role: "user", content: messageContent(body) }]
    : [{ type: "function_call_output", call_id: body.callId, output: JSON.stringify(body.output) }];

  return {
    model,
    instructions: `${AGENT_INSTRUCTIONS}\n\n${currentTimeInstruction()}`,
    input,
    tools: AGENT_TOOLS,
    tool_choice: "auto",
    parallel_tool_calls: false,
    stream: true,
    store: true,
    safety_identifier: safetyIdentifier,
    prompt_cache_key: safetyIdentifier,
    max_output_tokens: 2400,
    ...(body.previousResponseId ? { previous_response_id: body.previousResponseId } : {})
  };
}

function normalizeOpenAIStream(upstream: ReadableStream<Uint8Array>, onCompleted: (content: string, responseId: string, hasPendingTool: boolean) => Promise<void>) {
  let responseId: string | undefined;
  let pendingTool: { callId: string; name: string; arguments: string } | undefined;
  let outputText = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse("run.started", { status: "thinking" }));
      try {
        for await (const event of parseSse(upstream)) {
          if (event.type === "response.output_text.delta") {
            const delta = event.delta ?? "";
            outputText += delta;
            controller.enqueue(sse("content.delta", { delta }));
          } else if (event.type === "response.output_item.done" && event.item?.type === "function_call") {
            pendingTool = {
              callId: String(event.item.call_id),
              name: String(event.item.name),
              arguments: String(event.item.arguments ?? "{}")
            };
          } else if (event.type === "response.completed" || event.type === "response.incomplete") {
            responseId = event.response?.id;
          } else if (event.type === "response.failed" || event.type === "error") {
            throw new Error(event.response?.error?.message ?? event.message ?? "Model response failed");
          }
        }

        if (!responseId) throw new Error("The model response did not include an id");
        await onCompleted(outputText, responseId, Boolean(pendingTool));
        if (pendingTool) {
          controller.enqueue(sse("tool.requested", {
            responseId,
            callId: pendingTool.callId,
            name: pendingTool.name,
            arguments: safeJson(pendingTool.arguments),
            requiresApproval: WRITE_TOOL_NAMES.has(pendingTool.name)
          }));
          controller.enqueue(sse("run.completed", { status: "waiting_tool", responseId }));
        } else {
          controller.enqueue(sse("run.completed", { status: "completed", responseId }));
        }
      } catch (error) {
        controller.enqueue(sse("run.failed", {
          message: error instanceof Error ? error.message : "Streaming failed"
        }));
      } finally {
        controller.close();
      }
    }
  });
}

async function* parseSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";
      for (const block of blocks) {
        const data = block.split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (data && data !== "[DONE]") yield JSON.parse(data);
      }
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

function validateRequest(body: AgentRequest) {
  if (!body || (body.type !== "message" && body.type !== "tool_output")) throw new Error("Unknown request type");
  if (typeof body.userId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.userId)) throw new Error("A valid userId is required");
  if (!validId(body.conversationId) || !validId(body.assistantMessageId)) throw new Error("Valid conversation and message ids are required");
  if (body.type === "message" && (typeof body.message !== "string" || body.message.length > 4000)) {
    throw new Error("message must contain no more than 4000 characters");
  }
  if (body.type === "message") {
    if (!validId(body.messageId)) throw new Error("A valid messageId is required");
    const attachments = body.attachments ?? [];
    if (!body.message.trim() && attachments.length === 0) throw new Error("A message or attachment is required");
    if (!Array.isArray(attachments) || attachments.length > 3) throw new Error("Up to 3 attachments are allowed");
    attachments.forEach(validateAttachment);
  }
  if (body.type === "tool_output" && (!body.callId || !body.previousResponseId)) {
    throw new Error("callId and previousResponseId are required");
  }
}

function validateAttachment(attachment: AgentAttachment) {
  if (!attachment || typeof attachment.name !== "string" || !attachment.name.trim() || attachment.name.length > 160) {
    throw new Error("Attachment names must contain 1 to 160 characters");
  }
  if (!allowedMimeType(attachment.mimeType)) throw new Error(`Unsupported attachment type: ${attachment.mimeType}`);
  if (typeof attachment.dataUrl !== "string" || attachment.dataUrl.length > 14_000_000) throw new Error("Each attachment must be 10MB or smaller");
  const prefix = `data:${attachment.mimeType};base64,`;
  if (!attachment.dataUrl.startsWith(prefix)) throw new Error("Attachment data does not match its MIME type");
}

function allowedMimeType(mimeType: string) {
  return mimeType.startsWith("image/") || [
    "application/pdf", "text/plain", "text/markdown", "text/csv", "application/json",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ].includes(mimeType);
}

function messageContent(body: Extract<AgentRequest, { type: "message" }>) {
  const content: Array<Record<string, unknown>> = [
    { type: "input_text", text: body.message.trim() || "첨부된 파일의 내용을 확인해 주세요." }
  ];
  for (const attachment of body.attachments ?? []) {
    content.push(attachment.mimeType.startsWith("image/")
      ? { type: "input_image", image_url: attachment.dataUrl, detail: "auto" }
      : { type: "input_file", filename: attachment.name, file_data: attachment.dataUrl });
  }
  return content;
}

function currentTimeInstruction() {
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", dateStyle: "full", timeStyle: "long", hour12: false
  }).format(new Date());
  return `현재 날짜와 시간은 ${formatted} (Asia/Seoul)입니다. 상대 날짜와 시간 표현은 이 값을 기준으로 해석하세요.`;
}

async function refreshConversationTitle(env: Env, conversationId: string, ownerKey: string) {
  const historyResponse = await conversationRequest(env, conversationId, { action: "history", ownerKey });
  if (!historyResponse.ok) return;
  const history = await historyResponse.json() as { messages?: Array<{ role: string; content: string; attachments?: Array<{ name: string }> }> };
  const messages = history.messages ?? [];
  const userTurnCount = messages.filter((message) => message.role === "user").length;
  if (!userTurnCount) return;

  const indexResponse = await userIndexRequest(env, ownerKey, { action: "get_index", ownerKey, conversationId });
  if (!indexResponse.ok) return;
  const index = await indexResponse.json() as {
    conversation?: { manualTitle?: boolean; titleUpdatedTurn?: number } | null;
  };
  if (!index.conversation || index.conversation.manualTitle) return;
  const needsInitialTitle = typeof index.conversation.titleUpdatedTurn !== "number";
  const needsPeriodicRefresh = userTurnCount >= 10 && userTurnCount % 10 === 0
    && index.conversation.titleUpdatedTurn !== userTurnCount;
  if (!needsInitialTitle && !needsPeriodicRefresh) return;

  let title = "";
  try {
    title = await generateConversationTitle(env, messages);
  } catch (error) {
    console.warn("Title model returned no usable output; using a deterministic fallback", error);
    title = fallbackConversationTitle(messages);
  }
  if (!title) return;
  await userIndexRequest(env, ownerKey, {
    action: "auto_title", ownerKey, conversationId, title, titleUpdatedTurn: userTurnCount
  });
}

async function generateConversationTitle(
  env: Env,
  messages: Array<{ role: string; content: string; attachments?: Array<{ name: string }> }>
) {
  const selected = messages.length <= 30 ? messages : [...messages.slice(0, 4), ...messages.slice(-26)];
  const transcript = selected.map((message) => {
    const attachments = message.attachments?.length ? ` [첨부: ${message.attachments.map((item) => item.name).join(", ")}]` : "";
    return `${message.role === "user" ? "사용자" : "도우미"}: ${message.content.slice(0, 700)}${attachments}`;
  }).join("\n").slice(0, 18000);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENAI_TITLE_MODEL ?? "gpt-5-nano",
      instructions: "다음 광운대학교 학사 상담 대화의 핵심 주제를 나타내는 짧은 한국어 제목 하나만 작성하세요. 24자 이내로 쓰고 따옴표, 마크다운, 문장부호, 설명을 붙이지 마세요.",
      input: transcript,
      reasoning: { effort: "minimal" },
      text: { verbosity: "low" },
      max_output_tokens: 256,
      store: false
    })
  });
  if (!response.ok) throw new Error(`Title model request failed (${response.status})`);
  const result = await response.json() as {
    status?: string;
    output_text?: string;
    incomplete_details?: { reason?: string } | null;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (result.status && result.status !== "completed") {
    throw new Error(`Title response was ${result.status}: ${result.incomplete_details?.reason ?? "unknown reason"}`);
  }
  const raw = result.output_text ?? result.output?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")?.text ?? "";
  const title = raw.split(/\r?\n/)[0]
    .replace(/^(?:대화\s*)?제목\s*:\s*/i, "")
    .replace(/^[\s"'`#*]+|[\s"'`#*.,!?]+$/g, "")
    .slice(0, 48);
  if (!title) throw new Error("Title response did not contain output text");
  return title;
}

function fallbackConversationTitle(
  messages: Array<{ role: string; content: string; attachments?: Array<{ name: string }> }>
) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const source = firstUserMessage?.content.trim() || firstUserMessage?.attachments?.[0]?.name || "학사 상담";
  return source.replace(/\s+/g, " ").replace(/[\r\n]/g, " ").slice(0, 24).trim();
}

async function conversationRequest(env: Env, conversationId: string, payload: unknown, cors?: Record<string, string> | null) {
  const id = env.AGENT_CONVERSATIONS.idFromName(conversationId);
  const response = await env.AGENT_CONVERSATIONS.get(id).fetch(new Request("https://conversation.internal/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }));
  if (cors) {
    const data = await response.text();
    return new Response(data, { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
  return response;
}

function userIndexRequest(env: Env, ownerKey: string, payload: unknown, cors?: Record<string, string> | null) {
  return conversationRequest(env, `user-${ownerKey}`, payload, cors);
}

async function hashIdentifier(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validId(value: string) {
  return typeof value === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(value);
}

function corsHeaders(origin: string | null, configured?: string): Record<string, string> | null {
  if (!origin) return { "Access-Control-Allow-Origin": "*" };
  const allowed = (configured ?? "http://localhost:3000").split(",").map((value) => value.trim());
  if (!allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,GET,PATCH,DELETE,OPTIONS",
    Vary: "Origin"
  };
}

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function json(data: unknown, status: number, headers: Record<string, string> | null) {
  return Response.json(data, { status, headers: headers ?? undefined });
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return {}; }
}

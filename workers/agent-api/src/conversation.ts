import type { AgentSearchContext } from './searchContext';

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: Array<{ name: string; mimeType: string }>;
  searchContext?: AgentSearchContext;
}

interface ConversationRecord {
  ownerKey: string;
  messages: ConversationMessage[];
  latestResponseId?: string;
  pendingToolCallId?: string;
  inFlight?: { id: string; expiresAt: number };
  updatedAt: number;
}

interface ConversationIndexRecord {
  ownerKey: string;
  conversations: ConversationIndexItem[];
}

interface ConversationIndexItem {
  id: string;
  title: string;
  updatedAt: number;
  manualTitle?: boolean;
  titleUpdatedTurn?: number;
}

export class AgentConversation {
  constructor(private readonly state: any) {}

  async alarm() {
    await this.state.storage.deleteAll();
  }

  async fetch(request: Request): Promise<Response> {
    const body = await request.json() as {
      action: "history" | "append" | "set_response" | "delete_conversation" | "list" | "get_index" | "upsert_index" | "rename_index" | "auto_title" | "delete_index" | "begin_run" | "finish_run" | "abort_run" | "reserve_budget";
      ownerKey: string;
      message?: ConversationMessage;
      latestResponseId?: string;
      conversation?: ConversationIndexItem;
      conversationId?: string;
      title?: string;
      titleUpdatedTurn?: number;
      runId?: string;
      requestType?: string;
      previousResponseId?: string;
      callId?: string;
      pendingToolCallId?: string;
      perMinute?: number;
      perDay?: number;
    };
    if (body.action === 'reserve_budget') return this.reserveBudget(body.perMinute!, body.perDay!);
    if (['begin_run', 'finish_run', 'abort_run'].includes(body.action)) return this.handleRun(body);
    if (["list", "get_index", "upsert_index", "rename_index", "auto_title", "delete_index"].includes(body.action)) return this.handleIndex(body);

    const current = await this.state.storage.get("conversation") as ConversationRecord | undefined;

    if (current && current.ownerKey !== body.ownerKey) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (body.action === "delete_conversation") {
      if (current) await this.state.storage.deleteAll();
      return Response.json({ ok: true });
    }
    if (body.action === "history") {
      if (!current) {
        await this.state.storage.put("conversation", { ownerKey: body.ownerKey, messages: [], updatedAt: Date.now() } satisfies ConversationRecord);
        await this.refreshExpiry();
      }
      return Response.json({ messages: current?.messages ?? [], latestResponseId: current?.latestResponseId ?? null });
    }
    if (body.action === "set_response") {
      if (!current) return Response.json({ error: "Conversation not found" }, { status: 404 });
      await this.state.storage.put("conversation", { ...current, latestResponseId: body.latestResponseId, updatedAt: Date.now() });
      await this.refreshExpiry();
      return Response.json({ ok: true });
    }
    if (body.action !== "append" || !body.message) return Response.json({ error: "Invalid action" }, { status: 400 });

    const messages = upsertMessage(current?.messages ?? [], body.message).slice(-60);
    const next: ConversationRecord = {
      ...current,
      ownerKey: body.ownerKey,
      messages,
      latestResponseId: body.latestResponseId ?? current?.latestResponseId,
      updatedAt: Date.now()
    };
    await this.state.storage.put("conversation", next);
    await this.refreshExpiry();
    return Response.json({
      ok: true,
      messageCount: messages.length,
      userTurnCount: messages.filter((message) => message.role === "user").length
    });
  }

  private async reserveBudget(perMinute: number, perDay: number) {
    if (![perMinute, perDay].every(value => Number.isSafeInteger(value) && value > 0)) {
      return Response.json({ error: 'Invalid model budget' }, { status: 503 });
    }
    // One reserved object owns the aggregate quota across users and edge locations.
    return this.state.storage.transaction(async (storage: any) => {
      const now = Date.now();
      const minute = Math.floor(now / 60_000);
      const day = Math.floor(now / 86_400_000);
      const saved = await storage.get('modelBudget');
      const minuteCount = saved?.minute === minute ? saved.minuteCount : 0;
      const dayCount = saved?.day === day ? saved.dayCount : 0;
      if (minuteCount >= perMinute || dayCount >= perDay) {
        return Response.json({ error: 'Model request budget exhausted' }, { status: 429 });
      }
      await storage.put('modelBudget', { minute, day, minuteCount: minuteCount + 1, dayCount: dayCount + 1 });
      return Response.json({ ok: true });
    });
  }

  private async handleRun(body: {
    action: string; ownerKey: string; runId?: string; requestType?: string;
    previousResponseId?: string; callId?: string; latestResponseId?: string;
    pendingToolCallId?: string; message?: ConversationMessage;
  }) {
    const response = await this.state.storage.transaction(async (storage: any) => {
      const current = await storage.get('conversation') as ConversationRecord | undefined;
      if (current && current.ownerKey !== body.ownerKey) return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (body.action === 'begin_run') {
        if ((body.previousResponseId && body.previousResponseId !== current?.latestResponseId)
          || (body.requestType === 'tool_output' && (!current?.pendingToolCallId
            || body.callId !== current.pendingToolCallId || body.previousResponseId !== current.latestResponseId))) {
          return Response.json({ error: 'Invalid conversation continuation' }, { status: 409 });
        }
        if (current?.inFlight && current.inFlight.expiresAt > Date.now()) {
          return Response.json({ error: 'A conversation run is already in progress' }, { status: 409 });
        }
        const next: ConversationRecord = {
          ...(current ?? { ownerKey: body.ownerKey, messages: [] }),
          updatedAt: Date.now(),
          inFlight: { id: body.runId!, expiresAt: Date.now() + 5 * 60_000 }
        };
        await storage.put('conversation', next);
        return Response.json({ previousResponseId: current?.latestResponseId ?? null });
      }
      if (!current || current.inFlight?.id !== body.runId) {
        return Response.json({ error: 'Conversation run is no longer active' }, { status: 409 });
      }
      if (body.action === 'abort_run') {
        await storage.put('conversation', { ...current, inFlight: undefined });
        return Response.json({ ok: true });
      }
      await storage.put('conversation', {
        ...current,
        messages: body.message ? upsertMessage(current.messages, body.message).slice(-60) : current.messages,
        latestResponseId: body.latestResponseId,
        pendingToolCallId: body.pendingToolCallId,
        inFlight: undefined,
        updatedAt: Date.now()
      } satisfies ConversationRecord);
      return Response.json({ ok: true });
    });
    if (response.ok) await this.refreshExpiry();
    return response;
  }

  private async refreshExpiry() {
    await this.state.storage.setAlarm(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private async handleIndex(body: {
    action: string;
    ownerKey: string;
    conversation?: ConversationIndexItem;
    conversationId?: string;
    title?: string;
    titleUpdatedTurn?: number;
  }) {
    const current = await this.state.storage.get("index") as ConversationIndexRecord | undefined;
    if (current && current.ownerKey !== body.ownerKey) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (body.action === "list") return Response.json({ conversations: current?.conversations ?? [] });
    if (body.action === "get_index") {
      return Response.json({ conversation: current?.conversations.find((item) => item.id === body.conversationId) ?? null });
    }
    if (body.action === "delete_index") {
      const conversations = (current?.conversations ?? []).filter((item) => item.id !== body.conversationId);
      await this.state.storage.put("index", { ownerKey: body.ownerKey, conversations } satisfies ConversationIndexRecord);
      await this.refreshExpiry();
      return Response.json({ ok: true });
    }
    if (body.action === "rename_index" || body.action === "auto_title") {
      const existing = current?.conversations.find((item) => item.id === body.conversationId);
      if (!existing) return Response.json({ error: "Conversation not found" }, { status: 404 });
      if (body.action === "auto_title" && existing.manualTitle) return Response.json({ ok: true, skipped: true });
      const title = body.title?.trim().slice(0, 48);
      if (!title) return Response.json({ error: "A title is required" }, { status: 400 });
      const updated: ConversationIndexItem = {
        ...existing,
        title,
        manualTitle: body.action === "rename_index" ? true : existing.manualTitle,
        titleUpdatedTurn: body.action === "auto_title" ? body.titleUpdatedTurn : existing.titleUpdatedTurn
      };
      const conversations = [updated, ...(current?.conversations ?? []).filter((item) => item.id !== existing.id)]
        .sort((a, b) => b.updatedAt - a.updatedAt);
      await this.state.storage.put("index", { ownerKey: body.ownerKey, conversations } satisfies ConversationIndexRecord);
      await this.refreshExpiry();
      return Response.json({ ok: true, conversation: updated });
    }
    if (!body.conversation) return Response.json({ error: "Conversation is required" }, { status: 400 });
    const existing = current?.conversations.find((item) => item.id === body.conversation?.id);
    const conversation = existing ? { ...existing, updatedAt: body.conversation.updatedAt } : body.conversation;
    const conversations = [conversation, ...(current?.conversations ?? []).filter((item) => item.id !== body.conversation?.id)]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 30);
    await this.state.storage.put("index", { ownerKey: body.ownerKey, conversations } satisfies ConversationIndexRecord);
    await this.refreshExpiry();
    return Response.json({ ok: true });
  }
}

function upsertMessage(messages: ConversationMessage[], incoming: ConversationMessage) {
  const existing = messages.findIndex((message) => message.id === incoming.id);
  if (existing < 0) return [...messages, { ...incoming, content: incoming.content.slice(0, 24000) }];
  const next = [...messages];
  next[existing] = incoming.role === "assistant"
    ? { ...next[existing], content: `${next[existing].content}${incoming.content}`.slice(0, 24000) }
    : next[existing];
  return next;
}

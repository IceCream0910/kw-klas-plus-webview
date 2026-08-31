export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: Array<{ name: string; mimeType: string }>;
}

interface ConversationRecord {
  ownerKey: string;
  messages: ConversationMessage[];
  latestResponseId?: string;
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
      action: "history" | "append" | "set_response" | "delete_conversation" | "list" | "get_index" | "upsert_index" | "rename_index" | "auto_title" | "delete_index";
      ownerKey: string;
      message?: ConversationMessage;
      latestResponseId?: string;
      conversation?: ConversationIndexItem;
      conversationId?: string;
      title?: string;
      titleUpdatedTurn?: number;
    };
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

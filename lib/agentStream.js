import { AGENT_API_URL } from './agentConfig';

export async function streamAgent(request, { signal, onEvent }) {
    if (!AGENT_API_URL) throw new Error('Agent API 주소가 설정되지 않았습니다.');
    const response = await fetch(`${AGENT_API_URL}/v1/agent/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal
    });
    if (!response.ok || !response.body) {
        const detail = await response.text();
        throw new Error(detail || `Agent API request failed (${response.status})`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (value) buffer += decoder.decode(value, { stream: !done });
            const blocks = buffer.split(/\r?\n\r?\n/);
            buffer = blocks.pop() || '';
            blocks.forEach((block) => dispatchBlock(block, onEvent));
            if (done) {
                if (buffer.trim()) dispatchBlock(buffer, onEvent);
                break;
            }
        }
    } finally { reader.releaseLock(); }
}

export async function fetchConversation(conversationId, userId, signal) {
    if (!AGENT_API_URL) return { messages: [], latestResponseId: null };
    const response = await fetch(`${AGENT_API_URL}/v1/conversations/${encodeURIComponent(conversationId)}?userId=${encodeURIComponent(userId)}`, { signal });
    if (response.status === 404) return { messages: [], latestResponseId: null };
    if (!response.ok) throw new Error(`대화를 불러오지 못했습니다 (${response.status}).`);
    return response.json();
}

export async function fetchConversations(userId, signal) {
    if (!AGENT_API_URL) return { conversations: [] };
    const response = await fetch(`${AGENT_API_URL}/v1/conversations?userId=${encodeURIComponent(userId)}`, { signal });
    if (response.status === 404) return { conversations: [] };
    if (!response.ok) throw new Error(`대화 목록을 불러오지 못했습니다 (${response.status}).`);
    return response.json();
}

export async function renameConversation(conversationId, userId, title) {
    if (!AGENT_API_URL) throw new Error('Agent API 주소가 설정되지 않았습니다.');
    const response = await fetch(`${AGENT_API_URL}/v1/conversations/${encodeURIComponent(conversationId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title })
    });
    if (!response.ok) throw new Error(`대화 이름을 변경하지 못했습니다 (${response.status}).`);
    return response.json();
}

export async function deleteConversation(conversationId, userId) {
    if (!AGENT_API_URL) throw new Error('Agent API 주소가 설정되지 않았습니다.');
    const response = await fetch(`${AGENT_API_URL}/v1/conversations/${encodeURIComponent(conversationId)}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(`대화를 삭제하지 못했습니다 (${response.status}).`);
    return response.json();
}

function dispatchBlock(block, onEvent) {
    let event = 'message';
    const data = [];
    block.split(/\r?\n/).forEach((line) => {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    });
    if (data.length) onEvent(event, JSON.parse(data.join('\n')));
}

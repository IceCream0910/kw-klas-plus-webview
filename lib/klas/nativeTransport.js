import KlasNativeBridge from '../core/klasNativeBridge';
import { KlasApiError, isKlasMutation } from './contract';
let sequence = 0;
const active = new Set();
export function cancelNativeKlasRequests() { for (const controller of active) controller.abort(); }
export async function nativeKlasRequest(path, body, { signal: externalSignal } = {}) {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', forwardAbort, { once: true });
    if (externalSignal?.aborted) controller.abort();
    const signal = controller.signal;
    active.add(controller);
    const id = `klas-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
    const cancel = () => { try { Promise.resolve(KlasNativeBridge.cancelKlasApi(id)).catch(() => {}); } catch {} };
    const aborted = () => new DOMException('Cancelled', 'AbortError');
    if (signal.aborted) { active.delete(controller); externalSignal?.removeEventListener('abort', forwardAbort); throw aborted(); }
    let rejectAbort;
    const abortPromise = new Promise((_, reject) => { rejectAbort = reject; });
    const abort = () => { cancel(); rejectAbort(aborted()); };
    signal?.addEventListener('abort', abort, { once: true });
    const check = value => {
        if (signal.aborted) { active.delete(controller); externalSignal?.removeEventListener('abort', forwardAbort); throw aborted(); }
        if (value?.error) throw new KlasApiError(value.error, value.status);
        return value;
    };
    try {
        const request = async () => {
            const result = check(await KlasNativeBridge.requestKlasApi(id, path, JSON.stringify(body ?? null)));
            if (result?.responseId !== id || !Number.isInteger(result.chunkCount) || result.chunkCount < 1 || result.chunkCount > 700) throw new KlasApiError('INVALID_RESPONSE');
            const chunks = [];
            let size = 0;
            for (let index = 0; index < result.chunkCount; index++) {
                const chunk = check(await KlasNativeBridge.readKlasApiChunk(id, String(index)));
                if (typeof chunk !== 'string' || chunk.length > 6144 || (size += chunk.length) > 4 * 1024 * 1024) throw new KlasApiError('INVALID_RESPONSE');
                chunks.push(chunk);
            }
            return JSON.parse(chunks.join(''));
        };
        return await Promise.race([request(), abortPromise]);
    } catch (error) {
        if (isKlasMutation(path) && !error.code && error.name !== 'AbortError') throw new KlasApiError('OUTCOME_UNKNOWN');
        throw error;
    } finally { signal.removeEventListener('abort', abort); externalSignal?.removeEventListener('abort', forwardAbort); active.delete(controller); cancel(); }
}

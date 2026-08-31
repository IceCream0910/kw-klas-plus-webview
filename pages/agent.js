import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import BottomSheet from '../components/common/BottomSheet';
import { STARTER_PROMPTS } from '../lib/agentConfig';
import { executeClientTool, fetchAcademicProfile, TOOL_LABELS } from '../lib/agentClientTools';
import { deleteConversation, fetchConversation, fetchConversations, renameConversation, streamAgent } from '../lib/agentStream';
import styles from '../styles/Agent.module.css';

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILES = 'image/*,.pdf,.txt,.md,.csv,.json,.docx';
const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

const MARKDOWN_COMPONENTS = {
    a: ({ href, ...props }) => <a {...props} href={normalizeKlasHref(href)} />
};

export default function AgentPage() {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [attachmentError, setAttachmentError] = useState('');
    const [status, setStatus] = useState('restoring');
    const [approval, setApproval] = useState(null);
    const [studentName, setStudentName] = useState('');
    const [studentNameStatus, setStudentNameStatus] = useState('waiting');
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [renamingConversation, setRenamingConversation] = useState(null);
    const [renameDraft, setRenameDraft] = useState('');
    const [conversationMutationId, setConversationMutationId] = useState('');
    const [conversationMutationError, setConversationMutationError] = useState('');
    const prefersReducedMotion = useReducedMotion();
    const previousResponseId = useRef();
    const userId = useRef();
    const conversationId = useRef();
    const sessionToken = useRef('');
    const abortController = useRef();
    const approvalResolver = useRef();
    const bottomRef = useRef();
    const conversationRef = useRef();
    const isAtBottomRef = useRef(true);
    const fileInputRef = useRef();
    const profileRequestId = useRef(0);
    const profileToken = useRef('');

    const isRunning = !['idle', 'restoring'].includes(status);
    const activeAssistantId = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant')?.id, [messages]);
    const currentConversation = useMemo(() => conversations.find((item) => item.id === conversationId.current), [conversations, messages]);

    const refreshConversations = useCallback(async (signal) => {
        if (!userId.current) return;
        const result = await fetchConversations(userId.current, signal);
        setConversations(result.conversations || []);
    }, []);

    const restoreConversation = useCallback(async (id, signal) => {
        setStatus('restoring');
        isAtBottomRef.current = true;
        setShowScrollToBottom(false);
        const history = await fetchConversation(id, userId.current, signal);
        setMessages((history.messages || []).map((message) => ({ ...message, state: 'completed', steps: [] })));
        previousResponseId.current = history.latestResponseId || undefined;
        setStatus('idle');
    }, []);

    const loadStudentName = useCallback(async (token) => {
        if (!token) {
            setStudentName('');
            setStudentNameStatus('waiting');
            return;
        }
        if (profileToken.current === token) return;
        profileToken.current = token;
        const requestId = ++profileRequestId.current;
        setStudentNameStatus('loading');
        try {
            const profile = await fetchAcademicProfile(token);
            if (requestId !== profileRequestId.current) return;
            const name = typeof profile?.kname === 'string' ? profile.kname.trim() : '';
            setStudentName(name);
            setStudentNameStatus(name ? 'ready' : 'unavailable');
        } catch (error) {
            if (requestId !== profileRequestId.current) return;
            profileToken.current = '';
            setStudentName('');
            setStudentNameStatus('unavailable');
            console.warn('Student profile restore failed:', error);
        }
    }, []);

    useEffect(() => {
        sessionToken.current = localStorage.getItem('klasSessionToken') || '';
        loadStudentName(sessionToken.current);
        window.receiveToken = (receivedToken) => {
            if (!receivedToken) return;
            sessionToken.current = receivedToken;
            localStorage.setItem('klasSessionToken', receivedToken);
            loadStudentName(receivedToken);
        };
        return () => {
            window.receiveToken = undefined;
            sessionToken.current = '';
            profileRequestId.current += 1;
            approvalResolver.current?.(null);
            abortController.current?.abort();
        };
    }, [loadStudentName]);

    useEffect(() => {
        const controller = new AbortController();
        userId.current = getRybbitUserId();
        conversationId.current = getStoredId('klasAgentConversationId');
        Promise.all([restoreConversation(conversationId.current, controller.signal), refreshConversations(controller.signal)])
            .catch((error) => {
                if (error?.name !== 'AbortError') console.warn('Agent history restore failed:', error);
                setStatus('idle');
            });
        return () => controller.abort();
    }, [refreshConversations, restoreConversation]);

    const updateScrollState = useCallback(() => {
        const container = conversationRef.current;
        if (!container) return;
        const hasOverflow = container.scrollHeight > container.clientHeight + 2;
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 32;
        isAtBottomRef.current = isAtBottom;
        setShowScrollToBottom(hasOverflow && !isAtBottom);
    }, []);

    useEffect(() => {
        const container = conversationRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(container);
        updateScrollState();
        return () => observer.disconnect();
    }, [updateScrollState]);

    useEffect(() => {
        const container = conversationRef.current;
        if (container && (status === 'restoring' || isRunning || isAtBottomRef.current)) {
            isAtBottomRef.current = true;
            setShowScrollToBottom(false);
            container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
        }
        const frame = requestAnimationFrame(updateScrollState);
        return () => cancelAnimationFrame(frame);
    }, [messages, approval, status, isRunning, updateScrollState]);

    const scrollToBottom = useCallback(() => {
        const container = conversationRef.current;
        if (!container) return;
        isAtBottomRef.current = true;
        setShowScrollToBottom(false);
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
        requestAnimationFrame(updateScrollState);
    }, [updateScrollState]);

    const updateAssistant = useCallback((id, updater) => {
        setMessages((current) => current.map((message) => message.id === id ? updater(message) : message));
    }, []);
    const requestApproval = useCallback((tool) => new Promise((resolve) => {
        approvalResolver.current = resolve;
        setApproval(tool);
    }), []);
    const decideApproval = useCallback((editedArguments) => {
        const resolve = approvalResolver.current;
        approvalResolver.current = undefined;
        setApproval(null);
        resolve?.(editedArguments);
    }, []);

    const submit = useCallback(async (prompt, suppliedAttachments) => {
        const text = prompt.trim();
        const outgoingAttachments = suppliedAttachments ?? attachments;
        if ((!text && outgoingAttachments.length === 0) || status !== 'idle') return;
        const userMessageId = newId();
        const assistantMessageId = newId();
        const attachmentMetadata = outgoingAttachments.map(({ name, mimeType }) => ({ name, mimeType }));
        setDraft('');
        setAttachments([]);
        setAttachmentError('');
        setHistoryOpen(false);
        isAtBottomRef.current = true;
        setShowScrollToBottom(false);
        setMessages((current) => [...current,
        { id: userMessageId, role: 'user', content: text, attachments: attachmentMetadata, createdAt: Date.now() },
        { id: assistantMessageId, role: 'assistant', content: '', state: 'streaming', steps: [], createdAt: Date.now() }
        ]);
        setStatus('thinking');
        abortController.current = new AbortController();
        let request = {
            type: 'message', message: text,
            attachments: outgoingAttachments.map(({ name, mimeType, dataUrl }) => ({ name, mimeType, dataUrl })),
            messageId: userMessageId, assistantMessageId, userId: userId.current,
            conversationId: conversationId.current, previousResponseId: previousResponseId.current
        };

        try {
            let toolCallCount = 0;
            while (request) {
                let pendingTool;
                let runResult;
                await streamAgent(request, {
                    signal: abortController.current.signal,
                    onEvent: (event, data) => {
                        if (event === 'content.delta') {
                            setStatus('answering');
                            updateAssistant(assistantMessageId, (message) => ({ ...message, content: message.content + data.delta }));
                        } else if (event === 'tool.requested') pendingTool = data;
                        else if (event === 'run.completed') runResult = data;
                        else if (event === 'run.failed') throw new Error(data.message || '답변 생성에 실패했습니다.');
                    }
                });
                if (!runResult?.responseId) throw new Error('응답 연결 정보가 없습니다.');
                previousResponseId.current = runResult.responseId;
                if (!pendingTool) break;
                toolCallCount += 1;
                if (toolCallCount > 6) throw new Error('한 번의 요청에서 사용할 수 있는 도구 호출 수를 초과했습니다.');

                const stepId = newId();
                updateAssistant(assistantMessageId, (message) => ({
                    ...message, steps: [...message.steps, {
                        id: stepId, name: pendingTool.name, label: TOOL_LABELS[pendingTool.name] || pendingTool.name,
                        state: pendingTool.requiresApproval ? 'approval' : 'running'
                    }]
                }));
                let output;
                let toolArguments = pendingTool.arguments;
                if (pendingTool.requiresApproval) {
                    setStatus('approval');
                    toolArguments = await requestApproval(pendingTool);
                }
                if (!toolArguments) {
                    output = { ok: false, cancelled: true, error: '사용자가 변경 작업을 승인하지 않았습니다.' };
                    updateStep(updateAssistant, assistantMessageId, stepId, 'cancelled');
                } else {
                    setStatus('tool');
                    updateStep(updateAssistant, assistantMessageId, stepId, 'running');
                    try {
                        output = { ok: true, data: await executeClientTool(pendingTool.name, toolArguments, sessionToken.current) };
                        updateStep(updateAssistant, assistantMessageId, stepId, 'completed');
                    } catch (error) {
                        output = { ok: false, error: error instanceof Error ? error.message : '도구 실행에 실패했습니다.' };
                        updateStep(updateAssistant, assistantMessageId, stepId, 'failed');
                    }
                }
                request = {
                    type: 'tool_output', callId: pendingTool.callId, output, assistantMessageId,
                    userId: userId.current, conversationId: conversationId.current, previousResponseId: pendingTool.responseId
                };
                setStatus('thinking');
            }
            updateAssistant(assistantMessageId, (message) => ({ ...message, state: 'completed', createdAt: Date.now() }));
            await refreshConversations();
        } catch (error) {
            const stopped = error?.name === 'AbortError';
            updateAssistant(assistantMessageId, (message) => ({
                ...message, state: stopped ? 'stopped' : 'failed',
                createdAt: Date.now(),
                content: message.content || (stopped ? '응답 생성을 중단했어요.' : `답변을 만들지 못했어요. ${error instanceof Error ? error.message : ''}`)
            }));
        } finally {
            setApproval(null);
            approvalResolver.current = undefined;
            setStatus('idle');
            abortController.current = undefined;
        }
    }, [attachments, refreshConversations, requestApproval, status, updateAssistant]);

    const startNewConversation = useCallback(() => {
        abortController.current?.abort();
        approvalResolver.current?.(null);
        approvalResolver.current = undefined;
        const nextId = newId();
        localStorage.setItem('klasAgentConversationId', nextId);
        conversationId.current = nextId;
        previousResponseId.current = undefined;
        setApproval(null);
        setAttachments([]);
        setAttachmentError('');
        setMessages([]);
        setHistoryOpen(false);
        setStatus('idle');
    }, []);

    const selectConversation = useCallback(async (id) => {
        if (id === conversationId.current || isRunning) return setHistoryOpen(false);
        conversationId.current = id;
        localStorage.setItem('klasAgentConversationId', id);
        setHistoryOpen(false);
        setAttachments([]);
        try { await restoreConversation(id); }
        catch (error) {
            if (error?.name !== 'AbortError') console.warn('Conversation restore failed:', error);
            setStatus('idle');
        }
    }, [isRunning, restoreConversation]);

    const openConversationRename = useCallback((conversation) => {
        if (isRunning) return;
        setHistoryOpen(false);
        setConversationMutationError('');
        setRenameDraft(conversation.title);
        setRenamingConversation(conversation);
    }, [isRunning]);

    const saveConversationRename = useCallback(async (event) => {
        event.preventDefault();
        const title = renameDraft.trim();
        if (!renamingConversation || !title || conversationMutationId) return;
        setConversationMutationId(renamingConversation.id);
        setConversationMutationError('');
        try {
            await renameConversation(renamingConversation.id, userId.current, title);
            setConversations((current) => current.map((item) => item.id === renamingConversation.id ? { ...item, title } : item));
            setRenamingConversation(null);
            setRenameDraft('');
        } catch (error) {
            setConversationMutationError(error instanceof Error ? error.message : '대화 이름을 변경하지 못했어요.');
        } finally {
            setConversationMutationId('');
        }
    }, [conversationMutationId, renameDraft, renamingConversation]);

    const removeConversation = useCallback(async (conversation) => {
        if (isRunning || conversationMutationId) return;
        if (!window.confirm(`“${conversation.title}” 대화를 삭제할까요?\n삭제한 대화는 복구할 수 없습니다.`)) return;
        setConversationMutationId(conversation.id);
        try {
            await deleteConversation(conversation.id, userId.current);
            setConversations((current) => current.filter((item) => item.id !== conversation.id));
            if (conversation.id === conversationId.current) startNewConversation();
        } catch (error) {
            window.alert(error instanceof Error ? error.message : '대화를 삭제하지 못했어요.');
        } finally {
            setConversationMutationId('');
        }
    }, [conversationMutationId, isRunning, startNewConversation]);

    const addAttachments = useCallback(async (event) => {
        const selected = Array.from(event.target.files || []);
        event.target.value = '';
        const available = MAX_ATTACHMENTS - attachments.length;
        if (available <= 0) return setAttachmentError('파일은 최대 3개까지 첨부할 수 있어요.');
        setAttachmentError(selected.length > available ? `파일은 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있어요.` : '');
        const accepted = [];
        for (const file of selected.slice(0, available)) {
            const mimeType = normalizeMimeType(file);
            if (!isAcceptedFile(file.name, mimeType)) {
                setAttachmentError('이미지, PDF, TXT, MD, CSV, JSON, DOCX 파일만 첨부할 수 있어요.');
                continue;
            }
            if (file.size > MAX_ATTACHMENT_BYTES) {
                setAttachmentError('파일 하나의 크기는 10MB 이하여야 해요.');
                continue;
            }
            accepted.push({ id: newId(), name: file.name, mimeType, size: file.size, dataUrl: await readAsDataUrl(file, mimeType) });
        }
        setAttachments((current) => [...current, ...accepted].slice(0, MAX_ATTACHMENTS));
    }, [attachments.length]);

    const lastUserMessage = useMemo(() => [...messages].reverse().find((message) => message.role === 'user' && message.content), [messages]);

    return <>
        <Head><title>KLAS+ AI</title></Head>
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.historyAnchor}>
                    <button className={styles.titleButton} type="button" aria-expanded={historyOpen} onClick={() => setHistoryOpen((open) => !open)}>
                        <span><strong>{currentConversation?.title || '새 대화'}</strong></span>
                        <IonIcon name={historyOpen ? 'chevron-up' : 'chevron-down'} />
                    </button>
                    <AnimatePresence>{historyOpen && <ConversationMenu conversations={conversations} currentId={conversationId.current} disabled={isRunning || Boolean(conversationMutationId)} onSelect={selectConversation} onRename={openConversationRename} onDelete={removeConversation} />}</AnimatePresence>
                </div>
                <div className={styles.headerActions}><button type="button" onClick={startNewConversation} aria-label="새 대화"><IonIcon name="create-outline" /></button></div>
            </header>

            <section ref={conversationRef} className={styles.conversation} aria-live="polite" onScroll={updateScrollState}><div className={styles.thread}>
                {status === 'restoring' ? <RestoreSkeleton /> : messages.length === 0 ? <Welcome submit={submit} studentName={studentName} nameStatus={studentNameStatus} /> : <AnimatePresence initial={false}>
                    {messages.map((message) => {
                        const active = message.id === activeAssistantId && isRunning;
                        return <motion.article key={message.id} className={`${styles.message} ${styles[message.role]}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {message.role === 'assistant' && <ProcessPanel steps={message.steps || []} status={status} active={active} />}
                            <div className={styles.bubble}>{message.role === 'user' ? <>{message.attachments?.length > 0 && <MessageAttachments attachments={message.attachments} />}{message.content && <div className={styles.userMessageBody}>{message.content}</div>}</> : message.content ? <ReactMarkdown remarkPlugins={[remarkGfm, remarkFlattenNestedLists]} components={MARKDOWN_COMPONENTS}>{message.content}</ReactMarkdown> : null}</div>
                            {message.role === 'assistant' && message.content && <MessageActions content={message.content} createdAt={active ? null : message.createdAt} onRegenerate={message.id === activeAssistantId && !isRunning && lastUserMessage ? () => submit(lastUserMessage.content, []) : undefined} />}
                        </motion.article>;
                    })}
                </AnimatePresence>}
                <div ref={bottomRef} />
            </div></section>

            <div className={styles.bottomDock}>
                <AnimatePresence>{showScrollToBottom && <motion.button className={styles.scrollToBottom} type="button" initial={{ opacity: 0, y: 8, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: .94 }} transition={{ duration: .18 }} onClick={scrollToBottom} aria-label="채팅창 맨 아래로 이동" title="맨 아래로 이동"><IonIcon name="arrow-down" /></motion.button>}</AnimatePresence>
                <AnimatePresence>{approval && <ApprovalCard tool={approval} onDecision={decideApproval} />}</AnimatePresence>
                <BorderBeam className={styles.composerBeam} size="md" colorVariant="colorful" theme="auto" strength={0.72} duration={5.4} borderRadius={23} active={!prefersReducedMotion}>
                    <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); submit(draft); }}>
                        {attachments.length > 0 && <AttachmentTray attachments={attachments} onRemove={(id) => setAttachments((current) => current.filter((file) => file.id !== id))} />}
                        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(draft); } }} placeholder={approval ? '먼저 변경 작업을 확인해 주세요' : '무엇이든 요청하세요'} rows={2} maxLength={4000} disabled={isRunning} />
                        <div className={styles.composerActions}>
                            <div><input ref={fileInputRef} className={styles.fileInput} type="file" multiple accept={ACCEPTED_FILES} onChange={addAttachments} /><button type="button" disabled={isRunning || attachments.length >= MAX_ATTACHMENTS} onClick={() => fileInputRef.current?.click()} aria-label="파일 첨부"><IonIcon name="attach" /></button></div>
                            {isRunning && status !== 'approval' ? <button className={styles.send} type="button" onClick={() => abortController.current?.abort()} aria-label="응답 중단"><IonIcon name="stop" /></button> : <button className={styles.send} type="submit" disabled={isRunning || (!draft.trim() && attachments.length === 0)} aria-label="보내기"><IonIcon name="arrow-up" /></button>}
                        </div>
                    </form>
                </BorderBeam>
                {attachmentError && <p className={styles.attachmentError}>{attachmentError}</p>}
                <p className={styles.disclaimer}>AI가 생성한 답변은 정확하지 않을 수 있어요.</p>
            </div>
        </main>
        <BottomSheet open={Boolean(renamingConversation)} onDismiss={() => { if (!conversationMutationId) setRenamingConversation(null); }}>

            <div className='bottom-sheet'>
                <h2 style={{ marginBottom: '30px' }}>대화 이름 변경</h2>
                <form className={styles.renameSheet} onSubmit={saveConversationRename}>
                    <input id="agent-conversation-title" value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={48} autoFocus />
                    <small>{renameDraft.trim().length}/48</small>
                    {conversationMutationError && <p role="alert">{conversationMutationError}</p>}
                    <div><button type="button" onClick={() => setRenamingConversation(null)} disabled={Boolean(conversationMutationId)}>취소</button><button type="submit" disabled={!renameDraft.trim() || Boolean(conversationMutationId)}>{conversationMutationId ? '저장 중…' : '저장'}</button></div>
                </form>
            </div>
        </BottomSheet>
    </>;
}

function ConversationMenu({ conversations, currentId, disabled, onSelect, onRename, onDelete }) {
    return <motion.div className={styles.conversationMenu} initial={{ opacity: 0, y: -7, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5 }}>
        <span className={styles.menuLabel}>최근 대화</span>
        {conversations.length === 0 ? <p>저장된 대화가 없어요.</p> : conversations.map((item) => <div className={`${styles.conversationItem} ${item.id === currentId ? styles.selectedConversation : ''}`} key={item.id}>
            <button className={styles.conversationSelect} type="button" disabled={disabled} onClick={() => onSelect(item.id)}><IonIcon name="chatbubble-outline" /><span><strong>{item.title}</strong><small>{formatRelativeTime(item.updatedAt)}</small></span></button>
            <div className={styles.conversationItemActions}><button type="button" disabled={disabled} onClick={() => onRename(item)} aria-label={`${item.title} 이름 변경`} title="이름 변경"><IonIcon name="pencil-outline" /></button><button type="button" disabled={disabled} onClick={() => onDelete(item)} aria-label={`${item.title} 삭제`} title="삭제"><IonIcon name="trash-outline" /></button></div>
        </div>)}
    </motion.div>;
}

function AttachmentTray({ attachments, onRemove }) {
    return <div className={styles.attachmentTray}>{attachments.map((file) => <div className={styles.attachmentChip} key={file.id}>
        <span className={file.mimeType.startsWith('image/') ? styles.imageFile : styles.documentFile}><IonIcon name={file.mimeType.startsWith('image/') ? 'image-outline' : 'document-text-outline'} /></span>
        <span><strong>{file.name}</strong><small>{formatFileSize(file.size)}</small></span>
        <button type="button" onClick={() => onRemove(file.id)} aria-label={`${file.name} 첨부 제거`}><IonIcon name="close" /></button>
    </div>)}</div>;
}
function MessageAttachments({ attachments }) {
    return <div className={styles.messageAttachmentList} aria-label="첨부 파일">{attachments.map((file, index) => <span key={`${file.name}-${index}`}><IonIcon name={file.mimeType?.startsWith('image/') ? 'image-outline' : 'document-text-outline'} />{file.name}</span>)}</div>;
}
function Welcome({ submit, studentName, nameStatus }) {
    const container = { hidden: {}, visible: { transition: { delayChildren: .08, staggerChildren: .1 } } };
    const item = { hidden: { opacity: 0, y: 18, filter: 'blur(9px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: .48, ease: [0.22, 1, 0.36, 1] } } };
    return <motion.div className={styles.welcome} variants={container} initial="hidden" animate="visible">
        <motion.h1 variants={item}><span className={styles.greetingLine}><AnimatePresence mode="wait" initial={false}>{nameStatus === 'ready' ? <motion.span key="name" initial={{ opacity: 0, y: 7, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: .35 }}>{studentName}님, 안녕하세요!</motion.span> : nameStatus === 'loading' ? <motion.span key="loading" className={styles.nameSkeleton} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label="학생 이름을 불러오는 중" /> : <motion.span key="generic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>안녕하세요!</motion.span>}</AnimatePresence></span><br />어떤 도움이 필요하신가요?</motion.h1>
        <motion.div className={styles.prompts} variants={container}>{STARTER_PROMPTS.map((prompt) => <motion.button variants={item} key={prompt.label} type="button" onClick={() => submit(prompt.label, [])}><IonIcon name={prompt.icon} /><span>{prompt.label}</span></motion.button>)}</motion.div>
    </motion.div>;
}
function ProcessPanel({ steps, status, active }) {
    if (!steps.length && !active) return null;
    const completed = steps.filter((step) => step.state === 'completed').length;
    return <div className={styles.process}><div className={styles.processSummary}>{active ? <ThinkingIndicator status={status} /> : <IonIcon name="checkmark-circle-outline" />}<span>{active ? statusText(status) : `${completed || steps.length}개 작업 확인 완료`}</span>{active && <span className={styles.liveDot} />}</div>{steps.map((step) => <div className={styles.processStep} key={step.id}><IonIcon className={step.state === 'running' ? styles.spin : ''} name={step.state === 'running' ? 'sync' : step.state === 'approval' ? 'shield-checkmark-outline' : step.state === 'completed' ? 'checkmark' : step.state === 'cancelled' ? 'close' : 'alert-circle'} /><span>{step.label}</span><small>{stepStateText(step.state)}</small></div>)}</div>;
}

function ApprovalCard({ tool, onDecision }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(() => approvalForm(tool.arguments || {}));
    const invalid = !form.title.trim() || !form.start || !form.end || form.end < form.start;
    const editedArguments = () => ({ ...(tool.arguments || {}), title: form.title.trim(), place: form.place.trim() || null, ...dateTimeArguments(form.start, 'start'), ...dateTimeArguments(form.end, 'end'), color: form.color });
    const actionLabel = tool.name === 'deleteCalendarEvent' ? '일정 삭제' : tool.name === 'updateCalendarEvent' ? '일정 수정' : '일정 추가';
    return <motion.aside className={`${styles.approval} ${editing ? styles.approvalEditing : ''}`} initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}>
        <div className={styles.approvalIcon}><IonIcon name="calendar" /></div><div className={styles.approvalContent}><span>실행 전 확인</span>{editing ? <div className={styles.approvalFields}><label>제목<input value={form.title} maxLength={100} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>장소<input value={form.place} maxLength={100} onChange={(event) => setForm({ ...form, place: event.target.value })} /></label><label>시작<input type="datetime-local" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /></label><label>종료<input type="datetime-local" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} /></label></div> : <><strong>{form.title || '개인 일정 추가'}</strong><p>{formatFormDate(form)}{form.place ? ` · ${form.place}` : ''}</p></>}</div>
        <div className={styles.approvalActions}><button type="button" onClick={() => onDecision(null)}>취소</button><button type="button" className={styles.editApproval} onClick={() => setEditing((value) => !value)}>{editing ? '완료' : '수정'}</button><button type="button" disabled={invalid} onClick={() => onDecision(editedArguments())}>{actionLabel}</button></div>
    </motion.aside>;
}
function MessageActions({ content, createdAt, onRegenerate }) {
    const generatedAt = formatMessageTimestamp(createdAt);
    return (
        <div className={styles.messageActions}>
            <div style={{ display: 'flex' }}>
                <button type="button" onClick={() => navigator.clipboard?.writeText(content)} aria-label="답변 복사" title="복사">
                    <IonIcon name="copy-outline" />
                </button>
                {onRegenerate && <button type="button" onClick={onRegenerate} aria-label="답변 다시 생성" title="다시 생성">
                    <IonIcon name="refresh-outline" />
                </button>}
            </div>
            {generatedAt && <time dateTime={new Date(createdAt).toISOString()} title="답변 생성 일시">{generatedAt}</time>}
        </div>
    )
}
function RestoreSkeleton() { return <div className={styles.restore}><span /><span /><span /></div>; }
function ThinkingIndicator({ status, large = false }) {
    const state = ({ tool: 'searching', answering: 'working' })[status] || 'connecting';
    return <span className={large ? styles.thinkingOrbStage : styles.thinkingOrbInline}>
        <ThinkingOrb state={state} size={large ? 64 : 20} theme="auto" aria-label={statusText(status)} />
        {large && <small>{statusText(status)}</small>}
    </span>;
}
function updateStep(updateAssistant, assistantId, stepId, state) { updateAssistant(assistantId, (message) => ({ ...message, steps: message.steps.map((step) => step.id === stepId ? { ...step, state } : step) })); }
function statusText(status) { return ({ thinking: '요청을 이해하고 있어요', tool: '필요한 정보를 확인하고 있어요', answering: '답변을 작성하고 있어요', approval: '변경 작업 승인을 기다리고 있어요' })[status] || '작업 중이에요'; }
function stepStateText(state) { return ({ running: '확인 중', approval: '승인 필요', completed: '완료', cancelled: '취소됨', failed: '실패' })[state] || ''; }
function formatFormDate(form) {
    if (!form.start || !form.end) return '날짜 정보 확인 필요';
    const start = form.start.replace('T', ' ');
    const [endDate, endTime] = form.end.split('T');
    const startDate = form.start.split('T')[0];
    return `${start}–${endDate === startDate ? endTime : form.end.replace('T', ' ')}`;
}
function approvalForm(args) {
    const asDateTime = (date, hour, minute) => date ? `${date}T${String(hour ?? 0).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}` : '';
    return { title: args.title || '', place: args.place || '', start: asDateTime(args.startDate, args.startHour, args.startMinute), end: asDateTime(args.endDate, args.endHour, args.endMinute), color: args.color || '#87373B' };
}
function dateTimeArguments(value, prefix) { const [date, time] = value.split('T'); const [hour, minute] = time.split(':').map(Number); return { [`${prefix}Date`]: date, [`${prefix}Hour`]: hour, [`${prefix}Minute`]: minute }; }
function getStoredId(key) { const stored = localStorage.getItem(key); if (stored && /^[a-zA-Z0-9-]{16,80}$/.test(stored)) return stored; const value = newId(); localStorage.setItem(key, value); return value; }
function getRybbitUserId() { const stored = localStorage.getItem('rybbit-user-id'); if (stored && /^[a-zA-Z0-9-]{16,80}$/.test(stored)) return stored; const value = newId(); localStorage.setItem('rybbit-user-id', value); return value; }
function normalizeMimeType(file) { if (file.type) return file.type; const extension = file.name.split('.').pop()?.toLowerCase(); return ({ pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv', json: 'application/json', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })[extension] || 'application/octet-stream'; }
function isAcceptedFile(name, mimeType) { return mimeType.startsWith('image/') || ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType) || /\.(pdf|txt|md|csv|json|docx)$/i.test(name); }
function readAsDataUrl(file, mimeType) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const result = String(reader.result); resolve(`data:${mimeType};base64,${result.slice(result.indexOf(',') + 1)}`); }; reader.onerror = () => reject(new Error(`${file.name} 파일을 읽지 못했습니다.`)); reader.readAsDataURL(file); }); }
function formatFileSize(bytes) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`; }
function formatRelativeTime(timestamp) { const date = new Date(timestamp); const today = new Date(); if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }); }
function formatMessageTimestamp(timestamp) { const date = new Date(timestamp); return timestamp && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date) : ''; }

function normalizeKlasHref(href) {
    if (!href || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
    try { return new URL(href, 'https://klas.kw.ac.kr/').href; }
    catch { return href; }
}

function remarkFlattenNestedLists() {
    return (tree) => {
        const flatten = (list) => {
            for (let index = 0; index < list.children.length; index += 1) {
                const item = list.children[index];
                const nestedItems = [];
                item.children = item.children.filter((child) => {
                    if (child.type !== 'list') return true;
                    flatten(child);
                    nestedItems.push(...child.children);
                    return false;
                });
                if (nestedItems.length) list.children.splice(index + 1, 0, ...nestedItems);
            }
        };
        const visit = (node) => {
            if (!Array.isArray(node?.children)) return;
            node.children.forEach((child) => {
                if (child.type === 'list') flatten(child);
                else visit(child);
            });
        };
        visit(tree);
    };
}

import { forwardRef, useEffect, useRef, useState } from 'react';
import IonIcon from '@reacticons/ionicons';
import { BorderBeam } from 'border-beam';
import { useReducedMotion } from 'framer-motion';
import styles from './AgentComposer.module.css';
import SearchContextCard from './SearchContextCard';

const ACCEPTED_FILES = 'image/*,.pdf,.txt,.md,.csv,.json,.docx';

const AgentComposer = forwardRef(function AgentComposer({ mode = 'agent', value = '', onChange, onSubmit, disabled = false, status = 'idle',
    attachments = [], searchContext, onRemoveContext, onAddAttachments, onRemoveAttachment, onStop, attachmentError = '', onCompositionStart, onCompositionEnd, suggestion }, ref) {
    const files = useRef(null), composing = useRef(false);
    const [inputValue, setInputValue] = useState(value);
    useEffect(() => {
        if (composing.current) return;
        const next = mode === 'search' ? value.replace(/[\r\n]+/g, ' ') : value;
        setInputValue(next);
        if (next !== value) onChange?.(next);
    }, [value, mode, onChange]);
    const reducedMotion = useReducedMotion(), agent = mode === 'agent';
    const stopping = agent && !['idle', 'restoring', 'approval'].includes(status);
    const hasContext = agent && Boolean(searchContext?.references?.length);
    const send = () => { if ((!agent || !composing.current) && !disabled && (value.trim() || (agent && attachments.length) || hasContext)) onSubmit?.(); };
    return <div className={styles.dock} data-mode={mode} data-has-value={Boolean(inputValue)}>
        {suggestion}
        <BorderBeam className={styles.beam} size="md" colorVariant="colorful" theme="auto" strength={0.72} duration={5.4} borderRadius={30} active={agent && !reducedMotion}>
            <form className={styles.composer} onSubmit={event => { event.preventDefault(); send(); }}>
                {agent && <SearchContextCard context={searchContext} onRemove={onRemoveContext} disabled={disabled} />}
                {agent && attachments.length > 0 && <div className={styles.attachments}>{attachments.map(file => <div className={styles.file} key={file.id}>
                    <IonIcon name={file.mimeType?.startsWith('image/') ? 'image-outline' : 'document-text-outline'} aria-hidden="true" />
                    <span>{file.name}</span><button type="button" onClick={() => onRemoveAttachment?.(file.id)} aria-label={`${file.name} 첨부 제거`}><IonIcon name="close" aria-hidden="true" /></button>
                </div>)}</div>}
                <div className={styles.inputRow}>
                    <span className={styles.searchIcon} aria-hidden="true"><IonIcon name="search-outline" style={{ position: 'relative', top: '2px' }} /></span>
                    <textarea ref={ref} id="klas-search-query" aria-label={agent ? '메시지' : '검색어'} value={inputValue} rows={1}
                        maxLength={agent ? 4000 : 200} autoComplete="off" enterKeyHint={agent ? 'send' : 'search'} disabled={disabled}
                        placeholder={agent ? status === 'approval' ? '먼저 변경 작업을 확인해 주세요' : '무엇이든 요청하세요' : '무엇을 찾으세요?'}
                        onChange={event => {
                            const next = agent ? event.target.value : event.target.value.replace(/[\r\n]+/g, ' ');
                            setInputValue(next);
                            if (!agent || !composing.current) onChange?.(next);
                        }}
                        onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
                        onCompositionEnd={event => {
                            composing.current = false;
                            const next = agent ? event.currentTarget.value : event.currentTarget.value.replace(/[\r\n]+/g, ' ');
                            setInputValue(next);
                            onChange?.(next);
                            onCompositionEnd?.(event);
                        }}
                        onBlur={() => { if (!agent && composing.current) { composing.current = false; onCompositionEnd?.(); send(); } }}
                        onKeyDown={event => {
                            if (event.key === 'Enter' && (!agent || !event.shiftKey) && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229 && !composing.current) {
                                event.preventDefault();
                                event.currentTarget.blur();
                                send();
                            }
                        }} />
                </div>
                <div className={styles.actions}>
                    <div className={styles.attachmentAction} aria-hidden={!agent}>
                        <input ref={files} type="file" multiple accept={ACCEPTED_FILES} onChange={onAddAttachments} hidden />
                        <button type="button" tabIndex={agent ? 0 : -1} disabled={!agent || disabled || attachments.length >= 3} onClick={() => files.current?.click()} aria-label="파일 첨부"><IonIcon name="attach" aria-hidden="true" /></button>
                    </div>
                    {!agent && inputValue && <button className={styles.clear} type="button" disabled={disabled} aria-label="검색어 모두 지우기"
                        onPointerDown={event => event.preventDefault()}
                        onClick={event => {
                            composing.current = false;
                            setInputValue('');
                            onChange?.('');
                            onCompositionEnd?.();
                            event.currentTarget.form?.querySelector('textarea')?.focus({ preventScroll: true });
                        }}><IonIcon name="close-outline" aria-hidden="true" /></button>}
                    {stopping ? <button className={styles.send} type="button" onClick={onStop} aria-label="응답 중단"><IonIcon name="stop" aria-hidden="true" /></button>
                        : <button className={styles.send} type="submit" disabled={disabled || (!value.trim() && (!agent || !attachments.length) && !hasContext)} aria-label={agent ? '보내기' : '검색 실행'}><IonIcon name="arrow-up" aria-hidden="true" /></button>}
                </div>
            </form>
        </BorderBeam>
        {agent && attachmentError && <p className={styles.error} role="alert">{attachmentError}</p>}
        {agent && <p className={styles.disclaimer}>AI가 생성한 답변은 정확하지 않을 수 있어요.</p>}
    </div>;
});

export default AgentComposer;

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ToggleSwitch from '../common/ToggleSwitch';
import { supportsDeadlineNotificationSettings, readDeadlineNotificationState, setDeadlineNotificationsEnabled } from '../../lib/core/deadlineNotificationSettings';

export default function SettingsDeadlineNotificationSection() {
    const [supported, setSupported] = useState(false);
    const [state, setState] = useState(null);
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);
    const mounted = useRef(false);
    const compatible = useRef(false);
    const mutating = useRef(false);
    const reading = useRef(false);
    const version = useRef(0);
    const pendingSince = useRef(0);
    const read = async () => {
        if (reading.current || mutating.current) return;
        reading.current = true;
        const current = version.current;
        try {
            const result = await readDeadlineNotificationState();
            if (mounted.current && current === version.current) { setState(result); setFailed(false); }
        } catch { if (mounted.current && current === version.current) setFailed(true); }
        finally { reading.current = false; }
    };
    useEffect(() => {
        mounted.current = true;
        supportsDeadlineNotificationSettings().then(async supported => {
            if (!mounted.current) return;
            compatible.current = supported;
            setSupported(supported);
            if (supported) await read();
        });
        const returned = () => { if (compatible.current && document.visibilityState !== 'hidden') { pendingSince.current = Date.now(); read(); } };
        window.addEventListener('focus', returned);
        document.addEventListener('visibilitychange', returned);
        return () => { mounted.current = false; version.current++; window.removeEventListener('focus', returned); document.removeEventListener('visibilitychange', returned); };
    }, []);
    useEffect(() => {
        if (!state?.pending) { pendingSince.current = 0; return; }
        pendingSince.current ||= Date.now();
        const interval = window.setInterval(() => {
            if (Date.now() - pendingSince.current > 120_000) { setFailed(true); return; }
            read();
        }, 1000);
        return () => window.clearInterval(interval);
    }, [state?.pending]);
    const change = async enabled => {
        if (mutating.current) return;
        mutating.current = true; version.current++; setSaving(true);
        try {
            const result = await setDeadlineNotificationsEnabled(enabled);
            if (mounted.current) { setState(result); setFailed(false); }
        } catch { if (mounted.current) { setFailed(true); toast.error('알림 설정을 변경하지 못했어요. 다시 시도해 주세요.'); } }
        finally { mutating.current = false; if (mounted.current) setSaving(false); }
    };
    if (!supported) return null;
    return (
        <div style={{ padding: '10px' }}>
            <ToggleSwitch
                id="deadline-notifications"
                label="마감 임박 알림"
                role="switch"
                checked={state?.enabled === true || state?.pending === true}
                disabled={!state || !state.ready || saving || state.pending}
                onChange={event => change(event.target.checked)}
            />
            <div style={{ opacity: .6, fontSize: '13px' }}>
                {state?.pending ? '앱에서 알림 권한 설정을 완료해 주세요' : '24시간 안에 마감되는 할 일이 있을 때 알림 받기'}
            </div>
            {failed && <button type="button" onClick={() => { pendingSince.current = Date.now(); read(); }}>알림 설정 다시 확인</button>}
        </div>
    );
}

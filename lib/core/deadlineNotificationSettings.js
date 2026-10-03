import KlasNativeBridge from './klasNativeBridge';

export async function supportsDeadlineNotificationSettings(bridge = KlasNativeBridge) {
    if (!bridge.isAvailable('getNotificationCapabilities')) return false;
    try {
        const cap = await bridge.getNotificationCapabilities();
        return cap?.available === true && cap.feature === 'deadlineReminders' && cap.schemaVersion === 1 &&
            cap.consentFlow === 'nativePermissionSheet' &&
            ['getDeadlineNotificationState', 'setDeadlineNotificationsEnabled'].every(method => cap.supportedMethods?.includes(method));
    } catch { return false; }
}
function validate(state) {
    if (typeof state?.enabled !== 'boolean' || typeof state?.pending !== 'boolean' || typeof state?.ready !== 'boolean') {
        throw new Error('Invalid native notification state');
    }
    if (state.status === 'OPEN_FAILED') throw new Error('Native permission sheet did not open');
    return state;
}
export async function readDeadlineNotificationState(bridge = KlasNativeBridge) {
    return validate(await bridge.getDeadlineNotificationState());
}
export async function setDeadlineNotificationsEnabled(enabled, bridge = KlasNativeBridge) {
    return validate(await bridge.setDeadlineNotificationsEnabled(enabled));
}

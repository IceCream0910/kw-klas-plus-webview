

const getLegacyAndroidBridge = () => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window.Android;
};

const getNativeBridge = () => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const bridge = window.KlasNativeBridgeNative;
    return typeof bridge?.postMessage === 'function' ? bridge : undefined;
};

const BRIDGE_VERSION = 1;
const RESPONSE_TIMEOUT_MS = 15_000;

/**
 * Bridge v1과 구 Android bridge 사이의 transport 차이를 캡슐화하는 adapter.
 *
 * 일반 사용자는 이 클래스를 직접 생성하지 않고 기본 export인
 * {@link KlasNativeBridge} singleton을 사용한다. Bridge v1 호출은 Promise를
 * 반환하며, Bridge v1이 없는 구 앱에서는 legacy 메서드 반환값을 그대로 반환한다.
 */
export class KlasNativeBridgeAdapter {
    constructor() {
        this.pendingRequests = new Map();
        this.requestSequence = 0;
        this.connectedTransport = undefined;
    }

    isAvailable(methodName) {
        if (getNativeBridge()) {
            return true;
        }

        const bridge = getLegacyAndroidBridge();

        if (!bridge) {
            return false;
        }

        return methodName === undefined || typeof bridge[methodName] === 'function';
    }

    invoke(methodName, ...args) {
        const nativeBridge = getNativeBridge();

        if (nativeBridge) {
            return this.invokeNative(nativeBridge, methodName, args);
        }

        const bridge = getLegacyAndroidBridge();
        const method = bridge?.[methodName];

        if (typeof method !== 'function') {
            throw new Error(`KlasNativeBridge method is unavailable: ${methodName}`);
        }

        return method.apply(bridge, args);
    }

    createInvocationScript(methodName, argumentExpressions = []) {
        const serializedMethodName = JSON.stringify(methodName);
        const argumentsSource = argumentExpressions.join(', ');

        return `(function () {
            var methodName = ${serializedMethodName};
            var args = [${argumentsSource}];
            var nativeBridge = window.KlasNativeBridgeNative;
            if (nativeBridge && typeof nativeBridge.postMessage === 'function') {
                nativeBridge.postMessage(JSON.stringify({
                    version: ${BRIDGE_VERSION},
                    id: 'web-script-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
                    method: methodName,
                    arguments: args
                }));
                return;
            }
            var legacyBridge = window.Android;
            if (legacyBridge && typeof legacyBridge[methodName] === 'function') {
                legacyBridge[methodName].apply(legacyBridge, args);
            }
        })();`;
    }

    invokeNative(nativeBridge, methodName, args) {
        this.connect(nativeBridge);

        const id = `web-${Date.now().toString(36)}-${(++this.requestSequence).toString(36)}`;
        const payload = JSON.stringify({
            version: BRIDGE_VERSION,
            id,
            method: methodName,
            arguments: args,
        });

        return new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`KlasNativeBridge response timed out: ${methodName}`));
            }, RESPONSE_TIMEOUT_MS);

            this.pendingRequests.set(id, { resolve, reject, timeoutId, methodName, args });

            try {
                nativeBridge.postMessage(payload);
            } catch (error) {
                window.clearTimeout(timeoutId);
                this.pendingRequests.delete(id);
                reject(error);
            }
        });
    }

    connect(nativeBridge) {
        if (this.connectedTransport === nativeBridge) {
            return;
        }

        this.connectedTransport = nativeBridge;
        nativeBridge.onmessage = (event) => this.handleMessage(event?.data);
    }

    handleMessage(data) {
        let message;

        try {
            message = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            console.error('KlasNativeBridge received a malformed response:', error);
            return;
        }

        const pending = message?.id ? this.pendingRequests.get(message.id) : undefined;

        if (!pending) {
            return;
        }

        window.clearTimeout(pending.timeoutId);
        this.pendingRequests.delete(message.id);

        if (message.version !== BRIDGE_VERSION || message.ok !== true) {
            const errorCode = message?.error?.code ?? 'INVALID_RESPONSE';

            if (errorCode === 'UNKNOWN_METHOD') {
                const legacyBridge = getLegacyAndroidBridge();
                const legacyMethod = legacyBridge?.[pending.methodName];

                if (typeof legacyMethod === 'function') {
                    try {
                        pending.resolve(legacyMethod.apply(legacyBridge, pending.args));
                    } catch (error) {
                        pending.reject(error);
                    }
                    return;
                }
            }

            pending.reject(new Error(`KlasNativeBridge ${pending.methodName} failed: ${errorCode}`));
            return;
        }

        pending.resolve(message.result);
    }
}

const adapter = new KlasNativeBridgeAdapter();

/**
 * 네이티브 앱의 Bridge 함수 호출을 위한 객체
 *
 * 메서드명과 인자 순서를 변경하지 않고 네이티브 앱으로 전달하여 Bridge 함수를 호출한다.
 * `klasNativeBridge`가 없는 구 Android 앱에서는 `window.Android`로 fallback한다.
 *
 * @example
 * import KlasNativeBridge from '../lib/core/klasNativeBridge';
 *
 * KlasNativeBridge.openPage('https://klas.kw.ac.kr');
 * const settings = await KlasNativeBridge.getAppLockSettings();
 *
 */
const KlasNativeBridge = new Proxy(adapter, {
    get(target, property, receiver) {
        if (Reflect.has(target, property)) {
            const value = Reflect.get(target, property, receiver);
            return typeof value === 'function' ? value.bind(target) : value;
        }

        if (typeof property !== 'string') {
            return undefined;
        }

        return (...args) => target.invoke(property, ...args);
    },
});

export { KlasNativeBridge };
export default KlasNativeBridge;

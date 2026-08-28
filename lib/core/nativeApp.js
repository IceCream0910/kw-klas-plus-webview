// TODO: 환경변수로 관리
const NATIVE_FEATURE_MIN_VERSIONS = {
    header: { android: 21, ios: 1 },
    agent: { android: 23, ios: 1 },
    bottomNav: { android: 24, ios: 1 },
    appLock: { android: 32, ios: 1 },
    idCardQR: { android: 31, ios: 1 },
};

export const getNativeAppFromUserAgent = () => {
    if (typeof window === "undefined") return null;
    const userAgent = navigator.userAgent;
    const android = userAgent.match(/AndroidApp_v(\d+)/);
    if (android) {
        return { platform: "android", version: parseInt(android[1], 10) };
    }
    const ios = userAgent.match(/iOSApp_v(\d+)/);
    if (ios) {
        return { platform: "ios", version: parseInt(ios[1], 10) };
    }
    return null;
};

export const checkNativeAppCompatibility = (app, minVersions) => {
    if (!app) return false;
    const minVersion = minVersions?.[app.platform];
    if (minVersion == null) return false;
    return app.version >= minVersion;
};

export const isNativeFeatureCompatible = (feature, app = getNativeAppFromUserAgent()) => {
    return checkNativeAppCompatibility(app, NATIVE_FEATURE_MIN_VERSIONS[feature]);
};

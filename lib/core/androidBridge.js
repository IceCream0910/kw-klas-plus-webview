
export const isAndroidAvailable = () => {
    return typeof Android !== 'undefined';
};

export const safeAndroidCall = (fn, fallback = null) => {
    try {
        if (isAndroidAvailable()) {
            return fn(Android);
        } else if (fallback) {
            return fallback();
        }
    } catch (error) {
        console.error('Android bridge error:', error);
        if (fallback) {
            return fallback();
        }
    }
};

export const openExternalLink = (url) => {
    safeAndroidCall(
        (android) => android.openExternalLink(url),
        () => window.open(url, '_blank')
    );
};

export const openKlasPage = (url) => {
    safeAndroidCall(
        (android) => android.openPage(url),
        () => window.open(url, '_blank')
    );
};

export const openLectureActivity = (subj, subjName) => {
    safeAndroidCall((android) => android.openLectureActivity(subj, subjName));
};


export const openQRCheckIn = (subj, subjName) => {
    safeAndroidCall((android) => android.qrCheckIn(subj, subjName));
};

export const openOptionsMenu = () => {
    safeAndroidCall((android) => android.openOptionsMenu());
};

export const reloadApp = () => {
    safeAndroidCall((android) => android.reload());
};

export const openWebViewBottomSheet = () => {
    safeAndroidCall((android) => android.openWebViewBottomSheet());
};

export const closeWebViewBottomSheet = () => {
    safeAndroidCall((android) => android.closeWebViewBottomSheet());
};

export const evaluateKlasPage = (url, yearHakgi, subj) => {
    safeAndroidCall((android) => android.evaluate(url, yearHakgi, subj));
};

export const openCustomBottomSheet = (url, isModal = false) => {
    safeAndroidCall((android) => android.openCustomBottomSheet(url, isModal));
};

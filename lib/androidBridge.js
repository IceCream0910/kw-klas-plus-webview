/**
 * Android WebView와의 브리지 유틸리티 함수들
 */

/**
 * Android 앱이 사용 가능한지 확인
 */
export const isAndroidAvailable = () => {
    return typeof Android !== 'undefined';
};

/**
 * 안전하게 Android 함수 호출
 */
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

/**
 * 외부 링크 열기
 */
export const openExternalLink = (url) => {
    safeAndroidCall(
        (android) => android.openExternalLink(url),
        () => window.open(url, '_blank')
    );
};

/**
 * KLAS 페이지 열기
 */
export const openKlasPage = (url) => {
    safeAndroidCall(
        (android) => android.openPage(url),
        () => window.open(url, '_blank')
    );
};

/**
 * 강의 액티비티 열기
 */
export const openLectureActivity = (subj, subjName) => {
    safeAndroidCall((android) => android.openLectureActivity(subj, subjName));
};

/**
 * QR 체크인
 */
export const openQRCheckIn = (subj, subjName) => {
    safeAndroidCall((android) => android.qrCheckIn(subj, subjName));
};

/**
 * 옵션 메뉴 열기
 */
export const openOptionsMenu = () => {
    safeAndroidCall((android) => android.openOptionsMenu());
};

/**
 * 앱 새로고침
 */
export const reloadApp = () => {
    safeAndroidCall((android) => android.reload());
};

/**
 * 웹뷰 바텀시트 제어
 */
export const openWebViewBottomSheet = () => {
    safeAndroidCall((android) => android.openWebViewBottomSheet());
};

export const closeWebViewBottomSheet = () => {
    safeAndroidCall((android) => android.closeWebViewBottomSheet());
};

/**
 * KLAS 페이지 평가
 */
export const evaluateKlasPage = (url, yearHakgi, subj) => {
    safeAndroidCall((android) => android.evaluate(url, yearHakgi, subj));
};

/**
 * 커스텀 바텀시트 열기
 */
export const openCustomBottomSheet = (url, isModal = false) => {
    safeAndroidCall((android) => android.openCustomBottomSheet(url, isModal));
};

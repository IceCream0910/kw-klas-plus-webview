/**
 * 로컬 스토리지 관련 유틸리티 함수들
 */

/**
 * 안전하게 로컬 스토리지에서 JSON 데이터 가져오기
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error parsing localStorage item '${key}':`, error);
        return defaultValue;
    }
};

/**
 * 안전하게 로컬 스토리지에 JSON 데이터 저장하기
 */
export const setToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting localStorage item '${key}':`, error);
        return false;
    }
};

/**
 * 특정 키의 로컬 스토리지 아이템 제거
 */
export const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing localStorage item '${key}':`, error);
        return false;
    }
};

/**
 * 로컬 스토리지 전체 클리어
 */
export const clearLocalStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

// Aliases for consistency with other parts of the codebase
export const getStoredData = getFromLocalStorage;
export const setStoredData = setToLocalStorage;

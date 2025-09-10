import PullToRefresh from 'pulltorefreshjs';
import { PULL_TO_REFRESH_CONFIG } from './core/constants';
import { reloadApp } from './core/androidBridge';

/**
 * Pull to Refresh 관련 유틸리티 함수들
 */

/**
 * Pull to Refresh 초기화
 */
export const initializePullToRefresh = (mainElementSelector = '.pull-to-swipe-area') => {
    const ptr = PullToRefresh.init({
        mainElement: mainElementSelector,
        onRefresh: reloadApp,
        ...PULL_TO_REFRESH_CONFIG
    });

    // UI 상태 관찰자 설정
    const observer = setupPullToRefreshObserver();

    return {
        ptr,
        observer,
        destroy: () => {
            ptr.destroy();
            observer.disconnect();
        }
    };
};

/**
 * Pull to Refresh UI 상태 관찰자 설정
 */
const setupPullToRefreshObserver = () => {
    const observer = new MutationObserver(() => {
        const ptrRelease = document.querySelector('.ptr--release');
        const ptrRefreshing = document.querySelector('.ptr--refresh');
        const area = document.querySelector('.pull-to-swipe-area');

        if (area) {
            area.style.opacity = (ptrRelease || ptrRefreshing) ? '0.3' : '1';
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return observer;
};

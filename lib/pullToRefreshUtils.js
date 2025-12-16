import PullToRefresh from 'pulltorefreshjs';
import { PULL_TO_REFRESH_CONFIG } from './core/constants';
import { reloadApp } from './core/androidBridge';

export const initializePullToRefresh = (mainElementSelector = '.pull-to-swipe-area') => {
    const ptr = PullToRefresh.init({
        mainElement: mainElementSelector,
        onRefresh: reloadApp,
        ...PULL_TO_REFRESH_CONFIG
    });

    applyExpressiveIndicator();
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

const setupPullToRefreshObserver = () => {
    const observer = new MutationObserver(() => {
        applyExpressiveIndicator();
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

const applyExpressiveIndicator = () => {
        const container = document.querySelector('.ptr__children');
        if (!container || container.dataset.expressiveApplied === 'true') return;

        container.dataset.expressiveApplied = 'true';
        container.innerHTML = `
            <div class="ptr-expressive">
                <span class="ptr-dot ptr-dot-left"></span>
                <span class="ptr-dot ptr-dot-right"></span>
            </div>
        `;
};

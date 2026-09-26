import KlasNativeBridge from '../lib/core/klasNativeBridge';
import "../styles/globals.css";
import { useEffect } from "react";
import Script from 'next/script';
import { useRouter } from 'next/router';
import { identifyUser } from '../lib/core/analytics';
import Head from 'next/head';
import { isNativeFeatureCompatible } from '../lib/core/nativeApp';

const READING_ROUTES = new Set([
  '/boardView',
  '/lecturePlan',
  '/privacy'
]);

const BALANCED_ROUTES = new Set([
  '/boardList',
  '/grade',
  '/janghak',
  '/lectureHome',
  '/onlineLecture',
  '/ranking',
  '/searchLecturePlan',
  '/settings'
]);

const BOTTOM_NAV_ROUTES = new Set([
  '/calendar',
  '/feed',
  '/profile',
  '/timetableTab'
]);

const HOME_TAB_PATHS = {
  feed: '/feed',
  timetable: '/timetableTab',
  calendar: '/calendar',
  menu: '/profile'
};

const HOME_TABS_BY_PATH = Object.fromEntries(
  Object.entries(HOME_TAB_PATHS).map(([tab, path]) => [path, tab])
);

const getShellClassName = (pathname) => {
  if (pathname.startsWith('/modal/')) return 'app-shell app-shell--modal';
  if (pathname === '/changelog' || pathname === '/') return 'app-shell app-shell--flush';
  if (pathname === '/agent') return 'app-shell app-shell--legacy-edge app-shell--agent';
  if (pathname === '/onboarding') return 'app-shell app-shell--legacy-edge';
  if (READING_ROUTES.has(pathname)) return 'app-shell app-shell--reading';
  if (BALANCED_ROUTES.has(pathname)) return 'app-shell app-shell--balanced';
  return 'app-shell';
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const navigateFromNative = (tab) => {
      if (!Object.prototype.hasOwnProperty.call(HOME_TAB_PATHS, tab)) return false;
      router.push(HOME_TAB_PATHS[tab]).catch((error) => {
        console.error('Failed to navigate to the native tab:', error);
      });
      return true;
    };

    window.klasNativeNavigate = navigateFromNative;

    if (!process.env.NEXT_PUBLIC_DEVELOPMENT && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }

    try {
      KlasNativeBridge.completePageLoad();
    } catch (error) {
      if (window.location.href.includes("privacy") || window.location.href.includes("changelog")) return;
      if (process.env.NEXT_PUBLIC_DEVELOPMENT) return;
      window.location.replace("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus");
    }

    const handleRouteChange = (url = router.asPath) => {
      const hakbun = localStorage.getItem('klasplus_lastSessionID');
      if (hakbun) {
        identifyUser(hakbun);
      }

      const path = url.split(/[?#]/, 1)[0];
      const tab = HOME_TABS_BY_PATH[path];
      if (tab && isNativeFeatureCompatible('nativeBottomNav') && KlasNativeBridge.isAvailable('changeTab')) {
        try {
          Promise.resolve(KlasNativeBridge.changeTab(tab)).catch((error) => {
            console.error('Failed to sync the native tab:', error);
          });
        } catch (error) {
          console.error('Failed to sync the native tab:', error);
        }
      }
    };

    setTimeout(handleRouteChange, 1000);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      if (window.klasNativeNavigate === navigateFromNative) {
        delete window.klasNativeNavigate;
      }
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <div className={`${getShellClassName(router.pathname)}${BOTTOM_NAV_ROUTES.has(router.pathname) ? ' app-shell--with-bottom-nav' : ''}`}>
        <Component {...pageProps} />
      </div>
      <Script
        src="https://rybbit.yuntae.in/api/script.js"
        data-site-id="e4129eea280e"
        data-replay-mask-text-selectors='[".rr-mask"]'
        strategy="afterInteractive"
      />
      <Script src="https://embed.released.so/1/embed.js" />
    </>
  );
}

export default MyApp;

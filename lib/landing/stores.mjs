export const APP_STORES = {
  android: { name: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.icecream.kwklasplus' },
  ios: { name: 'App Store', url: 'https://apps.apple.com/app/id6820491776' },
};

export function detectStorePlatform(userAgent = '', maxTouchPoints = 0) {
  if (/android/i.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) return 'ios';
  return null;
}

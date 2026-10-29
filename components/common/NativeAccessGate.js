import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import { isPublicRoute } from '../../lib/core/publicRoutes.mjs';

export default function NativeAccessGate({ children, onNativeReady }) {
  const router = useRouter();
  const [allowedPath, setAllowedPath] = useState(null);
  const publicPage = isPublicRoute(router.pathname);

  useEffect(() => {
    if (publicPage) return;
    if (KlasNativeBridge.isAvailable()) {
      setAllowedPath(router.pathname);
    } else {
      void router.replace('/');
    }
  }, [publicPage, router.pathname, router]);

  useEffect(() => {
    if ((publicPage || allowedPath === router.pathname) && KlasNativeBridge.isAvailable()) {
      onNativeReady();
    }
  }, [publicPage, allowedPath, router.pathname, onNativeReady]);

  return publicPage || allowedPath === router.pathname ? children : null;
}

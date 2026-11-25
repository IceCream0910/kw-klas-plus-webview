import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import { isPublicRoute } from '../../lib/core/publicRoutes.mjs';

export default function NativeAccessGate({ children, onNativeReady }) {
  const router = useRouter();
  const [nativeAccess, setNativeAccess] = useState(false);
  const publicPage = isPublicRoute(router.pathname);
  const allowed = nativeAccess && KlasNativeBridge.isAvailable();

  useEffect(() => {
    if (publicPage) return;
    if (KlasNativeBridge.isAvailable()) {
      setNativeAccess(true);
    } else {
      void router.replace('/');
    }
  }, [publicPage, router.pathname, router]);

  useEffect(() => {
    if ((publicPage || allowed) && KlasNativeBridge.isAvailable()) {
      onNativeReady();
    }
  }, [publicPage, allowed, onNativeReady]);

  return publicPage || allowed ? children : null;
}

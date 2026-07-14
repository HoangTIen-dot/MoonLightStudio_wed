import { type ReactNode, useEffect, useState } from 'react';
import { clearAdminToken, getCurrentAdmin, hasAdminToken } from './auth.service';

type AdminAuthGateProps = {
  children: ReactNode;
  hasToken?: () => boolean;
  validateSession?: () => Promise<unknown>;
  redirectToLogin?: () => void;
};

function defaultRedirectToLogin() {
  window.location.replace('/admin/login');
}

export function AdminAuthGate({
  children,
  hasToken = hasAdminToken,
  validateSession = getCurrentAdmin,
  redirectToLogin = defaultRedirectToLogin,
}: AdminAuthGateProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!hasToken()) {
        redirectToLogin();
        return;
      }

      try {
        await validateSession();

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch {
        clearAdminToken();
        redirectToLogin();
      }
    }

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [hasToken, redirectToLogin, validateSession]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

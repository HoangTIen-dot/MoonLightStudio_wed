// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminAuthGate } from './AdminAuthGate';

describe('AdminAuthGate', () => {
  it('redirects to login and hides admin content when token validation fails', async () => {
    const redirectToLogin = vi.fn();

    render(
      <AdminAuthGate
        hasToken={() => true}
        validateSession={() => Promise.reject(new Error('Invalid token'))}
        redirectToLogin={redirectToLogin}
      >
        <div>Protected admin content</div>
      </AdminAuthGate>,
    );

    expect(screen.queryByText('Protected admin content')).toBeNull();

    await waitFor(() => {
      expect(redirectToLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('renders admin content after token validation succeeds', async () => {
    render(
      <AdminAuthGate
        hasToken={() => true}
        validateSession={() => Promise.resolve()}
        redirectToLogin={() => undefined}
      >
        <div>Protected admin content</div>
      </AdminAuthGate>,
    );

    expect(screen.queryByText('Protected admin content')).toBeNull();
    expect(await screen.findByText('Protected admin content')).toBeTruthy();
  });
});

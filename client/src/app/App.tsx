import type { ReactElement } from 'react';
import { AdminBrandsPage } from '../pages/admin/AdminBrandsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminLeadsPage } from '../pages/admin/AdminLeadsPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminProjectsPage } from '../pages/admin/AdminProjectsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { HomePage } from '../pages/public/HomePage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { AdminAuthGate } from '../features/auth/AdminAuthGate';

function renderAdminPage(page: ReactElement) {
  return <AdminAuthGate>{page}</AdminAuthGate>;
}

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/admin/login') {
    return <AdminLoginPage />;
  }

  if (pathname === '/admin') {
    return renderAdminPage(<AdminDashboardPage />);
  }

  if (pathname === '/admin/projects') {
    return renderAdminPage(<AdminProjectsPage />);
  }

  if (pathname === '/admin/brands') {
    return renderAdminPage(<AdminBrandsPage />);
  }

  if (pathname === '/admin/leads') {
    return renderAdminPage(<AdminLeadsPage />);
  }

  if (pathname === '/admin/users') {
    return renderAdminPage(<AdminUsersPage />);
  }

  if (pathname === '/admin/videos') {
    window.location.replace('/admin/projects');
    return null;
  }

  if (pathname === '/') {
    return (
      <main className="min-h-screen bg-[#0C0C0C] font-kanit tracking-[-0.02em]" style={{ overflowX: 'clip' }}>
        <HomePage />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0C0C0C] font-kanit tracking-[-0.02em]" style={{ overflowX: 'clip' }}>
      <NotFoundPage />
    </main>
  );
}

export default App;

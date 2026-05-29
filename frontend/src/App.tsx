import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Layout
import MainLayout from './components/layout/MainLayout';

// Route protection
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import POSPage from './pages/pos/POSPage';
import ProductsPage from './pages/products/ProductsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import CustomersPage from './pages/customers/CustomersPage';
import OrdersPage from './pages/orders/OrdersPage';
import StockPage from './pages/stock/StockPage';
import ReportsPage from './pages/reports/ReportsPage';
import AIRecommendationsPage from './pages/ai/AIRecommendationsPage';
import SettingsPage from './pages/settings/SettingsPage';

import { Toaster } from 'react-hot-toast';

export default function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Khi app load → verify token với backend
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      const persistedState = {
        state: {
          user: null,
          token: tokenParam,
          isAuthenticated: false,
        },
        version: 0,
      };
      localStorage.setItem('sora-pos-auth', JSON.stringify(persistedState));
      // Xóa query param khỏi URL cho sạch
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - all roles */}
          <Route path="/" element={<DashboardPage />} />

          {/* POS - all roles */}
          <Route path="/pos" element={<POSPage />} />

          {/* Products - all roles can view; actions are hidden for cashier */}
          <Route path="/products" element={<ProductsPage />} />

          {/* Categories - admin, manager */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          {/* Employees - admin, manager */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          {/* Customers - all roles can lookup and register members */}
          <Route path="/customers" element={<CustomersPage />} />

          {/* Orders - all roles */}
          <Route path="/orders" element={<OrdersPage />} />

          {/* Stock - all roles can view, admin/manager can modify */}
          <Route path="/stock" element={<StockPage />} />

          {/* Reports - admin, manager */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* AI Recommendations - admin, manager */}
          <Route
            path="/ai-recommendations"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AIRecommendationsPage />
              </ProtectedRoute>
            }
          />

          {/* Settings - admin, manager */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '../types/user.type';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
  /** URL redirect khi không đủ quyền (mặc định: hiển thị 403) */
  redirectTo?: string;
}

/**
 * RoleBasedRoute - Bảo vệ route theo vai trò
 * Yêu cầu user đã đăng nhập VÀ có role phù hợp
 * 
 * Usage:
 * <RoleBasedRoute roles={['admin', 'manager']}>
 *   <ManagerPage />
 * </RoleBasedRoute>
 */
export default function RoleBasedRoute({ children, roles, redirectTo }: RoleBasedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Không đủ quyền
  if (!roles.includes(user.role)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Không đủ quyền truy cập</h3>
          <p className="text-sm text-gray-500">
            Tính năng này yêu cầu quyền: <span className="font-medium text-gray-700">{roles.join(', ')}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Vai trò hiện tại: <span className="capitalize font-medium">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

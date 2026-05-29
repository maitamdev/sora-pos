import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../types/user.type';
import {
  HiOutlineHome,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlineDatabase,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { path: '/', icon: HiOutlineHome, label: 'Dashboard', roles: ['admin', 'manager', 'cashier'] },
  { path: '/pos', icon: HiOutlineShoppingCart, label: 'POS Bán hàng', roles: ['admin', 'manager', 'cashier'] },
  { path: '/products', icon: HiOutlineCube, label: 'Sản phẩm', roles: ['admin', 'manager', 'cashier'] },
  { path: '/categories', icon: HiOutlineTag, label: 'Danh mục', roles: ['admin', 'manager'] },
  { path: '/employees', icon: HiOutlineUserGroup, label: 'Nhân viên', roles: ['admin', 'manager'] },
  { path: '/customers', icon: HiOutlineUsers, label: 'Khách hàng', roles: ['admin', 'manager', 'cashier'] },
  { path: '/orders', icon: HiOutlineClipboardList, label: 'Hóa đơn', roles: ['admin', 'manager', 'cashier'] },
  { path: '/stock', icon: HiOutlineDatabase, label: 'Kho hàng', roles: ['admin', 'manager', 'cashier'] },
  { path: '/reports', icon: HiOutlineChartBar, label: 'Báo cáo', roles: ['admin', 'manager'] },
  { path: '/ai-recommendations', icon: HiOutlineLightBulb, label: 'AI Gợi ý', roles: ['admin', 'manager'] },
  { path: '/settings', icon: HiOutlineCog, label: 'Cài đặt POS', roles: ['admin', 'manager'] },
];

/** Map role → display info */
const roleDisplayMap: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Quản trị viên', color: 'text-emerald-400' },
  manager: { label: 'Quản lý', color: 'text-blue-400' },
  cashier: { label: 'Thu ngân', color: 'text-amber-400' },
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const filteredMenu = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleInfo = user ? roleDisplayMap[user.role] : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">
          <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Sora</span>
          <span className="text-white/90"> POS</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Hệ thống quản lý bán hàng</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-600/20">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            {roleInfo && (
              <p className={`text-xs ${roleInfo.color}`}>{roleInfo.label}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
        >
          <HiOutlineLogout className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

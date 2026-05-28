import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../validations/login.schema';
import { authAPI } from '../../services/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiEye,
  HiEyeOff,
  HiOutlineExclamationCircle,
  HiOutlineSparkles
} from 'react-icons/hi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lấy URL trước đó để redirect lại sau khi login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(data);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'admin@sorapos.com');
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex overflow-hidden font-sans">
      {/* LEFT PANEL - Full-Bleed Decorative & Feature Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 animate-fade-in">
        {/* Full-bleed illustration background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/pos_login_illustration.png" 
            alt="Sora POS Background" 
            className="w-full h-full object-cover opacity-50 mix-blend-lighten"
          />
          {/* Subtle gradient overlays to blend the image edges and ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#070a13] via-[#070a13]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070a13]/40 via-transparent to-[#070a13]/90" />
        </div>

        {/* Top Header/Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md shadow-primary-500/30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Sora <span className="text-primary-400">POS</span>
          </span>
        </div>

        {/* Bottom Content: Floating Feature Glass Box */}
        <div className="relative z-10 max-w-xl mb-12 p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 text-primary-400 mb-3 text-xs font-semibold uppercase tracking-wider">
            <HiOutlineSparkles className="w-4 h-4 animate-pulse" />
            <span>Hệ thống quản lý bán hàng thế hệ mới</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Quản lý kinh doanh với sức mạnh từ <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">Trí tuệ nhân tạo</span>
          </h1>
          <p className="text-sm text-gray-300 font-light leading-relaxed">
            Sora POS không chỉ giúp tối ưu quy trình thanh toán và kiểm kho, mà còn tự động đưa ra các dự báo doanh thu, gợi ý mặt hàng bán chạy nhờ trợ lý AI thông minh tích hợp.
          </p>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-500">
          <span>© 2026 Sora POS. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-gray-300 cursor-pointer">Điều khoản dịch vụ</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Clean & Premium Login Form (Centered inside a Card) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-[#070a13] flex flex-col justify-center p-6 sm:p-12 xl:p-16 relative">
        {/* Decorative aura background on mobile */}
        <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10">
          {/* Glassmorphic Form Card Container */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
            {/* Logo only on Mobile View */}
            <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md shadow-primary-500/25">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sora <span className="text-primary-400">POS</span>
              </span>
            </div>

            {/* Welcome Text */}
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">Chào mừng trở lại</h2>
              <p className="text-xs text-gray-400 mt-1.5">
                Đăng nhập tài khoản Sora POS để quản lý cửa hàng của bạn.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-shake">
                <HiOutlineExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors duration-200" />
                  <input
                    id="login-email"
                    {...register('email')}
                    type="email"
                    placeholder="admin@sorapos.com"
                    autoComplete="email"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-white/10 focus:ring-primary-500/40 focus:bg-slate-950/80'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Mật khẩu
                  </label>
                  <span className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer transition-colors duration-150">
                    Quên mật khẩu?
                  </span>
                </div>
                <div className="relative group">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors duration-200" />
                  <input
                    id="login-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950 border text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-white/10 focus:ring-primary-500/40 focus:bg-slate-950/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-slate-950 text-primary-600 focus:ring-primary-500/30 focus:ring-offset-0 focus:ring-2" />
                  <span className="text-xs text-gray-400">Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill section */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Trải nghiệm nhanh</span>
                <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-medium">Bấm để tự động điền</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-200 text-left group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">Tài khoản Demo Admin</span>
                  <span className="text-xs text-gray-400 mt-0.5">admin@sorapos.com</span>
                </div>
                <span className="text-xs bg-slate-950 border border-white/5 text-gray-500 px-2 py-1 rounded group-hover:text-gray-300 group-hover:border-white/10 transition-all">
                  password123
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

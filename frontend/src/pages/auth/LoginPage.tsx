import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../validations/login.schema';
import { authAPI } from '../../services/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff, HiOutlineExclamationCircle } from 'react-icons/hi';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Logo icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/30 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Sora</span>
            <span className="text-white/90"> POS</span>
          </h1>
          <p className="text-sm text-gray-400">Hệ thống quản lý bán hàng thông minh</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/[0.08] animate-slide-up">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Đăng nhập</h2>
            <p className="text-sm text-gray-400 mt-0.5">Nhập thông tin để truy cập hệ thống</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/20 flex items-start gap-3 animate-shake">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="login-email"
                  {...register('email')}
                  type="email"
                  placeholder="admin@sorapos.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/[0.1] focus:ring-primary-500/40'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="login-password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/[0.1] focus:ring-primary-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
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

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-xs text-gray-500 text-center mb-3">Tài khoản demo</p>
            <div className="grid gap-2">
              <DemoAccount
                email="admin@sorapos.com"
                role="Admin"
                roleColor="text-emerald-400"
                bgColor="bg-emerald-500/10"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © 2024 Sora POS. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

/** Demo account pill component */
function DemoAccount({
  email,
  role,
  roleColor,
  bgColor,
}: {
  email: string;
  role: string;
  roleColor: string;
  bgColor: string;
}) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${bgColor} border border-white/[0.04]`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${roleColor}`}>{role}</span>
        <span className="text-xs text-gray-400">{email}</span>
      </div>
      <span className="text-[10px] text-gray-500">password123</span>
    </div>
  );
}

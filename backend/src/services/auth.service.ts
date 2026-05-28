import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { JwtPayload, UserResponse } from '../types/user.type';

export class AuthService {
  /**
   * Đăng nhập - xác thực email/password và trả về JWT token
   */
  static async login(email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    // 1. Tìm user theo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*, roles(name)')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // 2. So sánh password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // 3. Tạo JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.roles.name,
    };

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as any,
    });

    // 4. Cập nhật last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 5. Trả về user info (không bao gồm password_hash)
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.roles.name,
      is_active: user.is_active,
      last_login: user.last_login,
    };

    return { user: userResponse, token };
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getProfile(userId: string): Promise<UserResponse | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, roles(name)')
      .eq('id', userId)
      .single();

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.roles.name,
      is_active: user.is_active,
      last_login: user.last_login,
    };
  }
}

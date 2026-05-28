export type UserRole = 'admin' | 'manager' | 'cashier';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// User data trả về cho frontend (không bao gồm password_hash)
export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extend Express Request để thêm user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

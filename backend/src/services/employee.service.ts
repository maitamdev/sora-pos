import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { UserResponse, UserRole } from '../types/user.type';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../validations/employee.validation';

const employeeSelect = 'id, email, full_name, phone, avatar_url, is_active, last_login, store_id, created_at, updated_at, roles(name)';

const toUserResponse = (user: any): UserResponse => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  phone: user.phone,
  avatar_url: user.avatar_url,
  role: user.roles?.name,
  is_active: user.is_active,
  last_login: user.last_login,
  store_id: user.store_id,
});

export class EmployeeService {
  static async getAll(storeId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(employeeSelect)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toUserResponse);
  }

  static async create(storeId: string, input: CreateEmployeeInput, actorRole: UserRole) {
    this.assertCanAssignRole(actorRole, input.role);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (existingUser) throw new Error('Email này đã được sử dụng');

    const roleId = await this.getRoleId(input.role);
    const passwordHash = await bcrypt.hash(input.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email,
        password_hash: passwordHash,
        full_name: input.full_name,
        phone: input.phone || null,
        role_id: roleId,
        store_id: storeId,
        is_active: input.is_active,
      })
      .select(employeeSelect)
      .single();

    if (error || !data) throw new Error(error?.message || 'Không thể tạo nhân viên');
    return toUserResponse(data);
  }

  static async update(storeId: string, id: string, input: UpdateEmployeeInput, actorId: string, actorRole: UserRole) {
    const current = await this.getById(storeId, id);
    if (!current) throw new Error('Nhân viên không tồn tại');

    if (input.role) this.assertCanAssignRole(actorRole, input.role);
    if (actorRole !== 'admin' && current.role !== 'cashier') {
      throw new Error('Quản lý chỉ được cập nhật tài khoản thu ngân');
    }
    if (id === actorId && input.is_active === false) {
      throw new Error('Không thể tự khóa tài khoản đang đăng nhập');
    }

    const updateData: Record<string, unknown> = {};
    if (input.full_name !== undefined) updateData.full_name = input.full_name;
    if (input.phone !== undefined) updateData.phone = input.phone || null;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.role) updateData.role_id = await this.getRoleId(input.role);
    if (input.password) updateData.password_hash = await bcrypt.hash(input.password, 10);

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('store_id', storeId)
      .eq('id', id)
      .select(employeeSelect)
      .single();

    if (error || !data) throw new Error(error?.message || 'Không thể cập nhật nhân viên');
    return toUserResponse(data);
  }

  static async deactivate(storeId: string, id: string, actorId: string, actorRole: UserRole) {
    const current = await this.getById(storeId, id);
    if (!current) throw new Error('Nhân viên không tồn tại');
    if (id === actorId) throw new Error('Không thể tự khóa tài khoản đang đăng nhập');
    if (actorRole !== 'admin' && current.role !== 'cashier') {
      throw new Error('Quản lý chỉ được khóa tài khoản thu ngân');
    }

    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('store_id', storeId)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private static async getById(storeId: string, id: string): Promise<UserResponse | null> {
    const { data, error } = await supabase
      .from('users')
      .select(employeeSelect)
      .eq('store_id', storeId)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return toUserResponse(data);
  }

  private static async getRoleId(role: UserRole) {
    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (error || !data) throw new Error('Không tìm thấy vai trò nhân viên');
    return data.id;
  }

  private static assertCanAssignRole(actorRole: UserRole, targetRole: UserRole) {
    if (actorRole !== 'admin' && targetRole !== 'cashier') {
      throw new Error('Chỉ admin được tạo hoặc gán quyền quản lý/admin');
    }
  }
}

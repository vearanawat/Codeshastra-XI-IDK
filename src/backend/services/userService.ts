import supabase from '../supabase/client';
import { User } from '../types';

export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('user_id');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get users');
  }
}

export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user');
  }
}

export async function createUser(user: Partial<User>) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user.user_id)
      .single();
    
    if (existingUser) {
      throw new Error('User ID already exists');
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data[0];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user');
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('User not found');
    }
    
    return data[0];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user');
  }
}

export async function deleteUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete user');
  }
} 
import supabase from '../supabase/client';
import { User } from '../types';

export async function signIn(userId: string, password: string) {
  try {
    // Query the users table to find a matching user ID
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      throw new Error('Invalid user ID or password');
    }
    
    // In a real application, you would verify the password with a proper hash comparison
    // For this demo, we'll accept any password (this is insecure and should never be used in production)
    // In a real app, you would do something like: if (!await bcrypt.compare(password, data.passwordHash))
    
    // Determine user role based on the 'user_role' field in the database
    // Note: We store "admin" in localStorage for backward compatibility with existing code
    const isAdmin = data.user_role === 'Admin';
    const storableRole = isAdmin ? 'admin' : data.user_role.toLowerCase();
    
    // Return user information
    return {
      user: data,
      isAdmin,
      userId: data.user_id,
      userRole: storableRole, // Use lowercase for consistency with existing code
      department: data.department,
      employeeStatus: data.employee_status,
      userEmail: `${data.user_id}@example.com`, // Mock email for display
    };
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed');
  }
}

export async function signOut() {
  try {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    }
    
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Sign out failed');
  }
}

export async function getCurrentUser() {
  try {
    // For our custom auth system, we retrieve from localStorage
    if (typeof window === 'undefined') return null;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    
    // Fetch the latest user data from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) {
      // User not found in database, clear local storage
      await signOut();
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to get current user:', error.message);
    return null;
  }
} 
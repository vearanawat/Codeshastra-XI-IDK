"use client";

import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/backend/services/userService";
import { User } from "@/backend/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState<Partial<User>>({
    user_id: "",
    user_role: "Employee",
    department: "",
    employee_status: "Full-time",
    region: "NA"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Auth check - redirect if not admin
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    // Check for both "Admin" (from database) and "admin" (legacy format) for backward compatibility
    const isAdminUser = userRole === "Admin" || userRole === "admin";
    
    if (!isAuthenticated || !isAdminUser) {
      // Use window.location for hard redirect to ensure a full page reload
      window.location.href = "/auth/login";
      return;
    }
  }, []);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser(newUser);
      setNewUser({
        user_id: "",
        user_role: "Employee",
        department: "",
        employee_status: "Full-time",
        region: "NA"
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.user_id, editingUser);
      setIsEditing(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  }

  function startEditing(user: User) {
    setEditingUser({ ...user });
    setIsEditing(true);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError("")}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit User" : "Create New User"}
        </h2>
        
        <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_id">
                User ID
              </label>
              <input
                id="user_id"
                type="text"
                required
                disabled={isEditing}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={isEditing ? editingUser?.user_id : newUser.user_id}
                onChange={(e) => 
                  isEditing 
                    ? setEditingUser({ ...editingUser!, user_id: e.target.value })
                    : setNewUser({ ...newUser, user_id: e.target.value })
                }
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_role">
                Role
              </label>
              <select
                id="user_role"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={isEditing ? editingUser?.user_role : newUser.user_role}
                onChange={(e) => 
                  isEditing 
                    ? setEditingUser({ ...editingUser!, user_role: e.target.value })
                    : setNewUser({ ...newUser, user_role: e.target.value })
                }
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="Contractor">Contractor</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
                Department
              </label>
              <select
                id="department"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={isEditing ? editingUser?.department : newUser.department}
                onChange={(e) => 
                  isEditing 
                    ? setEditingUser({ ...editingUser!, department: e.target.value })
                    : setNewUser({ ...newUser, department: e.target.value })
                }
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee_status">
                Status
              </label>
              <select
                id="employee_status"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={isEditing ? editingUser?.employee_status : newUser.employee_status}
                onChange={(e) => 
                  isEditing 
                    ? setEditingUser({ ...editingUser!, employee_status: e.target.value })
                    : setNewUser({ ...newUser, employee_status: e.target.value })
                }
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
                Region
              </label>
              <select
                id="region"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={isEditing ? editingUser?.region : newUser.region}
                onChange={(e) => 
                  isEditing 
                    ? setEditingUser({ ...editingUser!, region: e.target.value })
                    : setNewUser({ ...newUser, region: e.target.value })
                }
              >
                <option value="NA">North America (NA)</option>
                <option value="LATAM">Latin America (LATAM)</option>
                <option value="EU">Europe (EU)</option>
                <option value="APAC">Asia Pacific (APAC)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isEditing ? "Update User" : "Create User"}
            </button>
            
            {isEditing && (
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">User List</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.user_role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.employee_status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => startEditing(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
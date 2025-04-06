"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";

// Mock user data
const mockUsers = [
  { 
    id: 1, 
    userId: "ADM12345",
    name: "John Doe", 
    email: "john.doe@example.com", 
    role: "Admin", 
    status: "Active", 
    lastActive: "2 hours ago",
    avatar: "JD"
  },
  { 
    id: 2, 
    userId: "MGR23456",
    name: "Sarah Johnson", 
    email: "sarah.johnson@example.com", 
    role: "Manager", 
    status: "Active", 
    lastActive: "Just now",
    avatar: "SJ"
  },
  { 
    id: 3, 
    userId: "EMP34567",
    name: "Alex Rodriguez", 
    email: "alex.r@example.com", 
    role: "Employee", 
    status: "Inactive", 
    lastActive: "3 days ago",
    avatar: "AR"
  },
  { 
    id: 4, 
    userId: "ADM23456",
    name: "Mary Smith", 
    email: "mary.smith@example.com", 
    role: "Admin", 
    status: "Active", 
    lastActive: "1 hour ago",
    avatar: "MS"
  },
  { 
    id: 5, 
    userId: "MGR34567",
    name: "David Wu", 
    email: "david.wu@example.com", 
    role: "Manager", 
    status: "Active", 
    lastActive: "Yesterday",
    avatar: "DW"
  },
  { 
    id: 6, 
    userId: "EMP45678",
    name: "Emily Chen", 
    email: "emily.chen@example.com", 
    role: "Employee", 
    status: "Active", 
    lastActive: "5 hours ago",
    avatar: "EC"
  },
  { 
    id: 7, 
    userId: "EMP56789",
    name: "Robert Taylor", 
    email: "robert.t@example.com", 
    role: "Employee", 
    status: "Inactive", 
    lastActive: "1 week ago",
    avatar: "RT"
  },
  { 
    id: 8, 
    userId: "EMP67890",
    name: "Lisa Wang", 
    email: "lisa.wang@example.com", 
    role: "Employee", 
    status: "Active", 
    lastActive: "3 hours ago",
    avatar: "LW"
  }
];

// Roles for filter chips
const roles = ["Admin", "Manager", "Employee"];

// Statuses for filter chips
const statuses = ["Active", "Inactive"];

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRoleFilters, setActiveRoleFilters] = useState<string[]>([]);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Employee",
    status: "Active"
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { 
      scale: 0.95, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  // Auth check
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    // Check for both "Admin" (from database) and "admin" (legacy format) for backward compatibility
    const isAdminUser = userRole === "Admin" || userRole === "admin";
    
    if (!isAuthenticated || !isAdminUser) {
      router.push("/auth/login");
    }
  }, [router]);
  
  // Filter users based on search term, role filters, and status filters
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeRoleFilters.length > 0) {
      result = result.filter(user => activeRoleFilters.includes(user.role));
    }
    
    if (activeStatusFilters.length > 0) {
      result = result.filter(user => activeStatusFilters.includes(user.status));
    }
    
    setFilteredUsers(result);
    
    // Reset selectAll when filters change
    setSelectAll(false);
    setSelectedUsers([]);
  }, [searchTerm, activeRoleFilters, activeStatusFilters, users]);
  
  // Toggle role filter
  const toggleRoleFilter = (role: string) => {
    if (activeRoleFilters.includes(role)) {
      setActiveRoleFilters(activeRoleFilters.filter(r => r !== role));
    } else {
      setActiveRoleFilters([...activeRoleFilters, role]);
    }
  };
  
  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    if (activeStatusFilters.includes(status)) {
      setActiveStatusFilters(activeStatusFilters.filter(s => s !== status));
    } else {
      setActiveStatusFilters([...activeStatusFilters, status]);
    }
  };
  
  // Toggle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Toggle individual user selection
  const toggleUserSelection = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      if (selectedUsers.length + 1 === filteredUsers.length) {
        setSelectAll(true);
      }
    }
  };
  
  // Delete selected users
  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;
    
    const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
    setUsers(updatedUsers);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Delete a single user
  const handleDeleteUser = (userId: number) => {
    // Filter out the user with the specified ID
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    // If the user was selected, remove from selection
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      if (selectAll) setSelectAll(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveRoleFilters([]);
    setActiveStatusFilters([]);
  };
  
  // Generate role color
  const getRoleColor = (role: string) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Employee": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Generate status dot color
  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-500" : "bg-gray-400";
  };
  
  // Handle input change for new user form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
    } = {};
    
    if (!newUser.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!newUser.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email is invalid";
    } else if (users.some(user => user.email === newUser.email)) {
      errors.email = "Email already exists";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create new user with unique ID and generate avatar from initials
      const names = newUser.name.split(' ');
      const avatar = names.length > 1 
        ? (names[0][0] + names[1][0]).toUpperCase() 
        : names[0].substring(0, 2).toUpperCase();
      
      // Generate user ID based on role
      let userIdPrefix;
      switch(newUser.role) {
        case "Admin":
          userIdPrefix = "ADM";
          break;
        case "Manager":
          userIdPrefix = "MGR";
          break;
        default:
          userIdPrefix = "EMP";
      }
      
      // Generate a random 5-digit number and pad with zeros if needed
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      const userId = `${userIdPrefix}${randomNum}`;
      
      const newUserData = {
        id: Math.max(0, ...users.map(user => user.id)) + 1,
        userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        lastActive: "Just now",
        avatar
      };
      
      // Add user to state
      setUsers(prev => [newUserData, ...prev]);
      
      // Reset form
      setNewUser({
        name: "",
        email: "",
        role: "Employee",
        status: "Active"
      });
      
      // Close modal
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-x-hidden">
      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 w-full max-w-full">
        <motion.div 
          className="mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page Header */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <motion.button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </motion.button>
                
                {selectedUsers.length > 0 && (
                  <motion.button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteSelected}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({selectedUsers.length})
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Search and Filters Bar */}
            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                {/* Search */}
                <div className="relative flex-grow mb-4 md:mb-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search users by name, email, or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* View Type Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4 md:mb-0">
                  <button
                    className={`flex items-center justify-center p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    className={`flex items-center justify-center p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Select All Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label className="text-sm text-gray-700">Select All</label>
                </div>
              </div>
              
              {/* Filter Pills */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                  
                  <div className="flex-grow sm:flex-grow-0 sm:w-40">
                    <CustomSelect
                      options={[{ value: "", label: "All Roles" }, ...roles.map(role => ({ value: role, label: role }))]}
                      value={activeRoleFilters.length === 1 ? activeRoleFilters[0] : ""}
                      onChange={(value) => {
                        if (value === "") {
                          setActiveRoleFilters([]);
                        } else {
                          setActiveRoleFilters([value]);
                        }
                      }}
                      id="role-filter"
                      name="role-filter"
                      label="Role"
                    />
                  </div>
                  
                  <div className="flex-grow sm:flex-grow-0 sm:w-40">
                    <CustomSelect
                      options={[{ value: "", label: "All Statuses" }, ...statuses.map(status => ({ value: status, label: status }))]}
                      value={activeStatusFilters.length === 1 ? activeStatusFilters[0] : ""}
                      onChange={(value) => {
                        if (value === "") {
                          setActiveStatusFilters([]);
                        } else {
                          setActiveStatusFilters([value]);
                        }
                      }}
                      id="status-filter"
                      name="status-filter"
                      label="Status"
                    />
                  </div>
                  
                  {/* Clear All Filters */}
                  {(searchTerm || activeRoleFilters.length > 0 || activeStatusFilters.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Grid or List View */}
          <AnimatePresence>
            {filteredUsers.length === 0 ? (
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-8 text-center"
                variants={itemVariants}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      layoutId={`user-${user.id}`}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                        selectedUsers.includes(user.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg`}>
                              {user.avatar}
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium">{user.name}</h3>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              <p className="text-xs font-medium text-gray-800 mt-1">ID: {user.userId}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(user.status)} mr-1`}></span>
                            <span className="text-xs text-gray-500">{user.status}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-xs text-gray-500">
                          Last active: {user.lastActive}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-2 flex justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          onClick={() => alert(`Edit ${user.name}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.id}
                        className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {user.avatar}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(user.status)} mr-2`}></span>
                            <span className="text-sm text-gray-500">{user.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => alert(`Edit ${user.name}`)}>
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <motion.div className="mt-6 flex items-center justify-between" variants={itemVariants}>
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  className="flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </motion.button>
                <motion.button
                  className="flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {/* Add User Modal */}
          <AnimatePresence>
            {isAddModalOpen && (
              <div
                className="fixed inset-0 overflow-y-auto z-50"
                aria-labelledby="modal-title"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={() => setIsAddModalOpen(false)}
                  ></div>

                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                  <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <form onSubmit={handleSubmit}>
                      <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          <span className="sr-only">Close</span>
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New User</h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Fill in the details below to create a new user. A unique User ID will be automatically generated based on the selected role.
                          </p>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                                value={newUser.name}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                              />
                              {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                              )}
                            </div>
                            
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                                value={newUser.email}
                                onChange={handleInputChange}
                                placeholder="johndoe@example.com"
                              />
                              {formErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                              )}
                            </div>
                            
                            <div>
                              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <select
                                name="role"
                                id="role"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newUser.role}
                                onChange={handleInputChange}
                              >
                                {roles.map((role) => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                              <p className="mt-1 text-xs text-gray-500">
                                {newUser.role === "Admin" && "Will generate ID starting with ADM"}
                                {newUser.role === "Manager" && "Will generate ID starting with MGR"}
                                {newUser.role === "Employee" && "Will generate ID starting with EMP"}
                              </p>
                            </div>
                            
                            <div>
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                name="status"
                                id="status"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newUser.status}
                                onChange={handleInputChange}
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Add User
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 
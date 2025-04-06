"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";
import { 
  listAllFiles,
  deleteFile,
  downloadFile
} from "@/app/utils/supabaseStorage";

// Define different document categories
const DOCUMENT_CATEGORIES = [
  { id: "contract", name: "Contract" },
  { id: "report", name: "Report" },
  { id: "financial", name: "Financial" },
  { id: "presentation", name: "Presentation" },
  { id: "other", name: "Other" }
];

// Format file size function
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [users, setUsers] = useState<string[]>([]);

  // Check authentication and load documents
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    if (userRole !== "admin") {
      router.push("/employee/dashboard");
      return;
    }
    
    setIsAdmin(true);
    loadAllDocuments();
  }, [router]);
  
  // Load all documents from Supabase
  const loadAllDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await listAllFiles();
      
      // Transform the files to match our UI format
      const formattedDocs = files.map(file => {
        const fileName = file.name.split('-').slice(1).join('-') || file.name; // Remove timestamp prefix if exists
        
        return {
          id: file.id || file.name,
          name: fileName,
          size: file.metadata?.size ? formatFileSize(file.metadata.size) : "Unknown",
          type: file.metadata?.mimetype || "Unknown",
          uploadDate: new Date(file.created_at || Date.now()).toISOString().split('T')[0],
          category: file.category || "other",
          userId: file.userId || "unknown",
          path: file.path
        };
      });
      
      // Extract unique user IDs
      const uniqueUsers = Array.from(new Set(formattedDocs.map(doc => doc.userId)));
      setUsers(uniqueUsers);
      
      setDocuments(formattedDocs);
    } catch (err: any) {
      console.error("Error loading documents:", err);
      setError("Failed to load documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteFile(documentToDelete.path);
      
      // Remove document from the list
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      setShowConfirmDelete(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete document. Please try again.");
    }
  };
  
  // Handle file download
  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      // Get blob data from Supabase
      const blob = await downloadFile(filePath);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError("Failed to download file. Please try again.");
    }
  };
  
  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => {
    if (filter !== "all" && doc.category !== filter) return false;
    if (userFilter !== "all" && doc.userId !== userFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "size") {
      // Extract numeric part for comparison
      const sizeA = parseFloat(a.size.split(' ')[0]);
      const sizeB = parseFloat(b.size.split(' ')[0]);
      return sizeB - sizeA;
    } else if (sortBy === "user") {
      return a.userId.localeCompare(b.userId);
    }
    return 0;
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    }
  };
  
  // Document item component
  const DocumentItem = ({ document }: { document: any }) => {
    // Determine file icon based on type
    const getFileIcon = () => {
      if (document.type.includes('pdf')) return '📄';
      if (document.type.includes('word') || document.type.includes('doc')) return '📝';
      if (document.type.includes('spreadsheet') || document.type.includes('excel') || document.type.includes('xls')) return '📊';
      if (document.type.includes('presentation') || document.type.includes('powerpoint') || document.type.includes('ppt')) return '📑';
      if (document.type.includes('image')) return '🖼️';
      return '📁';
    };
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
        whileHover={{ y: -2 }}
        layout
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getFileIcon()}</span>
            <div>
              <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">{document.name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">{document.size}</span>
                <span className="mx-1 text-gray-300">•</span>
                <span className="text-xs text-gray-500">{document.uploadDate}</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                User: {document.userId}
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
              onClick={() => handleDownload(document.path, document.name)}
              aria-label="Download"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
              onClick={() => {
                setDocumentToDelete(document);
                setShowConfirmDelete(true);
              }}
              aria-label="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {DOCUMENT_CATEGORIES.find(cat => cat.id === document.category)?.name || 'Other'}
          </span>
        </div>
      </motion.div>
    );
  };

  // If not admin, don't render anything (we will redirect)
  if (!isAdmin && !isLoading) {
    return null;
  }

  return (
    <div className="py-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all documents uploaded by users
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Documents</h2>
              <div className="text-indigo-100">
                {filteredDocuments.length} document(s) from {users.length} user(s)
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Search and filters */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  onClick={loadAllDocuments}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect
                  id="filter-by-user"
                  name="filter-by-user"
                  label="Filter by User"
                  options={[
                    { value: "all", label: "All Users" },
                    ...users.map(userId => ({ value: userId, label: `User: ${userId}` }))
                  ]}
                  value={userFilter}
                  onChange={setUserFilter}
                />
                
                <CustomSelect
                  id="filter-by-category"
                  name="filter-by-category"
                  label="Filter by Category"
                  options={[
                    { value: "all", label: "All Categories" },
                    ...DOCUMENT_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))
                  ]}
                  value={filter}
                  onChange={setFilter}
                />
                
                <CustomSelect
                  id="sort-by"
                  name="sort-by"
                  label="Sort by"
                  options={[
                    { value: "date", label: "Date (newest first)" },
                    { value: "name", label: "Name (A-Z)" },
                    { value: "size", label: "Size (largest first)" },
                    { value: "user", label: "User ID" }
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
            </div>
            
            {/* Documents list */}
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-350px)]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredDocuments.map((doc) => (
                    <DocumentItem key={doc.id} document={doc} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {userFilter !== "all" || filter !== "all" ? "Try changing your filters" : "No documents have been uploaded yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showConfirmDelete && documentToDelete && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{documentToDelete.name}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setDocumentToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={handleDeleteDocument}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
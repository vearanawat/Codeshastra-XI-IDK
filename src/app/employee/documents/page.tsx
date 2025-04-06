"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";
import { 
  uploadFile, 
  listUserFiles, 
  downloadFile, 
  getFileUrl 
} from "@/app/utils/supabaseStorage";
import { formatFileSize } from "@/app/utils/formatters";

// Define different document categories
const DOCUMENT_CATEGORIES = [
  { id: "contract", name: "Contract" },
  { id: "report", name: "Report" },
  { id: "financial", name: "Financial" },
  { id: "presentation", name: "Presentation" },
  { id: "other", name: "Other" }
];

export default function UploadDocumentsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Check authentication and set user info
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    const id = localStorage.getItem("userId");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    setUserEmail(email);
    setUserId(id);
    
    // Load user's documents
    if (id) {
      loadUserDocuments(id);
    }
  }, [router]);
  
  // Load user documents from Supabase
  const loadUserDocuments = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await listUserFiles(userId);
      
      // Transform the files to match our UI format
      const formattedDocs = files.map(file => {
        // Get category from the path (userId/category/filename)
        const pathParts = file.name.split('/');
        const category = pathParts.length > 1 ? pathParts[1] : 'other';
        
        return {
          id: file.id || file.name,
          name: file.name.split('-').slice(1).join('-'), // Remove timestamp prefix
          size: file.metadata?.size ? formatFileSize(file.metadata.size) : "Unknown",
          type: file.metadata?.mimetype || "Unknown",
          uploadDate: new Date(file.created_at || Date.now()).toISOString().split('T')[0],
          category: file.category || category,
          status: "processed",
          path: file.path
        };
      });
      
      setDocuments(formattedDocs);
    } catch (err: any) {
      console.error("Error loading documents:", err);
      setError("Failed to load documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  // Handle upload to Supabase
  const handleUpload = async () => {
    if (files.length === 0 || !userId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Progress simulation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      const uploadPromises = files.map(file => 
        uploadFile(file, userId, selectedCategory)
      );
      
      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Complete progress
      setUploadProgress(100);
      
      // Format and add the uploaded files to the document list
      const newDocs = uploadedFiles.map((fileData, index) => ({
        id: `${Date.now()}-${index}`,
        name: fileData.name,
        size: formatFileSize(fileData.size),
        type: fileData.type,
        uploadDate: new Date().toISOString().split('T')[0],
        category: selectedCategory,
        status: "processed",
        path: fileData.path
      }));
      
      // Update documents list
      setDocuments(prev => [...newDocs, ...prev]);
      setFiles([]);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error uploading files:", err);
      setError("Failed to upload files. Please try again.");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
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
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Add document item component with download button
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
              <p className="text-xs text-gray-500 mt-1">
                {document.size} • {document.uploadDate}
              </p>
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
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {DOCUMENT_CATEGORIES.find(cat => cat.id === document.category)?.name || 'Other'}
          </span>
          {document.status === "processing" && (
            <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Processing
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-6 h-screen overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <h1 className="text-2xl font-bold">Upload Documents</h1>
            <p className="text-blue-100">Upload and manage your documents</p>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row">
            {/* Upload area */}
            <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h2>
              
              {/* Success message */}
              <AnimatePresence>
                {showSuccessMessage && (
                  <motion.div 
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Documents uploaded successfully!
                  </motion.div>
                )}
              </AnimatePresence>

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
              
              {/* File drop zone */}
              <div 
                ref={dropZoneRef}
                className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">
                      Drag and drop your files here, or 
                      <button 
                        type="button" 
                        className="text-blue-600 hover:text-blue-700 font-medium px-1 focus:outline-none"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel, PowerPoint, and image files supported</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect} 
                    multiple
                  />
                </div>
              </div>
              
              {/* Selected files */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files ({files.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-800 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Document category */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Document Category</h3>
                <CustomSelect
                  id="document-category"
                  name="document-category"
                  options={DOCUMENT_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>
              
              {/* Upload button */}
              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isUploading || files.length === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Upload Files
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Document list */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Documents</h2>
                <span className="text-sm text-gray-500">{filteredDocuments.length} document(s)</span>
              </div>
              
              {/* Search and filters */}
              <div className="mb-6">
                <div className="flex mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <CustomSelect
                    id="sort-by"
                    name="sort-by"
                    options={[
                      { value: "date", label: "Sort by Date" },
                      { value: "name", label: "Sort by Name" },
                      { value: "size", label: "Sort by Size" }
                    ]}
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-full"
                  />
                  
                  <CustomSelect
                    id="filter-by"
                    name="filter-by"
                    options={[
                      { value: "all", label: "All Categories" },
                      ...DOCUMENT_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    value={filter}
                    onChange={setFilter}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Document list */}
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100vh-400px)]"
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
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter !== "all" ? "Try changing your filters" : "Get started by uploading your first document"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";

// Define different document categories
const DOCUMENT_CATEGORIES = [
  { id: "contract", name: "Contract" },
  { id: "report", name: "Report" },
  { id: "financial", name: "Financial" },
  { id: "presentation", name: "Presentation" },
  { id: "other", name: "Other" }
];

// Mock previously uploaded documents
const MOCK_DOCUMENTS = [
  { 
    id: 1, 
    name: "Q3 Financial Report.pdf", 
    size: "2.4 MB", 
    type: "application/pdf", 
    uploadDate: "2023-10-15", 
    category: "financial", 
    status: "processed" 
  },
  { 
    id: 2, 
    name: "Project Proposal.docx", 
    size: "1.8 MB", 
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    uploadDate: "2023-10-10", 
    category: "report", 
    status: "processed" 
  },
  { 
    id: 3, 
    name: "Employee Contract.pdf", 
    size: "568 KB", 
    type: "application/pdf", 
    uploadDate: "2023-09-28", 
    category: "contract", 
    status: "processing" 
  }
];

export default function UploadDocumentsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Check authentication and set user email
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    setUserEmail(email);
  }, [router]);
  
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
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  // Handle upload
  const handleUpload = () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        // Add uploaded files to documents list
        const newDocs = files.map((file, index) => ({
          id: documents.length + index + 1,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          uploadDate: new Date().toISOString().split("T")[0],
          category: selectedCategory,
          status: "processing"
        }));
        
        setDocuments([...newDocs, ...documents]);
        setFiles([]);
        setIsUploading(false);
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }, 500);
    }, 2000);
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
      return parseFloat(b.size) - parseFloat(a.size);
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
              
              {/* Drag and drop area */}
              <div 
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg className={`h-12 w-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-base text-gray-600 mb-1">
                  {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOCX, XLSX, PPTX, TXT, JPG, PNG
                </p>
              </div>
              
              {/* Document category */}
              <div className="mt-4">
                <CustomSelect
                  label="Document Category"
                  options={DOCUMENT_CATEGORIES.map(category => ({ value: category.id, label: category.name }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>
              
              {/* Selected files */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({files.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No files selected</p>
                  ) : (
                    files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center truncate pr-3">
                          <div className="flex-shrink-0 mr-2">
                            {file.type.includes('pdf') ? (
                              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : file.type.includes('word') || file.type.includes('doc') ? (
                              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : file.type.includes('sheet') || file.type.includes('excel') || file.type.includes('xls') ? (
                              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ) : file.type.includes('image') ? (
                              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-400 hover:text-gray-500 p-1"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Upload progress and button */}
              <div className="mt-6">
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}
                
                <motion.button 
                  type="button"
                  disabled={files.length === 0 || isUploading}
                  className={`w-full py-2 rounded-lg flex items-center justify-center font-medium ${
                    files.length === 0 || isUploading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  whileHover={files.length > 0 && !isUploading ? { scale: 1.02 } : {}}
                  whileTap={files.length > 0 && !isUploading ? { scale: 0.98 } : {}}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {isUploading ? "Uploading..." : "Upload Documents"}
                </motion.button>
              </div>
            </div>
            
            {/* Document list */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Documents</h2>
                <span className="text-sm text-gray-500">{filteredDocuments.length} documents</span>
              </div>
              
              {/* Filters and search */}
              <div className="flex flex-col sm:flex-row mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="sm:flex-1">
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <CustomSelect
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: "all", label: "All Categories" },
                      ...DOCUMENT_CATEGORIES.map(category => ({ value: category.id, label: category.name }))
                    ]}
                    className="flex-shrink-0"
                  />
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: "date", label: "Sort by Date" },
                      { value: "name", label: "Sort by Name" },
                      { value: "size", label: "Sort by Size" }
                    ]}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
              
              {/* Document list */}
              <div className="space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto">
                <AnimatePresence>
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">No documents found</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredDocuments.map((doc) => (
                        <motion.div 
                          key={doc.id}
                          variants={itemVariants}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                {doc.type.includes('pdf') ? (
                                  <div className="w-10 h-12 bg-red-100 flex items-center justify-center rounded-md">
                                    <span className="text-red-600 text-xs font-semibold">PDF</span>
                                  </div>
                                ) : doc.type.includes('word') || doc.type.includes('doc') ? (
                                  <div className="w-10 h-12 bg-blue-100 flex items-center justify-center rounded-md">
                                    <span className="text-blue-600 text-xs font-semibold">DOC</span>
                                  </div>
                                ) : doc.type.includes('sheet') || doc.type.includes('excel') || doc.type.includes('xls') ? (
                                  <div className="w-10 h-12 bg-green-100 flex items-center justify-center rounded-md">
                                    <span className="text-green-600 text-xs font-semibold">XLS</span>
                                  </div>
                                ) : doc.type.includes('presentation') || doc.type.includes('powerpoint') || doc.type.includes('ppt') ? (
                                  <div className="w-10 h-12 bg-orange-100 flex items-center justify-center rounded-md">
                                    <span className="text-orange-600 text-xs font-semibold">PPT</span>
                                  </div>
                                ) : doc.type.includes('image') ? (
                                  <div className="w-10 h-12 bg-purple-100 flex items-center justify-center rounded-md">
                                    <span className="text-purple-600 text-xs font-semibold">IMG</span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-12 bg-gray-100 flex items-center justify-center rounded-md">
                                    <span className="text-gray-600 text-xs font-semibold">DOC</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-800">{doc.name}</h3>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500 mr-2">{doc.size}</span>
                                  <span className="text-xs text-gray-500 mr-2">•</span>
                                  <span className="text-xs text-gray-500">{doc.uploadDate}</span>
                                </div>
                                <div className="flex items-center mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {DOCUMENT_CATEGORIES.find(c => c.id === doc.category)?.name || 'Other'}
                                  </span>
                                  {doc.status === "processing" ? (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Processing
                                    </span>
                                  ) : (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Ready
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
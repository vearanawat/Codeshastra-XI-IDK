"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    title: "Product Overview.pdf",
    type: "pdf",
    category: "Documentation",
    uploadedBy: "Sarah Chen",
    status: "Public",
    views: 1250,
    size: "3.2 MB",
    uploadDate: "2023-09-12T14:32:00Z",
    description: "Complete product overview and feature documentation"
  },
  {
    id: 2,
    title: "Installation Guide.pdf",
    type: "pdf",
    category: "Technical",
    uploadedBy: "Michael Johnson",
    status: "Public",
    views: 850,
    size: "2.1 MB",
    uploadDate: "2023-10-05T09:15:00Z",
    description: "Step-by-step installation procedures for all platforms"
  },
  {
    id: 3,
    title: "Q3 Financial Report.xlsx",
    type: "spreadsheet",
    category: "Financial",
    uploadedBy: "Jennifer Williams",
    status: "Internal",
    views: 325,
    size: "1.8 MB",
    uploadDate: "2023-11-10T16:45:00Z",
    description: "Quarterly financial report with growth projections"
  },
  {
    id: 4,
    title: "Conference Presentation.pptx",
    type: "document",
    category: "Marketing",
    uploadedBy: "David Robinson",
    status: "Internal",
    views: 178,
    size: "5.7 MB",
    uploadDate: "2023-10-28T11:20:00Z",
    description: "Presentation slides for the annual industry conference"
  },
  {
    id: 5,
    title: "Product Roadmap.docx",
    type: "document",
    category: "Planning",
    uploadedBy: "Amanda Lewis",
    status: "Internal",
    views: 420,
    size: "1.2 MB",
    uploadDate: "2023-11-15T13:50:00Z",
    description: "12-month product development roadmap and milestones"
  },
  {
    id: 6,
    title: "Team Photo.jpg",
    type: "image",
    category: "HR",
    uploadedBy: "Robert Davis",
    status: "Public",
    views: 103,
    size: "2.5 MB",
    uploadDate: "2023-09-30T15:25:00Z",
    description: "Team photo from the company retreat"
  },
  {
    id: 7,
    title: "Product Demo.mp4",
    type: "video",
    category: "Marketing",
    uploadedBy: "Stephanie Clark",
    status: "Public",
    views: 560,
    size: "18.5 MB",
    uploadDate: "2023-10-18T10:05:00Z",
    description: "Video demonstration of key product features"
  },
  {
    id: 8,
    title: "Customer Interview.mp3",
    type: "audio",
    category: "Research",
    uploadedBy: "Alex Thompson",
    status: "Internal",
    views: 89,
    size: "4.3 MB",
    uploadDate: "2023-11-05T09:30:00Z",
    description: "Audio recording of customer feedback interview"
  }
];

// Categories
const categories = [
  "All Categories",
  "Documentation", 
  "Technical", 
  "Marketing", 
  "HR", 
  "Financial", 
  "Planning", 
  "Research"
];

// Status options
const statusOptions = [
  "All Statuses",
  "Public", 
  "Internal"
];

// Document types
const documentTypes = [
  "All Types",
  "pdf",
  "document",
  "spreadsheet",
  "image",
  "video",
  "audio"
];

export default function KnowledgeBase() {
  const router = useRouter();
  const [documents, setDocuments] = useState(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  
  // Form state for new document
  const [documentForm, setDocumentForm] = useState({
    title: "",
    type: "pdf",
    category: "Documentation",
    description: "",
    status: "Internal",
    size: "0 MB"
  });
  
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
  
  // Filter documents based on search term, category, status, and type
  useEffect(() => {
    let result = documents;
    
    if (searchTerm) {
      result = result.filter(document => 
        document.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        document.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "All Categories") {
      result = result.filter(document => document.category === selectedCategory);
    }
    
    if (selectedStatus !== "All Statuses") {
      result = result.filter(document => document.status === selectedStatus);
    }
    
    if (selectedType !== "All Types") {
      result = result.filter(document => document.type === selectedType);
    }
    
    setFilteredDocuments(result);
  }, [searchTerm, selectedCategory, selectedStatus, selectedType, documents]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Handle delete document
  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter(document => document.id !== id));
  };
  
  // Handle edit document
  const handleEditDocument = (id: number) => {
    const document = documents.find(d => d.id === id);
    if (document) {
      setDocumentForm({
        title: document.title,
        type: document.type,
        category: document.category,
        description: document.description,
        status: document.status,
        size: document.size
      });
      setIsEditMode(true);
      setSelectedDocument(id);
      setShowAddModal(true);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDocumentForm({ ...documentForm, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && selectedDocument) {
      // Update existing document
      setDocuments(documents.map(document => 
        document.id === selectedDocument 
          ? { 
              ...document, 
              title: documentForm.title,
              type: documentForm.type,
              category: documentForm.category,
              description: documentForm.description,
              status: documentForm.status,
              size: documentForm.size,
              uploadDate: new Date().toISOString()
            }
          : document
      ));
    } else {
      // Create new document
      const newDocument = {
        id: documents.length + 1,
        title: documentForm.title,
        type: documentForm.type,
        category: documentForm.category,
        uploadedBy: "Admin", // In a real app, get the current user
        status: documentForm.status,
        views: 0,
        size: documentForm.size,
        uploadDate: new Date().toISOString(),
        description: documentForm.description
      };
      
      setDocuments([...documents, newDocument]);
    }
    
    // Reset form and close modal
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedDocument(null);
    setDocumentForm({
      title: "",
      type: "pdf",
      category: "Documentation",
      description: "",
      status: "Internal",
      size: "0 MB"
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "Public":
        return "bg-green-100 text-green-800";
      case "Internal":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get file type icon and color
  const getFileTypeInfo = (type: string) => {
    switch(type) {
      case "pdf":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: "text-red-500"
        };
      case "document":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: "text-blue-500"
        };
      case "spreadsheet":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-green-500"
        };
      case "image":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-purple-500"
        };
      case "video":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-indigo-500"
        };
      case "audio":
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          ),
          color: "text-yellow-500"
        };
      default:
        return { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-gray-500"
        };
    }
  };
  
  // Handle document preview
  const handlePreviewDocument = (id: number) => {
    const document = documents.find(d => d.id === id);
    if (document) {
      setPreviewDocument(document);
      setShowPreviewModal(true);
    }
  };
  
  // Get preview content based on document type
  const getPreviewContent = (document: any) => {
    switch(document.type) {
      case "image":
        return (
          <div className="flex items-center justify-center h-96">
            <img 
              src={`/images/placeholders/${document.id}.jpg`} 
              alt={document.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        );
      case "video":
        return (
          <div className="flex items-center justify-center">
            <video 
              controls 
              className="max-h-96 max-w-full"
            >
              <source src={`/videos/placeholders/${document.id}.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "audio":
        return (
          <div className="p-8 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                {getFileTypeInfo(document.type).icon}
              </div>
              <h3 className="text-lg font-medium mb-4">{document.title}</h3>
              <audio 
                controls 
                className="w-full"
              >
                <source src={`/audio/placeholders/${document.id}.mp3`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        );
      case "pdf":
        return (
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-8 rounded-lg w-full text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                  {getFileTypeInfo(document.type).icon}
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">{document.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{document.description}</p>
              <p className="text-xs text-gray-400 mb-6">PDF Viewer not available in this demo.</p>
              <a 
                href="#" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                onClick={(e) => e.preventDefault()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>
        );
      case "spreadsheet":
        return (
          <div className="overflow-x-auto">
            <div className="bg-gray-100 p-8 rounded-lg text-center mb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                  {getFileTypeInfo(document.type).icon}
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">{document.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{document.description}</p>
              <p className="text-xs text-gray-400">Spreadsheet Viewer not available in this demo.</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Expenses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {['January', 'February', 'March', 'April', 'May'].map((month, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r">${Math.floor(Math.random() * 10000 + 5000)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r">${Math.floor(Math.random() * 5000 + 2000)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.floor(Math.random() * 5000 + 1000)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "document":
        return (
          <div className="bg-white p-8 border rounded-lg">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                {getFileTypeInfo(document.type).icon}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">{document.title}</h2>
            <div className="prose max-w-none">
              <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eu aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nisl eu nisl. Donec euismod, nisl eu aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nisl eu nisl.</p>
              <h3 className="text-xl font-semibold mb-3">Overview</h3>
              <p className="mb-4">{document.description}</p>
              <p className="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <h3 className="text-xl font-semibold mb-3">Details</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">Feature one explanation and benefits</li>
                <li className="mb-1">Feature two with supporting information</li>
                <li className="mb-1">Feature three capabilities and use cases</li>
                <li className="mb-1">Feature four technical specifications</li>
              </ul>
              <p>This is a placeholder document preview as the actual content would be loaded from the server in a real application.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {getFileTypeInfo(document.type).icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{document.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{document.description}</p>
            <p className="text-base text-center">Preview not available for this file type.</p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage uploaded documents across the platform</p>
          </div>
          <div className="mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                setIsEditMode(false);
                setSelectedDocument(null);
                setDocumentForm({
                  title: "",
                  type: "pdf",
                  category: "Documentation",
                  description: "",
                  status: "Internal",
                  size: "0 MB"
                });
                setShowAddModal(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Document
            </motion.button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{documents.length}</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Public Documents</p>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{documents.filter(a => a.status === "Public").length}</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">
              {documents.reduce((sum, document) => sum + document.views, 0).toLocaleString()}
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Categories</p>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">
              {new Set(documents.map(a => a.category)).size}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Search by title or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <CustomSelect 
                  id="category"
                  name="category"
                  label="Category"
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <CustomSelect 
                  id="status"
                  name="status"
                  label="Status"
                  options={statusOptions.map(status => ({ value: status, label: status }))}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <CustomSelect 
                  id="type"
                  name="type"
                  label="Type"
                  options={documentTypes.map(type => ({ value: type, label: type }))}
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents List */}
        <motion.div 
          className="bg-white rounded-lg shadow overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">{filteredDocuments.length} results</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <motion.tr 
                      key={document.id}
                      whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-md ${getFileTypeInfo(document.type).color} bg-opacity-20 flex items-center justify-center`}>
                            {getFileTypeInfo(document.type).icon}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{document.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeInfo(document.type).color} bg-opacity-10`}>
                          {document.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(document.status)}`}>
                          {document.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(document.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePreviewDocument(document.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </motion.button>
                          <motion.button
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditDocument(document.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </motion.button>
                          <motion.button
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty state */}
            {filteredDocuments.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or upload a new document.</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Upload/Edit Document Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 overflow-y-auto z-50"
            aria-labelledby="modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                onClick={() => setShowAddModal(false)}
                aria-hidden="true"
              ></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div 
                className="inline-block align-bottom bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center pb-3 mb-4 border-b">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {isEditMode ? "Edit Document" : "Upload Document"}
                      </h3>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowAddModal(false)}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Title</label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={documentForm.title}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Document Type</label>
                          <CustomSelect 
                            id="type"
                            name="type"
                            label="Type"
                            options={documentTypes.filter(type => type !== "All Types").map(type => ({ value: type, label: type }))}
                            value={documentForm.type}
                            onChange={(value) => handleInputChange({ target: { name: 'type', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                          <CustomSelect 
                            id="category"
                            name="category"
                            label="Category"
                            options={categories.filter(cat => cat !== "All Categories").map(cat => ({ value: cat, label: cat }))}
                            value={documentForm.category}
                            onChange={(value) => handleInputChange({ target: { name: 'category', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                          <CustomSelect 
                            id="status"
                            name="status"
                            label="Status"
                            options={statusOptions.filter(status => status !== "All Statuses").map(status => ({ value: status, label: status }))}
                            value={documentForm.status}
                            onChange={(value) => handleInputChange({ target: { name: 'status', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700">File Size</label>
                        <input
                          type="text"
                          name="size"
                          id="size"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={documentForm.size}
                          onChange={handleInputChange}
                          placeholder="e.g. 2.5 MB"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={documentForm.description}
                          onChange={handleInputChange}
                          placeholder="A brief description of the document"
                        />
                      </div>
                      
                      {!isEditMode && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700">Upload File</label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Upload a file</span>
                                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, Word, Excel, PowerPoint, Images, Audio, Video up to 30MB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isEditMode ? "Save Changes" : "Upload"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Preview Document Modal */}
        {showPreviewModal && previewDocument && (
          <div 
            className="fixed inset-0 overflow-y-auto z-50"
            aria-labelledby="preview-modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                onClick={() => setShowPreviewModal(false)}
                aria-hidden="true"
              ></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div 
                className="inline-block align-bottom bg-white rounded-lg max-w-4xl w-full mx-auto shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center" id="preview-modal-title">
                      <span className={`mr-2 ${getFileTypeInfo(previewDocument.type).color}`}>
                        {getFileTypeInfo(previewDocument.type).icon}
                      </span>
                      {previewDocument.title}
                    </h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusBadgeColor(previewDocument.status)}`}>
                        {previewDocument.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-4 bg-blue-100 text-blue-800`}>
                        {previewDocument.category}
                      </span>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowPreviewModal(false)}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    {getPreviewContent(previewDocument)}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    Close
                  </button>
                  <a
                    href="#"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
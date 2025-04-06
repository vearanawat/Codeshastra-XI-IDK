"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

// Mock conversation data for demonstration
const mockConversations = [
  { id: 1, title: "Project X Analysis", date: "Today", unread: true },
  { id: 2, title: "Q3 Financial Report", date: "Yesterday", unread: false },
  { id: 3, title: "New Marketing Strategy", date: "Aug 10", unread: false },
  { id: 4, title: "HR Policies", date: "Aug 5", unread: false },
  { id: 5, title: "Customer Feedback Analysis", date: "Jul 29", unread: false },
];

// Mock chat messages for the current conversation
const mockInitialMessages = [
  { 
    id: 1, 
    role: "assistant", 
    content: "Hello! I'm PenguinAI, your helpful assistant. How can I help you today?",
    timestamp: "10:30 AM" 
  },
];

// Sample quick prompts for the user to choose from
const quickPrompts = [
  "Summarize the latest quarterly report",
  "What were the key findings from yesterday's meeting?",
  "Generate a weekly update for my team",
  "Analyze the performance of our marketing campaign",
  "Draft a response to the client's feedback"
];

// RAG API URL - This should match your backend URL
const RAG_API_URL = "http://localhost:5000/query"; // Use secured endpoint
// const RAG_API_URL = "http://localhost:5000/dev_query"; // Development endpoint (bypasses permission checks)

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Default admin user ID - This matches the sample dataset
const DEFAULT_USER_ID = "1001";  // Admin user from synthetic dataset

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDept, setUserDept] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState(mockInitialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFormatting, setShowFormatting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user information from Supabase
  const fetchUserInfo = async (email: string) => {
    try {
      console.log("Fetching user info for email:", email);
      
      // First, check if we have a direct user ID in localStorage
      const directUserId = localStorage.getItem("userId");
      if (directUserId) {
        console.log("Direct user ID found in localStorage:", directUserId);
        
        // Try to fetch user directly by ID first
        const { data: directUserData, error: directUserError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", directUserId)
          .single();
        
        if (!directUserError && directUserData) {
          console.log("Found user by direct ID:", directUserData);
          return directUserData;
        } else {
          console.log("Couldn't find user by direct ID, falling back to email lookup");
        }
      }
      
      // Get the auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return null;
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        return null;
      }
      
      // Get user from Supabase auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching auth user:", userError);
        return null;
      }
      
      const authUserId = userData.user?.id;
      console.log("Auth user ID:", authUserId);
      
      // Query the users table to get the department-specific user ID
      const { data: userRecords, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      
      if (error) {
        console.error("Error fetching user from database:", error);
        // Fallback to querying by auth ID if email fails
        if (authUserId) {
          const { data: userByAuth, error: authError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", authUserId)
            .single();
          
          if (authError) {
            console.error("Error fetching user by auth ID:", authError);
            return null;
          }
          
          return userByAuth;
        }
        return null;
      }
      
      console.log("User record from Supabase:", userRecords);
      return userRecords;
    } catch (error) {
      console.error("Error in fetchUserInfo:", error);
      return null;
    }
  };
  
  // Check authentication and set user email
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    const directUserId = localStorage.getItem("userId");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    // Special handling for direct user ID login (e.g., for testing)
    if (directUserId) {
      console.log("Direct user ID found in localStorage:", directUserId);
      
      // Set the user ID directly from localStorage
      setUserId(directUserId);
      
      // Try to fetch additional user information if email is available
      if (email) {
        setUserEmail(email);
        setIsLoading(true);
        
        // Attempt to get user details from Supabase
        fetchUserInfo(email).then(userData => {
          setIsLoading(false);
          
          if (userData) {
            // Also set department and role if available
            if (userData.department) {
              setUserDept(userData.department);
              localStorage.setItem("userDept", userData.department);
            } else {
              // Set default department based on user ID if not in database
              const deptMap: {[key: string]: string} = {
                "1001": "IT",
                "1002": "HR", 
                "1003": "Finance",
                "2131": "Sales",
                "9999": "Operations"
              };
              
              const defaultDept = deptMap[directUserId] || "Unknown";
              setUserDept(defaultDept);
              localStorage.setItem("userDept", defaultDept);
            }
            
            if (userData.user_role) {
              setUserRole(userData.user_role);
              localStorage.setItem("userRole", userData.user_role);
            } else {
              // Default to regular user unless it's the admin ID
              const defaultRole = directUserId === "1001" ? "Admin" : "User";
              setUserRole(defaultRole);
              localStorage.setItem("userRole", defaultRole);
            }
          } else {
            // If no user data from Supabase, set defaults based on user ID
            console.log("Using default department/role mapping for user ID:", directUserId);
            
            // Set default department based on user ID
            const deptMap: {[key: string]: string} = {
              "1001": "IT",
              "1002": "HR", 
              "1003": "Finance",
              "2131": "Sales",
              "9999": "Operations"
            };
            
            const defaultDept = deptMap[directUserId] || "Unknown";
            setUserDept(defaultDept);
            localStorage.setItem("userDept", defaultDept);
            
            // Default to regular user unless it's the admin ID
            const defaultRole = directUserId === "1001" ? "Admin" : "User";
            setUserRole(defaultRole);
            localStorage.setItem("userRole", defaultRole);
          }
        });
      }
      return;
    }
    
    // Standard flow if no direct user ID
    if (email) {
    setUserEmail(email);
      setIsLoading(true);
      
      // Fetch user info from Supabase
      fetchUserInfo(email).then(userData => {
        setIsLoading(false);
        
        if (userData) {
          // Set user ID from Supabase
          const supabaseUserId = userData.user_id || userData.id;
          console.log("Setting user ID from Supabase:", supabaseUserId);
          
          if (supabaseUserId) {
            setUserId(supabaseUserId.toString());
            localStorage.setItem("userId", supabaseUserId.toString());
            
            // Also set department and role if available
            if (userData.department) {
              setUserDept(userData.department);
              localStorage.setItem("userDept", userData.department);
            }
            
            if (userData.user_role) {
              setUserRole(userData.user_role);
              localStorage.setItem("userRole", userData.user_role);
            }
          } else {
            console.warn("No user_id found in Supabase data");
          }
        } else {
          console.warn("User not found in Supabase, chat features may be limited");
        }
      });
    } else {
      console.warn("No email found in localStorage, can't fetch user info");
    }
  }, [router]);
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);
  
  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() && attachments.length === 0) return;
    
    // Don't allow sending if we don't have a user ID yet
    if (!userId) {
      setApiError("Can't send message: User not authenticated or user ID not found");
      return;
    }
    
    const newUserMessage = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages([...messages, newUserMessage]);
    setInputMessage("");
    setAttachments([]);
    setIsSending(true);
    setApiError(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Call RAG API
      const response = await fetch(RAG_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          query: inputMessage,
        }),
      });
      
      const data = await response.json();
      
      // Handle API response
      if (data.status === "approved") {
        const sources = data.sources ? 
          data.sources.map((source: any) => 
            source.filename || source.source || "Unknown source").join(", ") : 
          "";
        
        const sourceFooter = sources ? `\n\nSources: ${sources}` : "";
        
        const newAssistantMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: data.response + sourceFooter,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawResponse: data
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
      } else if (data.status === "denied") {
        // Create a dynamic, personalized access denied message
        const baseErrorMessage = data.message || "Access denied. You don't have permission to access this information.";
        
        // Detect what type of information was requested
        const queryLower = inputMessage.toLowerCase();
        const errorLower = baseErrorMessage.toLowerCase();
        
        // Determine content type being requested
        const isFinanceQuery = (
          queryLower.includes("finance") || 
          queryLower.includes("financial") || 
          queryLower.includes("budget") || 
          queryLower.includes("revenue") || 
          queryLower.includes("profit") || 
          queryLower.includes("earnings") || 
          queryLower.includes("report") ||
          errorLower.includes("finance")
        );
        
        const isITQuery = (
          queryLower.includes("it ") || 
          queryLower.includes("system") || 
          queryLower.includes("technology") || 
          queryLower.includes("software") || 
          queryLower.includes("hardware") || 
          queryLower.includes("network") || 
          queryLower.includes("security") ||
          errorLower.includes("it department")
        );
        
        const isHRQuery = (
          queryLower.includes("hr") || 
          queryLower.includes("human resources") || 
          queryLower.includes("personnel") || 
          queryLower.includes("employee") || 
          queryLower.includes("staff") || 
          queryLower.includes("benefits") || 
          queryLower.includes("hiring") ||
          errorLower.includes("hr department")
        );
        
        const isSalesQuery = (
          queryLower.includes("sales") || 
          queryLower.includes("customer") || 
          queryLower.includes("client") || 
          queryLower.includes("market") || 
          queryLower.includes("sell") ||
          errorLower.includes("sales department")
        );
        
        // Build a dynamic, helpful response based on context
        let deniedMessage = "🔒 " + baseErrorMessage + "\n\n";
        
        // Add context-specific advice
        if (isFinanceQuery) {
          // For finance queries
          if (userDept?.toLowerCase() === "hr") {
            deniedMessage += `As an HR staff member, you don't have permission to access financial information. For this specific report, please contact the Finance department (Jane Doe at jane.doe@company.com) with your request, and include your manager in CC.`;
          } else if (userDept?.toLowerCase() === "sales") {
            deniedMessage += `Sales team members don't have direct access to financial data. For revenue and forecast information relevant to your accounts, please request a filtered report from your Finance partner (Alex Smith).`;
          } else if (userDept?.toLowerCase() === "operations") {
            deniedMessage += `Operations team members need special approval for finance data access. Please submit a formal request through the Operations portal with your manager's approval.`;
          } else {
            deniedMessage += `This financial information is restricted to Finance department users and executives. If you need this data for your work, please submit an access request form explaining your specific needs.`;
          }
        } else if (isITQuery) {
          deniedMessage += `IT system information is restricted to IT department staff and authorized personnel. If you need technical documentation, please open a support ticket with the IT service desk.`;
        } else if (isHRQuery) {
          deniedMessage += `HR data is confidential and only accessible to HR personnel. If you need specific employee information, please contact your HR representative directly.`;
        } else if (isSalesQuery) {
          deniedMessage += `Sales data is restricted to the Sales department and executives. For specific customer or market information, please contact your Sales team lead.`;
        } else {
          deniedMessage += `This information is restricted based on your department and role. If you need access for your work, please request permission from your department manager.`;
        }
        
        // Add a general note about data access policies
        deniedMessage += `\n\nFor more information about data access policies, please refer to the company information security guidelines.`;
        
        const newAssistantMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: deniedMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          isDenied: true
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
        setApiError(baseErrorMessage);
      } else {
        // Handle other error responses
        const errorMessage = data.message || "An error occurred while processing your request.";
        
        const newAssistantMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: `I'm sorry, I couldn't process your request. ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
        setApiError(errorMessage);
      }
    } catch (error) {
      console.error("Error calling RAG API:", error);
      
      // Show error message
      const newAssistantMessage = {
        id: messages.length + 2,
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      setApiError("Network error connecting to the RAG API. Please check if the backend server is running.");
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };
  
  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  // Handle inserting a quick prompt
  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    // Focus the textarea
    textareaRef.current?.focus();
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
      }
    }
  };
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Render chat message component
  const ChatMessage = ({ message }: { message: any }) => {
    const isUser = message.role === "user";
    const isError = message.isError === true;
    const isDenied = message.isDenied === true;
    
    return (
      <motion.div 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
        variants={messageVariants}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
            isUser ? 'ml-3 bg-blue-500' : 
            isDenied ? 'mr-3 bg-yellow-500' : 
            isError ? 'mr-3 bg-red-500' : 
            'mr-3 bg-gray-700'
          }`}>
            {isUser ? (userEmail ? userEmail.charAt(0).toUpperCase() : 'U') : isDenied ? '🔒' : 'AI'}
          </div>
          <div className={`rounded-2xl px-5 py-3 shadow-sm ${
            isUser ? 'bg-blue-500 text-white' : 
            isDenied ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 
            isError ? 'bg-red-50 text-red-700' : 
            'bg-white text-gray-800'
          }`}>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.attachments.map((file: File, index: number) => (
                  <div key={index} className={`flex items-center p-2 rounded ${isUser ? 'bg-blue-400 bg-opacity-40' : 'bg-gray-100'}`}>
                    <svg className={`h-5 w-5 mr-2 ${isUser ? 'text-white' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="whitespace-pre-line text-[15px]">{message.content}</div>
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 
              isDenied ? 'text-yellow-500' : 
              isError ? 'text-red-500' : 
              'text-gray-500'
            } text-right`}>
              {message.timestamp}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-start mb-6">
      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 mr-3 bg-gray-700">
        AI
      </div>
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
        <div className="flex space-x-2">
          <motion.div 
            className="w-2.5 h-2.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.div 
            className="w-2.5 h-2.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.div 
            className="w-2.5 h-2.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, repeatType: "loop" }}
          />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="py-6 h-screen overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Conversation Sidebar */}
        <AnimatePresence mode="wait">
          {showConversations && (
            <motion.div 
              className="w-80 bg-white rounded-l-xl shadow-md flex flex-col mr-0.5 overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <motion.button
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConversations(false)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="p-4">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <motion.button 
                    className="w-full px-4 py-3 flex items-center text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setMessages(mockInitialMessages);
                      setActiveConversation({ id: Date.now(), title: "New Chat", date: "Now", unread: false });
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Conversation
                  </motion.button>
                </div>
                
                <div className="px-2 py-4">
                  <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Recent</h3>
                  {mockConversations.map((conversation) => (
                    <motion.div 
                      key={conversation.id}
                      className={`px-3 py-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                        activeConversation.id === conversation.id 
                          ? 'bg-blue-50 border-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center">
                            <h3 className={`font-medium text-sm truncate mr-2 ${conversation.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {conversation.title}
                            </h3>
                            {conversation.unread && (
                              <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{conversation.date}</p>
                        </div>
                        <motion.button
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">Clear All</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">Export History</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-r-xl shadow-md overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center">
              {!showConversations && (
                <motion.button 
                  className="mr-3 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConversations(true)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
              )}
              <div className="flex flex-col">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">{activeConversation.title}</h2>
                <span className="ml-2 text-xs text-gray-500 font-normal">Last updated {activeConversation.date.toLowerCase()}</span>
                </div>
                
                {/* User ID and Department from Supabase */}
                <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading user info...</span>
                    </div>
                  ) : userId ? (
                    <>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                        userRole?.toLowerCase() === "admin" ? "bg-purple-100 text-purple-800" : 
                        userDept?.toLowerCase() === "hr" ? "bg-green-100 text-green-800" : 
                        userDept?.toLowerCase() === "finance" ? "bg-blue-100 text-blue-800" : 
                        userDept?.toLowerCase() === "sales" ? "bg-orange-100 text-orange-800" : 
                        userDept?.toLowerCase() === "operations" ? "bg-gray-100 text-gray-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        Supabase User ID: {userId}
                      </span>
                      {userDept && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                          Department: {userDept}
                        </span>
                      )}
                      {userRole && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                          Role: {userRole}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-500">
                      ⚠️ User ID not found in Supabase
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <motion.button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </motion.button>
              <motion.button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </motion.button>
              <motion.button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </motion.button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-white p-6">
            <motion.div 
              className="max-w-3xl mx-auto space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              {apiError && !isTyping && (
                <div className="text-center p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm mb-4">
                  {apiError}
                </div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          </div>
          
          {/* Quick Prompts */}
          <div className="bg-white border-t border-gray-100 py-3 px-4">
            <div className="max-w-3xl mx-auto">
              <h4 className="text-xs font-medium text-gray-500 mb-2">QUICK PROMPTS</h4>
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs whitespace-nowrap flex-shrink-0 border border-blue-100"
                    whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickPrompt(prompt)}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Input Area with Attachments */}
          <div className="bg-white border-t border-gray-100 p-4">
            <div className="max-w-3xl mx-auto">
              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg px-3 py-1.5 flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-700 truncate max-w-[150px]">{file.name}</span>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-700"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Formatting Options */}
              {showFormatting && (
                <motion.div 
                  className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg flex justify-between shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="flex space-x-1">
                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setShowFormatting(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              )}
              
              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-end rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 border border-gray-200 bg-white overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full py-3 px-4 focus:outline-none resize-none text-gray-800 block"
                      style={{ minHeight: '52px', maxHeight: '120px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center p-2 space-x-1">
                    <motion.button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFormatting(!showFormatting)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </motion.button>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    
                    <motion.button
                      type="submit"
                      className={`p-2 rounded-full ${isSending ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      whileHover={!isSending ? { scale: 1.05 } : {}}
                      whileTap={!isSending ? { scale: 0.95 } : {}}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
                
                {/* Status message */}
                <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {apiError ? (
                    <span className="text-red-500">Error connecting to API. Check console for details.</span>
                  ) : (
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  )}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
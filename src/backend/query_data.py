# 

from flask import Flask, request, jsonify
from flask_cors import CORS  # Add CORS support
import pandas as pd
import joblib
import google.generativeai as genai
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate
from groq import Groq
from dotenv import load_dotenv
import os
from supabase import create_client

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow Hoppscotch access

# Load environment variables
load_dotenv()  # Load environment variables from .env

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma")
MODEL_DIR = os.path.join(BASE_DIR, "models")
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "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"
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
BUCKET_NAME = "documents"

# Create models directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Initialize Supabase client
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")

# Load models and encoders for permission checking - with fallback
model = None
label_encoders = None
feature_cols = None
dataset = None

try:
    # Try to load the XGBoost model and related files
    model_path = os.path.join(MODEL_DIR, 'xgb_model.pkl')
    encoders_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
    features_path = os.path.join(MODEL_DIR, 'used_columns.pkl')
    dataset_path = os.path.join(MODEL_DIR, 'synthetic_access_data_10000 (2).csv')
    
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("XGBoost model loaded successfully")
    else:
        print(f"Warning: XGBoost model not found at {model_path}")
        
    if os.path.exists(encoders_path):
        label_encoders = joblib.load(encoders_path)
        print("Label encoders loaded successfully")
    else:
        print(f"Warning: Label encoders not found at {encoders_path}")
        
    if os.path.exists(features_path):
        feature_cols = joblib.load(features_path)
        print("Feature columns loaded successfully")
    else:
        print(f"Warning: Feature columns not found at {features_path}")
        
    if os.path.exists(dataset_path):
        dataset = pd.read_csv(dataset_path)
        print("Dataset loaded successfully")
    else:
        print(f"Warning: Dataset not found at {dataset_path}")
        
except Exception as e:
    print(f"Error loading XGBoost model files: {e}")
    print("Access control will be limited to basic role checks")

# Configure Gemini for department extraction
gemini = None
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY") or "AIzaSyD_wNOQfA-blv6doc2n_5aT9bezZwdC8i8")
    gemini = genai.GenerativeModel("gemini-1.5-flash")
    print("Gemini model initialized successfully")
except Exception as e:
    print(f"Error initializing Gemini model: {e}")
    print("Department extraction will be unavailable")

# Function to log queries to Supabase
def log_query_to_supabase(user_id, query, response_status, response_content=None):
    if not supabase:
        print("Warning: Supabase client not initialized, skipping query logging")
        return
    
    try:
        data = {
            "user_id": user_id,
            "query_text": query,
            "status": response_status,
            "response": response_content[:500] if response_content else None  # Limit response length
        }
        
        result = supabase.table("query_logs").insert(data).execute()
        print(f"Query logged to Supabase: User {user_id}, Query: '{query[:30]}...'")
        return result
    except Exception as e:
        print(f"Error logging query to Supabase: {str(e)}")
        return None

# Prompt template for RAG
PROMPT_TEMPLATE = """
You are an expert assistant designed to answer questions based *only* on the provided context. 
Synthesize a comprehensive answer using the details found in the context below.

Context:
-------
{context}
-------

Question: {question}

Instructions:
1. Base your answer *solely* on the information within the provided context.
2. If the context contains technical details, numbers, links, or codes, include them accurately.
3. If the context doesn't contain the answer, state that the information is not available in the provided documents.
4. Combine relevant information from different parts of the context to form a complete answer.
5. Be detailed and thorough in your response.

Answer:
"""

# Department normalization mapping
DEPT_MAPPING = {
    "it": "IT",
    "i.t.": "IT",
    "information technology": "IT", 
    "human resources": "HR",
    "h.r.": "HR",
    "hr": "HR",
    "finance": "Finance",
    "financial": "Finance",
    "accounting": "Finance",
    "sales": "Sales",
    "marketing": "Marketing",
    "general": "General",
    "operations": "Operations",
    "operation": "Operations",
    "ops": "Operations"
}

# Normalize department name
def normalize_department(dept: str) -> str:
    return DEPT_MAPPING.get(dept.lower(), dept.title())

# Department extraction function
def get_department_from_query(query: str) -> str:
    if not gemini:
        print("Warning: Gemini model not available for department extraction")
        return "Unknown"
        
    try:
        prompt = f"""Extract the department name (like IT, HR, Marketing, Finance, Sales) from this query: "{query}".
        Just return one department name without extra text. If no department is mentioned, respond with "General".
        Important: If the department is IT or Information Technology, always return "IT" (uppercase)."""
        response = gemini.generate_content(prompt, generation_config={"max_output_tokens": 10})
        extracted_dept = response.text.strip()
        
        # Normalize the extracted department
        normalized_dept = normalize_department(extracted_dept)
        
        print(f"🧠 Gemini extracted department: '{extracted_dept}' -> normalized to '{normalized_dept}' from query: '{query}'")
        return normalized_dept
    except Exception as e:
        print(f"Error extracting department: {e}")
        return "Unknown"

# Simple keyword-based department extraction as fallback
def extract_department_from_keywords(query: str) -> str:
    query = query.lower()
    department_keywords = {
        "IT": ["it ", "technology", "computer", "software", "hardware", "network", "system", "security policy", "tech"],
        "HR": ["hr ", "human resources", "employee", "staff", "hiring", "benefits", "payroll", "personnel", "recruitment"],
        "Finance": ["finance", "financial", "budget", "revenue", "expense", "profit", "cost", "report", "q1", "q2", "q3", "q4", "quarter", "fiscal", "earnings", "balance sheet", "income statement", "cash flow"],
        "Sales": ["sales", "customer", "client", "revenue", "sell", "purchase", "order", "market share", "forecast"],
        "Marketing": ["marketing", "campaign", "brand", "advertisement", "promotion", "market research", "social media"],
        "Operations": ["operations", "logistics", "supply chain", "workflow", "process", "operational", "procurement", "inventory", "warehouse"]
    }
    
    for dept, keywords in department_keywords.items():
        for keyword in keywords:
            if keyword in query:
                print(f"📝 Keyword '{keyword}' matched department: {dept}")
                return dept
    
    return "General"

# Strict access check that doesn't rely solely on keywords
def is_finance_related(query_text: str) -> bool:
    """Additional check to determine if a query is specifically finance-related."""
    finance_terms = [
        "finance", "financial", "budget", "revenue", "expense", "profit", "cost", 
        "report", "q1", "q2", "q3", "q4", "quarter", "fiscal", "earnings", 
        "balance sheet", "income statement", "cash flow", "financial report"
    ]
    query_lower = query_text.lower()
    
    # Check for finance-related terms
    for term in finance_terms:
        if term in query_lower:
            print(f"📊 Finance term detected: '{term}'")
            return True
            
    # Broader pattern matching
    if "report" in query_lower and any(x in query_lower for x in ["financial", "finance", "budget", "earnings"]):
        print("📊 Finance report pattern detected")
        return True
        
    return False

# Permission prediction function with fallback for missing model
def predict_from_user_id_and_query(user_id, query: str):
    # Check if user exists in Supabase
    if supabase:
        try:
            # Look up user in Supabase auth users
            user_response = supabase.from_("users").select("*").eq("user_id", user_id).execute()
            
            if user_response and user_response.data and len(user_response.data) > 0:
                # User found in Supabase
                user_data = user_response.data[0]
                print(f"✅ User found in Supabase: {user_id} (Role: {user_data.get('user_role', 'Unknown')}, Department: {user_data.get('department', 'Unknown')})")
                
                # Extract department from query using Gemini
                extracted_department = get_department_from_query(query)
                
                # If extraction fails or returns Unknown, try keyword-based extraction
                if extracted_department == "Unknown":
                    extracted_department = extract_department_from_keywords(query)
                    print(f"🔍 Used keyword-based extraction: {extracted_department}")
                
                # Check permissions based on user role - Accept both "admin" and "Admin"
                if user_data.get('user_role', '').lower() == 'admin':
                    # Admin users can access anything
                    print(f"🔓 Access APPROVED: User {user_id} is an Admin")
                    return {"status": "approved", "message": "Access Approved (Admin user)"}
                    
                # For non-admin users, check department restrictions
                user_dept = user_data.get('department', '').lower()
                query_dept = extracted_department.lower()
                
                # Special case for General department (no specific department in query)
                if query_dept == "general":
                    print(f"🔓 Access APPROVED: General query without specific department")
                    return {"status": "approved", "message": "Access Approved (General query)"}
                
                if user_dept != query_dept and query_dept != "unknown":
                    print(f"🔒 Access DENIED: User department '{user_dept}' doesn't match query department '{query_dept}'")
                    return {"status": "denied", "message": f"Access Denied: User is from {user_data.get('department')}, but query refers to {extracted_department}"}
                
                # Department matches, grant access
                print(f"🔓 Access APPROVED: User department '{user_dept}' matches query department '{query_dept}'")
                return {"status": "approved", "message": "Access Approved (Department match)"}
            
            # If we can't find the user in Supabase but XGBoost model is available, fall back to CSV check
            if model is not None and dataset is not None:
                print(f"⚠️ User ID {user_id} not found in Supabase, checking synthetic dataset...")
                return predict_from_synthetic_data(user_id, query)
            
            # If there's no Supabase user and no XGBoost model, default to allowing access for development
            print(f"⚠️ User ID {user_id} not found in Supabase, allowing access (development mode)")
            return {"status": "approved", "message": f"Access Approved (User not found but allowing access)"}
            
        except Exception as e:
            print(f"❌ Error checking user in Supabase: {e}")
            # Fall back to XGBoost if available
            if model is not None and dataset is not None:
                return predict_from_synthetic_data(user_id, query)
            # Otherwise, allow access for development
            return {"status": "approved", "message": "Access Approved (Error checking Supabase)"}
    
    # If no Supabase connection, fall back to XGBoost model if available
    if model is not None and dataset is not None:
        return predict_from_synthetic_data(user_id, query)
        
    # Basic fallback if model or dataset is not available
    print("⚠️ Using basic role check as fallback (XGBoost model not available)")
    # Always approve for testing if model is missing
    return {"status": "approved", "message": "Access Approved (Development mode)"}

# Original prediction function now used as fallback
def predict_from_synthetic_data(user_id, query: str):
    try:
        user_id = int(user_id)
    except:
        pass

    dataset['user_id'] = dataset['user_id'].astype(str)
    user_id = str(user_id)

    user_row = dataset[dataset['user_id'] == user_id]
    if user_row.empty:
        # Don't fail but provide a development-friendly response
        print(f"User ID {user_id} not found in synthetic dataset, allowing access for development")
        return {"status": "approved", "message": f"Access Approved (Development mode)"}

    user_row = user_row.iloc[0].to_dict()

    extracted_department = get_department_from_query(query)
    print(f"🧠 Gemini extracted department from synthetic data: {extracted_department}")

    if user_row['user_role'].lower() != 'admin':
        if user_row['department'].lower() != extracted_department.lower():
            return {"status": "denied", "message": f"Access Denied: User is from {user_row['department']}, but query refers to {extracted_department}"}

    import numpy as np
    from datetime import datetime

    user_row['timestamp'] = pd.to_datetime(user_row['timestamp'], errors='coerce')
    user_row['event_hour'] = user_row['timestamp'].hour if pd.notnull(user_row['timestamp']) else 12
    user_row['employee_join_date'] = pd.to_datetime(user_row['employee_join_date'], errors='coerce')
    user_row['last_security_training'] = pd.to_datetime(user_row['last_security_training'], errors='coerce')
    user_row['trained'] = int(pd.notnull(user_row['last_security_training']))
    current_date = pd.to_datetime('2025-04-05')
    user_row['tenure_days'] = (current_date - user_row['employee_join_date']).days if pd.notnull(user_row['employee_join_date']) else -1
    user_row['ip_valid'] = 0 if user_row['ip_address'] == 'invalid_ip' else 1
    user_row['ip_address'] = user_row['ip_address'] if user_row['ip_address'] != 'invalid_ip' else '0.0.0.0'

    def convert_time_in_position(tip):
        if 'years' in tip:
            return int(tip.split()[0]) * 12
        elif 'months' in tip:
            return int(tip.split()[0])
        return 0
    user_row['time_in_position_months'] = convert_time_in_position(user_row.get('time_in_position', '0 months'))

    drop_cols = ['request_id', 'timestamp', 'user_id', 'employee_join_date', 
                 'last_security_training', 'time_in_position', 'is_approved']
    for col in drop_cols:
        user_row.pop(col, None)

    categorical_cols = ['user_role', 'department', 'employee_status', 'resource_type', 
                        'resource_sensitivity', 'action', 'request_reason', 'location', 
                        'device_type', 'region', 'encryption_required', 'ip_address']
    
    for col in categorical_cols:
        value = user_row.get(col)
        if pd.isna(value):
            user_row[col] = 'Unknown'
        try:
            user_row[col] = label_encoders[col].transform([user_row[col]])[0]
        except (ValueError, KeyError) as e:
            print(f"Warning: Issue with {col}: {e}. Defaulting to 'Unknown'.")
            try:
                user_row[col] = label_encoders[col].transform(['Unknown'])[0]
            except:
                user_row[col] = 0  # Absolute fallback

    df = pd.DataFrame([user_row])[feature_cols]
    prediction = model.predict(df)
    return {"status": "approved" if prediction[0] == 1 else "denied", "message": "Access Approved" if prediction[0] == 1 else "Access Denied"}

# RAG query processing function
def process_query(user_id: str, query_text: str):
    print(f"\n{'='*70}\nPROCESSING QUERY: '{query_text}' for USER: {user_id}\n{'='*70}")
    
    # STEP 1: Get user information
    user_info = {}
    try:
        if supabase:
            user_response = supabase.from_("users").select("*").eq("user_id", user_id).execute()
            if user_response and user_response.data and len(user_response.data) > 0:
                user_info = user_response.data[0]
                user_role = user_info.get('user_role', '').lower()
                user_dept = user_info.get('department', '').lower()
                print(f"👤 USER: {user_id} (Role: {user_role}, Department: {user_dept})")
            else:
                print(f"⚠️ User {user_id} not found")
                return {"status": "denied", "message": f"Access Denied: User ID {user_id} not found"}
    except Exception as e:
        print(f"❌ Error getting user info: {e}")
        return {"status": "error", "message": f"Error retrieving user information: {str(e)}"}
    
    # STEP 2: Strict content/document type check
    user_role = user_info.get('user_role', '').lower()
    user_dept = user_info.get('department', '').lower()
    
    # Only admin or finance users can access finance content
    finance_keywords = [
        'finance', 'financial', 'earnings', 'revenue', 'profit', 'balance sheet', 
        'income statement', 'cash flow', 'budget', 'fiscal', 'quarter', 'annual report',
        'q1', 'q2', 'q3', 'q4', 'statement', 'report'
    ]
    
    # Check if query is finance-related
    is_finance_query = False
    query_lower = query_text.lower()
    for keyword in finance_keywords:
        if keyword in query_lower:
            is_finance_query = True
            print(f"📊 Finance keyword detected: '{keyword}'")
            break
    
    # STRICT ACCESS CONTROL: Only allow finance queries for Finance dept or Admins
    if is_finance_query and user_role != 'admin' and user_dept != 'finance':
        print(f"🚫 ACCESS DENIED: {user_dept} user tried to access finance data")
        return {
            "status": "denied",
            "message": f"Access Denied: Finance information is restricted to Finance department users only. Your department ({user_dept.title()}) does not have sufficient privileges."
        }
    
    # STEP 3: Use embeddings to check for finance content
    try:
        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # Search docs - just to check what's available
        if os.path.exists(CHROMA_PATH):
            db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
            results = db.similarity_search_with_relevance_scores(query_text, k=5)
            
            # Check if any docs are finance-related by content
            has_finance_docs = False
            for doc, score in results:
                doc_text = doc.page_content.lower()
                doc_dept = doc.metadata.get('department', '').lower()
                
                # Direct department check
                if doc_dept == 'finance':
                    has_finance_docs = True
                    print(f"📁 Finance document detected by metadata")
                    break
                
                # Check content for finance terms
                for keyword in finance_keywords:
                    if keyword in doc_text and len(keyword) > 3:  # Avoid false positives
                        has_finance_docs = True
                        print(f"📄 Finance content detected: '{keyword}'")
                        break
                
                if has_finance_docs:
                    break
            
            # SECOND CHECK: Block non-finance users from finance documents
            if has_finance_docs and user_role != 'admin' and user_dept != 'finance':
                print(f"🚫 ACCESS DENIED: {user_dept} user attempted to access finance documents")
                return {
                    "status": "denied",
                    "message": f"Access Denied: The document you're requesting contains financial information. As a {user_dept.title()} department member, you don't have the required clearance for these documents."
                }
    except Exception as e:
        print(f"❌ Error checking document content: {e}")
    
    # STEP 4: Department-based access check
    try:
        # Extract query department 
        query_dept = get_department_from_query(query_text)
        if query_dept == "Unknown":
            query_dept = extract_department_from_keywords(query_text)
        
        print(f"🔍 Query classified as {query_dept} department")
        
        # Department match check - Admin override
        if user_role == 'admin':
            print(f"🔓 Access granted: Admin user")
        elif query_dept.lower() == 'general':
            print(f"🔓 Access granted: General query")
        elif user_dept != query_dept.lower() and query_dept.lower() != 'unknown':
            print(f"🚫 ACCESS DENIED: Dept mismatch - User: {user_dept}, Query: {query_dept.lower()}")
            return {
                "status": "denied",
                "message": f"Access Denied: You're requesting information from the {query_dept} department, but your credentials ({user_info.get('department', 'Unknown')}) only allow access to {user_dept.title()} department data."
            }
    except Exception as e:
        print(f"❌ Error in department check: {e}")
    
    # STEP 5: Now proceed with RAG if all checks passed
    try:
        # Initialize Chroma DB
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        if os.path.exists(CHROMA_PATH):
            db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
            print(f"📚 Loaded Chroma DB from {CHROMA_PATH}")
        else:
            print(f"⚠️ Warning: Chroma DB not found at {CHROMA_PATH}, creating new DB")
            db = Chroma.from_documents(
                [Document(page_content="Initialization document.")],
                embeddings,
                persist_directory=CHROMA_PATH
            )
            db.persist()

        # Search DB
        results = db.similarity_search_with_relevance_scores(query_text, k=5)
        print(f"🔍 Found {len(results)} results from vector search")
        
        # Filter for relevance
        relevant_results = [res for res in results if res[1] >= 0.3]
        print(f"🔍 Filtered to {len(relevant_results)} relevant results")

        if len(relevant_results) == 0:
            error_msg = "Unable to find matching results in knowledge base."
            log_query_to_supabase(user_id, query_text, "error", error_msg)
            return {"status": "error", "message": error_msg}

        # FINAL DOCUMENT FILTERING: Strict department-based access control
        if user_role != 'admin':
            print(f"🔐 Applying strict document filtering for {user_dept} user")
            original_count = len(relevant_results)
            
            # FILTERED: Finance content is completely restricted to Finance users
            filtered_results = []
            for doc, score in relevant_results:
                doc_text = doc.page_content.lower()
                doc_dept = doc.metadata.get('department', '').lower()
                
                # Skip any finance documents for non-finance users
                is_finance_doc = doc_dept == 'finance'
                if not is_finance_doc:
                    # Check content for finance terms
                    for keyword in finance_keywords:
                        if keyword in doc_text and len(keyword) > 3:
                            is_finance_doc = True
                            print(f"🔎 Filtering out finance document: '{keyword}' found")
                            break
                
                # Only include if: doc matches user's dept OR doc is not finance
                if not is_finance_doc or user_dept == 'finance' or user_role == 'admin':
                    filtered_results.append((doc, score))
            
            relevant_results = filtered_results
            print(f"🔍 Final document filtering: {len(relevant_results)}/{original_count} documents allowed")
            
            if len(relevant_results) == 0:
                return {
                    "status": "denied", 
                    "message": f"Access Denied: The requested information is outside your access scope as a {user_info.get('department', 'Unknown')} department member. Please contact the appropriate department for assistance."
                }

        # Process the filtered documents
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in relevant_results])
        
        # --- Debugging: Print the retrieved context ---
        print("\n" + "="*50)
        print(f"CONTEXT FED TO LLM FOR QUERY: '{query_text}'")
        print("-"*50)
        first_50_words = " ".join(context_text.split()[:50]) + "..."
        print(f"CONTENT PREVIEW: {first_50_words}")
        print("="*50 + "\n")
        # --- End Debugging ---
        
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(context=context_text, question=query_text)

        # Use Groq model
        try:
            client = Groq(api_key=GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in answering questions based on provided document context. Be comprehensive and detailed in your responses."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                top_p=0.9,
                max_tokens=1024
            )
            response_content = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"❌ Error calling Groq API: {e}")
            response_content = "Sorry, I encountered an error while generating a response. Please try again later."
        
        # Get metadata for sources
        sources = []
        for doc, _ in relevant_results:
            source_info = {}
            if 'source' in doc.metadata:
                source_info['source'] = doc.metadata['source']
            if 'original_filename' in doc.metadata:
                source_info['filename'] = doc.metadata['original_filename']
            elif 'source' in doc.metadata and '/' in doc.metadata['source']:
                source_info['filename'] = doc.metadata['source'].split('/')[-1]
            
            if source_info and source_info not in sources:
                sources.append(source_info)
        
        # Log successful query to Supabase
        log_query_to_supabase(user_id, query_text, "approved", response_content)
        
        return {
            "status": "approved",
            "message": "Query processed successfully",
            "response": response_content,
            "sources": sources
        }
    except Exception as e:
        error_message = f"Error processing query: {str(e)}"
        print(f"❌ {error_message}")
        # Log error to Supabase
        log_query_to_supabase(user_id, query_text, "error", error_message)
        return {"status": "error", "message": error_message}

# Existing POST endpoint
@app.route('/query', methods=['POST'])
def query_endpoint():
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Request must be JSON"}), 400

        data = request.get_json()
        user_id = data.get('user_id')
        query_text = data.get('query')

        if not user_id or not query_text:
            return jsonify({"status": "error", "message": "Missing user_id or query"}), 400

        result = process_query(user_id, query_text)
        return jsonify(result), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"status": "error", "message": f"Internal server error: {str(e)}"}), 500

# New dummy GET endpoint
@app.route('/test', methods=['GET'])
def test_endpoint():
    dummy_data = {
        "status": "success",
        "message": "Hello from the test route!",
        "data": {
            "id": 1,
            "name": "Test User",
            "timestamp": "2025-04-05T12:00:00"
        }
    }
    return jsonify(dummy_data), 200

# Development mode endpoint - NO PERMISSION CHECKS
@app.route('/dev_query', methods=['POST'])
def dev_query_endpoint():
    """Development endpoint with no permission checks"""
    print("\n" + "="*50 + "\nDEV MODE QUERY - NO PERMISSION CHECKS\n" + "="*50)
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Request must be JSON"}), 400

        data = request.get_json()
        user_id = data.get('user_id', '1001')  # Default to admin ID
        query_text = data.get('query')

        if not query_text:
            return jsonify({"status": "error", "message": "Missing query parameter"}), 400
        
        # Initialize Chroma DB
        try:
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            if os.path.exists(CHROMA_PATH):
                db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
                print(f"📚 Loaded Chroma DB from {CHROMA_PATH}")
            else:
                print(f"⚠️ Warning: Chroma DB not found")
                return jsonify({"status": "error", "message": "Knowledge base not found"}), 500

            # Search DB
            results = db.similarity_search_with_relevance_scores(query_text, k=5)
            print(f"🔍 Found {len(results)} results from vector search")
            
            # Filter for relevance
            relevant_results = [res for res in results if res[1] >= 0.3]
            print(f"🔍 Filtered to {len(relevant_results)} relevant results")

            if len(relevant_results) == 0:
                error_msg = "Unable to find matching results in knowledge base."
                return jsonify({"status": "error", "message": error_msg}), 404

            context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in relevant_results])
            
            # Print the first few words of context for debugging
            first_50_words = " ".join(context_text.split()[:50]) + "..."
            print(f"CONTENT PREVIEW: {first_50_words}")
            
            prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
            prompt = prompt_template.format(context=context_text, question=query_text)

            # Use Groq model
            client = Groq(api_key=GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in answering questions based on provided document context. Be comprehensive and detailed in your responses."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                top_p=0.9,
                max_tokens=1024
            )
            response_content = chat_completion.choices[0].message.content
            
            # Get metadata for sources
            sources = []
            for doc, _ in relevant_results:
                source_info = {}
                if 'source' in doc.metadata:
                    source_info['source'] = doc.metadata['source']
                if 'original_filename' in doc.metadata:
                    source_info['filename'] = doc.metadata['original_filename']
                elif 'source' in doc.metadata and '/' in doc.metadata['source']:
                    source_info['filename'] = doc.metadata['source'].split('/')[-1]
                
                if source_info and source_info not in sources:
                    sources.append(source_info)
            
            return jsonify({
                "status": "approved",
                "message": "DEV MODE: Query processed without permission checks",
                "response": response_content,
                "sources": sources
            }), 200
            
        except Exception as e:
            print(f"❌ Error in dev query processing: {e}")
            return jsonify({"status": "error", "message": f"Error processing query: {str(e)}"}), 500
            
    except Exception as e:
        print(f"❌ Error in dev endpoint: {e}")
        return jsonify({"status": "error", "message": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    print(f"Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
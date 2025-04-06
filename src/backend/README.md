# Penguin AI Backend RAG System

This directory contains the backend retrieval-augmented generation (RAG) system for Penguin AI. The system integrates with Supabase for storage and authentication, and uses local Chroma DB for vector storage.

## Core Components

- **`query_data.py`**: Main Flask server that handles query processing, access control, and responses
- **`process_documents.py`**: Document processing pipeline that converts files to embeddings
- **`sync_documents.py`**: Service to regularly sync documents from Supabase to local Chroma database

## Key Features

### Access Control
- **XGBoost Model**: Predicts if users should have access to certain data
- **Department Extraction**: Uses Gemini to extract departments from queries
- **Role-Based Access**: Restricts access based on user roles and departments

### Document Processing
- Supports PDF and DOCX file formats
- Implements chunking with RecursiveCharacterTextSplitter
- Uses HuggingFace embeddings (sentence-transformers/all-MiniLM-L6-v2)
- Stores metadata including user ID, category, and source information
- Avoids duplicates through source tracking

### Query Processing
- Implements document-level access control
- Logs all queries to Supabase for auditing
- Uses Groq's LLama 3 (70B) model for response generation
- Provides robust error handling

## Setup and Usage

### Environment Variables
The system requires the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `GROQ_API_KEY`: API key for Groq
- `GEMINI_API_KEY`: API key for Google's Gemini

### Running the Server
```bash
# Start the Flask server
python query_data.py

# Process documents once
python sync_documents.py --once

# Run document sync service (updates every 60 minutes)
python sync_documents.py --interval 60
```

## API Endpoints

### POST /query
Processes user queries against the knowledge base.

**Request:**
```json
{
  "user_id": "123",
  "query": "What is the latest financial report?"
}
```

**Response:**
```json
{
  "status": "approved",
  "message": "Query processed successfully",
  "response": "The latest financial report shows...",
  "sources": [
    {
      "source": "user123/Finance/quarterly_report_Q1_2023.pdf",
      "filename": "quarterly_report_Q1_2023.pdf"
    }
  ]
}
```

### GET /test
Simple test endpoint to verify server is running.

## Debugging

The system includes detailed logging for debugging:
- Check Flask logs for query processing details
- Document sync logs show processing status
- Context fed to LLM is printed in the terminal when queries are processed 
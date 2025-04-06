#!/usr/bin/env python3

"""
Setup Environment Script

This script initializes the environment for the RAG system by:
1. Creating required directories
2. Generating dummy model files for testing (if real ones aren't available)
3. Setting up a basic Chroma DB
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Base directory for application
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma")
MODEL_DIR = os.path.join(BASE_DIR, "models")

def create_directories():
    """Create required directories if they don't exist."""
    print(f"Creating directories if needed...")
    os.makedirs(CHROMA_PATH, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"- Created models directory: {MODEL_DIR}")
    print(f"- Created Chroma DB directory: {CHROMA_PATH}")

def create_dummy_xgb_model():
    """Create a dummy XGBoost model for testing."""
    model_path = os.path.join(MODEL_DIR, 'xgb_model.pkl')
    
    if os.path.exists(model_path):
        print(f"XGBoost model already exists at {model_path}")
        return
    
    print("Creating dummy XGBoost model...")
    
    # Get the feature columns to ensure the model matches expected dimensions
    feature_cols = []
    features_path = os.path.join(MODEL_DIR, 'used_columns.pkl')
    if os.path.exists(features_path):
        feature_cols = joblib.load(features_path)
    else:
        # Create default feature columns
        feature_cols = ['user_role', 'department', 'employee_status', 'event_hour',
                       'resource_type', 'resource_sensitivity', 'action', 'request_reason',
                       'location', 'device_type', 'region', 'trained', 'tenure_days',
                       'time_in_position_months', 'ip_valid', 'encryption_required']
        joblib.dump(feature_cols, features_path)
        print(f"Feature columns saved to {features_path}")
    
    # Create a simple dummy model with correct dimensions
    X = np.random.rand(100, len(feature_cols))
    y = np.random.randint(0, 2, 100)
    dummy_model = xgb.XGBClassifier(n_estimators=2, max_depth=2)
    dummy_model.fit(X, y)
    
    # Save the model
    joblib.dump(dummy_model, model_path)
    print(f"Dummy XGBoost model saved to {model_path} with {len(feature_cols)} features")

def create_dummy_label_encoders():
    """Create dummy label encoders for testing."""
    encoders_path = os.path.join(MODEL_DIR, 'label_encoders.pkl')
    
    if os.path.exists(encoders_path):
        print(f"Label encoders already exist at {encoders_path}")
        return
    
    print("Creating dummy label encoders...")
    
    from sklearn.preprocessing import LabelEncoder
    
    # Create dummy encoders for categorical variables
    categorical_cols = ['user_role', 'department', 'employee_status', 'resource_type', 
                       'resource_sensitivity', 'action', 'request_reason', 'location', 
                       'device_type', 'region', 'encryption_required', 'ip_address']
    
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        # Fit with some dummy values including 'Unknown'
        le.fit(['Value1', 'Value2', 'Admin', 'User', 'Unknown', 'IT', 'HR', 'Finance', 'Marketing'])
        label_encoders[col] = le
    
    # Save the encoders
    joblib.dump(label_encoders, encoders_path)
    print(f"Dummy label encoders saved to {encoders_path}")

def create_dummy_feature_cols():
    """Create dummy feature columns list for testing."""
    features_path = os.path.join(MODEL_DIR, 'used_columns.pkl')
    
    if os.path.exists(features_path):
        print(f"Feature columns already exist at {features_path}")
        return
    
    print("Creating dummy feature columns...")
    
    # Create a list of feature column names
    feature_cols = ['user_role', 'department', 'employee_status', 'event_hour',
                   'resource_type', 'resource_sensitivity', 'action', 'request_reason',
                   'location', 'device_type', 'region', 'trained', 'tenure_days',
                   'time_in_position_months', 'ip_valid', 'encryption_required']
    
    # Save the feature columns
    joblib.dump(feature_cols, features_path)
    print(f"Dummy feature columns saved to {features_path}")

def create_dummy_dataset():
    """Create a dummy dataset for testing."""
    dataset_path = os.path.join(MODEL_DIR, 'synthetic_access_data_10000 (2).csv')
    
    if os.path.exists(dataset_path):
        print(f"Dataset already exists at {dataset_path}")
        return
    
    print("Creating dummy dataset...")
    
    # Create sample data
    data = {
        'user_id': ['1001', '1002', '1003', '1004', '1005'],
        'user_role': ['Admin', 'User', 'User', 'User', 'Admin'],
        'department': ['IT', 'HR', 'Finance', 'Marketing', 'IT'],
        'employee_status': ['Active', 'Active', 'Active', 'Contractor', 'Active'],
        'resource_type': ['Database', 'Document', 'Application', 'Document', 'Database'],
        'resource_sensitivity': ['High', 'Medium', 'Low', 'Medium', 'High'],
        'action': ['Read', 'Write', 'Execute', 'Read', 'Delete'],
        'request_reason': ['Job requirement', 'Analysis', 'Training', 'Report', 'Maintenance'],
        'location': ['Office', 'Remote', 'Office', 'Remote', 'Office'],
        'device_type': ['Desktop', 'Laptop', 'Mobile', 'Laptop', 'Desktop'],
        'region': ['US', 'EU', 'APAC', 'US', 'EU'],
        'encryption_required': ['Yes', 'No', 'Yes', 'No', 'Yes'],
        'ip_address': ['192.168.1.1', '10.0.0.1', 'invalid_ip', '172.16.0.1', '192.168.1.2'],
        'timestamp': ['2023-01-01 08:00:00', '2023-01-02 09:30:00', '2023-01-03 14:15:00', 
                     '2023-01-04 11:45:00', '2023-01-05 16:20:00'],
        'employee_join_date': ['2020-05-15', '2021-02-10', '2022-07-20', '2022-11-30', '2019-03-22'],
        'last_security_training': ['2022-12-01', '2022-10-15', None, '2022-11-01', '2022-09-30'],
        'time_in_position': ['3 years', '1 year', '6 months', '2 months', '4 years'],
        'is_approved': [True, True, False, True, True],
        'request_id': ['REQ001', 'REQ002', 'REQ003', 'REQ004', 'REQ005']
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    df.to_csv(dataset_path, index=False)
    print(f"Dummy dataset saved to {dataset_path}")

def initialize_chroma_db():
    """Initialize Chroma DB with a sample document."""
    if os.path.exists(CHROMA_PATH) and any(os.listdir(CHROMA_PATH)):
        print(f"Chroma DB already exists at {CHROMA_PATH}")
        return
    
    print("Initializing Chroma DB with sample document...")
    
    try:
        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # Sample document for initialization
        sample_docs = [
            Document(
                page_content="This is a sample document for Penguin AI. It contains information about a financial report from Q1 2023.",
                metadata={"source": "sample/finance/report_q1_2023.pdf", "user_id": "1001", "category": "Finance"}
            ),
            Document(
                page_content="The IT department is planning a system upgrade in July 2023. All users will need to update their passwords.",
                metadata={"source": "sample/it/system_upgrade.docx", "user_id": "1002", "category": "IT"}
            ),
            Document(
                page_content="HR policy update: Work from home policy has been extended indefinitely for all employees.",
                metadata={"source": "sample/hr/policy_update.txt", "user_id": "1003", "category": "HR"}
            )
        ]
        
        # Initialize DB with sample documents
        db = Chroma.from_documents(
            sample_docs,
            embeddings,
            persist_directory=CHROMA_PATH
        )
        db.persist()
        print(f"Chroma DB initialized with {len(sample_docs)} sample documents")
    except Exception as e:
        print(f"Error initializing Chroma DB: {e}")
        print("You may need to install sentence-transformers: pip install sentence-transformers")

def main():
    """Main function to run all setup operations."""
    print("Setting up environment for Penguin AI RAG system...")
    
    # Create directories
    create_directories()
    
    # Create dummy model files
    create_dummy_xgb_model()
    create_dummy_label_encoders()
    create_dummy_feature_cols()
    create_dummy_dataset()
    
    # Initialize Chroma DB
    initialize_chroma_db()
    
    print("\nEnvironment setup complete!")
    print("\nNext steps:")
    print("1. Install required packages: pip install -r requirements.txt")
    print("2. Set environment variables in .env file")
    print("3. Run the server: python query_data.py")
    print("4. Process documents: python sync_documents.py --once")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error during setup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 
#!/usr/bin/env python3
"""
Create Users Table in Supabase

This script creates a 'users' table in Supabase if it doesn't exist,
and populates it with sample user data for testing purposes.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Sample user data
SAMPLE_USERS = [
    {
        "user_id": "1001",
        "user_role": "Admin",
        "department": "IT",
        "employee_status": "Active",
        "time_in_position": "3 years",
        "location": "Office",
        "region": "US",
        "past_violations": 0
    },
    {
        "user_id": "1002",
        "user_role": "User",
        "department": "HR",
        "employee_status": "Active",
        "time_in_position": "1 year",
        "location": "Remote",
        "region": "EU",
        "past_violations": 0
    },
    {
        "user_id": "1003",
        "user_role": "User",
        "department": "Finance",
        "employee_status": "Active",
        "time_in_position": "6 months",
        "location": "Office",
        "region": "APAC",
        "past_violations": 0
    },
    {
        "user_id": "1004",
        "user_role": "User",
        "department": "Marketing",
        "employee_status": "Contractor",
        "time_in_position": "2 months",
        "location": "Remote",
        "region": "US",
        "past_violations": 0
    },
    {
        "user_id": "1005",
        "user_role": "Admin",
        "department": "IT",
        "employee_status": "Active",
        "time_in_position": "4 years",
        "location": "Office",
        "region": "EU",
        "past_violations": 0
    },
    # Add the user ID from the error message
    {
        "user_id": "2131",
        "user_role": "User",
        "department": "Sales",
        "employee_status": "Active",
        "time_in_position": "1 year",
        "location": "Office",
        "region": "US",
        "past_violations": 0
    }
]

def create_users_table():
    """Create users table in Supabase and populate with sample data."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Supabase URL and key must be set in environment variables.")
        sys.exit(1)
    
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase successfully")
        
        # Check if table exists by querying it
        try:
            response = supabase.table("users").select("*").limit(1).execute()
            if response and hasattr(response, 'data'):
                print("Users table already exists")
                
                # Check for existing users
                existing_user_ids = []
                all_users_response = supabase.table("users").select("user_id").execute()
                if all_users_response and hasattr(all_users_response, 'data'):
                    existing_user_ids = [user['user_id'] for user in all_users_response.data]
                
                # Add sample users that don't exist yet
                users_added = 0
                for user in SAMPLE_USERS:
                    if user['user_id'] not in existing_user_ids:
                        supabase.table("users").insert(user).execute()
                        print(f"Added user: {user['user_id']}")
                        users_added += 1
                
                if users_added > 0:
                    print(f"Added {users_added} new sample users to the table")
                else:
                    print("All sample users already exist in the table")
                
                return
        except Exception as e:
            print(f"Table may not exist or other error: {str(e)}")
        
        # Create the table if it doesn't exist
        print("Creating users table...")
        
        # SQL to create the users table
        create_table_sql = """
        CREATE TABLE users (
            user_id TEXT PRIMARY KEY,
            user_role TEXT NOT NULL,
            department TEXT,
            employee_status TEXT,
            time_in_position TEXT,
            location TEXT,
            last_security_training TIMESTAMP,
            employee_join_date TIMESTAMP,
            region TEXT,
            past_violations INTEGER DEFAULT 0
        );
        """
        
        # Execute the SQL using a stored procedure or custom function
        # This is a simplified example; you might need to use a proper migration
        # strategy in a production environment
        try:
            # Create the table
            supabase.postgrest.rpc("exec", {"command": create_table_sql}).execute()
            print("Users table created successfully")
            
            # Insert sample users
            for user in SAMPLE_USERS:
                supabase.table("users").insert(user).execute()
            
            print(f"Added {len(SAMPLE_USERS)} sample users to the table")
        except Exception as e:
            print(f"Error creating table: {str(e)}")
            # Try an alternative method if RPC fails
            print("Attempting to insert users directly...")
            try:
                # Try to insert users directly - table might already exist
                for user in SAMPLE_USERS:
                    supabase.table("users").insert(user).execute()
                print(f"Added {len(SAMPLE_USERS)} sample users to the table")
            except Exception as inner_e:
                print(f"Error inserting users: {str(inner_e)}")
        
    except Exception as e:
        print(f"Error connecting to Supabase: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("Starting Supabase users table setup...")
    create_users_table()
    print("Setup complete.") 
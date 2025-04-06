#!/usr/bin/env python3

"""
Document Sync Service
Runs the document processing pipeline at regular intervals
to keep the Chroma database updated with documents from Supabase.
"""

import time
import os
import sys
from datetime import datetime
import argparse
import traceback

# Make sure we can import from the same directory
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.append(script_dir)

try:
    from process_documents import process_and_store_documents
except ImportError as e:
    print(f"Error importing process_documents module: {e}")
    print("Make sure process_documents.py is in the same directory as this script.")
    sys.exit(1)

def sync_documents(interval_minutes=60):
    """
    Continuously synchronizes documents at specified intervals
    
    Args:
        interval_minutes: Minutes between sync operations
    """
    print(f"Starting document sync service with {interval_minutes} minute interval")
    print(f"Working directory: {os.getcwd()}")
    print(f"Script directory: {script_dir}")
    
    while True:
        # Print current time
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[{current_time}] Running document sync...")
        
        try:
            # Process and store documents
            process_and_store_documents()
            print(f"[{current_time}] Sync completed successfully")
        except Exception as e:
            print(f"[{current_time}] Error during sync:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print("\nStack trace:")
            traceback.print_exc()
            print("\nContinuing to next sync cycle...")
        
        # Sleep for the specified interval
        print(f"Waiting {interval_minutes} minutes for next sync...")
        time.sleep(interval_minutes * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Document Sync Service")
    parser.add_argument("--interval", type=int, default=60,
                        help="Sync interval in minutes (default: 60)")
    parser.add_argument("--once", action="store_true",
                        help="Run sync once and exit")
    
    args = parser.parse_args()
    
    if args.once:
        print("Running document sync once...")
        try:
            process_and_store_documents()
            print("Sync completed successfully.")
        except Exception as e:
            print("Error during sync:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print("\nStack trace:")
            traceback.print_exc()
            sys.exit(1)
    else:
        try:
            sync_documents(args.interval)
        except KeyboardInterrupt:
            print("\nSync service stopped by user.")
        except Exception as e:
            print("Unhandled error in sync service:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print("\nStack trace:")
            traceback.print_exc()
            sys.exit(1) 
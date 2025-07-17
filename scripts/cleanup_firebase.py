import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

def cleanup_firebase_data():
    """Clean up excess Firebase data to free up storage quota"""
    
    print("Setting up Firebase connection...")
    
    # Try to use environment variables first
    if os.getenv('FIREBASE_SERVICE_ACCOUNT'):
        # Use service account from environment variable
        import json
        service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT'))
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("✓ Connected using environment variable")
    elif os.path.exists("firebase-service-account.json"):
        # Use service account file if it exists
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
        print("✓ Connected using service account file")
    else:
        print("⚠ Firebase credentials not found. Please:")
        print("1. Set FIREBASE_SERVICE_ACCOUNT environment variable, OR")
        print("2. Place firebase-service-account.json in this folder")
        print("3. Run this script again")
        return
    
    # Initialize Firestore
    db = firestore.client()
    
    print("\n🧹 Starting Firebase cleanup...")
    
    # 1. Clean up old company_insights collection
    print("\n1. Cleaning up old company_insights collection...")
    try:
        insights_ref = db.collection('company_insights')
        insights_snapshot = insights_ref.get()
        
        if len(insights_snapshot) == 0:
            print("   ✓ No company_insights documents found")
        else:
            print(f"   📊 Found {len(insights_snapshot)} company_insights documents")
            
            # Delete in batches
            batch_size = 500
            total_deleted = 0
            
            for i in range(0, len(insights_snapshot), batch_size):
                batch = insights_snapshot[i:i + batch_size]
                batch_write = db.batch()
                
                for doc in batch:
                    batch_write.delete(doc.reference)
                
                batch_write.commit()
                total_deleted += len(batch)
                print(f"   ✓ Deleted batch {i//batch_size + 1}: {total_deleted}/{len(insights_snapshot)}")
            
            print(f"   🎉 Successfully deleted {total_deleted} company_insights documents")
            
    except Exception as e:
        print(f"   ❌ Error cleaning company_insights: {e}")
    
    # 2. Clean up old submissions collection (optional)
    print("\n2. Checking submissions collection...")
    try:
        submissions_ref = db.collection('submissions')
        submissions_snapshot = submissions_ref.get()
        
        if len(submissions_snapshot) == 0:
            print("   ✓ No submissions documents found")
        else:
            print(f"   📊 Found {len(submissions_snapshot)} submissions documents")
            
            # Ask user if they want to delete submissions
            response = input("   Do you want to delete all submissions? (y/N): ").strip().lower()
            
            if response == 'y':
                print("   🗑️ Deleting submissions...")
                
                # Delete in batches
                batch_size = 500
                total_deleted = 0
                
                for i in range(0, len(submissions_snapshot), batch_size):
                    batch = submissions_snapshot[i:i + batch_size]
                    batch_write = db.batch()
                    
                    for doc in batch:
                        batch_write.delete(doc.reference)
                    
                    batch_write.commit()
                    total_deleted += len(batch)
                    print(f"   ✓ Deleted batch {i//batch_size + 1}: {total_deleted}/{len(submissions_snapshot)}")
                
                print(f"   🎉 Successfully deleted {total_deleted} submissions documents")
            else:
                print("   ✓ Keeping submissions (skipped)")
                
    except Exception as e:
        print(f"   ❌ Error checking submissions: {e}")
    
    # 3. Check for duplicate companies (companies without normalizedName)
    print("\n3. Checking for old format companies...")
    try:
        companies_ref = db.collection('companies')
        companies_snapshot = companies_ref.get()
        
        old_format_companies = []
        new_format_companies = 0
        
        for doc in companies_snapshot:
            data = doc.to_dict()
            if 'normalizedName' not in data or not data['normalizedName']:
                old_format_companies.append(doc)
            else:
                new_format_companies += 1
        
        print(f"   📊 Found {new_format_companies} new format companies")
        print(f"   📊 Found {len(old_format_companies)} old format companies")
        
        if old_format_companies:
            response = input("   Do you want to delete old format companies? (y/N): ").strip().lower()
            
            if response == 'y':
                print("   🗑️ Deleting old format companies...")
                
                # Delete in batches
                batch_size = 500
                total_deleted = 0
                
                for i in range(0, len(old_format_companies), batch_size):
                    batch = old_format_companies[i:i + batch_size]
                    batch_write = db.batch()
                    
                    for doc in batch:
                        batch_write.delete(doc.reference)
                    
                    batch_write.commit()
                    total_deleted += len(batch)
                    print(f"   ✓ Deleted batch {i//batch_size + 1}: {total_deleted}/{len(old_format_companies)}")
                
                print(f"   🎉 Successfully deleted {total_deleted} old format companies")
            else:
                print("   ✓ Keeping old format companies (skipped)")
        else:
            print("   ✓ No old format companies found")
            
    except Exception as e:
        print(f"   ❌ Error checking companies: {e}")
    
    # 4. Show storage statistics
    print("\n4. Storage Statistics:")
    try:
        companies_ref = db.collection('companies')
        companies_snapshot = companies_ref.get()
        
        total_companies = len(companies_snapshot)
        companies_with_submissions = sum(1 for doc in companies_snapshot 
                                       if doc.to_dict().get('submissionCount', 0) > 0)
        
        print(f"   📊 Total companies: {total_companies}")
        print(f"   📊 Companies with submissions: {companies_with_submissions}")
        print(f"   📊 Companies without submissions: {total_companies - companies_with_submissions}")
        
        # Estimate storage savings
        if total_companies > 0:
            print(f"   💾 Estimated storage: ~{total_companies * 2}KB for companies")
            
    except Exception as e:
        print(f"   ❌ Error getting statistics: {e}")
    
    print("\n🎉 Firebase cleanup completed!")
    print("💡 Check your Firebase Console to see the storage reduction")

if __name__ == "__main__":
    cleanup_firebase_data() 
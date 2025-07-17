import json
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

def import_companies_to_firebase():
    """Import cleaned company data to Firebase Firestore with unified structure"""
    
    print("Setting up Firebase connection...")
    
    # Try to use environment variables first
    if os.getenv('FIREBASE_SERVICE_ACCOUNT'):
        # Use service account from environment variable
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
    
    # Load the cleaned company data
    print("\nLoading cleaned company data...")
    with open('us_companies_cleaned.json', 'r', encoding='utf-8') as f:
        companies = json.load(f)
    
    print(f"Found {len(companies)} companies to import")
    
    # Create companies collection
    companies_ref = db.collection('companies')
    
    # Import companies in batches (Firebase has limits)
    batch_size = 500
    total_imported = 0
    
    print(f"\nImporting companies in batches of {batch_size}...")
    
    for i in range(0, len(companies), batch_size):
        batch = companies[i:i + batch_size]
        
        # Create a new batch
        batch_write = db.batch()
        
        for company in batch:
            # Create document with auto-generated ID
            doc_ref = companies_ref.document()
            
            # Prepare company data for Firebase
            firebase_company = {
                "name": company["name"],
                "normalizedName": company["normalizedName"],
                "aliases": company["aliases"],
                "website": company["website"],
                "location": company["location"],
                "industry": company["industry"],
                "company_size": company["company_size"],
                "company_type": company["company_type"],
                "founded_year": company["founded_year"],
                "specialities": company["specialities"],
                "locations": company["locations"],
                
                # Initialize dynamic fields
                "submissionCount": 0,
                "lastSubmission": None,
                "commonFlags": [],
                "averageFlagCount": 0,
                "severityTrends": {
                    "light": 0,
                    "medium": 0
                },
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }
            
            # Add to batch
            batch_write.set(doc_ref, firebase_company)
        
        # Commit the batch
        batch_write.commit()
        total_imported += len(batch)
        print(f"✓ Imported batch {i//batch_size + 1}: {total_imported}/{len(companies)} companies")
    
    print(f"\n🎉 Successfully imported {total_imported} companies to Firebase!")
    print("Collection: companies")
    print("Structure: Unified with normalized names, aliases, and dynamic fields")
    print("You can now use this data in your app's company search dropdown.")
    
    # Show some statistics about the imported data
    print(f"\nImport statistics:")
    print(f"- Total companies imported: {total_imported}")
    print(f"- Companies with normalized names: {sum(1 for c in companies if c['normalizedName'])}")
    print(f"- Companies with aliases: {sum(1 for c in companies if c['aliases'])}")
    print(f"- Companies with websites: {sum(1 for c in companies if c['website'])}")
    print(f"- Companies with locations: {sum(1 for c in companies if c['location'])}")
    
    # Show sample of imported structure
    print(f"\nSample imported company structure:")
    sample_company = companies[0]
    print(f"Name: {sample_company['name']}")
    print(f"Normalized: {sample_company['normalizedName']}")
    print(f"Aliases: {sample_company['aliases'][:3]}...")
    print(f"Website: {sample_company['website']}")
    print(f"Location: {sample_company['location']}")

if __name__ == "__main__":
    import_companies_to_firebase() 
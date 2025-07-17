#!/usr/bin/env python3
"""
Firebase Database Cleanup and Population Script

This script:
1. Cleans existing Firebase collections
2. Downloads and processes the Kaggle company dataset
3. Creates companies with the proper schema
4. Populates the database with clean data

Required schema for companies:
- aliases (array of strings)
- averageFlagCount (number)
- commonFlags (array of strings)
- createdAt (timestamp)
- lastSubmission (timestamp)
- name (string)
- normalizedName (string)
- severityTrends (map with light/medium numbers)
- submissionCount (number)
- updatedAt (timestamp)
"""

import os
import sys
import json
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore
from kagglehub import KaggleDatasetAdapter
import kagglehub

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('firebase_cleanup.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class FirebaseCleaner:
    def __init__(self, service_account_path: str = None):
        """Initialize Firebase connection"""
        try:
            # Try to use environment variables first
            if os.getenv('FIREBASE_SERVICE_ACCOUNT'):
                # Use service account from environment variable
                service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT'))
                if not firebase_admin._apps:
                    cred = credentials.Certificate(service_account_info)
                    firebase_admin.initialize_app(cred)
            elif service_account_path and os.path.exists(service_account_path):
                # Use service account file if provided and exists
                if not firebase_admin._apps:
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
            else:
                # Try to use default credentials (for local development)
                if not firebase_admin._apps:
                    firebase_admin.initialize_app()
            
            self.db = firestore.client()
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            logger.error("Please set FIREBASE_SERVICE_ACCOUNT environment variable or provide a valid service account file")
            raise

    def clean_collections(self, collections: List[str] = None):
        """Clean specified collections from Firebase"""
        if collections is None:
            collections = ['companies', 'company_insights', 'submissions']
        
        logger.info(f"Cleaning collections: {collections}")
        
        for collection_name in collections:
            try:
                # Get all documents in the collection
                docs = self.db.collection(collection_name).stream()
                doc_count = 0
                
                # Delete each document
                for doc in docs:
                    doc.reference.delete()
                    doc_count += 1
                
                logger.info(f"Deleted {doc_count} documents from {collection_name}")
                
            except Exception as e:
                logger.error(f"Error cleaning {collection_name}: {e}")

    def download_kaggle_dataset(self) -> pd.DataFrame:
        """Download and load the Kaggle company dataset"""
        logger.info("Downloading Kaggle dataset...")
        
        try:
            # Try to load the dataset with different approaches
            try:
                # First try with the main CSV file
                df = kagglehub.load_dataset(
                    KaggleDatasetAdapter.PANDAS,
                    "peopledatalabssf/free-7-million-company-dataset",
                    "companies.csv",
                )
            except:
                try:
                    # Try with the main file
                    df = kagglehub.load_dataset(
                        KaggleDatasetAdapter.PANDAS,
                        "peopledatalabssf/free-7-million-company-dataset",
                        "companies_data.csv",
                    )
                except:
                    # Try without specifying a file (let kagglehub find it)
                    df = kagglehub.load_dataset(
                        KaggleDatasetAdapter.PANDAS,
                        "peopledatalabssf/free-7-million-company-dataset",
                    )
            
            logger.info(f"Downloaded dataset with {len(df)} records")
            logger.info(f"Dataset columns: {list(df.columns)}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error downloading dataset: {e}")
            logger.info("Falling back to sample companies...")
            # Fallback to sample companies if Kaggle fails
            return self.create_sample_companies()
    
    def create_sample_companies(self) -> pd.DataFrame:
        """Create a sample dataset with popular companies"""
        logger.info("Creating sample companies dataset...")
        
        popular_companies = [
            # Tech Companies
            "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "Twitter", "LinkedIn",
            "Uber", "Airbnb", "Spotify", "Slack", "Zoom", "Salesforce", "Adobe", "Oracle",
            "Intel", "AMD", "NVIDIA", "IBM", "Cisco", "Dell", "HP", "Sony", "Samsung",
            
            # Financial Companies
            "JPMorgan Chase", "Bank of America", "Wells Fargo", "Goldman Sachs", "Morgan Stanley",
            "Citigroup", "American Express", "Visa", "Mastercard", "PayPal", "Stripe",
            
            # Retail & Consumer
            "Walmart", "Target", "Costco", "Home Depot", "Lowe's", "Best Buy", "Starbucks",
            "McDonald's", "Coca-Cola", "PepsiCo", "Nike", "Adidas", "Disney",
            
            # Healthcare & Pharma
            "Johnson & Johnson", "Pfizer", "Moderna", "Merck", "Gilead Sciences", "Amgen",
            "UnitedHealth Group", "Anthem", "CVS Health", "Walgreens",
            
            # Automotive
            "Tesla", "Ford", "General Motors", "Toyota", "Honda", "BMW", "Mercedes-Benz",
            "Volkswagen", "Audi", "Porsche",
            
            # Consulting & Services
            "McKinsey & Company", "Bain & Company", "Boston Consulting Group", "Deloitte",
            "PwC", "EY", "KPMG", "Accenture", "IBM Global Services",
            
            # Media & Entertainment
            "Warner Bros", "Universal Studios", "Paramount", "Sony Pictures",
            "HBO", "Hulu", "YouTube", "TikTok", "Instagram", "Facebook",
            
            # Manufacturing
            "General Electric", "3M", "Boeing", "Lockheed Martin", "Raytheon", "Caterpillar",
            "Deere & Company", "Honeywell", "United Technologies",
            
            # Energy
            "ExxonMobil", "Chevron", "Shell", "BP", "ConocoPhillips", "NextEra Energy",
            "Duke Energy", "Southern Company",
            
            # Telecommunications
            "AT&T", "Verizon", "T-Mobile", "Sprint", "Comcast", "Charter Communications",
            "CenturyLink", "Frontier Communications"
        ]
        
        df = pd.DataFrame({'name': popular_companies})
        logger.info(f"Created sample dataset with {len(df)} companies")
        return df

    def clean_company_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and process the company dataset"""
        logger.info("Cleaning company data...")
        
        # Select relevant columns and clean data
        if 'name' in df.columns:
            # Basic cleaning
            df_clean = df[['name']].copy()
            df_clean['name'] = df_clean['name'].astype(str).str.strip()
            
            # Remove duplicates and null values
            df_clean = df_clean.dropna(subset=['name'])
            df_clean = df_clean[df_clean['name'] != '']
            df_clean = df_clean[df_clean['name'] != 'nan']
            df_clean = df_clean.drop_duplicates(subset=['name'])
            
            # Filter for reasonable company names (2-100 characters)
            df_clean = df_clean[
                (df_clean['name'].str.len() >= 2) & 
                (df_clean['name'].str.len() <= 100)
            ]
            
            # Remove companies with only special characters
            df_clean = df_clean[df_clean['name'].str.match(r'^[a-zA-Z0-9\s\-\.&]+$')]
            
            logger.info(f"Cleaned dataset: {len(df_clean)} companies")
            return df_clean
            
        else:
            logger.warning("'name' column not found, using first column as company name")
            df_clean = df.iloc[:, 0:1].copy()
            df_clean.columns = ['name']
            return self.clean_company_data(df_clean)

    def normalize_company_name(self, name: str) -> str:
        """Normalize company name for consistent matching"""
        return (
            name.lower()
            .strip()
            .replace('  ', ' ')
            .replace('&', 'and')
            .replace('.', '')
            .replace(',', '')
            .replace('(', '')
            .replace(')', '')
            .replace('-', ' ')
            .replace('_', ' ')
        )

    def generate_aliases(self, name: str) -> List[str]:
        """Generate common aliases for a company name"""
        aliases = [name]
        
        # Common variations
        variations = [
            name.replace(' and ', ' & '),
            name.replace(' & ', ' and '),
            name.replace(' Inc', ''),
            name.replace(' Corp', ''),
            name.replace(' LLC', ''),
            name.replace(' Ltd', ''),
            name.replace(' Company', ''),
            name.replace(' Co', ''),
        ]
        
        # Add variations that are different from original
        for variation in variations:
            if variation.strip() != name and variation.strip():
                aliases.append(variation.strip())
        
        # Remove duplicates while preserving order
        seen = set()
        unique_aliases = []
        for alias in aliases:
            if alias not in seen:
                seen.add(alias)
                unique_aliases.append(alias)
        
        return unique_aliases[:10]  # Limit to 10 aliases

    def create_company_document(self, name: str) -> Dict[str, Any]:
        """Create a company document with the required schema"""
        normalized_name = self.normalize_company_name(name)
        aliases = self.generate_aliases(name)
        
        # Initialize with default values
        now = datetime.now(timezone.utc)
        
        return {
            'aliases': aliases,
            'averageFlagCount': 0.0,
            'commonFlags': [],
            'createdAt': now,
            'lastSubmission': now,
            'name': name,
            'normalizedName': normalized_name,
            'severityTrends': {
                'light': 0,
                'medium': 0
            },
            'submissionCount': 0,
            'updatedAt': now
        }

    def populate_companies(self, companies_df: pd.DataFrame, limit: int = 1000):
        """Populate Firebase with company documents"""
        logger.info(f"Populating Firebase with {min(limit, len(companies_df))} companies...")
        
        # Limit the number of companies to process
        companies_to_process = companies_df.head(limit)
        
        batch_size = 500
        total_added = 0
        
        for i in range(0, len(companies_to_process), batch_size):
            batch = companies_to_process.iloc[i:i + batch_size]
            
            # Create batch write
            batch_write = self.db.batch()
            
            for _, row in batch.iterrows():
                company_name = row['name']
                company_doc = self.create_company_document(company_name)
                
                # Create document reference
                doc_ref = self.db.collection('companies').document()
                batch_write.set(doc_ref, company_doc)
            
            # Commit batch
            try:
                batch_write.commit()
                total_added += len(batch)
                logger.info(f"Added batch {i//batch_size + 1}: {len(batch)} companies")
            except Exception as e:
                logger.error(f"Error committing batch {i//batch_size + 1}: {e}")
        
        logger.info(f"Successfully added {total_added} companies to Firebase")

    def verify_population(self):
        """Verify that companies were properly added"""
        try:
            companies_ref = self.db.collection('companies')
            docs = companies_ref.limit(5).stream()
            
            sample_companies = []
            for doc in docs:
                sample_companies.append(doc.to_dict())
            
            logger.info(f"Verification: Found {len(sample_companies)} sample companies")
            
            if sample_companies:
                sample = sample_companies[0]
                required_fields = [
                    'aliases', 'averageFlagCount', 'commonFlags', 'createdAt',
                    'lastSubmission', 'name', 'normalizedName', 'severityTrends',
                    'submissionCount', 'updatedAt'
                ]
                
                missing_fields = [field for field in required_fields if field not in sample]
                if missing_fields:
                    logger.warning(f"Missing fields in sample: {missing_fields}")
                else:
                    logger.info("All required fields present in sample")
                
                logger.info(f"Sample company: {sample['name']} (aliases: {len(sample['aliases'])})")
            
        except Exception as e:
            logger.error(f"Error during verification: {e}")

def main():
    """Main execution function"""
    logger.info("Starting Firebase cleanup and population process")
    
    try:
        # Initialize Firebase cleaner
        cleaner = FirebaseCleaner()
        
        # Step 1: Clean existing collections
        logger.info("Step 1: Cleaning existing collections")
        cleaner.clean_collections()
        
        # Step 2: Download Kaggle dataset
        logger.info("Step 2: Downloading Kaggle dataset")
        df = cleaner.download_kaggle_dataset()
        
        # Step 3: Clean company data
        logger.info("Step 3: Cleaning company data")
        clean_df = cleaner.clean_company_data(df)
        
        # Step 4: Populate Firebase
        logger.info("Step 4: Populating Firebase")
        cleaner.populate_companies(clean_df, limit=1000)  # Adjust limit as needed
        
        # Step 5: Verify population
        logger.info("Step 5: Verifying population")
        cleaner.verify_population()
        
        logger.info("Firebase cleanup and population completed successfully!")
        
    except Exception as e:
        logger.error(f"Process failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
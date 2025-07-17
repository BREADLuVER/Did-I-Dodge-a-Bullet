#!/usr/bin/env python3
"""
Firebase Population from CSV Script

This script populates Firebase with companies from a local CSV file.
Useful as a backup when Kaggle dataset download fails.

Usage:
python populate_from_csv.py --csv companies.csv --limit 1000
"""

import os
import sys
import json
import logging
import pandas as pd
import argparse
from datetime import datetime, timezone
from typing import Dict, List, Any
import firebase_admin
from firebase_admin import credentials, firestore

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('firebase_csv_population.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class CSVFirebasePopulator:
    def __init__(self, service_account_path: str = None):
        """Initialize Firebase connection"""
        try:
            # Use the service account file in the scripts directory
            if service_account_path is None:
                script_dir = os.path.dirname(os.path.abspath(__file__))
                service_account_path = os.path.join(script_dir, "firebase-service-account.json")
            
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise

    def load_csv(self, csv_path: str) -> pd.DataFrame:
        """Load and clean company data from CSV"""
        logger.info(f"Loading CSV from: {csv_path}")
        
        try:
            # Try different CSV reading approaches
            try:
                df = pd.read_csv(csv_path)
            except:
                df = pd.read_csv(csv_path, encoding='latin-1')
            
            logger.info(f"Loaded CSV with {len(df)} records")
            logger.info(f"Columns: {list(df.columns)}")
            
            # Find the company name column
            name_columns = ['name', 'company', 'company_name', 'organization', 'org']
            company_col = None
            
            for col in name_columns:
                if col in df.columns:
                    company_col = col
                    break
            
            if company_col is None:
                # Use first column as company name
                company_col = df.columns[0]
                logger.warning(f"No standard company name column found, using: {company_col}")
            
            # Clean the data
            df_clean = df[[company_col]].copy()
            df_clean.columns = ['name']
            df_clean['name'] = df_clean['name'].astype(str).str.strip()
            
            # Remove duplicates and null values
            df_clean = df_clean.dropna(subset=['name'])
            df_clean = df_clean[df_clean['name'] != '']
            df_clean = df_clean[df_clean['name'] != 'nan']
            df_clean = df_clean.drop_duplicates(subset=['name'])
            
            # Filter for reasonable company names
            df_clean = df_clean[
                (df_clean['name'].str.len() >= 2) & 
                (df_clean['name'].str.len() <= 100)
            ]
            
            logger.info(f"Cleaned dataset: {len(df_clean)} companies")
            return df_clean
            
        except Exception as e:
            logger.error(f"Error loading CSV: {e}")
            raise

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
    parser = argparse.ArgumentParser(description='Populate Firebase with companies from CSV')
    parser.add_argument('--csv', required=True, help='Path to CSV file with company names')
    parser.add_argument('--limit', type=int, default=1000, help='Maximum number of companies to add')
    parser.add_argument('--service-account', default='firebase-service-account.json', 
                       help='Path to Firebase service account JSON')
    
    args = parser.parse_args()
    
    logger.info("Starting Firebase population from CSV")
    
    try:
        # Check if CSV file exists
        if not os.path.exists(args.csv):
            logger.error(f"CSV file not found: {args.csv}")
            sys.exit(1)
        
        # Initialize populator
        populator = CSVFirebasePopulator(args.service_account)
        
        # Load and clean CSV data
        logger.info("Step 1: Loading and cleaning CSV data")
        df = populator.load_csv(args.csv)
        
        # Populate Firebase
        logger.info("Step 2: Populating Firebase")
        populator.populate_companies(df, limit=args.limit)
        
        # Verify population
        logger.info("Step 3: Verifying population")
        populator.verify_population()
        
        logger.info("Firebase population from CSV completed successfully!")
        
    except Exception as e:
        logger.error(f"Process failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
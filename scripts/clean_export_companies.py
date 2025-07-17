import kagglehub
import pandas as pd
import json
from pathlib import Path
import re

def normalize_company_name(name: str) -> str:
    """Normalize company name for consistent searching"""
    if not name:
        return ""
    
    normalized = name.lower().strip()
    # Remove common suffixes
    normalized = re.sub(r'\b(inc|corp|corporation|llc|ltd|limited|co|company|group|holdings|enterprises|ventures|partners|associates)\b', '', normalized)
    # Remove common prefixes
    normalized = re.sub(r'\b(the|a|an)\b', '', normalized)
    # Remove special characters except hyphens and spaces
    normalized = re.sub(r'[^\w\s-]', '', normalized)
    # Normalize whitespace
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    return normalized

def generate_aliases(name: str, website: str = "") -> list:
    """Generate common aliases for a company name"""
    aliases = []
    
    if not name:
        return aliases
    
    # Add original name
    aliases.append(name.strip())
    
    # Add lowercase version
    aliases.append(name.lower().strip())
    
    # Add without common suffixes
    name_clean = re.sub(r'\b(inc|corp|corporation|llc|ltd|limited|co|company|group|holdings|enterprises|ventures|partners|associates)\b', '', name.lower())
    name_clean = re.sub(r'\s+', ' ', name_clean).strip()
    if name_clean and name_clean != name.lower().strip():
        aliases.append(name_clean)
    
    # Add domain-based alias if website exists
    if website:
        try:
            from urllib.parse import urlparse
            domain = urlparse(website).netloc
            if domain and domain != name.lower():
                aliases.append(domain)
                # Add without www
                if domain.startswith('www.'):
                    aliases.append(domain[4:])
        except:
            pass
    
    # Remove duplicates and empty strings
    aliases = list(set([alias for alias in aliases if alias.strip()]))
    
    return aliases

def clean_and_export_companies():
    """Clean and export company data for Firebase import with unified structure"""
    
    print("Loading company dataset...")
    # Download latest version
    path = kagglehub.dataset_download("proxycurl/10000-us-company-profiles")
    dataset_path = Path(path)
    data_file = list(dataset_path.glob("*.txt"))[0]
    
    # Load the dataset
    df = pd.read_json(data_file, lines=True)
    print(f"Original dataset shape: {df.shape}")
    
    # Select relevant columns
    relevant_columns = [
        'name', 'website', 'industry', 'company_size', 
        'hq', 'company_type', 'founded_year', 'specialities', 'locations'
    ]
    
    # Check which columns exist
    existing_columns = [col for col in relevant_columns if col in df.columns]
    missing_columns = [col for col in relevant_columns if col not in df.columns]
    
    if missing_columns:
        print(f"Warning: Missing columns: {missing_columns}")
    
    # Select only existing columns
    df_clean = df[existing_columns].copy()
    print(f"Selected columns: {existing_columns}")
    
    # Clean the data
    print("\nCleaning data...")
    
    # Remove rows with missing company names
    initial_count = len(df_clean)
    df_clean = df_clean.dropna(subset=['name'])
    print(f"Removed {initial_count - len(df_clean)} rows with missing names")
    
    # Strip whitespace from string columns
    string_columns = df_clean.select_dtypes(include=['object']).columns
    for col in string_columns:
        df_clean[col] = df_clean[col].astype(str).str.strip()
    
    # Remove empty names
    df_clean = df_clean[df_clean['name'].str.len() > 0]
    print(f"Removed {initial_count - len(df_clean)} rows with empty names")
    
    # Fill missing values with empty strings for string columns
    for col in string_columns:
        df_clean[col] = df_clean[col].fillna("")
    
    # Fill missing values for numeric columns
    numeric_columns = df_clean.select_dtypes(include=['number']).columns
    for col in numeric_columns:
        df_clean[col] = df_clean[col].fillna(0)
    
    # Remove duplicates based on name and website
    initial_count = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset=['name', 'website'])
    print(f"Removed {initial_count - len(df_clean)} duplicate rows")
    
    # Sort by name for easier browsing
    df_clean = df_clean.sort_values('name')
    
    print(f"\nFinal cleaned dataset shape: {df_clean.shape}")
    
    # Show sample of cleaned data
    print("\nSample of cleaned companies:")
    print(df_clean.head(5)[['name', 'industry', 'company_size', 'hq']].to_string())
    
    # Export to JSON with unified structure
    output_file = 'us_companies_cleaned.json'
    
    # Convert to list of dictionaries for JSON export with unified structure
    companies_list = []
    for _, row in df_clean.iterrows():
        company_name = str(row['name']).strip()
        website = str(row['website']).strip()
        
        # Generate normalized name and aliases
        normalized_name = normalize_company_name(company_name)
        aliases = generate_aliases(company_name, website)
        
        # Extract location from HQ if available
        location = ""
        if row['hq'] and str(row['hq']) != 'nan':
            try:
                hq_data = json.loads(str(row['hq'])) if isinstance(row['hq'], str) else row['hq']
                if isinstance(hq_data, dict):
                    city = hq_data.get('city', '')
                    state = hq_data.get('state', '')
                    if city and state:
                        location = f"{city}, {state}"
                    elif city:
                        location = city
            except:
                location = str(row['hq'])
        
        company_dict = {
            "name": company_name,
            "normalizedName": normalized_name,
            "aliases": aliases,
            "website": website,
            "location": location,
            "industry": str(row['industry']).strip() if row['industry'] else "",
            "company_size": str(row['company_size']).strip() if row['company_size'] else "",
            "company_type": str(row['company_type']).strip() if row['company_type'] else "",
            "founded_year": int(row['founded_year']) if row['founded_year'] and row['founded_year'] > 0 else 0,
            "specialities": str(row['specialities']).strip() if row['specialities'] else "",
            "locations": str(row['locations']).strip() if row['locations'] else "",
            
            # Initialize dynamic fields (will be populated by submissions)
            "submissionCount": 0,
            "lastSubmission": None,
            "commonFlags": [],
            "averageFlagCount": 0,
            "severityTrends": {
                "light": 0,
                "medium": 0
            },
            "createdAt": None,
            "updatedAt": None
        }
        
        companies_list.append(company_dict)
    
    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(companies_list, f, indent=2, ensure_ascii=False)
    
    print(f"\nExported {len(companies_list)} companies to: {output_file}")
    
    # Show some statistics
    print(f"\nDataset statistics:")
    print(f"- Total companies: {len(companies_list)}")
    print(f"- Companies with websites: {sum(1 for c in companies_list if c['website'])}")
    print(f"- Companies with industry: {sum(1 for c in companies_list if c['industry'])}")
    print(f"- Companies with location: {sum(1 for c in companies_list if c['location'])}")
    
    # Show sample of normalized names and aliases
    print(f"\nSample normalized names and aliases:")
    for i, company in enumerate(companies_list[:5]):
        print(f"{i+1}. '{company['name']}' → '{company['normalizedName']}'")
        print(f"   Aliases: {company['aliases'][:3]}...")
    
    return companies_list

if __name__ == "__main__":
    companies = clean_and_export_companies() 
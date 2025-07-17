import kagglehub
import pandas as pd
import json
from pathlib import Path

def download_and_explore_dataset():
    """Download the company dataset and explore its structure"""
    
    print("Downloading company dataset...")
    # Download latest version
    path = kagglehub.dataset_download("proxycurl/10000-us-company-profiles")
    print(f"Path to dataset files: {path}")
    
    # List all files in the dataset
    dataset_path = Path(path)
    files = list(dataset_path.glob("*"))
    print(f"\nFiles found: {[f.name for f in files]}")
    
    # Look for data files
    data_files = [f for f in files if f.suffix in ['.csv', '.json', '.parquet', '.txt']]
    
    if not data_files:
        print("No data files found!")
        return
    
    # Load the first data file
    data_file = data_files[0]
    print(f"\nLoading data from: {data_file}")
    
    if data_file.suffix == '.csv':
        df = pd.read_csv(data_file)
    elif data_file.suffix == '.json':
        df = pd.read_json(data_file)
    elif data_file.suffix == '.parquet':
        df = pd.read_parquet(data_file)
    elif data_file.suffix == '.txt':
        # Try to read as JSON lines first
        try:
            df = pd.read_json(data_file, lines=True)
        except:
            # If that fails, read as regular text and try to parse
            with open(data_file, 'r', encoding='utf-8') as f:
                first_lines = [f.readline() for _ in range(5)]
            print(f"First few lines of text file:")
            for i, line in enumerate(first_lines):
                print(f"Line {i+1}: {line.strip()}")
            return None
    
    # Explore the dataset
    print(f"\nDataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    # Show data types
    print(f"\nData types:")
    print(df.dtypes)
    
    # Show first few rows
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    # Show sample of company names
    if 'name' in df.columns:
        print(f"\nSample company names:")
        print(df['name'].head(10).tolist())
    elif 'company_name' in df.columns:
        print(f"\nSample company names:")
        print(df['company_name'].head(10).tolist())
    
    # Check for missing values
    print(f"\nMissing values per column:")
    print(df.isnull().sum())
    
    # Save schema info
    schema_info = {
        'shape': df.shape,
        'columns': list(df.columns),
        'dtypes': df.dtypes.to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
        'sample_companies': df.iloc[:5].to_dict('records') if len(df) > 0 else []
    }
    
    with open('company_dataset_schema.json', 'w') as f:
        json.dump(schema_info, f, indent=2, default=str)
    
    print(f"\nSchema info saved to: company_dataset_schema.json")
    
    return df

if __name__ == "__main__":
    df = download_and_explore_dataset() 
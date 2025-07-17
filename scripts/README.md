# Firebase Database Cleanup & Population Scripts

This directory contains scripts to clean and populate your Firebase database with a robust company dataset.

## 📋 Prerequisites

1. **Python 3.7+** installed
2. **Firebase service account key** (`firebase-service-account.json`) in this directory
3. **Kaggle API credentials** (optional, for downloading datasets)

## 🛠 Installation

```bash
# Install required dependencies
pip install -r requirements.txt
```

## 📁 Scripts Overview

### 1. `clean_and_populate_firebase.py`
**Main script** that downloads the Kaggle dataset and populates Firebase with the proper schema.

**Features:**
- Cleans existing Firebase collections
- Downloads 7M+ company dataset from Kaggle
- Processes and cleans company data
- Creates companies with the required schema
- Batch processing for efficiency
- Comprehensive logging

**Usage:**
```bash
python clean_and_populate_firebase.py
```

### 2. `populate_from_csv.py`
**Backup script** for populating Firebase from a local CSV file.

**Features:**
- Loads company data from CSV
- Automatic column detection
- Data cleaning and validation
- Batch processing
- Command-line arguments

**Usage:**
```bash
python populate_from_csv.py --csv companies.csv --limit 1000
```

**Arguments:**
- `--csv`: Path to CSV file (required)
- `--limit`: Maximum companies to add (default: 1000)
- `--service-account`: Path to Firebase service account (default: firebase-service-account.json)

### 3. `generate_sample_companies.py`
**Utility script** to create a sample CSV with popular companies for testing.

**Features:**
- Generates 100+ popular companies
- Includes various industries
- Ready for testing

**Usage:**
```bash
python generate_sample_companies.py
```

## 🏗 Company Schema

Each company document will have the following structure:

```json
{
  "aliases": ["Company Name", "Company", "Company Inc"],
  "averageFlagCount": 0.0,
  "commonFlags": [],
  "createdAt": "2024-01-01T00:00:00Z",
  "lastSubmission": "2024-01-01T00:00:00Z",
  "name": "Company Name",
  "normalizedName": "company name",
  "severityTrends": {
    "light": 0,
    "medium": 0
  },
  "submissionCount": 0,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🚀 Quick Start

### Option 1: Use Kaggle Dataset (Recommended)
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the main script
python clean_and_populate_firebase.py
```

### Option 2: Use Sample Data (Testing)
```bash
# 1. Generate sample companies
python generate_sample_companies.py

# 2. Populate Firebase with sample data
python populate_from_csv.py --csv sample_companies.csv --limit 100
```

### Option 3: Use Your Own CSV
```bash
# 1. Prepare your CSV file with company names
# 2. Run the CSV population script
python populate_from_csv.py --csv your_companies.csv --limit 5000
```

## 📊 Data Processing

### Company Name Cleaning
- Removes duplicates and null values
- Filters for reasonable name lengths (2-100 characters)
- Normalizes special characters
- Generates common aliases

### Alias Generation
The script automatically generates aliases for each company:
- Original name
- Common variations (Inc → "", Corp → "", etc.)
- And/& variations
- Limited to 10 aliases per company

### Batch Processing
- Processes companies in batches of 500
- Provides progress updates
- Handles errors gracefully
- Continues processing on batch failures

## 🔍 Verification

After running any script, it will automatically verify:
- Company count in database
- Required fields presence
- Sample company structure
- Data integrity

## 📝 Logging

All scripts create detailed logs:
- `firebase_cleanup.log` - Main script logs
- `firebase_csv_population.log` - CSV script logs
- Console output with progress indicators

## ⚠️ Important Notes

1. **Backup First**: These scripts will delete existing data. Backup your database first!
2. **Service Account**: Ensure your Firebase service account has write permissions
3. **Rate Limits**: Firebase has rate limits. Large datasets may take time to process
4. **Kaggle API**: If using Kaggle dataset, you may need to authenticate with Kaggle

## 🐛 Troubleshooting

### Common Issues

**Firebase Authentication Error:**
```
❌ Failed to initialize Firebase: [Errno 2] No such file or directory: 'firebase-service-account.json'
```
**Solution:** Ensure `firebase-service-account.json` is in the scripts directory

**Kaggle Download Error:**
```
❌ Error downloading dataset: Authentication required
```
**Solution:** Set up Kaggle API credentials or use the CSV backup script

**CSV Column Error:**
```
⚠️ No standard company name column found, using: column_name
```
**Solution:** This is a warning, not an error. The script will use the first column.

### Performance Tips

1. **Start Small**: Test with 100-1000 companies first
2. **Monitor Logs**: Check log files for detailed progress
3. **Batch Size**: Reduce batch size if you encounter rate limits
4. **Network**: Ensure stable internet connection for Kaggle downloads

## 📞 Support

If you encounter issues:
1. Check the log files for detailed error messages
2. Verify your Firebase service account permissions
3. Test with the sample companies first
4. Check your internet connection for Kaggle downloads 
#!/usr/bin/env python3
"""
Generate Sample Companies CSV

This script creates a CSV file with popular companies for testing.
"""

import pandas as pd
import os

# Popular companies for testing
POPULAR_COMPANIES = [
    # Tech Companies
    "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "Twitter", "LinkedIn",
    "Uber", "Airbnb", "Spotify", "Slack", "Zoom", "Salesforce", "Adobe", "Oracle",
    "Intel", "AMD", "NVIDIA", "IBM", "Cisco", "Dell", "HP", "Sony", "Samsung",
    
    # Financial Companies
    "JPMorgan Chase", "Bank of America", "Wells Fargo", "Goldman Sachs", "Morgan Stanley",
    "Citigroup", "American Express", "Visa", "Mastercard", "PayPal", "Stripe",
    
    # Retail & Consumer
    "Walmart", "Target", "Costco", "Home Depot", "Lowe's", "Best Buy", "Starbucks",
    "McDonald's", "Coca-Cola", "PepsiCo", "Nike", "Adidas", "Disney", "Netflix",
    
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
    "Disney", "Warner Bros", "Universal Studios", "Paramount", "Sony Pictures",
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

def generate_sample_csv(output_path: str = "sample_companies.csv"):
    """Generate a CSV file with sample companies"""
    print(f"📝 Generating sample companies CSV: {output_path}")
    
    # Create DataFrame
    df = pd.DataFrame({
        'name': POPULAR_COMPANIES,
        'industry': ['Technology'] * 25 + ['Financial'] * 11 + ['Retail'] * 14 + 
                   ['Healthcare'] * 10 + ['Automotive'] * 10 + ['Consulting'] * 9 +
                   ['Media'] * 11 + ['Manufacturing'] * 9 + ['Energy'] * 8 + ['Telecommunications'] * 8
    })
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    
    print(f"✅ Generated {len(df)} companies in {output_path}")
    print(f"📊 Sample companies:")
    for i, company in enumerate(df['name'][:10]):
        print(f"   {i+1}. {company}")
    
    return output_path

def main():
    """Main function"""
    output_file = generate_sample_csv()
    print(f"\n🎉 Sample companies CSV created: {output_file}")
    print("You can now use this file with the populate_from_csv.py script:")
    print(f"python populate_from_csv.py --csv {output_file} --limit 100")

if __name__ == "__main__":
    main() 
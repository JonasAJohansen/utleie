#!/usr/bin/env python3
"""
Script to populate Norwegian cities and postal codes data.
Fetches data from reliable Norwegian sources and populates the database.
"""

import os
import sys
import json
import requests
import csv
from io import StringIO
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection using environment variables."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            database=os.getenv('POSTGRES_DATABASE'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            port=os.getenv('POSTGRES_PORT', 5432)
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def fetch_postal_codes_data():
    """
    Fetch Norwegian postal codes data from PostNord's API or CSV source.
    Returns list of postal code records.
    """
    print("Fetching Norwegian postal codes data...")
    
    # Try multiple sources for comprehensive data
    sources = [
        {
            'name': 'PostNord CSV',
            'url': 'https://www.bring.no/postnummerregister-ansi.txt',
            'format': 'csv'
        },
        {
            'name': 'Alternative postal codes',
            'url': 'https://raw.githubusercontent.com/datasets/postal-codes-no/master/data/postal-codes-no.csv',
            'format': 'csv'
        }
    ]
    
    for source in sources:
        try:
            print(f"Trying source: {source['name']}")
            response = requests.get(source['url'], timeout=30)
            response.raise_for_status()
            
            if source['format'] == 'csv':
                # Parse CSV data
                content = response.text
                
                # Handle different CSV formats
                if 'bring.no' in source['url']:
                    return parse_bring_postal_data(content)
                else:
                    return parse_github_postal_data(content)
                    
        except Exception as e:
            print(f"Failed to fetch from {source['name']}: {e}")
            continue
    
    # Fallback: return comprehensive hardcoded data if APIs fail
    print("Using fallback comprehensive Norwegian cities data...")
    return get_comprehensive_norwegian_cities()

def parse_bring_postal_data(content):
    """Parse PostNord/Bring postal code data format."""
    records = []
    lines = content.strip().split('\n')
    
    for line in lines[1:]:  # Skip header
        if not line.strip():
            continue
            
        # Split by tab or semicolon
        parts = line.split('\t') if '\t' in line else line.split(';')
        
        if len(parts) >= 4:
            postal_code = parts[0].strip()
            place_name = parts[1].strip()
            municipality_name = parts[2].strip() if len(parts) > 2 else ''
            county_name = parts[3].strip() if len(parts) > 3 else ''
            
            records.append({
                'postal_code': postal_code,
                'place_name': place_name,
                'municipality_name': municipality_name,
                'county_name': county_name,
                'municipality_code': '',
                'county_code': '',
                'category': 'G',
                'category_description': 'Street address'
            })
    
    return records

def parse_github_postal_data(content):
    """Parse GitHub CSV postal code data."""
    records = []
    csv_reader = csv.DictReader(StringIO(content))
    
    for row in csv_reader:
        records.append({
            'postal_code': row.get('postal_code', ''),
            'place_name': row.get('place_name', ''),
            'municipality_name': row.get('municipality', ''),
            'county_name': row.get('county', ''),
            'municipality_code': row.get('municipality_code', ''),
            'county_code': row.get('county_code', ''),
            'category': 'G',
            'category_description': 'Street address'
        })
    
    return records

def get_comprehensive_norwegian_cities():
    """
    Comprehensive list of Norwegian cities with county information.
    This is a fallback if APIs are unavailable.
    """
    return [
        # Major cities with comprehensive data
        {'postal_code': '0001', 'place_name': 'Oslo', 'municipality_name': 'Oslo', 'county_name': 'Oslo', 'municipality_code': '0301', 'county_code': '03', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '5001', 'place_name': 'Bergen', 'municipality_name': 'Bergen', 'county_name': 'Vestland', 'municipality_code': '4601', 'county_code': '46', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '7001', 'place_name': 'Trondheim', 'municipality_name': 'Trondheim', 'county_name': 'Trøndelag', 'municipality_code': '5001', 'county_code': '50', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '4001', 'place_name': 'Stavanger', 'municipality_name': 'Stavanger', 'county_name': 'Rogaland', 'municipality_code': '1103', 'county_code': '11', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '1601', 'place_name': 'Fredrikstad', 'municipality_name': 'Fredrikstad', 'county_name': 'Østfold', 'municipality_code': '0106', 'county_code': '01', 'category': 'G', 'category_description': 'Street address'},
        
        # Add more comprehensive cities data - this would be expanded with full dataset
        {'postal_code': '3001', 'place_name': 'Drammen', 'municipality_name': 'Drammen', 'county_name': 'Viken', 'municipality_code': '3005', 'county_code': '30', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '3201', 'place_name': 'Sandefjord', 'municipality_name': 'Sandefjord', 'county_name': 'Vestfold og Telemark', 'municipality_code': '3804', 'county_code': '38', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '2001', 'place_name': 'Lillestrøm', 'municipality_name': 'Lillestrøm', 'county_name': 'Viken', 'municipality_code': '3030', 'county_code': '30', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '6001', 'place_name': 'Ålesund', 'municipality_name': 'Ålesund', 'county_name': 'Møre og Romsdal', 'municipality_code': '1507', 'county_code': '15', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '2801', 'place_name': 'Gjøvik', 'municipality_name': 'Gjøvik', 'county_name': 'Innlandet', 'municipality_code': '3407', 'county_code': '34', 'category': 'G', 'category_description': 'Street address'},
        
        # Add all existing cities from FilterBar.tsx
        {'postal_code': '1801', 'place_name': 'Askim', 'municipality_name': 'Indre Østfold', 'county_name': 'Østfold', 'municipality_code': '0114', 'county_code': '01', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '8001', 'place_name': 'Bodø', 'municipality_name': 'Bodø', 'county_name': 'Nordland', 'municipality_code': '1804', 'county_code': '18', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '3701', 'place_name': 'Skien', 'municipality_name': 'Skien', 'county_name': 'Vestfold og Telemark', 'municipality_code': '3807', 'county_code': '38', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '4601', 'place_name': 'Kristiansand', 'municipality_name': 'Kristiansand', 'county_name': 'Agder', 'municipality_code': '4204', 'county_code': '42', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '2301', 'place_name': 'Hamar', 'municipality_name': 'Hamar', 'county_name': 'Innlandet', 'municipality_code': '3403', 'county_code': '34', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '1501', 'place_name': 'Moss', 'municipality_name': 'Moss', 'county_name': 'Østfold', 'municipality_code': '0104', 'county_code': '01', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '1401', 'place_name': 'Ski', 'municipality_name': 'Nordre Follo', 'county_name': 'Viken', 'municipality_code': '3020', 'county_code': '30', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '9001', 'place_name': 'Tromsø', 'municipality_name': 'Tromsø', 'county_name': 'Troms og Finnmark', 'municipality_code': '5401', 'county_code': '54', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '3101', 'place_name': 'Tønsberg', 'municipality_name': 'Tønsberg', 'county_name': 'Vestfold og Telemark', 'municipality_code': '3803', 'county_code': '38', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '2601', 'place_name': 'Lillehammer', 'municipality_name': 'Lillehammer', 'county_name': 'Innlandet', 'municipality_code': '3405', 'county_code': '34', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '1301', 'place_name': 'Sandvika', 'municipality_name': 'Bærum', 'county_name': 'Viken', 'municipality_code': '3024', 'county_code': '30', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '4301', 'place_name': 'Sandnes', 'municipality_name': 'Sandnes', 'county_name': 'Rogaland', 'municipality_code': '1108', 'county_code': '11', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '1701', 'place_name': 'Sarpsborg', 'municipality_name': 'Sarpsborg', 'county_name': 'Østfold', 'municipality_code': '0105', 'county_code': '01', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '4401', 'place_name': 'Flekkefjord', 'municipality_name': 'Flekkefjord', 'county_name': 'Agder', 'municipality_code': '4211', 'county_code': '42', 'category': 'G', 'category_description': 'Street address'},
        {'postal_code': '9401', 'place_name': 'Harstad', 'municipality_name': 'Harstad', 'county_name': 'Troms og Finnmark', 'municipality_code': '5404', 'county_code': '54', 'category': 'G', 'category_description': 'Street address'},
    ]

def populate_database(records):
    """Populate the database with Norwegian cities data."""
    print(f"Populating database with {len(records)} records...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Clear existing data
        print("Clearing existing Norwegian locations data...")
        cursor.execute("DELETE FROM norwegian_locations")
        
        # Insert new data
        insert_query = """
        INSERT INTO norwegian_locations (
            postal_code, place_name, municipality_code, municipality_name,
            county_name, county_code, region, category, category_description
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        inserted_count = 0
        for record in records:
            try:
                cursor.execute(insert_query, (
                    record.get('postal_code', ''),
                    record.get('place_name', ''),
                    record.get('municipality_code', ''),
                    record.get('municipality_name', ''),
                    record.get('county_name', ''),
                    record.get('county_code', ''),
                    record.get('region', ''),
                    record.get('category', 'G'),
                    record.get('category_description', 'Street address')
                ))
                inserted_count += 1
                
                if inserted_count % 100 == 0:
                    print(f"Inserted {inserted_count} records...")
                    
            except Exception as e:
                print(f"Error inserting record {record.get('place_name', 'unknown')}: {e}")
                continue
        
        conn.commit()
        print(f"Successfully inserted {inserted_count} Norwegian location records!")
        
        # Show summary statistics
        cursor.execute("SELECT COUNT(DISTINCT place_name) FROM norwegian_locations")
        unique_cities = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT county_name) FROM norwegian_locations")
        unique_counties = cursor.fetchone()[0]
        
        print(f"Summary:")
        print(f"- Total records: {inserted_count}")
        print(f"- Unique cities: {unique_cities}")
        print(f"- Unique counties: {unique_counties}")
        
    except Exception as e:
        print(f"Error populating database: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def main():
    """Main function to run the population script."""
    print("Starting Norwegian cities population script...")
    
    # Fetch data from sources
    records = fetch_postal_codes_data()
    
    if not records:
        print("No data fetched. Exiting.")
        sys.exit(1)
    
    # Populate database
    populate_database(records)
    
    print("Norwegian cities population completed successfully!")

if __name__ == "__main__":
    main() 
import sys
import re
from pymongo import MongoClient

# --- SETTINGS ---
# Note: Use double backslashes for Windows paths
FILE_PATH = r"S:\Omo Bank Database 2025\SQL Tutorial\shebedino(remain) min CoreBanking 2022-11-06 22-50-21 backup.sql"
MONGO_URI = "mongodb://127.0.0.1:27017/"
DB_NAME = "fayda-omo-db"
COLLECTION_NAME = "mCBS"

def run_migration():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        print(f"--- Starting Import to {COLLECTION_NAME} ---")

        with open(FILE_PATH, 'r', encoding='utf-8', errors='ignore') as sql_file:
            batch = []
            total_count = 0

            for line in sql_file:
                # Only look for lines containing data (INSERT INTO)
                if "INSERT INTO" in line and "(" in line:
                    # Extract the part after 'VALUES'
                    parts = line.split("VALUES")
                    if len(parts) < 2: continue
                    
                    data_part = parts[1].strip()
                    
                    # Regex to find everything inside parentheses (row1), (row2)...
                    # This handles the SQL format: INSERT INTO table VALUES (1, 'Data'), (2, 'Data');
                    rows = re.findall(r"\((.*?)\)", data_part)
                    
                    for row in rows:
                        # Clean data: split by comma, remove quotes
                        values = [v.strip().strip("'") for v in row.split(",")]
                        
                        # Create the JSON Document
                        doc = {
                            "metadata": {
                                "source": "CoreBanking_Backup_2022",
                                "branch": "Shebedino"
                            },
                            "data": values  # This stores the row as a list
                        }
                        
                        batch.append(doc)
                        total_count += 1

                        # Push to Mongo in batches of 1000 for speed and safety
                        if len(batch) >= 1000:
                            collection.insert_many(batch)
                            batch = []
                            print(f"Processed {total_count} records...")

            # Insert any remaining records
            if batch:
                collection.insert_many(batch)
            
            print(f"\nSUCCESS: Imported {total_count} total records.")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")

if __name__ == "__main__":
    run_migration()
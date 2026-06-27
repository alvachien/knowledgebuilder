import os
import json
from collections import Counter

def find_duplicate_enwords(file_path):
    """
    Scans a JSON file and returns duplicate enword entries found in it.
    Expects the file to contain an array of objects with 'enword' field.
    """
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"File does not exist: {file_path}")
        return {}
    
    try:
        # Read and parse the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extract 'enword' values from the data
        enwords = []
        if isinstance(data, list):
            # If the JSON is an array of objects
            for item in data:
                if isinstance(item, dict) and 'enword' in item:
                    enwords.append(item['enword'])
        elif isinstance(data, dict) and 'items' in data and isinstance(data['items'], list):
            # If the JSON has an 'items' field containing the array
            for item in data['items']:
                if isinstance(item, dict) and 'enword' in item:
                    enwords.append(item['enword'])
        
        # Count occurrences of each enword
        enword_counts = Counter(enwords)
        
        # Find duplicates (enwords that appear more than once)
        duplicates = {enword: count for enword, count in enword_counts.items() if count > 1}
        
        return duplicates
        
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in file: {file_path}")
        return {}
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return {}

def main():
    # Ask user for the filename in public/data/learnenglish directory
    file_name = input("Enter the filename in public/data/learnenglish directory: ")
    file_path = os.path.join("..", "public", "data", "learnenglish", file_name)
    
    print(f"Scanning file: {file_path}")
    
    duplicates = find_duplicate_enwords(file_path)
    
    if duplicates:
        print("\nDuplicate enword entries found:")
        print("-" * 40)
        for enword, count in sorted(duplicates.items()):
            print(f"{enword}: {count} times")
        print(f"\nTotal unique duplicate enwords: {len(duplicates)}")
    else:
        print("\nNo duplicate enword entries found.")

if __name__ == "__main__":
    main()
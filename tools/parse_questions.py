"""
Parse a text file containing multiple choice questions and generate JSON.
Input format:
    1. [question text]
    A. option A
    B. option B
    C. option C
    D. option D
    2. ...
Output format:
    [
        {
            "id": "1",
            "itemType": "SingleChoice",
            "question": "question text",
            "options": {"A": "", "B": "", "C": "", "D": ""},
            "answer": "",
            "hintofanswer": ""
        }
    ]
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional, Tuple


def normalize_quotes(text: str) -> str:
    """Normalize curly/smart quotes to straight quotes for consistency."""
    quote_map = {
        '"': '"',
        '"': '"',
        ''': "'",
        ''': "'",
    }
    for curly, straight in quote_map.items():
        text = text.replace(curly, straight)
    return text


def validate_item(item: Dict) -> Tuple[bool, List[str]]:
    """Validate that an item has a non-empty question and all options.
    
    Returns:
        tuple of (is_valid, list of error messages)
    """
    errors: List[str] = []
    
    if not item.get('question', '').strip():
        errors.append(f"Question {item.get('id', 'unknown')}: Empty question")
    
    options = item.get('options', {})
    for key in ['A', 'B', 'C', 'D']:
        if not options.get(key, '').strip():
            errors.append(f"Question {item.get('id', 'unknown')}: Option {key} is empty")
    
    return len(errors) == 0, errors


def parse_questions(text: str, id_prefix: str = '') -> List[Dict]:
    items: List[Dict] = []
    lines = text.strip().split('\n')
    
    current_item: Optional[Dict] = None
    current_question_lines: List[str] = []
    
    question_pattern = re.compile(r'^(\d+)\.\s*(.*)$')
    option_pattern = re.compile(r'^([A-D])\.\s*(.*)$')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        question_match = question_pattern.match(line)
        option_match = option_pattern.match(line)
        
        if question_match:
            if current_item is not None:
                question_text = '\n'.join(current_question_lines).strip()
                current_item['question'] = normalize_quotes(question_text)
                items.append(current_item)
            
            question_id = question_match.group(1)
            question_text = question_match.group(2).strip()
            question_text = normalize_quotes(question_text)
            
            current_item = {
                'id': f"{id_prefix}{question_id}" if id_prefix else question_id,
                'itemType': 'SingleChoice',
                'question': '',
                'options': {
                    'A': '',
                    'B': '',
                    'C': '',
                    'D': ''
                },
                'answer': '',
                'hintofanswer': ''
            }
            
            if question_text:
                current_question_lines = [question_text]
            else:
                current_question_lines = [f'({question_id})']
        
        elif option_match and current_item is not None:
            option_key = option_match.group(1)
            option_value = option_match.group(2).strip()
            current_item['options'][option_key] = normalize_quotes(option_value)
        
        elif current_item is not None:
            current_question_lines.append(normalize_quotes(line))
    
    if current_item is not None:
        question_text = '\n'.join(current_question_lines).strip()
        current_item['question'] = normalize_quotes(question_text)
        items.append(current_item)
    
    return items


def main():
    if len(sys.argv) < 2:
        user_input = input("Enter text file path: ").strip()
        if not user_input:
            print("Error: No input file specified", file=sys.stderr)
            sys.exit(1)
        input_path = Path(user_input)
        output_path = None
        id_prefix = ''
    else:
        input_path = Path(sys.argv[1])
        output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None
        id_prefix = sys.argv[3] if len(sys.argv) > 3 else ''
    
    if not input_path.exists():
        print(f"Error: File not found at {input_path}", file=sys.stderr)
        sys.exit(1)
    
    with open(input_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    items = parse_questions(text, id_prefix)
    
    valid_items: List[Dict] = []
    all_errors: List[str] = []
    
    for item in items:
        is_valid, errors = validate_item(item)
        if is_valid:
            valid_items.append(item)
        else:
            all_errors.extend(errors)
    
    if all_errors:
        print("Validation errors found:")
        for error in all_errors:
            print(f"  - {error}")
        print()
    
    if output_path is None:
        output_path = input_path.parent / f"{input_path.stem}_output.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(valid_items, f, ensure_ascii=False, indent='\t')
    
    print(f"Parsed {len(items)} questions, {len(valid_items)} valid")
    sys.exit(0)


if __name__ == '__main__':
    main()
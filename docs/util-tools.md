# Tools

## `fix-json-ids.js`

A tool to fix the ids of items in a JSON file.

### Usage

1. Place the script in the same directory as the JSON file you want to fix.
2. Run the script using Node.js:
```
node tools/fix-json-ids.js
```
3. The script will modify the JSON file in place, adding or updating the `id` field for each item.

## `quizConverter.js`

A tool which parse the text file and convert it to JSON format.

Each line in the text file defines a question. And each question contain 4 options:

An example:

```txt
A. shine B. fly C. dance D. score
A. fly B. shine C. score D. dance
```

### Usage

1. Place the script in the same directory as the text file you want to convert.
2. Run the script using Node.js:
```
node tools/quizConverter.js
```
3. The script will output the JSON format of the questions to the console.
4. You can redirect the output to a file if needed:
```
node tools/quizConverter.js > questions.json
```


## `parse_questions.ps1`

A PowerShell wrapper that calls `parse_questions.py` to parse question text files into JSON format.

### Usage

1. Navigate to the `tools` folder:
```
cd tools
```
2. Update `question.txt` with your questions.
3. Execute the script from the same folder:
```
.\parse_questions.ps1 wk16-friday-
```
4. Check the result in `questions.json` under the same `tools` folder.

## `parse_questions.py`

A Python script that parses question text files into structured JSON. Called by `parse_questions.ps1`.

### Usage

Run directly with Python:
```
python tools/parse_questions.py <input_file> <output_file> [prefix]
```


## `convertTextToJson.js`

A tool which parse the text file and convert it to JSON format.

The text file use blank line to separate each question. And each question contain 5 lines:

1. The question stem
2. The options (A, B, C, D)

An example:

```txt
Question 1.
A. shine
B. fly
C. dance
D. score

Question 2.
A. shine
B. fly
C. dance
D. score
```

### Usage

1. Place the script in the same directory as the text file you want to convert.
2. Run the script using Node.js:
```
node tools/convertTextToJson.js
```
3. The script will output the JSON format of the questions to the console.
4. You can redirect the output to a file if needed:
```
node tools/convertTextToJson.js > questions.json
```

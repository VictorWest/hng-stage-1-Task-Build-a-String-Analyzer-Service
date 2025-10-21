# 🧠 Backend Wizards — Stage 1 Task  
**Build a String Analyzer Service**  

A lightweight Express.js API for managing, analyzing, and filtering strings.
It supports both structured queries (like /strings?min_length=5) and natural language queries (like /strings/filter-by-natural-language?query=all single word palindromic strings).

---

## Features

- Add, retrieve, and delete stored strings.

- Compute and store properties:
  - Palindrome detection
  - Character frequency
  - Word count
  - SHA256 hash
  - Unique character count

- Filter strings by query parameters (min_length, max_length, etc.).

- Perform natural language filtering, e.g.:
  - "all single word palindromic strings"
  - "strings longer than 10 characters"
  - "strings containing the letter z"

---
## Tech Stack

- Node.js (v18+)
- Express.js
- TypeScript
- Crypto (built-in Node.js module)

---

## Dependencies
| Package | Purpose 
| :------ | :----: 
| express  | Web server and routing
| crypto   | Generates SHA256 hashes (built into Node.js)
| typescript | Type safety and clarity
| ts-node | Run TypeScript directly without compiling manually

---
## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/string-processing-api.git
cd string-processing-api
```
### 2. Initialize and install dependencies
```bash
npm init -y
npm install express
npm install -D typescript ts-node @types/express
```

### 3. Add TypeScript config
```bash
npx tsc --init
```
Then update tsconfig.json minimally:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 4. Running Locally
- Development mode

This runs your app with live reload (via nodemon):
```bash
npx nodemon --watch './**/*.ts' --exec 'ts-node index.ts'
```
- Production mode

Compile TypeScript to JavaScript and run it:
```bash
npx tsc
node dist/index.js
```

Your API will be live at
👉 http://localhost:3000

---
## API Endpoints
### 1. Add a new string

POST /strings
```json
{
  "value": "racecar"
}
```

Response (201 Created):
```json
{
  "id": "ab3e1f...",
  "value": "racecar",
  "properties": {
    "length": 7,
    "is_palindrome": true,
    "unique_characters": 4,
    "word_count": 1,
    "sha256_hash": "ab3e1f...",
    "character_frequency_map": { "r": 2, "a": 2, "c": 2, "e": 1 }
  },
  "created_at": "2025-10-22T00:00:00Z"
}
```

### 2. Retrieve all strings (with filters)

GET /strings?min_length=3&is_palindrome=true

Returns strings matching applied filters.

### 3. Retrieve by natural language

GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings

Response:
```json
{
  "data": ["madam", "civic", "level"],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

### 4. Retrieve a specific string

GET /strings/:string_value

Returns the string and its computed properties.

### 5. Delete a string

DELETE /strings/:string_value

Response: 204 No Content

---
## Example Query Patterns Supported

|Query | Parsed Filters
| :------ | :----: 
|all single word palindromic strings|	{ word_count: 1, is_palindrome: true }
|strings longer than 10 characters|	{ min_length: 11 }
|strings containing the letter z|	{ contains_character: "z" }
|palindromic strings that contain the first vowel|	{ is_palindrome: true, contains_character: "a" }

## Error Responses
|Code |Meaning |Example Message
| :------ | :----: | :----:
|400|	Bad Request|	"Invalid query parameter values or types"
|404|	Not Found|	"String does not exist in the system"
|409|	Conflict|	"String already exists in the system"
|422|	Unprocessable Entity|	"Query parsed but resulted in conflicting filters"
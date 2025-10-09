import os
import uuid
import sqlite3
import json
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# === Flask App Setup ===
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend connection

# === Configuration ===
DB_FOLDER = 'sessions'
os.makedirs(DB_FOLDER, exist_ok=True)

# === Gemini API Configuration ===
GEMINI_API_KEY = "AIzaSyB2VDk8MZ2Fh4i3XgICSz2M3TZwu-VGq_A"  # Replace with your real key
genai.configure(api_key=GEMINI_API_KEY)
network_model = genai.GenerativeModel("models/gemini-2.5-flash-lite")
sql_model = genai.GenerativeModel("models/gemini-2.5-flash-lite")
coding_model = genai.GenerativeModel("models/gemini-2.5-flash-lite")

# === Helper Functions ===
def get_db_path(session_id):
    """Get the path for a session-specific SQLite database"""
    return os.path.join(DB_FOLDER, f"{session_id}.db")

# =============================================================================
# NETWORKING ROUTES (from original app1.py)
# =============================================================================

@app.route('/generate-network-question', methods=['GET'])
def generate_network_question():
    prompt = """
Generate a clear and concise networking scenario question for students that involves designing IP configurations and network device setups. The question should be practical and test the understanding of subnetting, IP addressing, routing, and gateway configuration.

The scenario involves two PCs (or end devices) that need to communicate. Randomly choose one of the following cases and clearly state it in the question:

1. Both PCs are in the same subnet.
2. The PCs are in different subnets within the same overall network.
3. The PCs are in different networks requiring routing between them.

Assume the subnet mask is always 255.255.255.0.

Limit the maximum number of routers to two (or fewer).

The question should ask the student to:
- Assign suitable IP addresses to both PCs based on the chosen scenario.
- Specify any required network devices and their configuration (routers, switches).
- Provide gateway settings for the PCs and routers if needed.

Write the question clearly and in a student-friendly manner without giving away the solution or assumptions about the number of routers/devices needed.

"""
    try:
        response = network_model.generate_content(prompt)
        question_text = response.text.strip()

        # Strip markdown code blocks if present
        if question_text.startswith("```"):
            question_text = question_text.strip("```").strip()

        return jsonify({"status": "success", "question": question_text})

    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to generate question: {e}"}), 500


@app.route('/evaluate-network', methods=['POST'])
def evaluate_network():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No JSON data received"}), 400
        
    network_data = data.get('config')
    question = data.get('question')

    # Basic validation
    if not network_data or 'nodes' not in network_data or 'edges' not in network_data:
        return jsonify({"status": "error", "message": "Invalid network JSON"}), 400

    prompt = f"""
    You are a network configuration evaluator.
    
    First, give a clear and concise overall verdict about the correctness of the provided network configuration with respect to the question. If correct then 5/5 and if incorrect then 0/5. No mid marks here. 
    Start with a sentence like:

    - "Your Score is : Given Score."
    
    - "The network configuration is correct and meets the requirements."
    - OR "The network configuration is incomplete and does not fully meet the requirements."
    
    After this verdict, provide a detailed explanation divided into numbered points covering:
    
    1. IP Addressing for PCs
    2. Network Devices and Configuration
    3. Gateway Settings
    
    Use clear, human-like sentences with bullet points or numbered lists for explanation. 
    Do not just return raw JSON — respond in friendly, easy-to-read paragraphs.
    
    Here is the question:
    {json.dumps(question, indent=2)}
    
    Here is the network configuration JSON:
    {json.dumps(network_data, indent=2)}
    """

    try:
        response = network_model.generate_content(prompt)
        text = response.text.strip()

        # Clean code block markdown if present
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        return jsonify({"status": "success", "evaluation": text})

    except Exception as e:
        return jsonify({"status": "error", "message": f"Gemini evaluation failed: {e}"}), 500

# =============================================================================
# SQL PRACTICE ROUTES (from original app1.py)
# =============================================================================

@app.route('/generate-sql-question', methods=['GET'])
def generate_sql_question():
    prompt = """
Generate a beginner-friendly SQL practice question.

Return JSON like:
{
  "question": "Write a query to list names of employees earning more than 50000.",
  "setup_sql": "CREATE TABLE employees (id INT, name TEXT, salary INT);\\nINSERT INTO employees VALUES (1, 'John', 45000), (2, 'Alice', 60000), (3, 'Bob', 70000);"
}

Use only simple SELECT + WHERE (no joins).
"""
    try:
        response = sql_model.generate_content(prompt)
        content = response.text.strip()

        # Strip code block markers
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()

        qdata = json.loads(content)
        return jsonify({"status": "success", "data": qdata})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Gemini generation failed: {e}"}), 500

@app.route('/run-setup', methods=['POST'])
def run_setup():
    data = request.json
    setup_sql = data.get('setup_sql')
    session_id = data.get('session_id', str(uuid.uuid4()))

    db_path = get_db_path(session_id)

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.executescript(setup_sql)
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "session_id": session_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    

@app.route('/get-table', methods=['POST'])
def get_table():
    data = request.json
    session_id = data.get('session_id')
    table_name = data.get('table_name')  # optional

    db_path = get_db_path(session_id)

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Try to detect table name if not provided
        if not table_name:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            if not tables:
                return jsonify({"status": "error", "message": "No tables found"})
            table_name = tables[0][0]  # just pick the first

        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        col_names = [desc[0] for desc in cursor.description]

        result = {
            "columns": col_names,
            "rows": rows
        }

        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/run-query', methods=['POST'])
def run_query():
    data = request.json
    session_id = data.get('session_id')
    user_query = data.get('user_query')

    db_path = get_db_path(session_id)

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(user_query)

        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()

        conn.close()
        return jsonify({
            "status": "success",
            "columns": columns,
            "rows": rows
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/evaluate-sql', methods=['POST'])
def evaluate_sql():
    data = request.json
    question = data.get('question')
    setup_sql = data.get('setup_sql')
    user_query = data.get('user_query')
    user_output = data.get('user_output')

    prompt = f"""
You are an SQL evaluator. A student is attempting a database problem.

Problem Statement:
{question}

Reference Setup SQL:
{setup_sql}

User's SQL Query:
{user_query}

User's Output:
{user_output}

Please evaluate:
- Is the query correct based on the question?
- If incorrect, give a short reason and the correct query.
- Give a score out of 5.

Return JSON like:
{{
  "is_correct": true/false,
  "score": 0-5,
  "feedback": "brief feedback",
  "suggested_query": "correct query if applicable"
}}
"""
    try:
        response = sql_model.generate_content(prompt)
        gemini_text = response.text.strip()

        if gemini_text.startswith("```json"):
            gemini_text = gemini_text.replace("```json", "").replace("```", "").strip()

        eval_result = json.loads(gemini_text)
        return jsonify({"status": "success", "evaluation": eval_result})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Gemini evaluation failed: {e}"}), 500

# =============================================================================
# CODING PRACTICE ROUTES (from app2py)
# =============================================================================

@app.route('/generate-coding-question', methods=['GET'])
def generate_coding_question():
    prompt = """
    Generate a beginner to intermediate level programming question that can be solved in Python, C, C++, or Java.
    The question should be clear, concise, and require around 10–30 lines of code which does not require any input. Avoid advanced topics.
    Provide only the question statement without code or answer. 
    """

    try:
        response = coding_model.generate_content(prompt)
        question = response.text.strip()
        return jsonify({'question': question})
    except Exception as e:
        return jsonify({'error': f'Gemini error: {str(e)}'}), 500

@app.route('/run-code', methods=['POST'])
def run_code():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    question = data.get('question')

    if not code or not language or not question:
        return jsonify({'error': 'Missing code, language, or question'}), 400

    filename = ''
    run_cmd = ''
    volume_path = os.getcwd().replace("\\", "/")
    unique_id = str(uuid.uuid4())[:8]

    if language == 'python':
        filename = f'{unique_id}.py'
        run_cmd = f'python /code/{filename}'
        docker_image = 'python:3.9'
    elif language == 'c':
        filename = f'{unique_id}.c'
        run_cmd = f'/bin/sh -c "gcc /code/{filename} -o /code/a.out && /code/a.out"'
        docker_image = 'gcc'
    elif language == 'cpp':
        filename = f'{unique_id}.cpp'
        run_cmd = f'/bin/sh -c "g++ /code/{filename} -o /code/a.out && /code/a.out"'
        docker_image = 'gcc'
    elif language == 'java':
        filename = f'Main{unique_id}.java'
        run_cmd = f'/bin/sh -c "javac /code/{filename} && java -cp /code Main{unique_id}"'
        docker_image = 'openjdk'
    else:
        return jsonify({'error': 'Unsupported language'}), 400

    file_path = os.path.join(os.getcwd(), filename)
    with open(file_path, 'w') as f:
        f.write(code)

    try:
        docker_command = f'docker run --rm -v "{volume_path}:/code" {docker_image} {run_cmd}'
        result = subprocess.run(
            docker_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=10,
            shell=True
        )
        output = result.stdout.decode('utf-8') + result.stderr.decode('utf-8')
    except subprocess.TimeoutExpired:
        output = 'Error: Execution timed out'
    finally:
        # Clean up files
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(os.path.join(os.getcwd(), 'a.out')):
            os.remove('a.out')
        if os.path.exists(os.path.join(os.getcwd(), f'Main{unique_id}.class')):
            os.remove(f'Main{unique_id}.class')

    # Gemini Evaluation
    eval_prompt = f"""
    Evaluate the following solution for a programming problem.

    **Question:**
    {question}

    **Language:** {language}

    **Code:**
    ```{language}
    {code}
    ```

    **Output:**
    {output}

    Give a clear, concise evaluation: is the code correct, are there logic flaws, what edge cases are missing, and how can it be improved?
    """

    try:
        gemini_response = coding_model.generate_content(eval_prompt)
        ai_feedback = gemini_response.text
    except Exception as e:
        ai_feedback = f"AI Evaluation Failed: {str(e)}"

    return jsonify({
        'output': output,
        'ai_feedback': ai_feedback
    })

# =============================================================================
# MAIN APPLICATION
# =============================================================================

if __name__ == '__main__':
    app.run(port=5001, debug=True)
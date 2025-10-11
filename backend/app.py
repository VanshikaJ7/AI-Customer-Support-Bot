# Flask backend for customer support chatbot
import os
import json
import sqlite3
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from groq import Groq
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
load_dotenv()

# Initialize Groq client (FREE API!)
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Load FAQs
with open('faqs.json') as f:
    FAQS = json.load(f)

def init_db():
    conn = sqlite3.connect('chat_memory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT,
                    user_message TEXT,
                    bot_response TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )''')
    conn.commit()
    conn.close()

init_db()

def store_message(session_id, user_message, bot_response):
    conn = sqlite3.connect('chat_memory.db')
    c = conn.cursor()
    c.execute("INSERT INTO sessions (session_id, user_message, bot_response) VALUES (?, ?, ?)",
              (session_id, user_message, bot_response))
    conn.commit()
    conn.close()

def get_history(session_id):
    conn = sqlite3.connect('chat_memory.db')
    c = conn.cursor()
    c.execute("SELECT user_message, bot_response FROM sessions WHERE session_id=? ORDER BY rowid", (session_id,))
    history = c.fetchall()
    conn.close()
    return history

def build_faq_context():
    """Build a context string from FAQs for the system prompt"""
    faq_text = "Here are some frequently asked questions and answers:\n\n"
    for faq in FAQS:
        faq_text += f"Q: {faq['question']}\nA: {faq['answer']}\n\n"
    return faq_text

def get_llm_response(user_message, history):
    """Get response from Groq's LLM (FREE and FAST!)"""
    
    # Build system prompt with FAQ context
    system_prompt = f"""You are a helpful and friendly customer support assistant. Answer questions naturally and conversationally, like ChatGPT would.

{build_faq_context()}

Guidelines:
- Answer any question the user asks to the best of your ability
- Be helpful, informative, and conversational
- For FAQ-related questions, use the information provided above
- For general questions (like weather, definitions, explanations), answer them naturally
- Only suggest speaking with a human agent for account-specific issues, billing problems, or technical issues you cannot resolve
- Keep responses clear and friendly"""

    # Build conversation history for context
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add last 5 exchanges for context
    for user_msg, bot_msg in history[-5:]:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": bot_msg})
    
    # Add current message
    messages.append({"role": "user", "content": user_message})
    
    try:
        print(f"\n=== Groq API Call ===")
        print(f"User message: {user_message}")
        print(f"API Key exists: {bool(client.api_key)}")
        print(f"Sending request to Groq API...")
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Fast and FREE model
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content.strip()
        print(f"✓ SUCCESS! Received response: {bot_response}")
        print(f"======================\n")
        return bot_response
        
    except Exception as e:
        print(f"\n✗ ERROR calling Groq API:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        import traceback
        traceback.print_exc()
        print(f"======================\n")
        
        # Return a user-friendly error message
        return f"I apologize, but I'm experiencing technical difficulties. Error: {type(e).__name__}. Please try again or contact support."

@app.route('/faqs', methods=['GET'])
def get_faqs():
    return jsonify(FAQS)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Get conversation history
    history = get_history(session_id)
    
    # Get response from LLM
    bot_response = get_llm_response(user_message, history)
    
    # Check if response suggests escalation
    escalation_keywords = ["human agent", "speak with someone", "contact support team"]
    if any(keyword in bot_response.lower() for keyword in escalation_keywords):
        store_message(session_id, user_message, bot_response)
        return jsonify({
            "escalated": True,
            "message": bot_response
        })
    
    # Store and return response
    store_message(session_id, user_message, bot_response)
    return jsonify({"response": bot_response})

@app.route('/session', methods=['GET'])
def get_session():
    session_id = request.args.get('session_id')
    history = get_history(session_id)
    return jsonify([{"user": m, "bot": r} for m, r in history])

@app.route('/escalate', methods=['POST'])
def escalate():
    data = request.json
    message = data.get('message', '')
    return jsonify({
        "escalated": True, 
        "message": "Thank you for your patience. Your query has been escalated to our support team. A human agent will assist you shortly."
    })

if __name__ == '__main__':
    app.run(debug=True)
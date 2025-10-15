# AI-Customer-Support-Chat-Bot

An intelligent customer support chatbot powered by Groq's LLM (Llama 3.1) that provides contextual responses, maintains conversation history, and handles escalations automatically.

## 🌟 Features

- **Intelligent AI Responses**: Powered by Groq's Llama 3.1 model for natural, conversational interactions
- **Contextual Memory**: Retains conversation history to provide context-aware responses
- **FAQ Integration**: Pre-loaded frequently asked questions for quick responses
- **Smart Escalation**: Automatically escalates complex queries to human agents
- **Session Management**: Tracks individual user sessions with SQLite database
- **Modern UI**: Beautiful, responsive chat interface built with React
- **Real-time Interaction**: Instant responses with typing indicators

## 📋 Table of Contents

- [Demo Video](#-demo-video)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [LLM Prompt Documentation](#-llm-prompt-documentation)
- [Project Structure](#-project-structure)
- [Key Features Explained](#-key-features-explained)
- [Troubleshooting](#-troubleshooting)
- [Database Schema](#-database-schema)


## Demo Video


## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │ ◄─────► │  Flask Backend   │ ◄─────► │  Groq LLM API   │
│                 │         │                  │         │  (Llama 3.1)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │  SQLite Database │
                            │  (Session Store) │
                            └──────────────────┘
```

### Key Components:

1. **Frontend (React)**: Modern chat interface with real-time updates
2. **Backend (Flask)**: REST API handling requests and business logic
3. **LLM Integration (Groq)**: Generates intelligent, context-aware responses
4. **Database (SQLite)**: Stores conversation history for context retention

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Groq SDK** - LLM integration
- **SQLite3** - Database for session management
- **python-dotenv** - Environment variable management

### Frontend
- **React 18+**
- **JavaScript (ES6+)**
- **CSS3** - Inline styling

## 📦 Prerequisites

Before you begin, ensure you have:

- Python 3.8 or higher installed
- Node.js 14+ and npm installed
- A Groq API key (free at [console.groq.com](https://console.groq.com))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-customer-support-bot.git
cd ai-customer-support-bot
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the `backend` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Get Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

### 3. Customize FAQs (Optional)

Edit `backend/faqs.json` to add your own FAQs:

```json
[
  {
    "question": "What are your business hours?",
    "answer": "Our business hours are 9am to 6pm, Monday to Friday."
  },
  {
    "question": "How do I reset my password?",
    "answer": "You can reset your password by clicking 'Forgot Password' on the login page."
  }
]
```

## 🎮 Running the Application

### 1. Start the Backend Server

```bash
cd backend
python app.py
```

The Flask server will start on `http://localhost:5000`

### 2. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The React app will open automatically at `http://localhost:3000`

## 📡 API Endpoints

### POST `/chat`
Send a message and receive AI response

**Request Body:**
```json
{
  "session_id": "unique_session_id",
  "message": "How do I reset my password?"
}
```

**Response:**
```json
{
  "response": "You can reset your password by clicking 'Forgot Password' on the login page."
}
```

**Escalation Response:**
```json
{
  "escalated": true,
  "message": "Your query has been escalated to a human agent..."
}
```

### GET `/faqs`
Retrieve all FAQs

**Response:**
```json
[
  {
    "question": "What are your business hours?",
    "answer": "Our business hours are 9am to 6pm, Monday to Friday."
  }
]
```

### GET `/session?session_id=<id>`
Retrieve conversation history for a session

**Response:**
```json
[
  {
    "user": "Hello",
    "bot": "Hi! How can I help you today?"
  }
]
```

### POST `/escalate`
Manually escalate a query

**Request Body:**
```json
{
  "message": "I need urgent help"
}
```

**Response:**
```json
{
  "escalated": true,
  "message": "Thank you for your patience. Your query has been escalated..."
}
```

## 📝 LLM Prompt Documentation

### System Prompt Structure

The chatbot uses a carefully crafted system prompt to guide the LLM's behavior:

```python
system_prompt = f"""You are a helpful and friendly customer support assistant. 
Answer questions naturally and conversationally, like ChatGPT would.

{build_faq_context()}

Guidelines:
- Answer any question the user asks to the best of your ability
- Be helpful, informative, and conversational
- For FAQ-related questions, use the information provided above
- For general questions (like weather, definitions, explanations), answer them naturally
- Only suggest speaking with a human agent for account-specific issues, billing problems, 
  or technical issues you cannot resolve
- Keep responses clear and friendly"""
```

### Prompt Components

1. **Role Definition**: Establishes the bot as a customer support assistant
2. **FAQ Context**: Injects relevant FAQs into the prompt
3. **Behavioral Guidelines**: Sets expectations for tone and response style
4. **Escalation Rules**: Defines when to suggest human agent involvement

### Context Management

The bot maintains conversation context by:

```python
messages = [{"role": "system", "content": system_prompt}]

# Add last 5 exchanges for context
for user_msg, bot_msg in history[-5:]:
    messages.append({"role": "user", "content": user_msg})
    messages.append({"role": "assistant", "content": bot_msg})

# Add current message
messages.append({"role": "user", "content": user_message})
```

### LLM Parameters

```python
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",  # Fast, efficient model
    messages=messages,              # Conversation history
    max_tokens=300,                 # Response length limit
    temperature=0.7                 # Balance creativity and consistency
)
```

**Parameter Explanations:**
- `model`: Llama 3.1 8B Instant - optimized for speed and quality
- `max_tokens`: Limits response length to keep answers concise
- `temperature`: 0.7 provides balanced responses (not too random, not too rigid)

### Escalation Detection

The system detects when escalation is needed through keyword matching:

```python
escalation_keywords = ["human agent", "speak with someone", "contact support team"]
if any(keyword in bot_response.lower() for keyword in escalation_keywords):
    # Trigger escalation
```

## 📁 Project Structure

```
ai-customer-support-bot/
│
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── faqs.json             # FAQ dataset
│   ├── .env                  # Environment variables (not in repo)
│   ├── requirements.txt      # Python dependencies
│   ├── chat_memory.db        # SQLite database (auto-created)
│   └── test_openai.py        # API testing script
│
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   └── index.js          # React entry point
│   ├── package.json          # Node dependencies
│   └── package-lock.json
│
└── README.md                 # This file
```

## 🎯 Key Features Explained

### 1. Contextual Memory

The bot remembers the last 5 conversation exchanges:

```python
def get_history(session_id):
    conn = sqlite3.connect('chat_memory.db')
    c = conn.cursor()
    c.execute("SELECT user_message, bot_response FROM sessions WHERE session_id=? ORDER BY rowid", 
              (session_id,))
    history = c.fetchall()
    conn.close()
    return history
```

### 2. Session Management

Each user gets a unique session ID:

```javascript
const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
```

### 3. Smart Escalation

Automatic detection when human intervention is needed:
- Account-specific issues
- Billing problems
- Complex technical queries
- When the bot explicitly suggests contacting support

### 4. FAQ Integration

FAQs are loaded into the system prompt, allowing the LLM to reference them:

```python
def build_faq_context():
    faq_text = "Here are some frequently asked questions and answers:\n\n"
    for faq in FAQS:
        faq_text += f"Q: {faq['question']}\nA: {faq['answer']}\n\n"
    return faq_text
```

## 🎬 Demo

[Add your demo video link or screenshots here]

### Sample Interactions

**Example 1: FAQ Query**
```
User: What are your business hours?
Bot: Our business hours are 9am to 6pm, Monday to Friday.
```

**Example 2: General Question**
```
User: What is artificial intelligence?
Bot: Artificial Intelligence (AI) is the simulation of human intelligence by 
machines, particularly computer systems. It includes learning, reasoning, and 
self-correction capabilities.
```

**Example 3: Escalation**
```
User: I need to cancel my subscription immediately
Bot: I understand you'd like to cancel your subscription. For account-specific 
changes like this, I recommend speaking with a human agent who can help you right 
away. Would you like me to connect you?
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'groq'`
```bash
pip install groq
```

**Problem**: API Key errors
- Verify your `.env` file exists in the backend directory
- Check that GROQ_API_KEY is set correctly
- Ensure no extra spaces or quotes around the API key

**Problem**: Database errors
- Delete `chat_memory.db` and restart the server to recreate it

### Frontend Issues

**Problem**: Connection refused to backend
- Ensure Flask server is running on port 5000
- Check CORS is enabled in Flask

**Problem**: Blank screen
- Check browser console for errors
- Verify all npm dependencies are installed

## 📊 Database Schema

```sql
CREATE TABLE sessions (
    session_id TEXT,
    user_message TEXT,
    bot_response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```





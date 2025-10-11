import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Test OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')

print(f"API Key loaded: {bool(api_key)}")
if api_key:
    print(f"API Key starts with: {api_key[:10]}...")
else:
    print("ERROR: No API key found in .env file!")
    exit()

client = OpenAI(api_key=api_key)

# Test API call
try:
    print("\nTesting OpenAI API connection...")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "Say hello"}
        ],
        max_tokens=50
    )
    print("✓ SUCCESS! API is working.")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
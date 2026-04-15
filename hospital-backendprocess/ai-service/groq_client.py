import requests
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def ask_groq(context: str, question: str):

    if not context:
        return "No relevant data found."

    prompt = f"""
You are a hospital assistant AI.
Use ONLY the given context.

Context:
{context}

Question:
{question}

Answer:
"""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=60
        )

        data = response.json()

        if "choices" not in data:
            return f"Groq Error: {data}"

        return data["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Error: {str(e)}"
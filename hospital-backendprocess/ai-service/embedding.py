import requests
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_embedding(text: str):
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/embeddings",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "text-embedding-3-small",
                "input": text
            }
        )

        data = response.json()
        return data["data"][0]["embedding"]

    except Exception as e:
        print("Embedding Error:", e)
        return []
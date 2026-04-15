import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from embedding import get_embedding

_ai_dir = Path(__file__).resolve().parent
load_dotenv(_ai_dir / ".env")
load_dotenv()

_conn = None


def _connect():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )


def get_conn():
    global _conn
    if _conn is None or _conn.closed:
        _conn = _connect()
    return _conn

def to_vector_string(emb):
    return "[" + ",".join(map(str, emb)) + "]"


def store_data(content: str, ref_id: int, type_: str):
    try:
        emb = get_embedding(content)
        emb_str = to_vector_string(emb)

        cur = get_conn().cursor()
        # One embedding per Spring entity (ref_id + type); re-index replaces old row.
        cur.execute(
            "DELETE FROM embeddings WHERE ref_id = %s AND type = %s",
            (ref_id, type_),
        )
        cur.execute("""
            INSERT INTO embeddings (content, ref_id, type, embedding)
            VALUES (%s, %s, %s, %s::vector)
        """, (content, ref_id, type_, emb_str))

        get_conn().commit()
        cur.close()
        return "stored"

    except Exception as e:
        global _conn
        _conn = None
        return f"DB Error: {str(e)}"


def search_similar(query: str):
    try:
        emb = get_embedding(query)
        emb_str = to_vector_string(emb)

        cur = get_conn().cursor()
        cur.execute("""
            SELECT content
            FROM embeddings
            ORDER BY embedding <-> %s::vector
            LIMIT 3
        """, (emb_str,))

        results = cur.fetchall()
        cur.close()

        return [row[0] for row in results]

    except Exception as e:
        global _conn
        _conn = None
        print("Search Error:", e)
        return []

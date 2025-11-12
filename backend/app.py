from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str


GROQ_API_KEY = os.getenv("GROQ_API_KEY")


@app.post("/process_text")
async def process_text(input: TextInput):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a sentiment analyzer. Return only valid JSON with these fields: 'sentiment' (float 0-1, where 0=negative, 1=positive), 'emotion' (string: 'happy', 'sad', 'angry', 'calm', 'excited', 'anxious'), 'intensity' (float 0-1, how strong the emotion is), and 'keywords' (array of 3-5 key words/phrases)."
                        },
                        {
                            "role": "user",
                            "content": f"Analyze: {input.text}"
                        }
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                },
                timeout=30.0
            )

            result = response.json()
            print("Groq response:", result)

            message_content = result["choices"][0]["message"]["content"]
            content = json.loads(message_content)

            return {
                "sentiment": content.get("sentiment", 0.5),
                "emotion": content.get("emotion", "neutral"),
                "intensity": content.get("intensity", 0.5),
                "keywords": content.get("keywords", [])
            }

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "sentiment": 0.5, "keywords": []}


@app.get("/")
async def root():
    return {"status": "running"}

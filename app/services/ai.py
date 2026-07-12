import uuid
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

class AIService:
    def __init__(self):
        load_dotenv()
        self.client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL"),
            api_key=os.getenv("AI_API_KEY")
        )
        self.history = []

    async def test(self):
        return {
            "status": "success",
            "message": "Работаем!",
        }

    async def user_response(self, id: uuid.UUID, model: str, msg: str):
        response = await self.client.chat.completions.create(
    model=model,
            messages=[
                {"role": "user", "content": msg}
                     ]
    )
        answer_text = response.choices[0].message.content
        return answer_text
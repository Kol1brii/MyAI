import uuid
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

class AIService:
    def __init__(self):
        load_dotenv()
        self.key = os.getenv("AI_API_KEY")
        self.client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL"),
            api_key=self.key
        )
        self.history = []

    async def test(self):
        return {
            "status": "success",
            "message": "Работаем!",
            "key": self.key
        }

    async def user_response(self, id: uuid.UUID, msg: str):
        response = await self.client.chat.completions.create(
    model="deepseek-v4-flash",
            messages=[
                {"role": "user", "content": msg}
                     ]
    )
        return response
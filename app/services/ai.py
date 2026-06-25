from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

class AIService:
    def __init__(self):
        load_dotenv()
        self.key = os.getenv("AI_BASE_URL")
        self.client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL"),
            api_key=self.key
        )

    async def test(self):
        return {
            "status": "success",
            "message": "Работаем!",
            "key": self.key
        }
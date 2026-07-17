import asyncio
import json
import os
from sqlalchemy import select

from app.db.connection import get_db
from app.db.models import Models

async def upload():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "db_models.json")

    async for db in get_db():
        res = await db.execute(select(Models).limit(1))

        if res.scalars().first():
            print("Data already exists. Abort.")
            return

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        db.add_all([Models(**item) for item in data])
        await db.commit()

        print("Successfully.")
        break

if __name__ == "__main__":
    asyncio.run(upload())
import os
from dotenv import load_dotenv

# load .env file
load_dotenv()


class _Config:
    DATABASE_URL = os.getenv("DATABASE_URL")


config = _Config()

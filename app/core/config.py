import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class _Config:
    # Determine if running in Docker
    IS_DOCKER = os.getenv("DOCKER_ENV") == "docker"

    # Set database URLs based on environment
    if IS_DOCKER:
        DATABASE_URL = os.getenv("DATABASE_URL", "").replace("postgres://", "postgresql://")
    else:
        DATABASE_URL = os.getenv("LOCAL_DATABASE_URL", "").replace("postgres://", "postgresql://")

config = _Config()


import os
from dotenv import load_dotenv

load_dotenv()


class _Config:
    IS_DOCKER = os.getenv("DOCKER_ENV") == "docker"

    if IS_DOCKER:
        DATABASE_URL = os.getenv("DATABASE_URL", "")
    else:
        DATABASE_URL = os.getenv("LOCAL_DATABASE_URL", "")
    FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ui", "build")


config = _Config()

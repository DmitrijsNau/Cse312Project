import os

from dotenv import load_dotenv

load_dotenv()


class _Config:
    IS_DOCKER = os.getenv("DOCKER_ENV") == "docker"

    if IS_DOCKER:
        DATABASE_URL = os.getenv("DATABASE_URL", "")
    else:
        DATABASE_URL = os.getenv("LOCAL_DATABASE_URL", "")

    FRONTEND_BUILD_DIR = os.path.join("/app","ui","build")

    UPLOAD_DIR = os.path.join("/app","uploads")
    IMAGES_PATH = "/images"

config = _Config()

os.makedirs(config.UPLOAD_DIR, exist_ok=True)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base
from app.core.config import config

# create an engine
engine = create_engine(config.DATABASE_URL)

# create tables
Base.metadata.create_all(engine)

# create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get a session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

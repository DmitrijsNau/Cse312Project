from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base
from app.core.config import config

# Determine which database URL to use
database_url = config.DATABASE_URL

# Connect to the database
engine = create_engine(database_url)

# Create tables (if needed)
Base.metadata.create_all(engine)

# Create configured "Session" class
db_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get a session for the main database
def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()

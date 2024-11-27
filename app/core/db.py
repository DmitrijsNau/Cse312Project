from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import config

# OK, this is weird but sqlalchemy requires you to import the models
# however, we don't have to actually use them.
from app.models.base import Base
from app.models.user import User
from app.models.pet import Pet

database_url = config.DATABASE_URL

engine = create_engine(database_url)

db_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise


def get_db():
    print("Getting db")
    db = db_session()
    try:
        yield db
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise
    finally:
        db.close()

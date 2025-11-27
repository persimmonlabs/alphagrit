from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine # Need create_engine for init_db
from sqlalchemy.engine import Engine # Need Engine for init_db

Base = declarative_base()

def init_db(engine: Engine):
    """
    Initializes the database by creating all tables defined in Base.
    """
    Base.metadata.create_all(bind=engine)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
from typing import Generator

from src.infrastructure.base import Base # Import Base from the dedicated file

DATABASE_URL = "sqlite:///./app.db" # Placeholder, update as needed

# For local development and testing, you might use SQLite
# DATABASE_URL = "sqlite:///./test.db"

engine: Engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

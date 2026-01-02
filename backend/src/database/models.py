from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine('sqlite:///database.db', echo=True) #this can be changes to the connection string of remote db
Base = declarative_base()

# Following will be the Database table - They are just declared and not yet actually created in the DB

class Challenge(Base):
    __tablename__ = 'challenges'

    # var = Column(data-type, properties)
    id = Column(Integer, primary_key=True) 
    difficulty = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.now)
    created_by = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # Optional description/question text
    code_snippet = Column(Text, nullable=True)  # Optional code snippet
    options = Column(Text, nullable=False)  # Store as JSON string
    correct_answer_id = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)  


class ChallengeQuota(Base):
    __tablename__ = 'challenge_quota'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    remaining_quota = Column(Integer, nullable=False, default=25)
    last_reset_date = Column(DateTime, nullable=False, default=datetime.now)

Base.metadata.create_all(engine) #this creates all the table using the classes we defined earlier
 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #sesson to represent db connection

def get_db():
    db = SessionLocal() #create a db session

    try:
        yield db
    finally:
        db.close()


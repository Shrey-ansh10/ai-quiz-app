from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.ext.declerative import declerative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine('sqlite://database.db', echo=True) #this can be changes to the connection string of remote db
Base = declerative_base()

class Challenge(Base):
    __tablename__ = 'challenges'

    # var = Column(data-type, properties)
    id = Column(Integer, primary_key=True)
    difficulty = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.now)
    created_by = Column(String, nullable=False)
    title = Column(String, nullable=False)
    options = Column(String, nullable=False)
    correct_answer_id = Column(Integer, nullable=False)
    explaination = Column(String, nullable=False)


class ChallengeQuota(Base):
    __tablename__ = 'challenge_quota'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    quota_remaining = Column(Integer, nullable=False, default=25)
    last_reset_date = Column(DateTime, nullable=False, default=datetime.now)

Base.metadata.create_all(engine) #this creates all the table using the classes we defined earlier
 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #sesson to represent db connection

def get_db():
    db = SessionLocal() #create a db session

    try:
        yield db
    finally:
        db.close()


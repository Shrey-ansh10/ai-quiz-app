from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models

def get_challenge_quota(db : Session, user_id : str):
    return (
        db.query(models.ChallengeQuota) #query the table
        .filter(models.ChallengeQuota.user_id == user_id) # match the user id
        .first() #get the first record
    )

# inset-update quota after a LLM call from user
def create_challenge_quota(db: Session, user_id : str):
    db_quota = models.ChallengeQuota(user_id=user_id) #create a obj of the class ChallengeQuota
    db.add(db_quota) # add to the db
    db.commit() #commit to the db
    db.refresh(db_quota) # refresh the db to find the updated record - makes sure it's updated
    return db_quota

def reset_quota_if_needed(db: Session, quota: models.ChallengeQuota):
    now = datetime.now()

    if now - quota.last_reset_date > timedelta(hours=24):
        quota.remaining_quota = 10
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
    
    return quota

def create_challenge(
    db: Session, 
    difficulty: str,
    created_by: str,
    title: str,
    options: list[str],
    correct_answer_id: int,
    explanation: str,
    description: str = None,
    code_snippet: str = None,
):
    import json
    db_challenge = models.Challenge(
        difficulty=difficulty,
        created_by=created_by,
        title=title,
        description=description,
        code_snippet=code_snippet,
        options=json.dumps(options),  # Serialize list to JSON string
        correct_answer_id=correct_answer_id,
        explanation=explanation
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


def get_user_challenges(db: Session, user_id: str):
    return (
        db.query(models.Challenge)
        .filter(models.Challenge.created_by == user_id)
        # .order_by(models.Challenge.date_created.desc())
        .all()
    )
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
    """
    Create a new quota record for a user with default values:
    - remaining_quota: 25 (default from model)
    - last_reset_date: current datetime (default from model)
    """
    db_quota = models.ChallengeQuota(
        user_id=user_id,
        remaining_quota=25,  # Explicitly set to ensure it's not 0
        last_reset_date=datetime.now()  # Explicitly set to current time
    )
    db.add(db_quota) # add to the db
    db.commit() #commit to the db
    db.refresh(db_quota) # refresh the db to find the updated record - makes sure it's updated
    return db_quota

def reset_quota_if_needed(db: Session, quota: models.ChallengeQuota):
    """
    Reset quota if 24 hours have passed since last reset.
    For new users, this should not trigger since last_reset_date is set to now.
    """
    now = datetime.now()
    
    # Ensure last_reset_date is not None
    if not quota.last_reset_date:
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
        return quota

    # Calculate time difference
    time_diff = now - quota.last_reset_date
    
    # Only reset if more than 24 hours have passed
    # Use total_seconds() for more accurate comparison
    if time_diff.total_seconds() > timedelta(hours=24).total_seconds():
        # Reset to 10 (daily quota after initial 25)
        quota.remaining_quota = 10
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
    
    return quota

def create_challenge(
    db: Session, 
    difficulty: str,
    created_by: str,
    title: str = None,
    options: list[str] = None,
    correct_answer_id: int = None,
    explanation: str = None,
    description: str = None,
    code_snippet: str = None,
    challenge_data: dict = None,
):
    """
    Create a challenge in the database.
    
    Can be called either with individual parameters or with a challenge_data dictionary.
    If challenge_data is provided, it will override individual parameters.
    """
    import json
    
    # If challenge_data dict is provided, use it to populate fields
    if challenge_data:
        title = challenge_data.get('title', title)
        options = challenge_data.get('options', options)
        correct_answer_id = challenge_data.get('correct_answer_id', correct_answer_id)
        explanation = challenge_data.get('explanation', explanation)
        description = challenge_data.get('description', description)
        code_snippet = challenge_data.get('code_snippet', code_snippet)
    
    # Validate required fields
    if not all([title, options is not None, correct_answer_id is not None, explanation]):
        raise ValueError("Missing required fields: title, options, correct_answer_id, explanation")
    
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
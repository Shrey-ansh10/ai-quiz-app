# here we write the routes
from ..ai_generator import generate_challenge_with_ai
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.db import create_challenge, get_user_challenges, create_challenge_quota, reset_quota_if_needed, get_challenge_quota
from ..database.models import Challenge, get_db
from ..utils import authenticate_and_get_user_details
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/challenges", tags=["challenges"])

class ChallengeRequest(BaseModel):
    difficulty: str

    class Config:
        json_schema_extra = {"example" : {"difficulty": "easy"}}

# post endpoint to generate challenge
@router.post("/generate-challenge")
async def generate_challenge(request: ChallengeRequest, request_obj: Request,  db: Session = Depends(get_db)):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        quota = get_challenge_quota(db, user_id)
        if not quota:
            quota = create_challenge_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.remaining_quota <= 0:
            raise HTTPException(status_code=429, detail="Quota Exhausted")

        challenge_data = generate_challenge_with_ai(request.difficulty)

        new_challenge = create_challenge(
            db=db,
            difficulty=request.difficulty,
            created_by=user_id,
            challenge_data=challenge_data
        )

        quota.remaining_quota -= 1
        db.commit()
        return {
            "id": new_challenge.id,
            "difficulty": request.difficulty, 
            "title": new_challenge.title,
            "description": new_challenge.description,
            "code_snippet": new_challenge.code_snippet,
            "options": json.loads(new_challenge.options),
            "correct_answer_id": new_challenge.correct_answer_id,
            "explanation": new_challenge.explanation,
            "timestamp": new_challenge.date_created.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/my-history")
async def get_my_history(request: Request, db: Session = Depends(get_db)): #this will get database session for us
    user_details = authenticate_and_get_user_details(request) # authenticates the user and returns an object with key-value "user_id":user_id
    user_id = user_details.get("user_id") # retrieve the value from the object into a variable 

    challenges = get_user_challenges(db, user_id)  # query the function with db session and user_id -> will return 
    return {"challenge": challenges} # retunr this object/dictionary

@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    quota = get_challenge_quota(db, user_id)
    if not quota:
        # Create quota for new users if it doesn't exist
        quota = create_challenge_quota(db, user_id)
        # Ensure quota is properly initialized
        if quota.remaining_quota <= 0:
            quota.remaining_quota = 25
            db.commit()
            db.refresh(quota)
    
    quota = reset_quota_if_needed(db, quota)
    
    # Final safeguard: ensure quota is never negative
    if quota.remaining_quota < 0:
        quota.remaining_quota = 0
        db.commit()
        db.refresh(quota)
    
    return {
        "user_id": quota.user_id,
        "remaining_quota": quota.remaining_quota,
        "last_reset_date": quota.last_reset_date.isoformat() if quota.last_reset_date else None
    }
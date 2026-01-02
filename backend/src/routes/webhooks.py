from dotenv import load_dotenv
from fastapi import APIRouter, Request, HTTPException, Depends
from ..database.models import get_db
from ..database.db import create_challenge_quota
from svix.webhooks import Webhook
import os
import json


router = APIRouter()

@router.post("/clerk")
async def handle_user_created(request: Request, db = Depends(get_db)):
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET") 

    if not webhook_secret:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET not set")

    body = await request.body()
    payload = body.decode("utf-8")
    headers = dict(request.headers)

    try:
        wh = Webhook(webhook_secret)
        wh.verify(payload, headers)

        data = json.loads(payload)

        if data.get("type") != "user.created":
            return {"status": "ignored"}

        user_data = data.get("data", {})
        user_id = user_data.get("id")

        if not user_id:
            return {"status": "error", "detail": "No user_id in webhook data"}

        # Check if quota already exists to avoid duplicates
        from ..database.db import get_challenge_quota
        existing_quota = get_challenge_quota(db, user_id)
        if existing_quota:
            return {"status": "success", "detail": "Quota already exists"}

        create_challenge_quota(db, user_id)

        return {"status": "success"}
    except Exception as e:
        import traceback
        error_detail = str(e)
        traceback.print_exc()
        # Return 500 for server errors, 401 only for auth/verification errors
        if "verify" in error_detail.lower() or "signature" in error_detail.lower():
            raise HTTPException(status_code=401, detail=f"Webhook verification failed: {error_detail}")
        else:
            raise HTTPException(status_code=500, detail=f"Internal server error: {error_detail}")
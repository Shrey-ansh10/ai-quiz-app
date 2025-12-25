from fastapi import HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions
import os
from dotenv import load_dotenv

load_dotenv()

clerk_sdk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# REQUEST AUTHENTICATION : Authenticate a request from your app's frontend (when using a Clerk frontend SDK) to a Python backend (Django, Flask, and other Python web frameworks). 

# The following utility function checks if the user is effectively signed in:
def authenticate_and_get_user_details(request): #this will get the request and will authenticate the user
    try:
        request_state = clerk_sdk.authenticate_request( #calling the "authenticate_request" method with following params
            request, # the request
            AuthenticateRequestOptions( # the result of this function
                authorized_parties=["http://localhost:5173", "http://localhost:5174"],
                jwt_key=os.getenv("JWT_KEY")
            )
        )
        if not request_state.is_signed_in:
            raise HTTPException(status_code=401 , details="Invalid token")

        user_id = request_state.payload.get("sub") #
        return {"user_id":user_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import challenge, webhooks


app = FastAPI() 

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], # this is to restrict incoming requests to the server, * means anyone can send request - so we can specify the URL from where we wanna recieve requests
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(challenge.router, prefix="/api")
app.include_router(webhooks.router, prefix="/webhooks")
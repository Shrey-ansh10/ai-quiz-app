from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI() 

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], # this is to restrict incoming requests to the server, * means anyone can send request - so we can specify the URL from where we wanna recieve requests
    allow_credentials=True, 
    allow_method=["*"],
    allow_header=["*"],
)
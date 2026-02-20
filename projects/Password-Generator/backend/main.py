import random
import string
import hashlib
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="Password Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PasswordRequest(BaseModel):
    length: int = 12
    include_upper: bool = True
    include_lower: bool = True
    include_digits: bool = True
    include_special: bool = False

class BreachCheckRequest(BaseModel):
    password: str

class ExportRequest(BaseModel):
    passwords: List[str]
    format: str = "txt"  

def generate_password(length: int, include_upper: bool, include_lower: bool, 
                     include_digits: bool, include_special: bool) -> str:
    chars = ''
    if include_lower:
        chars += string.ascii_lowercase
    if include_upper:
        chars += string.ascii_uppercase
    if include_digits:
        chars += string.digits
    if include_special:
        chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    if not chars:
        raise ValueError("Select at least one character type")
   
    password = ''.join(random.choice(chars) for _ in range(length))
    return password

def check_password_breach(password: str) -> dict:
    """Check if password has been pwned using HaveIBeenPwned API"""
    try:
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix, suffix = sha1_hash[:5], sha1_hash[5:]
        
        response = requests.get(
            f"https://api.pwnedpasswords.com/range/{prefix}",
            timeout=5,
            headers={"Add-Padding": "true"}
        )
        
        if response.status_code == 200:
            hashes = (line.split(':') for line in response.text.splitlines())
            for hash_suffix, count in hashes:
                if hash_suffix == suffix:
                    return {
                        "breached": True,
                        "count": int(count),
                        "message": f"This password has been found {count} times in data breaches!"
                    }
            
            return {
                "breached": False,
                "count": 0,
                "message": "Good news! This password hasn't been found in any known breaches."
            }
    except Exception as e:
        return {
            "breached": None,
            "count": 0,
            "message": "Unable to check breach status. Please try again later."
        }

# Mount frontend folder as static files
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Serve index.html at root
@app.get("/", response_class=FileResponse)
async def root():
    return FileResponse("../frontend/index.html")

@app.post("/generate")
async def generate(request: PasswordRequest):
    try:
        if request.length < 4 or request.length > 128:
            raise HTTPException(status_code=400, detail="Length must be 4-128")
        password = generate_password(
            request.length,
            request.include_upper,
            request.include_lower,
            request.include_digits,
            request.include_special
        )
        return {"password": password, "length": request.length}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/check-breach")
async def check_breach(request: BreachCheckRequest):
    try:
        result = check_password_breach(request.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export")
async def export_passwords(request: ExportRequest):
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if request.format == "json":
            content = json.dumps({
                "exported_at": datetime.now().isoformat(),
                "passwords": request.passwords
            }, indent=2)
            filename = f"passwords_{timestamp}.json"
            media_type = "application/json"
        else:
            content = "\n".join([
                f"Password Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "=" * 40,
                *[f"{i+1}. {pwd}" for i, pwd in enumerate(request.passwords)]
            ])
            filename = f"passwords_{timestamp}.txt"
            media_type = "text/plain"
        
        return {
            "content": content,
            "filename": filename,
            "media_type": media_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
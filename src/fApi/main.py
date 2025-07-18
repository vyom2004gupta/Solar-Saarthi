from fastapi import FastAPI, Header, HTTPException, Depends # type: ignore
from pydantic import BaseModel # type: ignore
from typing import Optional
import os
from dotenv import load_dotenv # type: ignore
import jwt  # type: ignore # PyJWT
import psycopg2 # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from jose import jwt as jose_jwt, jwk # type: ignore
from jose.utils import base64url_decode # type: ignore

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

print("SUPABASE_JWT_SECRET:", SUPABASE_JWT_SECRET)
print("DATABASE_URL:", DATABASE_URL)
print("SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY)

class UserProfile(BaseModel):
    firstName: str
    lastName: str
    mobileNumber: str
    password: Optional[str] = ""  # Making password optional for social logins


def get_current_user(authorization: Optional[str] = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        print("Decoded token payload:", payload)

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return user_id

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


@app.post("/api/save-user")
def save_user(profile: UserProfile, user_id: str = Depends(get_current_user)):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute("SELECT id FROM profiles WHERE id = %s", (user_id,))
        user_exists = cursor.fetchone() is not None

        if user_exists:
            # Update existing user
            cursor.execute("""
                UPDATE profiles 
                SET first_name = %s, last_name = %s, number = %s
                WHERE id = %s    
            """, (profile.firstName, profile.lastName, profile.mobileNumber, user_id))
        else:
            # Insert new user
            cursor.execute("""
                INSERT INTO profiles (id, first_name, last_name, number, password, is_social_login)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id, 
                profile.firstName, 
                profile.lastName, 
                profile.mobileNumber,
                profile.password if profile.password else None,
                profile.password == ""  # True if password is empty (social login)
            ))

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "User saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Endpoint to check if user exists and get profile info
@app.get("/api/user-profile")
def get_user_profile(user_id: str = Depends(get_current_user)):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT first_name, last_name, number, is_social_login
            FROM profiles WHERE id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "firstName": user[0],
            "lastName": user[1],
            "mobileNumber": user[2],
            "isSocialLogin": user[3] if len(user) > 3 else False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
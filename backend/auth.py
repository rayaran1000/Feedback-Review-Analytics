# All code related to JSON Web token is present here (For password authentication of user and admin)

import os
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional

import jwt
from bson.objectid import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pymongo import MongoClient
from Logger import logger


# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI not set in environment variables")

# Auth database used to store User Hashed Password - for login purpose
client = MongoClient(MONGODB_URI)
db = client['feedback_analytics'] # Database with 'user_auth_db' name created in MongoDB server
users_collection = db['users_password'] # Collection named 'users' created

# JWT settings
SECRET_KEY = os.environ.get("SECRET_KEY")  # Set this securely in production
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in environment variables")
# Token broken down into algoritm and expiry minutes
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class UserRole(str, Enum): # 2 roles present for login, user will be able to give feedback, and admin will be able to view the analytics
    USER = "user" 
    ADMIN = "admin"

# Password hashing - Hash form saved in Database
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Hashing done using bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # Setting up OAuth2 scheme that uses bearer tokens for authentication

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    """
    logger.info(f"Entered in 'verify_password' function")
    return pwd_context.verify(plain_password, hashed_password) # Plain password is checked whether it matches with the hashed password

def get_password_hash(password: str) -> str:
    """
    Generate a hash for a given password.
    """
    logger.info(f"Entered in 'get_password_hash' function")
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str) -> dict:
    """
    Authenticate a user based on username and password.
    """
    logger.info(f"Entered in 'authenticate_user' function")
    user = users_collection.find_one({"username": username}) # user is the address of the username in the users collections(find_one used to find the username from the collection)
    if not user or not verify_password(password, user["password"]): # user["password"] used to retrieved the hash password from db
        return False
    return user

# Generate a JSON Web Token (JWT) for user authentication

# JWTs are commonly used in authentication systems to verify a user's identity. 
# After a user successfully logs in, a server generates a JWT, which includes the user's information (e.g., user ID, roles) and sends it back to the client (e.g., web or mobile application). 
# The client stores this token, typically in local storage
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    """
    logger.info(f"Entered in 'create_access_token' function")
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "role": data.get("role")})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Encoded JWT: {encoded_jwt}")
    return encoded_jwt

# Function designed to extract and verify the current user's identity from a JWT token. 
# This function is typically used in a FastAPI application to secure endpoints and ensure that only authenticated users can access certain routes.
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Get the current user based on the JWT token.
    """
    logger.info(f"Entered in 'get_current_user' function")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # decoding the JWT token using secret key and algorithm, then if it is decoded successfully, store it in payload
        username: str = payload.get("sub") # "sub" used as key to store the username(in main.py), so it is used here to extract the username
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"username": username}) # Checking whether username present in db
    if user is None:
        raise credentials_exception
    return {"username": user["username"], "role": user["role"]} # role is user or admin

# Role check for admin
def admin_required(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Ensure the current user has admin role.
    """
    logger.info(f"Entered in 'admin_required' function")
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
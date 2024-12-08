import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from pymongo import MongoClient
from pydantic import BaseModel, Field

from Logger import logger

# Importing all the password authentication functions
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    UserRole,
    admin_required,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    users_collection,
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS ( Main connection between frontend in React and Backend in python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI not set in environment variables")

# Sentiment Database used for storing Feedbacks that are submitted by the users
client = MongoClient(MONGODB_URI)
db = client.feedback_analytics
feedback_collection = db.sentiment

# JWT settings
SECRET_KEY = os.environ.get("SECRET_KEY")  # Set this securely in production
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in environment variables")

# Langchain and Groq API keys
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
if not LANGCHAIN_API_KEY:
    raise ValueError("LANGCHAIN_API_KEY not set in environment variables")

LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2")
if not LANGCHAIN_TRACING_V2:
    raise ValueError("LANGCHAIN_TRACING_V2 not set in environment variables")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not set in environment variables")


# Pydantic models
# Pydantic models are a feature of the Pydantic library in Python, which is used for data validation and settings management using Python type annotations. 
# Pydantic models allow you to define data structures that automatically validate and convert input data to the specified types. 
# They are particularly useful in scenarios where you need to ensure the correctness of data being processed, such as in API development, data parsing, or configuration management.
class PyObjectId(ObjectId): # ObjectId: used for MongoDB document identifiers (IDs)
    @classmethod
    def __get_validators__(cls):
        yield cls.validate # validate method, which will be used by Pydantic to validate input data that is supposed to be an ObjectId

    @classmethod # This method checks whether the provided value (v) is a valid MongoDB ObjectId.
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema: Any) -> None:
        field_schema.update(type="string") # This updates the schema to indicate that fields of this type should be represented as strings in JSON, which is how MongoDB ObjectIds are typically serialized

# BaseModel being used here --> used for calling the pydantic model, and checking each field is present and is of string format
class User(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.USER

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserOut(BaseModel):
    username: str
    role: UserRole

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class FeedbackSubmission(BaseModel):
    feedback: str
    timestamp: datetime = Field(default_factory=datetime.now)

class AnalyticsResponse(BaseModel):
    topics: List[str]
    sentiment: Dict[str, float]
    trends: List[str]

class FeedbackResponse(BaseModel):
    current: List[FeedbackSubmission]
    historical: List[FeedbackSubmission]

class AnalysisResult(BaseModel):
    topics: List[str]
    trends: List[str]

class LoginData(BaseModel):
    username: str
    password: str

# LLM Configuration
llm = ChatGroq(groq_api_key=GROQ_API_KEY,model_name="gemma-7b-it", temperature=0.1)
output_parser = PydanticOutputParser(pydantic_object=AnalysisResult)

analyze_prompt = PromptTemplate(
    input_variables=["feedback"],
    template="Analyze the following customer feedback: \
            \n{feedback}\n\nProvide the analysis in the following format with each key-value pair on a new line: \
            \nKey topics: comma-separated list without bullet points \
            \nOverall Sentiment: Positive, Negative, or Neutral \
            \nEmerging trends: comma-separated list without bullet points"
)

# Langchain llm chain
analyze_chain = LLMChain(llm=llm, prompt=analyze_prompt)

# API Routes
@app.post("/register", response_model=dict) # Registering of a new user
async def register(user: User, admin_key: str = Header(None, alias="X-Admin-Key")):
    """
    Register a new user.
    """
    logger.info(f"Entered in 'register' function")
    if users_collection.find_one({"username": user.username}): # Username already present in db
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password) # password hash generated
    # Dictionary created for the new user which stores the hashed password with key as original password, role as key and value as user or admin, then the data stored in users collection
    user_dict = user.dict()
    user_dict["password"] = hashed_password 

    if admin_key and admin_key == SECRET_KEY:
        user_dict["role"] = UserRole.ADMIN
    else:
        user_dict["role"] = UserRole.USER
    
    result = users_collection.insert_one(user_dict)
    return {"message": "User registered successfully", "id": str(result.inserted_id)}

@app.post("/token")
async def login_for_access_token(login_data: LoginData):
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information.
    """
    logger.info(f"Entered in 'read_users_me' function")
    return UserOut(username=current_user["username"], role=current_user["role"])

@app.get("/admin")
async def admin_only(current_user: dict = Depends(admin_required)):
    """
    Admin-only endpoint.
    """
    logger.info(f"Entered in 'admin_only' function")
    return {"message": "Welcome, admin!", "username": current_user["username"]}

@app.post("/feedback")
async def submit_feedback(feedback_item: FeedbackSubmission, current_user: dict = Depends(get_current_user)):
    """
    Submit feedback.
    """
    logger.info(f"Entered in 'submit_feedback' function")
    feedback_doc = feedback_item.dict()
    feedback_doc["username"] = current_user["username"] # Feedbacks stored in the db in dictionary format with username
    feedback_collection.insert_one(feedback_doc)
    return {"message": "Feedback submitted successfully"}

@app.get("/feedback", response_model=FeedbackResponse)
async def get_feedback(current_user: dict = Depends(get_current_user)): # Depends functionality helps in running a function on the username, then only pass the username here
    """
    Get recent and historical feedback.
    """
    logger.info(f"Entered in 'get_feedback' function")
    current_time = datetime.now()
    one_hour_ago = current_time - timedelta(hours=1)
    
    # Fetching current (past 1 hour feedbacks)
    current_feedback = list(feedback_collection.find(
        {"timestamp": {"$gte": one_hour_ago}},
        {"_id": 0, "feedback": 1, "timestamp": 1}
    ))
    
    # Fetching historical (timestamp less than 1 hour, that means older feedbacks than past 1 hour)
    historical_feedback = list(feedback_collection.find(
        {"timestamp": {"$lt": one_hour_ago}},
        {"_id": 0, "feedback": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(10)) # sorting done as per timestamp
    
    # list of feedbacks returned
    return {
        "current": [FeedbackSubmission(**item) for item in current_feedback],
        "historical": [FeedbackSubmission(**item) for item in historical_feedback]
    }

@app.get("/analytics")
async def get_analytics(current_user: dict = Depends(admin_required)): # only for admins, do dependency function used
    """
    Get analytics from feedback data.
    """
    logger.info(f"Entered in 'get_analytics' function")

    # Fetching all the feedbacks from the collection, then retreiving just the feedback field for each username and storing them together as combined feedback
    all_feedback = list(feedback_collection.find({}, {"_id": 0, "feedback": 1}))
    combined_feedback = " ".join([f["feedback"] for f in all_feedback])

    if not combined_feedback:
        raise HTTPException(status_code=404, detail="No feedback data available")

# The combined feedback collected earlier is passed here
    print("LLM chain start")
    result = analyze_chain.run(feedback=combined_feedback)

    print("LLM chain end")
    
    # Split result by double newlines
    split_result = result.split("\n")
    cleaned_result = [line.strip() for line in split_result if line.strip()]

# Check length of split_result and unpack accordingly
    if len(cleaned_result) == 3:
        topics, sentiment, trends = cleaned_result.split()
        print(topics)
        print(sentiment)
        print(trends)
    else:
        topics = cleaned_result[0].split('**')[2]
        sentiment = cleaned_result[1].split('**')[2]
        trends =  ",".join([" ".join(word.split()[1:]) for word in cleaned_result[3:]])
        print("--------------------------------")
        print(topics)
        print(sentiment)
        print(trends)

    
    # Return the prediction of the model

    return {
         "topics": [topic.strip().capitalize() for topic in topics.split(",")],
         "sentiment": sentiment.strip().capitalize(),
         "trends": [trend.strip().capitalize() for trend in trends.split(",")]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
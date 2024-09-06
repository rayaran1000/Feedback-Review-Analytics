# Feedback Review Analytics

![image](https://github.com/user-attachments/assets/2fcf7ea8-fe72-4e10-98db-2a57ff498f1b)

## Project Overview

**Feedback Review Analytics** is a web application designed to collect and analyze user feedback. It provides insights into customer sentiments, key topics, and emerging trends from feedback. The application includes authentication for users and admins, with admins having access to analytics data. 

The front-end is developed using **React**, while the back-end is built with **FastAPI**. MongoDB is used as the database to store user credentials and feedback, and **LangChain** with **ChatGroq** powers the analytics and sentiment analysis.


## Features

- **User Registration and Authentication**: Users can register and log in using JWT-based authentication. Roles are assigned as either "user" or "admin."
- **Feedback Submission**: Authenticated users can submit feedback.
- **Sentiment Analysis**: Feedback is analyzed to extract key topics, sentiment, and trends using an LLM (powered by LangChain and ChatGroq).
- **Admin Dashboard**: Admins can view analytics of submitted feedback.
- **MongoDB Integration**: User data and feedback are stored in a MongoDB database.
## Project Structure

### Front-end
- **Framework**: React
- **Features**: User authentication, feedback submission forms, and admin dashboards for feedback analytics.
  
### Back-end
- **Framework**: FastAPI
- **Modules**:
  - `Auth.py`: Handles user authentication using JWT and password hashing.
  - `Main.py`: Manages feedback submission, retrieval, and analysis.
  
- **Key Dependencies**: 
  - **FastAPI**: API framework for building backend routes.
  - **MongoDB**: Database to store user and feedback data.
  - **LangChain and ChatGroq**: Libraries for performing sentiment analysis on feedback.
## Installation

### Prerequisites

- **Python 3.9+**
- **MongoDB** (locally or via cloud service like MongoDB Atlas)
- **Node.js & npm/yarn** (for the React front-end)
- **Docker** (optional, for containerized deployment)

### Environment Variables

Ensure the following environment variables are set:

- `MONGODB_URI`: Your MongoDB connection URI
- `SECRET_KEY`: A secret key for JWT
- `LANGCHAIN_API_KEY`: API key for LangChain
- `GROQ_API_KEY`: API key for ChatGroq

### Back-end Setup

1. Clone the repository:
    ```bash
    git clone <repo-url>
    cd <repo-directory>
    ```

2. Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Run the FastAPI application:
    ```bash
    uvicorn main:app --reload
    ```

### Front-end Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Run the React development server:
    ```bash
    npm start
    ```

### Running with Docker

1. Build the Docker image:
    ```bash
    docker-compose up --build
    ```

2. The back-end should be accessible at `http://localhost:8000` and the front-end at `http://localhost:3000`.

## API Endpoints

### Authentication

- **Register a new user**: `POST /register`
    - Headers: `X-Admin-Key` (for admin registration)
    - Body: `{ "username": "string", "password": "string" }`
    
- **Login to get access token**: `POST /token`
    - Body: `{ "username": "string", "password": "string" }`

- **Get current user information**: `GET /users/me`

### Feedback

- **Submit feedback**: `POST /feedback`
    - Body: `{ "feedback": "string" }`
    
- **Get feedback (current and historical)**: `GET /feedback`

### Analytics (Admin Only)

- **Get feedback analytics**: `GET /analytics`

## Database Structure

The project uses a MongoDB database with the following collections:

- **users_password**: Stores hashed passwords and roles for user authentication.
- **sentiment**: Stores feedback submitted by users, including timestamps and associated users.

## Technologies Used

- **FastAPI**: Backend API framework
- **React**: Frontend framework for building user interfaces
- **MongoDB**: NoSQL database for storing user and feedback data
- **JWT**: JSON Web Tokens for user authentication
- **LangChain & ChatGroq**: For performing NLP and sentiment analysis on feedback

## Security

- **Password Hashing**: Passwords are hashed using `bcrypt`.
- **JWT Authentication**: Tokens are used for secure authentication.
- **Admin Access**: Admins have special privileges to view feedback analytics.

## Future Enhancements

- **Real-time Feedback Monitoring**: Implement real-time feedback submissions and analysis.
- **Enhanced Analytics**: Add more detailed breakdowns of feedback, including user demographics and location-based trends.
- **Notification System**: Notify admins when significant trends emerge in feedback.
    

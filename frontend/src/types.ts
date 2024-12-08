// types.ts
export interface Analytics {
    topics: string[];
    sentiment: string[];
    trends: string[];
  }
export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserData {
  username: string;
  role: UserRole;
}

export interface FeedbackItem {
  feedback: string;
  timestamp: string;
  username: string;
}

export interface FeedbackResponse {
  current: FeedbackItem[];
  historical: FeedbackItem[];
}

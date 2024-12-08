import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Container, CircularProgress, Box } from '@mui/material';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import FeedbackForm from './components/FeedbackForm';
import AnalyticsDisplay from './components/AnalyticsDisplay';
import FeedbackDisplay from './components/FeedbackDisplay';
import { Analytics, UserRole, LoginResponse, UserData, FeedbackResponse, FeedbackItem } from './types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#50dbfe',
      light: '#79e5ff',
      dark: '#0098cb',
    },
    secondary: {
      main: '#ff6b9b',
      light: '#ff9bc4',
      dark: '#c73b74',
    },
    background: {
      default: '#1a1a1a',
      paper: '#262626',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'linear-gradient(145deg, rgba(0,0,0,0.8) 0%, rgba(2,204,254,0.2) 100%)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [feedback, setFeedback] = useState<{ current: FeedbackItem[], historical: FeedbackItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchData();
    } else {
      setLoading(false);
      setUserRole(null);
      setUsername(null);
    }
  }, [token]);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json() as UserData;
      setUserRole(userData.role);
      setUsername(userData.username);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('username', userData.username);
    } catch (error) {
      console.error('Error fetching user data:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setToken(null);
    setUserRole(null);
    setUsername(null);
    setAnalytics(null);
    setFeedback(null);
    setLoading(false);
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [analyticsResponse, feedbackResponse] = await Promise.all([
        fetch('http://localhost:8000/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/feedback', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!analyticsResponse.ok || !feedbackResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const analyticsData = await analyticsResponse.json() as Analytics;
      const feedbackData = await feedbackResponse.json() as FeedbackResponse;

      setAnalytics(analyticsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedbackText: string) => {
    if (!token || !username) {
      console.log('No token or username available, user might not be logged in');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedbackText, username: username }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Header token={token} handleLogout={handleLogout} userRole={userRole} />
          <Container component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setToken={setToken} />} />
              <Route path="/home" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              <Route path="/analytics" element={
                <PrivateRoute requiredRole={UserRole.ADMIN}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                      <CircularProgress size={60} thickness={4} />
                    </Box>
                  ) : (
                    <AnalyticsDisplay analytics={analytics} userRole={userRole} />
                  )}
                </PrivateRoute>
              } />
              <Route path="/feedback" element={
                <PrivateRoute>
                  <>
                    {userRole !== UserRole.ADMIN && (
                      <FeedbackForm onSubmit={handleFeedbackSubmit} />
                    )}
                    {loading ? (
                      <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress size={60} thickness={4} />
                      </Box>
                    ) : (
                      <FeedbackDisplay feedback={feedback} userRole={userRole} username={username} />
                    )}
                  </>
                </PrivateRoute>
              } />
              <Route path="/" element={token ? <Navigate to="/home" /> : <Navigate to="/login" />} />
            </Routes>
          </Container>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Container, Avatar, Grid, Link } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoginResponse } from '../types';

interface LoginProps {
  setToken: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>('http://localhost:8000/token', {
        username,
        password
      });
      
      const token = response.data.access_token;
      setToken(token);
      localStorage.setItem('token', token);
      navigate('/home');
    } catch (error) {
      setError('Invalid username or password');
      console.error('Login error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={0}
        sx={{ 
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(2,204,254,0.15))',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          }
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#50dbfe' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ color: 'white', mb: 3 }}>
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#50dbfe',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#50dbfe',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#50dbfe',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#50dbfe',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, mb: 2, 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            Sign In
          </Button>
          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
            <Grid item>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ color: 'white' }} 
              >
                Don't have an account? Sign Up
              </Link>
            </Grid>
            <Grid item>
              <Link
                href="#"
                variant="body2"
                sx={{ color: 'white' }} 
              >
                Forgot password?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;

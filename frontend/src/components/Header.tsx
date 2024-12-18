import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import { UserRole } from '../types';

interface HeaderProps {
  token: string | null;
  handleLogout: () => void;
  userRole: UserRole | null;
}

const Header: React.FC<HeaderProps> = ({ token, handleLogout, userRole }) => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(145deg, rgba(0,0,0,0.9), rgba(2,204,254,0.2))',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: '#50dbfe',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: 'white',
              }
            }}
          >
            FEEDBACK ANALYTICS
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {!token ? (
              <>
                <Button
                  component={RouterLink}
                  to="/register"
                  startIcon={<PersonAddIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                  sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  Register
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  startIcon={<LoginIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                  sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/home"
                  startIcon={<HomeIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                  sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  Home
                </Button>
                {userRole === UserRole.ADMIN && (
                  <Button
                    component={RouterLink}
                    to="/analytics"
                    startIcon={<AnalyticsIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                    sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    Analytics
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  to="/feedback"
                  startIcon={<FeedbackIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                  sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  Feedback
                </Button>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon sx={{ color: '#87CEEB' }} />} // Icon color changed to sky blue
                  sx={{ my: 2, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;

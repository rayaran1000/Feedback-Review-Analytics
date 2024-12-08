import React from 'react';
import { Box, Paper, Typography, Chip, List, ListItem, ListItemText, Zoom, Grid, Container } from '@mui/material';
import { keyframes } from '@emotion/react';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { UserRole, FeedbackItem } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface FeedbackDisplayProps {
  feedback: {
    current: FeedbackItem[];
    historical: FeedbackItem[];
  } | null;
  userRole: UserRole | null;
  username: string | null;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, userRole, username }) => {
  if (!feedback) return null;

  const filterFeedback = (feedbackList: FeedbackItem[]) => {
    if (userRole === UserRole.ADMIN) {
      return feedbackList;
    } else {
      return feedbackList.filter(item => item.username === username);
    }
  };

  const currentFeedback = filterFeedback(feedback.current);
  const historicalFeedback = filterFeedback(feedback.historical);

  return (
    <Zoom in={true} style={{ transitionDelay: '300ms' }}>
      <Container maxWidth="lg" sx={{ mt: 4, animation: `${fadeIn} 0.6s ease-out` }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            p: 3, 
            background: 'linear-gradient(145deg, rgba(0,0,0,0.9), rgba(2,204,254,0.2))',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <FeedbackIcon sx={{ fontSize: 48, color: '#50dbfe', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'white', letterSpacing: '0.5px' }}>
            Feedback Overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(145deg, black, #02ccfe)', 
                borderRadius: '15px',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                Current Feedback
              </Typography>
              <List>
                {currentFeedback.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={<Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{item.feedback}</Typography>}
                      secondary={
                        <>
                          {userRole === UserRole.ADMIN && (
                            <Typography variant="body2" component="span" sx={{ color: 'white' }}>
                              {`${item.username} - `}
                            </Typography>
                          )}
                          <Chip
                            label={new Date(item.timestamp).toLocaleString()}
                            sx={{ fontWeight: 'normal', color: 'red' }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(145deg, black, #02ccfe)', 
                borderRadius: '15px',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Historical Feedback
              </Typography>
              <List>
                {historicalFeedback.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {item.feedback}
                        </Typography>
                      }
                      secondary={
                        <>
                          {userRole === UserRole.ADMIN && (
                            <Typography variant="body2" component="span" sx={{ color: 'white' }}>
                              {`${item.username} - `}
                            </Typography>
                          )}
                          <Chip
                            label={new Date(item.timestamp).toLocaleString()}
                            sx={{ fontWeight: 'normal', color: 'red' }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Zoom>
  );
};

export default FeedbackDisplay;
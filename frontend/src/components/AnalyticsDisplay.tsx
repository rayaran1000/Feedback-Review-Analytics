import React from 'react';
import { Box, Paper, Typography, Chip, Zoom, Grid, Container } from '@mui/material';
import { Analytics, UserRole } from '../types';
import { keyframes } from '@emotion/react';
import BarChartIcon from '@mui/icons-material/BarChart';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface AnalyticsDisplayProps {
  analytics: Partial<Analytics> | null;
  userRole: UserRole | null;
}

const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({ analytics, userRole }) => {
  if (!analytics || userRole !== UserRole.ADMIN) {
    return null;
  }

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
          <BarChartIcon sx={{ fontSize: 48, color: '#50dbfe', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'white', letterSpacing: '0.5px' }}>
            Analytics Overview
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
                Key Topics
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
              {analytics.topics?.map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  sx={{
                    backgroundColor: 'black', 
                    color: '#50dbfe', 
                    fontWeight: 'bold',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                Overall Sentiment
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label={analytics.sentiment} 
                sx={{
                  background: 'black', 
                  color: '#50dbfe', 
                  fontWeight: 'bold',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
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
                Emerging Trends
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
               {analytics.trends?.map((trend, index) => (
                <Chip
                  key={index}
                  label={trend}
                  sx={{
                    background: 'black', 
                    color: '#50dbfe', 
                    fontWeight: 'bold',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Zoom>
  );
};

export default AnalyticsDisplay;
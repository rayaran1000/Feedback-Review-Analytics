import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { styled } from '@mui/system';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e1e1e', // Dark background color as before
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  marginTop: 'auto',
}));

const SocialIcons = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  marginTop: '0.5rem',
});

const SocialIcon = styled(Link)(({ theme }) => ({
  color: '#87CEEB', // Icon color changed to sky blue
  fontSize: '1.5rem',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: '#FFFFFF', // White color on hover for better visibility against dark background
  },
}));

const Footer: React.FC = () => {
  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; 2024 @aranya ray
        </Typography>
        <SocialIcons>
          <SocialIcon href="https://github.com/rayaran1000" target="_blank" rel="noopener noreferrer">
            <GitHubIcon />
          </SocialIcon>
          <SocialIcon href="https://www.linkedin.com/in/aranya-ray-46a635156/" target="_blank" rel="noopener noreferrer">
            <LinkedInIcon />
          </SocialIcon>
          <SocialIcon href="https://x.com/AranyaRay1998" target="_blank" rel="noopener noreferrer">
            <TwitterIcon />
          </SocialIcon>
        </SocialIcons>
      </Container>
    </FooterContainer>
  );
};

export default Footer;

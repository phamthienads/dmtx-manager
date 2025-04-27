import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Điện Máy Thiên Xuân
      </Typography>
    </Box>
  );
}

export default Footer; 
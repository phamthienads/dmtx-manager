import React from 'react';
import {
  Box,
  TablePagination,
  useTheme,
  useMediaQuery
} from '@mui/material';

function Pagination({
  total = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100]
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      mt: 2,
      '& .MuiTablePagination-root': {
        width: '100%',
        maxWidth: isMobile ? '100%' : 'auto',
        overflowX: 'auto',
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          whiteSpace: 'nowrap'
        },
        '& .MuiTablePagination-select': {
          fontSize: isMobile ? '0.75rem' : '0.875rem'
        }
      }
    }}>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={isMobile ? [10, 20] : rowsPerPageOptions}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => {
          if (count === 0) return '0-0 của 0';
          return isMobile ? `${from}-${to}/${count}` : `${from}-${to} của ${count}`;
        }}
      />
    </Box>
  );
}

export default Pagination; 
import React from 'react';
import {
  Box,
  TablePagination
} from '@mui/material';

function Pagination({
  total = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100]
}) {
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
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => {
          if (count === 0) return '0-0 của 0';
          return `${from}-${to} của ${count}`;
        }}
      />
    </Box>
  );
}

export default Pagination; 
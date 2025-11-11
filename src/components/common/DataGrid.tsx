import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Paper,
  Stack,
  TablePagination,
  alpha,
} from '@mui/material';
import { Button } from '.';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'select';
  filterOptions?: { label: string; value: string | number }[];
}

export interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filterOptions?: { label: string; value: string; field: keyof T }[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  getRowId?: (row: T) => string;
}

type Order = 'asc' | 'desc';

export function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = false,
  filterOptions = [],
  onRowClick,
  actions,
  emptyMessage = 'No data available',
  getRowId = (row) => (row as { id?: string }).id || String(row),
}: DataGridProps<T>) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<Order>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterSelect = (value: string) => {
    setFilterValue(value);
    setFilterAnchor(null);
  };

  const handleColumnFilterChange = (columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const handleClearColumnFilter = (columnId: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
  };

  const handleClearAllColumnFilters = () => {
    setColumnFilters({});
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.id as keyof T];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply category filter
    if (filterValue && filterable && filterOptions.length > 0) {
      const filterOption = filterOptions.find((opt) => opt.value === filterValue);
      if (filterOption) {
        filtered = filtered.filter((row) => row[filterOption.field] === filterValue);
      }
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (!filterValue) return;
      
      const column = columns.find((col) => String(col.id) === columnId);
      if (!column || column.filterable === false) return;

      filtered = filtered.filter((row) => {
        const value = row[columnId as keyof T];
        if (value === null || value === undefined) return false;

        const filterStr = filterValue.toLowerCase();
        const valueStr = String(value).toLowerCase();

        if (column.filterType === 'number') {
          const filterNum = Number(filterValue);
          const valueNum = Number(value);
          if (isNaN(filterNum) || isNaN(valueNum)) return valueStr.includes(filterStr);
          return valueNum === filterNum || valueStr.includes(filterStr);
        }

        return valueStr.includes(filterStr);
      });
    });

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return order === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, filterValue, columnFilters, orderBy, order, columns, filterable, filterOptions]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedData.slice(start, start + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  // Reset to first page if filters change and current page is out of bounds
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredAndSortedData.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(0);
    }
  }, [filteredAndSortedData.length, rowsPerPage, page]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ri-search-line" style={{ fontSize: '18px' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ p: 0.5 }}
                    >
                      <i className="ri-close-line" style={{ fontSize: '16px' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, minWidth: 200 }}
            />
          )}

          {filterable && filterOptions.length > 0 && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<i className="ri-filter-line" style={{ fontSize: '16px' }} />}
                onClick={handleFilterClick}
                sx={{ textTransform: 'none' }}
              >
                {filterValue
                  ? filterOptions.find((opt) => opt.value === filterValue)?.label || 'Filter'
                  : 'Filter'}
              </Button>
              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={handleFilterClose}
              >
                <MenuItem onClick={() => handleFilterSelect('')}>
                  <em>All</em>
                </MenuItem>
                {filterOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleFilterSelect(option.value)}
                    selected={filterValue === option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {(searchQuery || filterValue || Object.keys(columnFilters).length > 0) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              {Object.keys(columnFilters).length > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={handleClearAllColumnFilters}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Clear Column Filters
                </Button>
              )}
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedData.length} result{filteredAndSortedData.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    backgroundColor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider',
                    p: 0,
                  }}
                >
                  <Box sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        {column.sortable !== false ? (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={() => handleRequestSort(String(column.id))}
                            sx={{
                              '& .MuiTableSortLabel-icon': {
                                opacity: orderBy === column.id ? 1 : 0.3,
                              },
                            }}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          <Typography variant="subtitle2" fontWeight={600}>
                            {column.label}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {column.filterable !== false && (
                      <TextField
                        size="small"
                        placeholder={`Filter ${column.label.toLowerCase()}...`}
                        value={columnFilters[String(column.id)] || ''}
                        onChange={(e) => handleColumnFilterChange(String(column.id), e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <i className="ri-search-line" style={{ fontSize: '14px' }} />
                            </InputAdornment>
                          ),
                          endAdornment: columnFilters[String(column.id)] && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearColumnFilter(String(column.id));
                                }}
                                sx={{ p: 0.25 }}
                              >
                                <i className="ri-close-line" style={{ fontSize: '12px' }} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        type={column.filterType === 'number' ? 'number' : column.filterType === 'date' ? 'date' : 'text'}
                        sx={{
                          mt: 0.5,
                          '& .MuiInputBase-root': {
                            fontSize: '0.75rem',
                            height: '32px',
                          },
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  <Stack spacing={1} alignItems="center">
                    <i className="ri-file-list-line" style={{ fontSize: '48px', color: 'inherit', opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id as keyof T];
                    return (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : String(value ?? '—')}
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredAndSortedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Rows per page"
        sx={{ mt: 1 }}
      />
    </Box>
  );
}

export default DataGrid;

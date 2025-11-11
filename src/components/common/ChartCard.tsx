import React, { lazy, Suspense } from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import type { ApexOptions } from 'apexcharts';

// Lazy load ApexCharts to avoid SSR issues
const Chart = lazy(() => import('react-apexcharts'));

export interface ChartCardProps {
  title?: string;
  subtitle?: string;
  height?: number | string;
  options: ApexOptions;
  series: ApexOptions['series'];
  type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'boxPlot' | 'candlestick' | 'radar' | 'polarArea' | 'rangeBar';
  sx?: React.CSSProperties;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  height = 350,
  options,
  series,
  type = 'line',
  sx,
}) => {
  const theme = useTheme();

  const defaultOptions: ApexOptions = {
    chart: {
      type,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      fontFamily: theme.typography.fontFamily,
    },
    theme: {
      mode: theme.palette.mode,
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
    },
    // Merge options, but ensure colors from options take precedence
    ...options,
    colors: options.colors || [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ],
  };

  return (
    <Box sx={{ ...sx }}>
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && (
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ width: '100%' }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: typeof height === 'number' ? height : 350 }}>
            <CircularProgress />
          </Box>
        }>
          <Chart
            options={defaultOptions}
            series={series}
            type={type}
            height={height}
          />
        </Suspense>
      </Box>
    </Box>
  );
};

export default ChartCard;

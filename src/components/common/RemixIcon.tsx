import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface RemixIconProps {
  icon: string;
  size?: number | string;
  color?: string;
  sx?: SxProps<Theme>;
  className?: string;
}

export const RemixIcon = ({ 
  icon, 
  size = 24, 
  color, 
  sx,
  className = '' 
}: RemixIconProps) => {
  return (
    <Box
      component="i"
      className={`ri-${icon} ${className}`}
      sx={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    />
  );
};

export default RemixIcon;
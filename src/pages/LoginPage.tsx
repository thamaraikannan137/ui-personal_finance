// React Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { styled, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';

// Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused': {
      boxShadow: `0 0 0 0 ${theme.palette.primary.main}1f`
    }
  }
}));

// Validation Schema (Zod)
const loginSchema = z.object({
  email: z.string().trim().min(1, 'This field is required').email('Please enter a valid email address'),
  password: z.string().trim().min(1, 'This field is required').min(5, 'Password must be at least 5 characters long')
});

export const LoginPage = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const navigate = useNavigate();
  const theme = useTheme();
  const { login } = useAuth();

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);

  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className='flex min-h-screen'>
      <Box
        className='flex items-center justify-center flex-1 min-h-screen relative p-6 hidden md:flex'
        sx={{
          borderRight: theme => theme.palette.divider
        }}
      >
        <LoginIllustration
          src='/images/illustrations/login.png'
          alt='login-illustration'
          className={theme.direction === 'rtl' ? 'scale-x-[-1]' : ''}
        />
      </Box>
      <Box className='flex justify-center items-center min-h-screen bg-background-paper w-full p-6 md:w-[480px]'>
        <Box className='absolute top-6 left-6'>
          <Typography variant='h4' color='primary'>LOGO</Typography>
        </Box>
        <Box className='w-full max-w-[400px] mt-11 md:mt-0'>
          <Box className='mb-6'>
            <Typography variant='h4'>Welcome! 👋🏻</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <form
            noValidate
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
          >
            <Box className='flex flex-col gap-5'>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='email'
                    label='Email'
                    placeholder='Enter your email'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Password'
                    placeholder='············'
                    type={isPasswordShown ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            {isPasswordShown ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              <Box className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Link href='/forgot-password' underline='none' color='primary'>
                  Forgot password?
                </Link>
              </Box>
              <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
              <Box className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Link href='/register' underline='none' color='primary'>
                  Create an account
                </Link>
              </Box>
              <Divider>or</Divider>
              <Box className='flex justify-center items-center gap-1.5'>
                <IconButton color='primary' size='small'>
                  <FacebookIcon />
                </IconButton>
                <IconButton color='info' size='small'>
                  <TwitterIcon />
                </IconButton>
                <IconButton size='small'>
                  <GitHubIcon />
                </IconButton>
                <IconButton color='error' size='small'>
                  <GoogleIcon />
                </IconButton>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};


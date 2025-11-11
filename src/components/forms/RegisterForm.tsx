import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MuiButton, MuiInput } from '../common';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';

// Define validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  agree: z.boolean().refine(v => v, { message: 'You must agree to privacy policy & terms' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setError(null);
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-5">
        <MuiInput
          {...register('firstName')}
          type="text"
          label="First Name"
          placeholder="Enter your first name"
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />

        <MuiInput
          {...register('lastName')}
          type="text"
          label="Last Name"
          placeholder="Enter your last name"
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />

        <MuiInput
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <MuiInput
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          error={!!errors.password}
          helperText={errors.password?.message || "Must be at least 6 characters"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword(v => !v)}
                  onMouseDown={e => e.preventDefault()}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <MuiInput
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  onMouseDown={e => e.preventDefault()}
                  aria-label="toggle confirm password visibility"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <div className="flex flex-col gap-1">
          <FormControlLabel
            control={<Checkbox {...register('agree')} />}
            label={
              <>
                <span>I agree to </span>
                <Link className='text-primary' href='/' onClick={e => e.preventDefault()} underline="none">
                  privacy policy & terms
                </Link>
              </>
            }
          />
          {errors.agree?.message && (
            <Typography variant="caption" color="error">{errors.agree.message}</Typography>
          )}
        </div>

        <MuiButton
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </MuiButton>

        <div className="text-center">
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" underline="none">
              Sign in instead
            </Link>
          </Typography>
        </div>
      </div>
    </form>
  );
};


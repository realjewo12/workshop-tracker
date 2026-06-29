// src/(Auth)/Login.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import './Login.css';

const loginSchema = z.object({
  identifier: z.string().min(5, "Please enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const { loginUser, isLoading } = useLogin();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await loginUser({
      identifier: data.identifier.trim(),
      password: data.password,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Login successful! Welcome back 🎉' });
      reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Invalid credentials' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Your Workshop</h2>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email or Phone Number</label>
            <input
              type="text"
              {...register("identifier")}
              className="form-input"
              placeholder="0712345678 or your@email.com"
            />
            {errors.identifier && <p className="error">{errors.identifier.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register("password")}
              className="form-input"
              placeholder="Enter your password"
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-link" style={{ marginTop: '12px' }}>
          <a href="/forgot-password">Forgot Password?</a>
        </div>

        <p className="login-link">
          Don't have an account?{' '}
          <a href="/">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
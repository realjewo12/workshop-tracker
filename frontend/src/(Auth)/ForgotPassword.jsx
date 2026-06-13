import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import './ForgotPassword.css';

const forgotSchema = z.object({
  identifier: z.string().min(5, "Please enter your email or phone number"),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log("Password reset requested for:", data.identifier);

      // Simulate API / Dexie lookup delay
      await new Promise(resolve => setTimeout(resolve, 1400));

      setMessage({
        type: 'success',
        text: `Reset link has been sent to your ${data.identifier.includes('@') ? 'email' : 'phone number'}!`
      });
      setStep(2);
      reset();

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to process request. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
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

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ fontSize: '15px', color: '#334155', marginBottom: '24px' }}>
              A password reset link has been sent.<br />
              Please check your email or phone.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="submit-btn"
            >
              Back to Login
            </button>
          </div>
        )}

        <p className="login-link" style={{ marginTop: '20px' }}>
          Remember your password?{' '}
          <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
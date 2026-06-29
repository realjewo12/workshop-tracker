// src/(Auth)/Register.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRegister } from '../hooks/useAuth';
import './Register.css';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  workshopName: z.string().min(3, "Workshop name must be at least 3 characters"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  email: z.string().email("Please enter a valid email address"),
  workshopType: z.enum(["Carpenter", "Shoemaker", "Tailor", "Welder", "Other Workshop"]),
  otherWorkshopType: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.workshopType === "Other Workshop") {
    return data.otherWorkshopType?.trim().length > 2;
  }
  return true;
}, {
  message: "Please specify your workshop type",
  path: ["otherWorkshopType"],
});

const Register = () => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const { registerUser, isLoading } = useRegister();

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      workshopType: "", 
      otherWorkshopType: "" 
    }
  });

  const selectedType = watch("workshopType");

  const onSubmit = async (data) => {
    const result = await registerUser({
      fullName: data.fullName.trim(),
      workshopName: data.workshopName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.trim(),
      workshopType: data.workshopType === "Other Workshop" 
        ? data.otherWorkshopType.trim() 
        : data.workshopType,
      password: data.password,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Registration successful! 🎉' });
      reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Registration failed' });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register Your Workshop</h2>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" {...register("fullName")} className="form-input" placeholder="John Doe" />
            {errors.fullName && <p className="error">{errors.fullName.message}</p>}
          </div>

          <div className="form-group">
            <label>Workshop Name</label>
            <input type="text" {...register("workshopName")} className="form-input" placeholder="Elite Carpentry Works" />
            {errors.workshopName && <p className="error">{errors.workshopName.message}</p>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" {...register("phoneNumber")} className="form-input" placeholder="0712345678" />
            {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              {...register("email")} 
              className="form-input" 
              placeholder="your@email.com" 
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Workshop Type</label>
            <select {...register("workshopType")} className="form-input">
              <option value="">Select Workshop Type</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Shoemaker">Shoemaker</option>
              <option value="Tailor">Tailor</option>
              <option value="Welder">Welder</option>
              <option value="Other Workshop">Other Workshop</option>
            </select>
            {errors.workshopType && <p className="error">{errors.workshopType.message}</p>}
          </div>

          {selectedType === "Other Workshop" && (
            <div className="form-group">
              <label>Please Specify Workshop Type</label>
              <input 
                type="text" 
                {...register("otherWorkshopType")} 
                className="form-input" 
                placeholder="e.g. Plumbing, Electrical, Mechanic..." 
              />
              {errors.otherWorkshopType && <p className="error">{errors.otherWorkshopType.message}</p>}
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register("password")} className="form-input" />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" {...register("confirmPassword")} className="form-input" />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
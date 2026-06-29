import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/dexie';

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const users = useLiveQuery(() => db.users.toArray(), []);

  const registerUser = async (userData) => {
    setIsLoading(true);
    try {
      // Duplicate check
      const existingPhone = await db.users
        .where('phoneNumber').equals(userData.phoneNumber).first();
      
      const existingEmail = await db.users
        .where('email').equals(userData.email).first();

      if (existingPhone) return { success: false, error: "Phone number already registered" };
      if (existingEmail) return { success: false, error: "Email already registered" };

      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
      };

      const id = await db.users.add(newUser);

      return { success: true, id, user: newUser };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  return { registerUser, users, isLoading };
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (credentials) => {
    setIsLoading(true);
    try {
      let user = null;

      // Try phone number first
      user = await db.users.where('phoneNumber').equals(credentials.identifier).first();

      // Try email if not found
      if (!user) {
        user = await db.users.where('email').equals(credentials.identifier).first();
      }

      if (!user) {
        return { success: false, error: "No account found with this email or phone number" };
      }

      if (user.password !== credentials.password) {
        return { success: false, error: "Incorrect password" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  return { loginUser, isLoading };
};
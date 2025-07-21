import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/medical';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock users for demo
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'doctor@healthcare.com',
      name: 'Dr. Sarah Johnson',
      role: 'Doctor',
      department: 'General Medicine',
      licenseNumber: 'MD-12345',
      createdAt: new Date()
    },
    {
      id: '2', 
      email: 'admin@healthcare.com',
      name: 'John Administrator',
      role: 'Admin',
      createdAt: new Date()
    },
    {
      id: '3',
      email: 'patient@healthcare.com', 
      name: 'Jane Patient',
      role: 'Patient',
      createdAt: new Date()
    }
  ];

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('healthcare_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'healthcare123') {
      setUser(foundUser);
      localStorage.setItem('healthcare_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: User['role']): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock signup - check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date()
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('healthcare_user', JSON.stringify(newUser));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthcare_user');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
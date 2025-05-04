
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Assume a user might have multiple roles, but only one is active at a time.
// The backend should ideally provide all possible roles on login.
// For now, we assume the initial 'role' is the default or primary one.
interface User {
  id: string;
  name: string;
  email: string;
  role: 'interviewer' | 'interviewee'; // Default/initial role
  availableRoles?: ('interviewer' | 'interviewee')[]; // All roles the user has
  profile_picture_url?: string;
}

type ActiveRole = 'interviewer' | 'interviewee';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeRole: ActiveRole | null; // Currently active role for the UI
  canSwitchRole: boolean; // Can the user switch roles?
  login: (newToken: string, userData: User) => void;
  logout: () => void;
  switchRole: () => void; // Function to toggle the active role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [activeRole, setActiveRole] = useState<ActiveRole | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for token and user data on initial load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    const storedActiveRole = localStorage.getItem('activeRole') as ActiveRole | null;

    let initialUser: User | null = null;
    if (storedToken && storedUser) {
      try {
        initialUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(initialUser);
        // Set active role: use stored role if valid, otherwise default to user's primary role
        setActiveRole(storedActiveRole && initialUser?.availableRoles?.includes(storedActiveRole) ? storedActiveRole : initialUser?.role || null);
        // Optional: Validate token with backend here
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('activeRole');
      }
    }
    setIsLoading(false); // Finish loading after checking storage
  }, []);

  // Determine if the user can switch roles
  const canSwitchRole = !!user?.availableRoles && user.availableRoles.length > 1;

   // Redirect logic based on auth state and current path
   useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const isAuthPage = pathname.startsWith('/auth/');
    const isHomePage = pathname === '/';
    const isDashboard = pathname.startsWith('/dashboard');

    if (!user && !isAuthPage && !isHomePage) {
      // If not logged in and not on auth page or home page, redirect to login
      router.push('/auth/login');
    } else if (user && activeRole) {
       if (isAuthPage) {
          // If logged in and on an auth page, redirect to active dashboard
          const redirectPath = `/dashboard/${activeRole}`;
          router.push(redirectPath);
       } else if (isDashboard && !pathname.startsWith(`/dashboard/${activeRole}`)) {
          // If logged in and on the WRONG dashboard page for the active role, redirect
          // This prevents accessing /dashboard/interviewer when activeRole is interviewee
          const correctDashboardPath = `/dashboard/${activeRole}`;
          router.push(correctDashboardPath);
       }
    }
    // Allow access to home page regardless of auth state
    // Allow access to other pages (like /profile, /schedule) if logged in

  }, [user, activeRole, isLoading, pathname, router]);


  const login = (newToken: string, userData: User) => {
    // Ensure availableRoles is set, default to just the primary role if not provided
    const roles = userData.availableRoles || [userData.role];
    const userWithRoles = { ...userData, availableRoles: roles };

    const currentActiveRole = localStorage.getItem('activeRole') as ActiveRole | null;
    // Use stored active role if valid for the new user, otherwise default to primary role
    const newActiveRole = currentActiveRole && roles.includes(currentActiveRole) ? currentActiveRole : userWithRoles.role;

    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userWithRoles));
    localStorage.setItem('activeRole', newActiveRole); // Store active role
    setToken(newToken);
    setUser(userWithRoles);
    setActiveRole(newActiveRole);
    // Redirect is handled by useEffect
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('activeRole');
    setToken(null);
    setUser(null);
    setActiveRole(null);
    router.push('/auth/login'); // Redirect to login after logout
  };

  const switchRole = useCallback(() => {
    if (!user || !canSwitchRole || !activeRole) return;

    // Simple toggle between the two roles
    const nextRole = activeRole === 'interviewee' ? 'interviewer' : 'interviewee';

    if (user.availableRoles?.includes(nextRole)) {
       setActiveRole(nextRole);
       localStorage.setItem('activeRole', nextRole);
       // Redirect to the new active dashboard after switching
       router.push(`/dashboard/${nextRole}`);
    }
  }, [user, canSwitchRole, activeRole, router]);

  const value = {
    user,
    token,
    isLoading,
    activeRole,
    canSwitchRole,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;

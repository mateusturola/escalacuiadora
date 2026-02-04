"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

export function useAuth(redirectTo?: string, userType?: 'admin' | 'cuidadora') {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser && redirectTo) {
      router.push(redirectTo);
      return;
    }

    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      
      if (userType && userData.tipo !== userType) {
        router.push(redirectTo || '/');
        return;
      }
      
      setUser(userData);
    }
    
    setLoading(false);
  }, [router, redirectTo, userType]);

  const logout = (redirectPath?: string) => {
    localStorage.removeItem('user');
    setUser(null);
    router.push(redirectPath || '/');
  };

  const login = (userData: User, redirectPath?: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return { user, loading, logout, login };
}

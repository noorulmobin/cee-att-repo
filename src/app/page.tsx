'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkUserExists = async () => {
      try {
        // Check if there are any existing users
        const response = await fetch('/api/auth/check-users');
        const data = await response.json();
        
        if (data.hasUsers) {
          // If users exist, redirect to login
          router.push('/login');
        } else {
          // If no users exist, redirect to signup
          router.push('/signup');
        }
      } catch (error) {
        // If there's an error, default to signup page
        router.push('/signup');
      }
    };


    
    checkUserExists();
  }, [router, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}

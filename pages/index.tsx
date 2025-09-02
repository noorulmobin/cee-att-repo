import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if any users exist
    const checkUsers = async () => {
      try {
        const response = await fetch('/api/auth/check-users');
        const data = await response.json();
        
        if (data.hasUsers) {
          router.push('/login');
        } else {
          router.push('/signup');
        }
      } catch (error) {
        // If API fails, redirect to signup
        router.push('/signup');
      }
    };

    checkUsers();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Attendance App</h1>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecureAccess, setShowSecureAccess] = useState(false);
  const [securePassword, setSecurePassword] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is admin/CEO and show secure access popup
        if (data.user.role === 'admin') {
          setShowSecureAccess(true);
        } else {
          // Regular user - proceed to dashboard
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecureAccess = async () => {
    if (!securePassword.trim()) {
      setError('Please enter the access password');
      return;
    }
    
    // Check if it's the correct admin access password
    if (securePassword === 'admin!@34') {
      // Proceed with login
      await completeAdminLogin();
    } else {
      // Wrong password - show error
      setError('⚠️ Wrong admin access password. Access denied.');
      setSecurePassword('');
    }
  };

  const completeAdminLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowSecureAccess(false);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during secure access:', error);
      setError('An error occurred during secure access');
    }
  };

  // const startCamera = async () => { // Removed as per edit hint
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ 
  //       video: { 
  //         facingMode: 'user',
  //         width: { ideal: 640 },
  //         height: { ideal: 480 }
  //       } 
  //     });
  //     setCameraStream(stream);
  //     setShowCamera(true);
  //   } catch (error) {
  //     setError('Camera access denied. Please allow camera permissions.');
  //   }
  // };

  // const stopCamera = () => { // Removed as per edit hint
  //   if (cameraStream) {
  //     cameraStream.getTracks().forEach(track => track.stop());
  //     setCameraStream(null);
  //   }
  //   setShowCamera(false);
  //   setCameraVerified(false);
  // };

  // const verifyCamera = () => { // Removed as per edit hint
  //   setCameraVerified(true);
  //   setTimeout(() => {
  //     // Simulate camera verification success
  //     completeAdminLogin();
  //   }, 2000);
  // };

  // const handleConfirmation = () => { // Removed as per edit hint
  //   setShowConfirmationPopup(false);
  //   // Always open camera for verification when confirmed
  //   setTimeout(() => {
  //     startCamera();
  //   }, 300); // Reduced delay for faster response
  // };

  // const handleDenial = () => { // Removed as per edit hint
  //   setShowConfirmationPopup(false);
  //   setError('Access denied. Only verified CEOs and Admins can proceed.');
  //   setSecurePassword('');
  //   setWrongPasswordAttempts(0);
  // };

  return (
          <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Core Elite Experts - Top Left */}
      <div style={{
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        animation: 'bounce 2s infinite',
        zIndex: 20
      }}>
        <Image
          src="/ceelogo.png"
          alt="CEE Core Elite Experts Logo"
          width={60}
          height={60}
          style={{
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Main Login Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '350px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        position: 'relative',
        zIndex: 10,
        marginTop: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#dbeafe'
          }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  fontSize: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: '#fca5a5', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#dbeafe',
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            Don't have an account?{' '}
            <Link href="/signup">
              <a style={{
                color: 'white',
                fontWeight: '600',
                textDecoration: 'underline'
              }}>
                Sign up here
              </a>
            </Link>
          </p>
        </div>

        {/* CEO Login Note */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dbeafe', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <strong>CEO & Admin Access:</strong>
          </p>
          <p style={{ color: 'white', fontSize: '0.75rem', lineHeight: '1.4' }}>
            CEO: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>ceo / ceo2024</code><br/>
            Admin: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>admin / admin123</code>
          </p>
        </div>
      </div>

      {/* Developed By Footer */}
              <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'bounce 2s infinite'
        }}>
        <p style={{
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '600',
          textAlign: 'center',
          margin: 0,
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          👨‍💻 @Cee Company
        </p>
      </div>

      {/* Bouncing Animation Keyframes */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* Secure Access Popup */}
      {showSecureAccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Secure Access Required
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '1rem' }}>
                Additional verification required for admin access
              </p>
              <div style={{ // Security Notice Banner
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#d97706', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                  <strong>🔒 Security Notice:</strong> Only authorized administrators can proceed beyond this point.
                </p>
              </div>
            </div>

            {/* Access Method Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => {
                    setShowSecureAccess(false);
                    setError('');
                    setSecurePassword('');
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSecureAccess}
                  // disabled={isSecureLoading} // Removed as per edit hint
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: 1 // Removed opacity based on isSecureLoading
                  }}
                >
                  Verify Access
                </button>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="securePassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textAlign: 'left' }}>
                  Admin Access Password
                </label>
                <input
                  type="password"
                  id="securePassword"
                  value={securePassword}
                  onChange={(e) => setSecurePassword(e.target.value)}
                  placeholder="Enter admin access password"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px', fontSize: '16px', background: 'rgba(255, 255, 255, 0.9)', transition: 'all 0.3s ease'
                  }}
                />
                {error && error.includes('not admin') && (
                  <div style={{
                    marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex',
                    alignItems: 'center', gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>🚫</span>
                    <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
                      {error}
                    </span>
                  </div>
                )}
              </div>

              {/* Fingerprint Section */}
              {/* Removed Fingerprint Section */}

              {/* Camera Verification Section */}
              {/* Removed Camera Verification Section */}
            </div>

            {/* Action Buttons */}
            {/* Removed Action Buttons */}

            {/* General Error Display */}
            {error && !error.includes('not admin') && (
              <div style={{
                marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex',
                alignItems: 'center', gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
                  {error}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CEO/Admin Confirmation Popup */}
      {/* Removed CEO/Admin Confirmation Popup */}
    </div>
  );
}

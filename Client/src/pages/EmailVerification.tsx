import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import bgImg from '../assets/hero.jpg';
import Logo from '../assets/Logo';

// interface VerificationInfo {
//   emailVerified: boolean;
//   email: string;
//   tokenExpiry?: string;
//   canResend?: boolean;
// }

export default function EmailVerification() {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  // const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if there's a pending verification email in localStorage
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
      setVerificationStatus('pending');
      setMessage('Please enter the 6-digit verification code sent to your email.');
    } else {
      // If no pending email, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const verifyEmail = async (verificationCode: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('http://localhost:3000/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        
        // Clear pending verification
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:3000/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage('Verification code sent! Please check your email.');
        setVerificationStatus('pending');
      } else {
        setMessage(data.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyEmail(code);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setVerificationStatus('pending');
                  setMessage('Please enter the 6-digit verification code sent to your email.');
                }}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Code Expired</h2>
            <p className="text-gray-600 mb-6">Your verification code has expired. Please request a new one.</p>
            <button
              onClick={resendVerification}
              disabled={isResending}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Send New Code'}
            </button>
          </div>
        );

      case 'pending':
      default:
        return (
          <div className="text-center">
            <Mail className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              
              <button
                type="submit"
                disabled={code.length !== 6 || isVerifying}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-900 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white bg-opacity-85 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl font-bold text-gray-800">🍽️ eGebeya</h1>
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Need help? Contact us at{' '}
            <a href="mailto:support@eGebeya.com" className="text-yellow-600 hover:underline">
              support@eGebeya.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
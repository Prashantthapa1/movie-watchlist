// frontend/src/components/auth/EmailVerification.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailVerificationService from '../../services/EmailVerificationService';
import { useAuth } from '../../services/AuthContext';
import Button from '../../shared/Button';

const EmailVerification = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get email from navigation state
    const email = location.state?.email;

    // Countdown timer for resend button
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit verification code');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await EmailVerificationService.verifyEmailAndRegister({
                email,
                verification_code: verificationCode
            });

            if (response.success) {
                setSuccess('Email verified successfully! Redirecting...');
                
                // Log the user in automatically
                await login(response.data.user, response.data.token);
                
                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(response.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await EmailVerificationService.resendVerificationCode(email);
            
            if (response.success) {
                setSuccess('New verification code sent to your email');
                setTimeLeft(300); // Reset timer
                setCanResend(false);
            } else {
                setError(response.message || 'Failed to resend code');
            }
        } catch (err) {
            setError(err.message || 'Failed to resend verification code');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setVerificationCode(value);
            setError(''); // Clear error when user types
        }
    };

    if (!email) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        📧 Verify Your Email
                    </h2>
                    <p className="text-gray-600">
                        We've sent a verification code to
                    </p>
                    <p className="font-semibold text-blue-600">{email}</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleVerification} className="space-y-6">
                        <div>
                            <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="verification_code"
                                    name="verification_code"
                                    type="text"
                                    value={verificationCode}
                                    onChange={handleCodeChange}
                                    placeholder="Enter 6-digit code"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
                                    maxLength="6"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="text-sm text-green-700">{success}</div>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    loading || verificationCode.length !== 6
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify Email'
                                )}
                            </Button>
                        </div>

                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">
                                {timeLeft > 0 ? (
                                    <>Code expires in: <span className="font-mono font-semibold text-red-600">{formatTime(timeLeft)}</span></>
                                ) : (
                                    <span className="text-red-600 font-semibold">Code has expired</span>
                                )}
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={!canResend || resendLoading}
                                className={`text-sm ${
                                    canResend && !resendLoading
                                        ? 'text-blue-600 hover:text-blue-500 cursor-pointer'
                                        : 'text-gray-400 cursor-not-allowed'
                                } font-medium`}
                            >
                                {resendLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Resend verification code'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-sm text-gray-600 hover:text-gray-500"
                            >
                                ← Back to registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
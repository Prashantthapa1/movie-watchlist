// frontend/src/services/EmailVerificationService.jsx
import api from './api';

class EmailVerificationService {
    // Send verification code to email
    static async sendVerificationCode(userData) {
        try {
            const response = await api.post('/auth/send-verification', userData);
            return response.data;
        } catch (err) {
            console.error("Error sending verification code:", err);
            throw this.handleError(err);
        }
    }

    // Verify email with code and complete registration
    static async verifyEmailAndRegister(verificationData) {
        try {
            const response = await api.post('/auth/verify-email', verificationData);
            return response.data;
        } catch (err) {
            console.error("Error verifying email:", err);
            throw this.handleError(err);
        }
    }

    // Resend verification code
    static async resendVerificationCode(email) {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response.data;
        } catch (err) {
            console.error("Error resending verification code:", err);
            throw this.handleError(err);
        }
    }

    // Handle API errors consistently
    static handleError(error) {
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data.message || 'An error occurred',
                status: error.response.status
            };
        } else if (error.request) {
            // Network error
            return {
                success: false,
                message: 'Network error. Please check your connection.',
                status: 0
            };
        } else {
            // Other error
            return {
                success: false,
                message: error.message || 'An unexpected error occurred',
                status: 500
            };
        }
    }
}

export default EmailVerificationService;
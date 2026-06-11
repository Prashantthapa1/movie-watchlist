import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { EmailConfig } from '../types';


class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        const emailConfig: EmailConfig = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || '',
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        this.transporter = nodemailer.createTransport(emailConfig);
    }

    static generateVerificationCode(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    async sendVerificationEmail(email: string, verificationCode: string, userName: string): Promise<boolean> {
        try{
            const mailOptions = {
                from: `"Movie Watchlist" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify your Email - Movies Watchlist',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin-bottom: 10px;">🎬 Movies Watchlist</h1>
                            <h2 style="color: #666; font-weight: normal;">Email Verification</h2>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
                            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
                                Hello <strong>${userName}</strong>,
                            </p>
                            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                                Thank you for registering with Movies Watchlist! To complete your registration, please verify your email address using the code below:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; display: inline-block;">
                                    ${verificationCode}
                                </div>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                                This verification code will expire in <strong>5 minutes</strong>.
                            </p>
                        </div>
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                If you didn't create an account with Movies Watchlist, please ignore this email.
                            </p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Verfication email sent: ", info.messageId);
            return true;
        } catch(err) {
            console.error('Error sending verification email:', err);
            return false;
        }
    }

    async testConnection(): Promise<boolean> {
        try{
            await this.transporter.verify();
            console.log("Email service is ready");
            return true; 
        } catch(err) {
            console.error("Email service error:", err);
            return false;
        }
    }
}

export default EmailService;
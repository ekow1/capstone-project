import express from 'express';
import { 
    register, 
    login, 
    logout,
    sendRegistrationOTP, 
    forgotPassword, 
    resetPassword
    // verifyPhone - TEMPORARILY COMMENTED OUT
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Step 1 of 3)
 *     tags: [Authentication]
 *     description: Create a new user account with phone, name, password, and optional fields.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: "Jane Doe"
 *             phone: "+233201234567"
 *             email: "janedoe@example.com"
 *             password: "securePassword123"
 *             address: "East Legon, Accra"
 *             country: "Ghana"
 *             dob: "1992-05-15"
 *             image: "https://randomuser.me/api/portraits/women/44.jpg"
 *             ghanaPost: "GA-184-1234"
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent for verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully. Please verify your phone number with the OTP sent."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Jane Doe"
 *                     phone:
 *                       type: string
 *                       example: "+233201234567"
 *                     email:
 *                       type: string
 *                       example: "janedoe@example.com"
 *                     isPhoneVerified:
 *                       type: boolean
 *                       example: false
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                 otp_sent:
 *                   type: object
 *                   properties:
 *                     phone_number:
 *                       type: string
 *                       example: "233201234567"
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or phone already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneInUse:
 *                 value:
 *                   message: "Phone already in use"
 *               nameRequired:
 *                 value:
 *                   message: "Name is required"
 *               phoneRequired:
 *                 value:
 *                   message: "Phone number is required"
 *               invalidPhone:
 *                 value:
 *                   message: "Invalid phone number format. Use international format (e.g., +233201234567)"
 *               passwordTooShort:
 *                 value:
 *                   message: "Password must be at least 6 characters long"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (Step 3 of 3)
 *     tags: [Authentication]
 *     description: Authenticate user with phone and password. Returns JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             phone: "+1234567890"
 *             password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMmY5ZTNhZTEwYjRmMDAxNWI1YWNkYyIsImlhdCI6MTYzMDU0MDg0MiwiZXhwIjoxNjMwNjI3MjQyfQ.9kX_7J5KZ8Y4bQ_3kF7Lq4mN2dR8vT6wP1xY4sZ7vA8"
 *               user:
 *                 id: "507f1f77bcf86cd799439011"
 *                 name: "John Doe"
 *                 phone: "+1234567890"
 *                 email: "john.doe@example.com"
 *                 address: "123 Main St, City, Country"
 *                 country: "USA"
 *                 dob: "1990-01-01"
 *                 image: "https://example.com/images/profile.jpg"
 *                 ghanaPost: "GA-184-1234"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneRequired:
 *                 value:
 *                   message: "Phone number is required"
 *               passwordRequired:
 *                 value:
 *                   message: "Password is required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid credentials"
 *       403:
 *         description: Account not active (phone not verified)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Account is not active. Please verify your phone number first."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logout a user by clearing the authentication cookie
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       500:
 *         description: Server error
 */
router.post('/logout', logout);

// OTP-based Authentication Routes

/**
 * @swagger
 * /api/auth/send-registration-otp:
 *   post:
 *     summary: Send OTP for user registration
 *     tags: [Authentication]
 *     description: Send OTP to phone number for user registration verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+233201234567"
 *           example:
 *             phone: "+233201234567"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 phone_number:
 *                   type: string
 *                   example: "233201234567"
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Phone already registered or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneRegistered:
 *                 value:
 *                   message: "Phone number already registered"
 *               phoneRequired:
 *                 value:
 *                   message: "Phone number is required"
 *       500:
 *         description: Failed to send OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to send OTP"
 */
router.post('/send-registration-otp', sendRegistrationOTP);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Authentication]
 *     description: Send OTP to phone number for password reset verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+233201234567"
 *           example:
 *             phone: "+233201234567"
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset OTP sent successfully"
 *                 phone_number:
 *                   type: string
 *                   example: "233201234567"
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Phone number is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Failed to send OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to send OTP"
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP verification
 *     tags: [Authentication]
 *     description: Reset user password using OTP verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp_code
 *               - new_password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+233201234567"
 *               otp_code:
 *                 type: string
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newSecurePassword123"
 *           example:
 *             phone: "+233201234567"
 *             otp_code: "123456"
 *             new_password: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *                 phone_number:
 *                   type: string
 *                   example: "233201234567"
 *       400:
 *         description: Validation error or invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validationError:
 *                 value:
 *                   message: "Phone number, OTP code, and new password are required"
 *               passwordTooShort:
 *                 value:
 *                   message: "New password must be at least 6 characters long"
 *               invalidOTP:
 *                 value:
 *                   message: "Invalid OTP code"
 *               expiredOTP:
 *                 value:
 *                   message: "OTP has expired"
 *               tooManyAttempts:
 *                 value:
 *                   message: "Too many verification attempts. Please request a new OTP."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/verify-phone:
 *   post:
 *     summary: Verify phone number with OTP (Step 2 of 3)
 *     tags: [Authentication]
 *     description: Verify phone number for newly registered users using OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp_code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+233201234567"
 *               otp_code:
 *                 type: string
 *                 example: "123456"
 *           example:
 *             phone: "+233201234567"
 *             otp_code: "123456"
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number verified successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phone:
 *                       type: string
 *                       example: "+233201234567"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     isPhoneVerified:
 *                       type: boolean
 *                       example: true
 *                     phoneVerifiedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validationError:
 *                 value:
 *                   message: "Phone number and OTP code are required"
 *               alreadyVerified:
 *                 value:
 *                   message: "Phone number is already verified"
 *               invalidOTP:
 *                 value:
 *                   message: "Invalid OTP code"
 *               expiredOTP:
 *                 value:
 *                   message: "OTP has expired"
 *               tooManyAttempts:
 *                 value:
 *                   message: "Too many verification attempts. Please request a new OTP."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// TEMPORARILY COMMENTED OUT - OTP VERIFICATION DISABLED
// router.post('/verify-phone', verifyPhone);

export default router;

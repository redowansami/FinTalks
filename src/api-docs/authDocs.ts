/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           pattern: '^[a-zA-Z0-9_]+$'
 *           example: "john_doe"
 *           description: Username must contain only letters, numbers, and underscores
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           example: "SecurePass123!"
 *           description: Must contain at least one lowercase letter, one uppercase letter, one digit, and one special character
 *       required:
 *         - username
 *         - name
 *         - email
 *         - password
 *
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           example: "SecurePass123!"
 *       required:
 *         - email
 *         - password
 *
 *     ResendConfirmationEmailRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *       required:
 *         - email
 *
 *     SignupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Confirmation email sent. Please check your email to verify your account."
 *         user:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               format: uuid
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             username:
 *               type: string
 *               example: "john_doe"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             joinDate:
 *               type: string
 *               format: date-time
 *               example: "2025-12-11T10:00:00Z"
 *             role:
 *               type: string
 *               enum: [USER, ADMIN]
 *               example: "USER"
 *             isEmailConfirmed:
 *               type: boolean
 *               example: false
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: JWT token for authentication
 *         user:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               format: uuid
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             username:
 *               type: string
 *               example: "john_doe"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             joinDate:
 *               type: string
 *               format: date-time
 *               example: "2025-12-11T10:00:00Z"
 *             role:
 *               type: string
 *               enum: [USER, ADMIN]
 *               example: "USER"
 *
 *     ConfirmEmailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Email confirmed successfully"
 *         isConfirmed:
 *           type: boolean
 *           example: true
 *
 *     ResendConfirmationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Confirmation email resent successfully"
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account and sends a confirmation email. Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully, confirmation email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       409:
 *         description: Conflict - username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               usernameExists:
 *                 value:
 *                   success: false
 *                   message: "Username already exists"
 *               emailExists:
 *                 value:
 *                   success: false
 *                   message: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticates a user with email and password. Returns a JWT token for subsequent authenticated requests. Email must be confirmed before login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidPassword:
 *                 value:
 *                   success: false
 *                   message: "Invalid password"
 *               invalidCredentials:
 *                 value:
 *                   success: false
 *                   message: "Invalid credentials"
 *       403:
 *         description: Forbidden - email not confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email not confirmed. Please confirm your email before logging in."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/confirm-email/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Confirm user email
 *     description: Confirms user's email address using the token sent via email. Token expires after the configured time period.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email confirmation token (JWT) sent to user's email
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Email confirmed successfully or already confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfirmEmailResponse'
 *             examples:
 *               confirmed:
 *                 value:
 *                   success: true
 *                   message: "Email confirmed successfully"
 *                   isConfirmed: true
 *               alreadyConfirmed:
 *                 value:
 *                   success: true
 *                   message: "Email already confirmed"
 *                   isConfirmed: true
 *       401:
 *         description: Unauthorized - invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/resend-confirmation-email:
 *   post:
 *     tags: [Auth]
 *     summary: Resend confirmation email
 *     description: Resends the email confirmation link to the user's email address. Can be used if the original confirmation email was not received or expired.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendConfirmationEmailRequest'
 *     responses:
 *       200:
 *         description: Confirmation email resent successfully or email already confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendConfirmationResponse'
 *             examples:
 *               resent:
 *                 value:
 *                   success: true
 *                   message: "Confirmation email resent successfully"
 *               alreadyConfirmed:
 *                 value:
 *                   success: true
 *                   message: "Email already confirmed"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */

export {};

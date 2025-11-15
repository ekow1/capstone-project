import express from 'express';
import {
    createFirePersonnel,
    getAllFirePersonnel,
    getFirePersonnelById,
    getCurrentFirePersonnel,
    updateFirePersonnel,
    deleteFirePersonnel,
    getPersonnelByUnit,
    getPersonnelByDepartment,
    getPersonnelByStation,
    loginFirePersonnel,
    logoutFirePersonnel,
    changePassword
} from '../controllers/firePersonnelController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Personnel
 *     description: Fire service personnel management with dual reference structure (station + department/unit).
 */

/**
 * @swagger
 * /api/fire/personnel:
 *   post:
 *     summary: Create new fire personnel
 *     tags: [Personnel]
 *     description: Create a new fire service personnel record with temporary password. Service number is used for login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FirePersonnelCreateRequest'
 *           example:
 *             serviceNumber: "GFS-2024-001"
 *             name: "Kwame Mensah"
 *             rank: "507f1f77bcf86cd799439011"
 *             department: "507f1f77bcf86cd799439016"
 *             unit: "507f1f77bcf86cd799439012"
 *             station_id: "507f1f77bcf86cd799439013"
 *             tempPassword: "TEMP1234"
 *     responses:
 *       201:
 *         description: Personnel created successfully with temporary password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Fire personnel created successfully. Temporary password set for 7 days."
 *                 data:
 *                   $ref: '#/components/schemas/FirePersonnel'
 *                 tempPassword:
 *                   type: string
 *                   description: The temporary password (plain text) - share this with the personnel
 *                   example: "TEMP1234"
 *                 tempPasswordExpiry:
 *                   type: string
 *                   format: date-time
 *                   description: When the temporary password expires
 *       400:
 *         description: Validation error
 *       404:
 *         description: Station, department, or unit not found
 *       500:
 *         description: Server error
 */
router.post('/', createFirePersonnel);

/**
 * @swagger
 * /api/fire/personnel/login:
 *   post:
 *     summary: Login fire personnel
 *     tags: [Personnel]
 *     description: Authenticate fire personnel with service number and password. If using temp password, user will receive requiresPasswordReset flag and should set their own password using the change-password endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceNumber
 *               - password
 *             properties:
 *               serviceNumber:
 *                 type: string
 *                 description: Personnel service number (used for login)
 *                 example: "GFS-2024-001"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (temp password or user's own password)
 *                 example: "TEMP1234"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Login successful. Please reset your password."
 *                 token:
 *                   type: string
 *                 requiresPasswordReset:
 *                   type: boolean
 *                   description: Whether the personnel needs to reset their password (true if using temp password)
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FirePersonnel'
 *       400:
 *         description: Service number and password are required
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Temporary password expired or password reset required before access
 *       404:
 *         description: Fire personnel not found
 *       500:
 *         description: Server error
 */
router.post('/login', loginFirePersonnel);
router.post('/logout', logoutFirePersonnel);

/**
 * @swagger
 * /api/fire/personnel/{id}/change-password:
 *   post:
 *     summary: Change or set fire personnel password
 *     tags: [Personnel]
 *     description: Set a new password for fire personnel. Can be used to set initial password (from temp password) or change existing password. If oldPassword is not provided and temp password exists, it will set the password from temp password.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personnel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password (required for password change, optional if setting from temp password)
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password set/changed successfully
 *       400:
 *         description: Invalid input (password too short, old password required for change, etc.)
 *       403:
 *         description: Temporary password has expired
 *       401:
 *         description: Old password is incorrect
 *       404:
 *         description: Fire personnel not found
 *       500:
 *         description: Server error
 */
router.post('/:id/change-password', changePassword);

/**
 * @swagger
 * /api/fire/personnel:
 *   get:
 *     summary: Get all fire personnel
 *     tags: [Personnel]
 *     description: Retrieve all fire service personnel with optional filtering
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: unit
 *         schema:
 *           type: string
 *         description: Filter by unit ID
 *       - in: query
 *         name: station_id
 *         schema:
 *           type: string
 *         description: Filter by station ID
 *       - in: query
 *         name: rank
 *         schema:
 *           type: string
 *         description: Filter by rank ID
 *     responses:
 *       200:
 *         description: List of fire personnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FirePersonnel'
 *       500:
 *         description: Server error
 */
router.get('/', getAllFirePersonnel);

/**
 * @swagger
 * /api/fire/personnel/station/{stationId}:
 *   get:
 *     summary: Get personnel by station
 *     tags: [Personnel]
 *     description: Retrieve all personnel for a specific station
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *     responses:
 *       200:
 *         description: List of personnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FirePersonnel'
 *       400:
 *         description: Invalid station ID format
 *       500:
 *         description: Server error
 */
router.get('/station/:stationId', getPersonnelByStation);

/**
 * @swagger
 * /api/fire/personnel/unit/{unitId}:
 *   get:
 *     summary: Get personnel by unit
 *     tags: [Personnel]
 *     description: Retrieve all personnel for a specific unit
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: List of personnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FirePersonnel'
 *       400:
 *         description: Invalid unit ID format
 *       500:
 *         description: Server error
 */
router.get('/unit/:unitId', getPersonnelByUnit);

/**
 * @swagger
 * /api/fire/personnel/department/{departmentId}:
 *   get:
 *     summary: Get personnel by department
 *     tags: [Personnel]
 *     description: Retrieve all personnel for a specific department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of personnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FirePersonnel'
 *       400:
 *         description: Invalid department ID format
 *       500:
 *         description: Server error
 */
router.get('/department/:departmentId', getPersonnelByDepartment);

/**
 * @swagger
 * /api/fire/personnel/{id}:
 *   get:
 *     summary: Get personnel by ID
 *     tags: [Personnel]
 *     description: Retrieve a specific personnel record by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personnel ID
 *     responses:
 *       200:
 *         description: Personnel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FirePersonnel'
 *       400:
 *         description: Invalid personnel ID format
 *       404:
 *         description: Personnel not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/fire/personnel/me:
 *   get:
 *     summary: Get current fire personnel profile
 *     tags: [Personnel]
 *     description: Get the currently authenticated fire personnel's profile information
 *     responses:
 *       200:
 *         description: Fire personnel profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FirePersonnel'
 *                 requiresPasswordReset:
 *                   type: boolean
 *                   description: Whether the user needs to reset their password
 *                   example: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fire personnel not found
 *       500:
 *         description: Server error
 */
router.get('/me', getCurrentFirePersonnel);

router.get('/:id', getFirePersonnelById);

/**
 * @swagger
 * /api/fire/personnel/{id}:
 *   put:
 *     summary: Update personnel
 *     tags: [Personnel]
 *     description: Update an existing fire personnel record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personnel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FirePersonnelCreateRequest'
 *     responses:
 *       200:
 *         description: Personnel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FirePersonnelResponse'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Personnel not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateFirePersonnel);

/**
 * @swagger
 * /api/fire/personnel/{id}:
 *   delete:
 *     summary: Delete personnel
 *     tags: [Personnel]
 *     description: Delete a personnel record by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personnel ID
 *     responses:
 *       200:
 *         description: Personnel deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid personnel ID format
 *       404:
 *         description: Personnel not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteFirePersonnel);

export default router;


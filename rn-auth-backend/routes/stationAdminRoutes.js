import express from 'express';
import {
    createStationAdmin,
    loginStationAdmin,
    logoutStationAdmin,
    getAllStationAdmins,
    getStationAdminById,
    getCurrentStationAdmin,
    updateStationAdmin,
    deleteStationAdmin,
    changePassword,
    resetTempPassword,
    getStationAdminsByStation
} from '../controllers/stationAdminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Station Admin
 *     description: Station administrator management with authentication and station-specific management capabilities.
 */

/**
 * @swagger
 * /api/station-admin/register:
 *   post:
 *     summary: Register a new station admin
 *     tags: [Station Admin]
 *     description: Create a new station administrator account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - station_id
 *             properties:
 *               username:
 *                 type: string
 *                 example: station_admin1
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@station1.gov.gh
 *               tempPassword:
 *                 type: string
 *                 format: password
 *                 description: Optional temporary password. If not provided, a random 8-character password will be generated.
 *                 example: TEMP1234
 *               name:
 *                 type: string
 *                 example: John Doe
 *               station_id:
 *                 type: string
 *                 description: Station ID this admin will manage
 *     responses:
 *       201:
 *         description: Station admin created successfully with temporary password (valid for 7 days)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Station admin created successfully. Temporary password set for 7 days."
 *                 data:
 *                   $ref: '#/components/schemas/StationAdmin'
 *                 tempPassword:
 *                   type: string
 *                   description: The temporary password (plain text) - share this with the admin
 *                   example: "TEMP1234"
 *                 tempPasswordExpiry:
 *                   type: string
 *                   format: date-time
 *                   description: When the temporary password expires
 *       400:
 *         description: Validation error or duplicate admin
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.post('/register', createStationAdmin);

/**
 * @swagger
 * /api/station-admin/login:
 *   post:
 *     summary: Login station admin
 *     tags: [Station Admin]
 *     description: Authenticate and login a station administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: station_admin1
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
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
 *                   description: Whether the admin needs to reset their password (true if using temp password)
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StationAdmin'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated or temporary password expired
 *       500:
 *         description: Server error
 */
router.post('/login', loginStationAdmin);

/**
 * @swagger
 * /api/station-admin/logout:
 *   post:
 *     summary: Logout station admin
 *     tags: [Station Admin]
 *     description: Logout a station administrator by clearing the authentication cookie
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
router.post('/logout', logoutStationAdmin);

/**
 * @swagger
 * /api/station-admin:
 *   get:
 *     summary: Get all station admins
 *     tags: [Station Admin]
 *     description: Retrieve all station administrator accounts
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: station_id
 *         schema:
 *           type: string
 *         description: Filter by station ID
 *     responses:
 *       200:
 *         description: List of station admins
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
 *                     $ref: '#/components/schemas/StationAdmin'
 *       500:
 *         description: Server error
 */
router.get('/', getAllStationAdmins);

/**
 * @swagger
 * /api/station-admin/station/{station_id}:
 *   get:
 *     summary: Get station admins by station ID
 *     tags: [Station Admin]
 *     description: Retrieve all station administrators for a specific station
 *     parameters:
 *       - in: path
 *         name: station_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of station admins for the station
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.get('/station/:station_id', getStationAdminsByStation);

/**
 * @swagger
 * /api/station-admin/me:
 *   get:
 *     summary: Get current station admin profile
 *     tags: [Station Admin]
 *     description: Get the currently authenticated station admin's profile information
 *     responses:
 *       200:
 *         description: Station admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StationAdmin'
 *                 requiresPasswordReset:
 *                   type: boolean
 *                   description: Whether the user needs to reset their password
 *                   example: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Station admin not found
 *       500:
 *         description: Server error
 */
router.get('/me', getCurrentStationAdmin);

/**
 * @swagger
 * /api/station-admin/{id}:
 *   get:
 *     summary: Get station admin by ID
 *     tags: [Station Admin]
 *     description: Retrieve a specific station administrator by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station Admin ID
 *     responses:
 *       200:
 *         description: Station admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StationAdmin'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Station admin not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getStationAdminById);

/**
 * @swagger
 * /api/station-admin/{id}:
 *   patch:
 *     summary: Update station admin
 *     tags: [Station Admin]
 *     description: Update station administrator information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               station_id:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Station admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StationAdmin'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Station admin or station not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateStationAdmin);

/**
 * @swagger
 * /api/station-admin/{id}:
 *   delete:
 *     summary: Delete station admin
 *     tags: [Station Admin]
 *     description: Delete a station administrator account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station Admin ID
 *     responses:
 *       200:
 *         description: Station admin deleted successfully
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
 *         description: Invalid ID format
 *       404:
 *         description: Station admin not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteStationAdmin);

/**
 * @swagger
 * /api/station-admin/{id}/change-password:
 *   post:
 *     summary: Change or set station admin password
 *     tags: [Station Admin]
 *     description: Change password for a station administrator. Requires old password (either regular or temp password) to verify identity. Sets new password as regular password and removes temp password.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password (regular password or temp password)
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
 *         description: Station admin not found
 *       500:
 *         description: Server error
 */
router.post('/:id/change-password', changePassword);

/**
 * @swagger
 * /api/station-admin/{id}/reset-temp-password:
 *   post:
 *     summary: Reset temporary password for station admin
 *     tags: [Station Admin]
 *     description: Set a new temporary password for a station admin (admin function)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newTempPassword
 *             properties:
 *               newTempPassword:
 *                 type: string
 *                 description: New temporary password to set
 *                 example: "UgyQWfCv"
 *     responses:
 *       200:
 *         description: Temporary password reset successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Station admin not found
 *       500:
 *         description: Server error
 */
router.post('/:id/reset-temp-password', resetTempPassword);

export default router;


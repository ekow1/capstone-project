import express from 'express';
import {
    createSuperAdmin,
    loginSuperAdmin,
    logoutSuperAdmin,
    getAllSuperAdmins,
    getSuperAdminById,
    updateSuperAdmin,
    deleteSuperAdmin,
    changePassword,
    addManagedDepartment,
    removeManagedDepartment
} from '../controllers/superAdminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Super Admin
 *     description: Super administrator management with authentication and department/station management capabilities.
 */

/**
 * @swagger
 * /api/super-admin/register:
 *   post:
 *     summary: Register a new super admin
 *     tags: [Super Admin]
 *     description: Create a new super administrator account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@fireservice.gov.gh
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *       400:
 *         description: Validation error or duplicate admin
 *       500:
 *         description: Server error
 */
router.post('/register', createSuperAdmin);

/**
 * @swagger
 * /api/super-admin/login:
 *   post:
 *     summary: Login super admin
 *     tags: [Super Admin]
 *     description: Authenticate and login a super administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@fireservice.gov.gh
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
 *                 token:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginSuperAdmin);

/**
 * @swagger
 * /api/super-admin/logout:
 *   post:
 *     summary: Logout super admin
 *     tags: [Super Admin]
 *     description: Logout a super administrator by clearing the authentication cookie
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
router.post('/logout', logoutSuperAdmin);

/**
 * @swagger
 * /api/super-admin:
 *   get:
 *     summary: Get all super admins
 *     tags: [Super Admin]
 *     description: Retrieve all super administrator accounts
 *     responses:
 *       200:
 *         description: List of super admins
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
 *                     $ref: '#/components/schemas/SuperAdmin'
 *       500:
 *         description: Server error
 */
router.get('/', getAllSuperAdmins);

/**
 * @swagger
 * /api/super-admin/{id}:
 *   get:
 *     summary: Get super admin by ID
 *     tags: [Super Admin]
 *     description: Retrieve a specific super administrator by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: Super admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Super admin not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSuperAdminById);

/**
 * @swagger
 * /api/super-admin/{id}:
 *   patch:
 *     summary: Update super admin
 *     tags: [Super Admin]
 *     description: Update super administrator information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
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
 *     responses:
 *       200:
 *         description: Super admin updated successfully
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
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Super admin not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateSuperAdmin);

/**
 * @swagger
 * /api/super-admin/{id}:
 *   delete:
 *     summary: Delete super admin
 *     tags: [Super Admin]
 *     description: Delete a super administrator account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: Super admin deleted successfully
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
 *         description: Super admin not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteSuperAdmin);

/**
 * @swagger
 * /api/super-admin/{id}/change-password:
 *   post:
 *     summary: Change super admin password
 *     tags: [Super Admin]
 *     description: Change the password for a super administrator
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or wrong current password
 *       404:
 *         description: Super admin not found
 *       500:
 *         description: Server error
 */
router.post('/:id/change-password', changePassword);

/**
 * @swagger
 * /api/super-admin/{id}/departments/add:
 *   post:
 *     summary: Add managed department
 *     tags: [Super Admin]
 *     description: Add a department to the super admin's managed departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentId
 *             properties:
 *               departmentId:
 *                 type: string
 *                 description: Department ID to add
 *     responses:
 *       200:
 *         description: Department added successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Super admin or department not found
 *       500:
 *         description: Server error
 */
router.post('/:id/departments/add', addManagedDepartment);

/**
 * @swagger
 * /api/super-admin/{id}/departments/remove:
 *   post:
 *     summary: Remove managed department
 *     tags: [Super Admin]
 *     description: Remove a department from the super admin's managed departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Super Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentId
 *             properties:
 *               departmentId:
 *                 type: string
 *                 description: Department ID to remove
 *     responses:
 *       200:
 *         description: Department removed successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Super admin or department not found
 *       500:
 *         description: Server error
 */
router.post('/:id/departments/remove', removeManagedDepartment);

export default router;


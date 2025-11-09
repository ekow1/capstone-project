import express from 'express';
import {
    createFirePersonnel,
    getAllFirePersonnel,
    getFirePersonnelById,
    updateFirePersonnel,
    deleteFirePersonnel,
    getPersonnelByUnit,
    getPersonnelByDepartment,
    getPersonnelByStation,
    loginFirePersonnel,
    logoutFirePersonnel
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
 *     description: Create a new fire service personnel record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FirePersonnelCreateRequest'
 *     responses:
 *       201:
 *         description: Personnel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FirePersonnelResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Station, department, or unit not found
 *       500:
 *         description: Server error
 */
router.post('/', createFirePersonnel);

router.post('/login', loginFirePersonnel);
router.post('/logout', logoutFirePersonnel);

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


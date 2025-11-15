import express from 'express';
import {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
    getUnitsByDepartment,
    activateUnit,
    deactivateUnit
} from '../controllers/unitController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Units
 *     description: Unit management within departments. Supports CRUD operations and department-based filtering.
 */

/**
 * @swagger
 * /api/fire/units:
 *   post:
 *     summary: Create a new unit
 *     tags: [Units]
 *     description: Create a new unit within a department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitCreateRequest'
 *     responses:
 *       201:
 *         description: Unit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.post('/', createUnit);

/**
 * @swagger
 * /api/fire/units:
 *   get:
 *     summary: Get all units
 *     tags: [Units]
 *     description: Retrieve all units with optional department filtering
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: List of units
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
 *                     $ref: '#/components/schemas/Unit'
 *       500:
 *         description: Server error
 */
router.get('/', getAllUnits);

/**
 * @swagger
 * /api/fire/units/{id}:
 *   get:
 *     summary: Get unit by ID
 *     tags: [Units]
 *     description: Retrieve a specific unit by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Invalid unit ID format
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getUnitById);

/**
 * @swagger
 * /api/fire/units/{id}:
 *   patch:
 *     summary: Update unit
 *     tags: [Units]
 *     description: Update an existing unit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               department:
 *                 type: string
 *                 description: Department ID
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitResponse'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateUnit);

/**
 * @swagger
 * /api/fire/units/{id}:
 *   delete:
 *     summary: Delete unit
 *     tags: [Units]
 *     description: Delete a unit by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit deleted successfully
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
 *         description: Invalid unit ID format
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteUnit);

/**
 * @swagger
 * /api/fire/units/department/{departmentId}:
 *   get:
 *     summary: Get units by department
 *     tags: [Units]
 *     description: Retrieve all units for a specific department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of units
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
 *                     $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Invalid department ID format
 *       500:
 *         description: Server error
 */
router.get('/department/:departmentId', getUnitsByDepartment);

/**
 * @swagger
 * /api/fire/units/{id}/activate:
 *   post:
 *     summary: Activate unit (set on duty)
 *     tags: [Units]
 *     description: Set a unit to active status. Only Operations department units can be activated. Only one unit can be active per department at a time.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit activated successfully
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
 *                   $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Unit cannot be activated (not Operations department or another unit is active)
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */
router.post('/:id/activate', activateUnit);

/**
 * @swagger
 * /api/fire/units/{id}/deactivate:
 *   post:
 *     summary: Deactivate unit (set off duty)
 *     tags: [Units]
 *     description: Set a unit to inactive status. Manual deactivation is only allowed after 7 AM the next day from activation. Units are automatically deactivated at 8 AM the next day.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit deactivated successfully
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
 *                   $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Unit cannot be deactivated yet (must be after 7 AM the next day)
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */
router.post('/:id/deactivate', deactivateUnit);

export default router;


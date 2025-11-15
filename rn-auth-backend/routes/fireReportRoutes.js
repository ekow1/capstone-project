import express from 'express';
import {
    createFireReport,
    getAllFireReports,
    getFireReportById,
    updateFireReport,
    deleteFireReport,
    getFireReportsByStation,
    getFireReportsByUser,
    getFireReportStats,
    
} from '../controllers/fireReportController.js';
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FireReport:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Fire report ID
 *           example: "507f1f77bcf86cd799439011"
 *         incidentType:
 *           type: string
 *           enum: [fire, rescue, medical, other]
 *           description: Type of incident
 *           example: "fire"
 *         incidentName:
 *           type: string
 *           description: Name/description of the incident
 *           example: "Building Fire at Central Market"
 *         location:
 *           type: object
 *           properties:
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 5.6037
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: -0.1870
 *             locationUrl:
 *               type: string
 *               example: "https://maps.google.com/?q=5.6037,-0.1870"
 *             locationName:
 *               type: string
 *               example: "Central Market, Accra"
 *         station:
 *           type: string
 *           description: Station ID
 *           example: "507f1f77bcf86cd799439011"
 *         department:
 *           type: string
 *           description: Department ID assigned to handle this report (automatically assigned to Operations department)
 *           example: "507f1f77bcf86cd799439012"
 *         unit:
 *           type: string
 *           description: Active unit ID assigned to handle this report (automatically assigned to active Operations unit)
 *           example: "507f1f77bcf86cd799439013"
 *         reporterId:
 *           type: string
 *           description: ID of the reporter (User or FirePersonnel)
 *           example: "507f1f77bcf86cd799439011"
 *         reporterType:
 *           type: string
 *           enum: [User, FirePersonnel]
 *           description: Type of reporter (automatically determined from ID)
 *           example: "User"
 *         reportedAt:
 *           type: string
 *           format: date-time
 *           description: When the report was created
 *         status:
 *           type: string
 *           enum: [pending, responding, resolved, closed]
 *           default: pending
 *           example: "pending"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: high
 *           example: "high"
 *         description:
 *           type: string
 *           description: Additional details about the incident
 *         estimatedCasualties:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         estimatedDamage:
 *           type: string
 *           enum: [minimal, moderate, severe, extensive]
 *           default: minimal
 *         assignedPersonnel:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of personnel IDs assigned to this report
 *         responseTime:
 *           type: number
 *           description: Response time in minutes
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: When the incident was resolved
 *         notes:
 *           type: string
 *           description: Additional notes
 *         dispatched:
 *           type: boolean
 *           description: Whether the active unit has dispatched to handle this report
 *           default: false
 *         dispatchedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the unit dispatched
 *         declined:
 *           type: boolean
 *           description: Whether the active unit has declined this report
 *           default: false
 *         declinedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the unit declined
 *         declineReason:
 *           type: string
 *           description: Reason for declining the report
 *         referred:
 *           type: boolean
 *           description: Whether the report has been referred to another station
 *           default: false
 *         referredAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the report was referred
 *         referredToStation:
 *           type: string
 *           description: Station ID that this report was referred to
 *         referReason:
 *           type: string
 *           description: Reason for referring the report to another station
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     FireReportCreateRequest:
 *       type: object
 *       required:
 *         - incidentType
 *         - incidentName
 *         - location
 *         - station
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the reporter (can be User ID or FirePersonnel ID - automatically detected)
 *           example: "507f1f77bcf86cd799439011"
 *         incidentType:
 *           type: string
 *           enum: [fire, rescue, medical, other]
 *           example: "fire"
 *         incidentName:
 *           type: string
 *           example: "Building Fire at Central Market"
 *         location:
 *           type: object
 *           required:
 *             - coordinates
 *           properties:
 *             coordinates:
 *               type: object
 *               required:
 *                 - latitude
 *                 - longitude
 *               properties:
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 5.6037
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: -0.1870
 *             locationUrl:
 *               type: string
 *               example: "https://maps.google.com/?q=5.6037,-0.1870"
 *             locationName:
 *               type: string
 *               example: "Central Market, Accra"
 *         station:
 *           oneOf:
 *             - type: string
 *               description: Station ObjectId
 *               example: "507f1f77bcf86cd799439011"
 *             - type: object
 *               description: Station object with details (will be used to find the station)
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Ghana Fire Service Station - Madina"
 *                 address:
 *                   type: string
 *                   example: "Madina"
 *                 latitude:
 *                   type: number
 *                   example: 5.6819121
 *                 longitude:
 *                   type: number
 *                   example: -0.172234
 *                 placeId:
 *                   type: string
 *                   example: "ChIJBw0DsOac3w8RKsKHDk7AVeU"
 *                 phone:
 *                   type: string
 *                   example: "030 250 1744"
 *         description:
 *           type: string
 *           example: "Fire reported in 3-story building"
 *         estimatedCasualties:
 *           type: number
 *           minimum: 0
 *           example: 0
 *         estimatedDamage:
 *           type: string
 *           enum: [minimal, moderate, severe, extensive]
 *           example: "moderate"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           example: "high"
 *         assignedPersonnel:
 *           type: array
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         notes:
 *           type: string
 *           example: "Multiple units responding"
 *     
 *     FireReportStats:
 *       type: object
 *       properties:
 *         totalReports:
 *           type: number
 *           example: 150
 *         pendingReports:
 *           type: number
 *           example: 5
 *         respondingReports:
 *           type: number
 *           example: 3
 *         resolvedReports:
 *           type: number
 *           example: 140
 *         closedReports:
 *           type: number
 *           example: 2
 *         highPriorityReports:
 *           type: number
 *           example: 25
 *         mediumPriorityReports:
 *           type: number
 *           example: 50
 *         lowPriorityReports:
 *           type: number
 *           example: 75
 *         fireIncidents:
 *           type: number
 *           example: 80
 *         rescueIncidents:
 *           type: number
 *           example: 30
 *         medicalIncidents:
 *           type: number
 *           example: 25
 *         otherIncidents:
 *           type: number
 *           example: 15
 */

/**
 * @swagger
 * tags:
 *   - name: Fire Reports
 *     description: Fire incident reporting and management
 */

/**
 * @swagger
 * /api/fire-reports:
 *   post:
 *     summary: Create a new fire report
 *     tags: [Fire Reports]
 *     description: Create a new fire incident report with location, station assignment, and priority. Automatically assigns to Operations department and active unit if available.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FireReportCreateRequest'
 *           example:
 *             incidentType: "fire"
 *             incidentName: "Building Fire at Central Market"
 *             location:
 *               coordinates:
 *                 latitude: 5.6037
 *                 longitude: -0.1870
 *               locationUrl: "https://maps.google.com/?q=5.6037,-0.1870"
 *               locationName: "Central Market, Accra"
 *             station:
 *               name: "Ghana Fire Service Station - Madina"
 *               address: "Madina"
 *               latitude: 5.6819121
 *               longitude: -0.172234
 *               placeId: "ChIJBw0DsOac3w8RKsKHDk7AVeU"
 *               phone: "030 250 1744"
 *             userId: "507f1f77bcf86cd799439011"
 *             description: "Fire reported in 3-story building"
 *             priority: "high"
 *     responses:
 *       201:
 *         description: Fire report created successfully
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
 *                   example: "Fire report created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FireReport'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', createFireReport);

/**
 * @swagger
 * /api/fire-reports:
 *   get:
 *     summary: Get all fire reports
 *     tags: [Fire Reports]
 *     description: Retrieve all fire reports with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, responding, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: station
 *         schema:
 *           type: string
 *         description: Filter by station ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Fire reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FireReport'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 15
 *                     total:
 *                       type: integer
 *                       example: 150
 *       500:
 *         description: Server error
 */
router.get('/',  getAllFireReports);

/**
 * @swagger
 * /api/fire-reports/stats:
 *   get:
 *     summary: Get fire report statistics
 *     tags: [Fire Reports]
 *     description: Get comprehensive statistics about fire reports
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *         description: Filter by station ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireReportStats'
 *       500:
 *         description: Server error
 */
router.get('/stats', getFireReportStats);

/**
 * @swagger
 * /api/fire-reports/station/{stationId}:
 *   get:
 *     summary: Get fire reports by station
 *     tags: [Fire Reports]
 *     description: Retrieve all fire reports for a specific station
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, responding, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Fire reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FireReport'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     total:
 *                       type: integer
 *                       example: 50
 *       400:
 *         description: Invalid station ID
 *       500:
 *         description: Server error
 */
router.get('/station/:stationId', getFireReportsByStation);

/**
 * @swagger
 * /api/fire-reports/user/{userId}:
 *   get:
 *     summary: Get fire reports by user
 *     tags: [Fire Reports]
 *     description: Retrieve all fire reports created by a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, responding, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Fire reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FireReport'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 3
 *                     total:
 *                       type: integer
 *                       example: 25
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', getFireReportsByUser);

/**
 * @swagger
 * /api/fire-reports/{id}:
 *   get:
 *     summary: Get fire report by ID
 *     tags: [Fire Reports]
 *     description: Retrieve a specific fire report by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fire report ID
 *     responses:
 *       200:
 *         description: Fire report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireReport'
 *       400:
 *         description: Invalid fire report ID
 *       404:
 *         description: Fire report not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getFireReportById);

/**
 * @swagger
 * /api/fire-reports/{id}:
 *   put:
 *     summary: Update fire report
 *     tags: [Fire Reports]
 *     description: Update an existing fire report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fire report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, responding, resolved, closed]
 *                 example: "responding"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "high"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               assignedPersonnel:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *               notes:
 *                 type: string
 *                 example: "Additional notes"
 *     responses:
 *       200:
 *         description: Fire report updated successfully
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
 *                   example: "Fire report updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FireReport'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Fire report not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateFireReport);

/**
 * @swagger
 * /api/fire-reports/{id}:
 *   delete:
 *     summary: Delete fire report
 *     tags: [Fire Reports]
 *     description: Delete a fire report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fire report ID
 *     responses:
 *       200:
 *         description: Fire report deleted successfully
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
 *                   example: "Fire report deleted successfully"
 *       400:
 *         description: Invalid fire report ID
 *       404:
 *         description: Fire report not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteFireReport);

export default router;

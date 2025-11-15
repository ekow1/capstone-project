import FireReport from '../models/FireReport.js';
import User from '../models/User.js';
import FirePersonnel from '../models/FirePersonnel.js';
import Department from '../models/Department.js';
import Unit from '../models/Unit.js';
import Station from '../models/Station.js';
import mongoose from 'mongoose';

// Create Fire Report
export const createFireReport = async (req, res) => {
    try {
        console.log('🚨 ===== FIRE REPORT CREATION STARTED =====');
        console.log('🚨 CREATE FIRE REPORT - Request Body:', JSON.stringify(req.body, null, 2));
        console.log('🚨 Request Headers:', {
            'Content-Type': req.headers['content-type'],
            'Authorization': req.headers.authorization ? 'Present' : 'Missing',
            'User-Agent': req.headers['user-agent']
        });
        
        const {
            incidentType,
            incidentName,
            location,
            station,
            userId,
            description,
            estimatedCasualties,
            estimatedDamage,
            priority
        } = req.body;

        // Log extracted values
        console.log('📋 Extracted values:', {
            incidentType,
            incidentName,
            location: location ? {
                hasCoordinates: !!location.coordinates,
                latitude: location.coordinates?.latitude,
                longitude: location.coordinates?.longitude,
                locationName: location.locationName,
                locationUrl: location.locationUrl
            } : null,
            station: station ? {
                type: typeof station,
                isObject: typeof station === 'object',
                hasPlaceId: !!station.placeId,
                hasCoordinates: !!(station.latitude && station.longitude),
                hasName: !!station.name
            } : null,
            userId,
            description,
            estimatedCasualties,
            estimatedDamage,
            priority
        });

        // Validate required fields
        console.log('🔍 Validating required fields...');
        if (!incidentType || !incidentName || !location || !station || !userId) {
            console.log('❌ Validation failed - missing required fields:', {
                incidentType: !!incidentType,
                incidentName: !!incidentName,
                location: !!location,
                station: !!station,
                userId: !!userId
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: incidentType, incidentName, location, station, userId'
            });
        }
        console.log('✅ Required fields validation passed');

        // Validate coordinates
        console.log('🔍 Validating location coordinates...');
        if (!location.coordinates || !location.coordinates.latitude || !location.coordinates.longitude) {
            console.log('❌ Coordinate validation failed:', {
                hasCoordinates: !!location.coordinates,
                latitude: location.coordinates?.latitude,
                longitude: location.coordinates?.longitude
            });
            return res.status(400).json({
                success: false,
                message: 'Location coordinates (latitude, longitude) are required'
            });
        }
        console.log('✅ Location coordinates validation passed');

        // Validate userId
        console.log('🔍 Validating userId format...');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('❌ Invalid userId format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        console.log('✅ UserId validation passed');

        // Determine reporter type - check if userId is a User or FirePersonnel
        console.log('🔍 Determining reporter type...');
        let reporterId = userId;
        let reporterType = null;
        
        const user = await User.findById(userId);
        if (user) {
            reporterType = 'User';
            console.log('✅ Reporter identified as: User');
        } else {
            const personnel = await FirePersonnel.findById(userId);
            if (personnel) {
                reporterType = 'FirePersonnel';
                console.log('✅ Reporter identified as: FirePersonnel');
            } else {
                console.log('❌ Reporter not found in either User or FirePersonnel');
                return res.status(404).json({
                    success: false,
                    message: 'User ID not found. The provided ID does not exist in Users or FirePersonnel'
                });
            }
        }

        // Handle station - could be ObjectId or station object
        console.log('🔍 Processing station data...');
        let stationId;
        
        if (typeof station === 'string') {
            // Station is already an ObjectId
            console.log('📍 Station provided as string (ObjectId)');
            if (!mongoose.Types.ObjectId.isValid(station)) {
                console.log('❌ Invalid station ObjectId format:', station);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid station ID format'
                });
            }
            stationId = station;
            console.log('✅ Using station ObjectId:', stationId);
        } else if (typeof station === 'object' && station !== null) {
            // Station is an object with station details - find the station
            console.log('📍 Station provided as object - searching for existing station...');
            console.log('🔍 Station object details:', {
                name: station.name,
                address: station.address,
                latitude: station.latitude,
                longitude: station.longitude,
                placeId: station.placeId,
                phone: station.phone
            });
            
            const Station = mongoose.model('Station');
            let foundStation = null;
            
            // Try to find by placeId first (most reliable)
            if (station.placeId) {
                console.log('🔍 Searching by placeId:', station.placeId);
                foundStation = await Station.findOne({ placeId: station.placeId });
                console.log('📍 Found station by placeId:', foundStation ? foundStation._id : 'Not found');
            }
            
            // If not found by placeId, try by coordinates
            if (!foundStation && station.latitude && station.longitude) {
                console.log('🔍 Searching by coordinates:', { lat: station.latitude, lng: station.longitude });
                foundStation = await Station.findOne({
                    lat: station.latitude,
                    lng: station.longitude
                });
                console.log('📍 Found station by coordinates:', foundStation ? foundStation._id : 'Not found');
            }
            
            // If still not found, try by name
            if (!foundStation && station.name) {
                console.log('🔍 Searching by name:', station.name);
                foundStation = await Station.findOne({
                    name: { $regex: new RegExp(station.name, 'i') }
                });
                console.log('📍 Found station by name:', foundStation ? foundStation._id : 'Not found');
            }
            
            if (!foundStation) {
                console.log('❌ Station not found with any method');
                console.log('🔍 Searched with:', {
                    placeId: station.placeId,
                    coordinates: station.latitude && station.longitude ? 'Yes' : 'No',
                    name: station.name
                });
                return res.status(404).json({
                    success: false,
                    message: 'Station not found. Please ensure the station exists in the system.',
                    providedStation: station
                });
            }
            
            stationId = foundStation._id;
            console.log('✅ Station found and linked:', {
                stationId: stationId,
                stationName: foundStation.name,
                stationLocation: foundStation.location
            });
        } else {
            console.log('❌ Invalid station format:', typeof station);
            return res.status(400).json({
                success: false,
                message: 'Station must be either a valid ObjectId or a station object with details'
            });
        }

        // Find Operations department and active unit
        console.log('🔍 Finding Operations department and active unit...');
        let operationsDepartment = null;
        let activeUnit = null;

        try {
            // Find Operations department
            operationsDepartment = await Department.findOne({ 
                name: { $regex: /^operations$/i } 
            });

            if (operationsDepartment) {
                console.log('✅ Operations department found:', operationsDepartment._id);

                // Find active unit in Operations department that has personnel at this station
                // First, find all personnel at this station
                const stationPersonnel = await FirePersonnel.find({ 
                    station_id: stationId 
                }).select('unit');

                const stationUnitIds = [...new Set(stationPersonnel.map(p => p.unit).filter(Boolean))];

                // Find active unit in Operations that has personnel at this station
                if (stationUnitIds.length > 0) {
                    activeUnit = await Unit.findOne({
                        department: operationsDepartment._id,
                        isActive: true,
                        _id: { $in: stationUnitIds }
                    });
                }

                // If no active unit found with station personnel, find any active unit in Operations
                if (!activeUnit) {
                    activeUnit = await Unit.findOne({
                        department: operationsDepartment._id,
                        isActive: true
                    });
                }

                if (activeUnit) {
                    console.log('✅ Active unit found:', activeUnit._id, activeUnit.name);
                } else {
                    console.log('⚠️ No active unit found in Operations department');
                }
            } else {
                console.log('⚠️ Operations department not found');
            }
        } catch (error) {
            console.error('⚠️ Error finding Operations department/unit:', error.message);
            // Continue without department/unit assignment - not critical
        }

        const fireReport = new FireReport({
            incidentType,
            incidentName,
            location,
            station: stationId,
            department: operationsDepartment?._id,
            unit: activeUnit?._id,
            reporterId,
            reporterType,
            description,
            estimatedCasualties,
            estimatedDamage,
            priority
        });

        console.log('📝 Creating fire report with data:', {
            incidentType: fireReport.incidentType,
            incidentName: fireReport.incidentName,
            station: fireReport.station,
            reporterId: fireReport.reporterId,
            reporterType: fireReport.reporterType,
            status: fireReport.status,
            priority: fireReport.priority,
            reportedAt: fireReport.reportedAt
        });

        await fireReport.save();
        
        console.log('✅ Fire report saved to database:', fireReport._id);
        
        // Populate related data
        console.log('🔗 Populating related data...');
        await fireReport.populate([
            { path: 'station', select: 'name location lat lng phone_number placeId' },
            { path: 'department', select: 'name description' },
            { path: 'unit', select: 'name isActive' },
            { path: 'referredStationDetails', select: 'name location lat lng phone_number placeId' },
            { 
                path: 'reporterDetails', 
                select: reporterType === 'User' ? 'name phone email' : 'name rank department unit role station' 
            }
        ]);

        console.log('✅ Fire report created successfully:', {
            reportId: fireReport._id,
            incidentType: fireReport.incidentType,
            incidentName: fireReport.incidentName,
            status: fireReport.status,
            priority: fireReport.priority,
            stationName: fireReport.station?.name,
            reporterType: fireReport.reporterType,
            reportedAt: fireReport.reportedAt
        });

        res.status(201).json({
            success: true,
            message: 'Fire report created successfully',
            data: fireReport
        });

        console.log('🚨 ===== FIRE REPORT CREATION COMPLETED =====');

    } catch (error) {
        console.error('❌ ===== FIRE REPORT CREATION ERROR =====');
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack trace
        });
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            console.error('❌ Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        console.error('❌ Unexpected error occurred during fire report creation');
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Fire Reports
export const getAllFireReports = async (req, res) => {
    try {
        const fireReports = await FireReport.find({})
            .populate('station', 'name location lat lng phone_number')
            .populate('reporterDetails')
            .populate('assignedPersonnel', 'name rank role')
            .sort({ reportedAt: -1 });

        const total = fireReports.length;

        res.json({
            success: true,
            data: fireReports,
            total
        });

    } catch (error) {
        console.error('❌ Get all fire reports error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Fire Report by ID
export const getFireReportById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        const fireReport = await FireReport.findById(id)
            .populate('station', 'name location lat lng phone_number')
            .populate('reporterDetails')
            .populate('assignedPersonnel', 'name rank role');

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        res.json({
            success: true,
            data: fireReport
        });

    } catch (error) {
        console.error('❌ Get fire report by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Fire Report
export const updateFireReport = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('🔄 UPDATE FIRE REPORT - ID:', id);
        console.log('📝 Update data:', updateData);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        // If updating status to resolved, set resolvedAt
        if (updateData.status === 'resolved' && !updateData.resolvedAt) {
            updateData.resolvedAt = new Date();
        }

        const fireReport = await FireReport.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'station', select: 'name location lat lng phone_number' },
            { path: 'reporterDetails' },
            { path: 'assignedPersonnel', select: 'name rank role' }
        ]);

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        console.log('✅ Fire report updated successfully:', fireReport._id);

        res.json({
            success: true,
            message: 'Fire report updated successfully',
            data: fireReport
        });

    } catch (error) {
        console.error('❌ Update fire report error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Fire Report
export const deleteFireReport = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        const fireReport = await FireReport.findByIdAndDelete(id);

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        console.log('🗑️ Fire report deleted successfully:', id);

        res.json({
            success: true,
            message: 'Fire report deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete fire report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Fire Reports by Station
export const getFireReportsByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const { status, priority, page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid station ID format'
            });
        }

        const filter = { station: stationId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const skip = (page - 1) * limit;

        const fireReports = await FireReport.find(filter)
            .populate('reporterDetails')
            .populate('assignedPersonnel', 'name rank role')
            .sort({ reportedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await FireReport.countDocuments(filter);

        res.json({
            success: true,
            data: fireReports,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('❌ Get fire reports by station error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Fire Reports by User
export const getFireReportsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reporter ID format'
            });
        }

        const filter = { reporterId: userId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const fireReports = await FireReport.find(filter)
            .populate('station', 'name location lat lng phone_number')
            .populate('assignedPersonnel', 'name rank role')
            .sort({ reportedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await FireReport.countDocuments(filter);

        res.json({
            success: true,
            data: fireReports,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('❌ Get fire reports by user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Fire Reports Statistics
export const getFireReportStats = async (req, res) => {
    try {
        const { stationId, startDate, endDate } = req.query;

        const filter = {};
        if (stationId) filter.station = stationId;
        if (startDate || endDate) {
            filter.reportedAt = {};
            if (startDate) filter.reportedAt.$gte = new Date(startDate);
            if (endDate) filter.reportedAt.$lte = new Date(endDate);
        }

        const stats = await FireReport.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalReports: { $sum: 1 },
                    pendingReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    respondingReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'responding'] }, 1, 0] }
                    },
                    resolvedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    closedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    highPriorityReports: {
                        $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                    },
                    mediumPriorityReports: {
                        $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
                    },
                    lowPriorityReports: {
                        $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
                    },
                    fireIncidents: {
                        $sum: { $cond: [{ $eq: ['$incidentType', 'fire'] }, 1, 0] }
                    },
                    rescueIncidents: {
                        $sum: { $cond: [{ $eq: ['$incidentType', 'rescue'] }, 1, 0] }
                    },
                    medicalIncidents: {
                        $sum: { $cond: [{ $eq: ['$incidentType', 'medical'] }, 1, 0] }
                    },
                    otherIncidents: {
                        $sum: { $cond: [{ $eq: ['$incidentType', 'other'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalReports: 0,
            pendingReports: 0,
            respondingReports: 0,
            resolvedReports: 0,
            closedReports: 0,
            highPriorityReports: 0,
            mediumPriorityReports: 0,
            lowPriorityReports: 0,
            fireIncidents: 0,
            rescueIncidents: 0,
            medicalIncidents: 0,
            otherIncidents: 0
        };

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Get fire report stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Dispatch Fire Report (active unit accepts and dispatches)
export const dispatchFireReport = async (req, res) => {
    try {
        const reportId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        // Find the fire report
        const fireReport = await FireReport.findById(reportId)
            .populate('unit')
            .populate('department');

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        // Check if report has been assigned to an active unit
        if (!fireReport.unit || !fireReport.unit.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Fire report must be assigned to an active unit before dispatch'
            });
        }

        // Check if report has already been dispatched, declined, or referred
        if (fireReport.dispatched) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been dispatched'
            });
        }

        if (fireReport.declined) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been declined. Cannot dispatch a declined report.'
            });
        }

        if (fireReport.referred) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been referred to another station. Cannot dispatch a referred report.'
            });
        }

        // Dispatch the report
        fireReport.dispatched = true;
        fireReport.dispatchedAt = new Date();
        fireReport.status = 'responding'; // Update status to responding
        await fireReport.save();

        // Populate related data
        await fireReport.populate([
            { path: 'station', select: 'name location lat lng phone_number placeId' },
            { path: 'department', select: 'name description' },
            { path: 'unit', select: 'name isActive' },
            { path: 'reporterDetails', select: 'name phone email' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Fire report dispatched successfully',
            data: fireReport
        });
    } catch (error) {
        console.error('❌ Dispatch fire report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Decline Fire Report (active unit declines)
export const declineFireReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { reason } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        // Validate reason is provided
        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Decline reason is required'
            });
        }

        // Find the fire report
        const fireReport = await FireReport.findById(reportId)
            .populate('unit')
            .populate('department');

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        // Check if report has been assigned to an active unit
        if (!fireReport.unit || !fireReport.unit.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Fire report must be assigned to an active unit before declining'
            });
        }

        // Check if report has already been dispatched, declined, or referred
        if (fireReport.dispatched) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been dispatched. Cannot decline a dispatched report.'
            });
        }

        if (fireReport.declined) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been declined'
            });
        }

        if (fireReport.referred) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been referred. Cannot decline a referred report.'
            });
        }

        // Decline the report
        fireReport.declined = true;
        fireReport.declinedAt = new Date();
        fireReport.declineReason = reason.trim();
        await fireReport.save();

        // Populate related data
        await fireReport.populate([
            { path: 'station', select: 'name location lat lng phone_number placeId' },
            { path: 'department', select: 'name description' },
            { path: 'unit', select: 'name isActive' },
            { path: 'reporterDetails', select: 'name phone email' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Fire report declined successfully',
            data: fireReport
        });
    } catch (error) {
        console.error('❌ Decline fire report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Refer Fire Report to Another Station
export const referFireReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { stationId, reason } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fire report ID format'
            });
        }

        // Validate stationId is provided
        if (!stationId) {
            return res.status(400).json({
                success: false,
                message: 'Station ID is required'
            });
        }

        // Validate stationId format
        if (!mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid station ID format'
            });
        }

        // Validate reason is provided
        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Refer reason is required'
            });
        }

        // Check if referred station exists
        const referredStation = await Station.findById(stationId);
        if (!referredStation) {
            return res.status(404).json({
                success: false,
                message: 'Referred station not found'
            });
        }

        // Find the fire report
        const fireReport = await FireReport.findById(reportId)
            .populate('unit')
            .populate('department');

        if (!fireReport) {
            return res.status(404).json({
                success: false,
                message: 'Fire report not found'
            });
        }

        // Check if report has been assigned to an active unit
        if (!fireReport.unit || !fireReport.unit.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Fire report must be assigned to an active unit before referring'
            });
        }

        // Check if trying to refer to the same station
        if (fireReport.station.toString() === stationId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot refer fire report to the same station'
            });
        }

        // Check if report has already been dispatched, declined, or referred
        if (fireReport.dispatched) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been dispatched. Cannot refer a dispatched report.'
            });
        }

        if (fireReport.declined) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been declined. Cannot refer a declined report.'
            });
        }

        if (fireReport.referred) {
            return res.status(400).json({
                success: false,
                message: 'Fire report has already been referred to another station'
            });
        }

        // Refer the report
        fireReport.referred = true;
        fireReport.referredAt = new Date();
        fireReport.referredToStation = stationId;
        fireReport.referReason = reason.trim();
        // Update the station to the referred station
        fireReport.station = stationId;
        // Clear unit assignment as it will be reassigned by the new station
        fireReport.unit = null;
        fireReport.department = null;
        await fireReport.save();

        // Populate related data
        await fireReport.populate([
            { path: 'station', select: 'name location lat lng phone_number placeId' },
            { path: 'department', select: 'name description' },
            { path: 'unit', select: 'name isActive' },
            { path: 'referredStationDetails', select: 'name location lat lng phone_number placeId' },
            { path: 'reporterDetails', select: 'name phone email' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Fire report referred successfully',
            data: fireReport
        });
    } catch (error) {
        console.error('❌ Refer fire report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

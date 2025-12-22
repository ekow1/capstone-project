import FirePersonnel from '../models/FirePersonnel.js';
import Unit from '../models/Unit.js';
import Department from '../models/Department.js';
import Station from '../models/Station.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to extract user ID from token
const getUserIdFromToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.fire_personnel_token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// Create FirePersonnel
export const createFirePersonnel = async (req, res) => {
    try {
        const { serviceNumber, name, rank, unit, department, role, station_id, tempPassword } = req.body;
        
        if (!serviceNumber || !station_id || !department) {
            return res.status(400).json({
                success: false,
                message: 'Service number, station_id, and department are required'
            });
        }
        
        // Generate temporary password if not provided
        let generatedTempPassword = tempPassword;
        if (!generatedTempPassword) {
            // Generate a random 8-character password
            generatedTempPassword = Math.random().toString(36).slice(-8).toUpperCase();
        }
        
        // Hash the temporary password
        const hashedTempPassword = await bcrypt.hash(generatedTempPassword, 10);
        
        // Set expiry for 7 days from now
        const tempPasswordExpiry = new Date();
        tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 7);

        // Validate station_id
        if (!mongoose.Types.ObjectId.isValid(station_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid station_id format'
            });
        }

        // Check if station exists
        const stationDoc = await Station.findById(station_id);
        if (!stationDoc) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        // Validate department
        if (!mongoose.Types.ObjectId.isValid(department)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department format'
            });
        }

        const departmentDoc = await Department.findById(department);
        if (!departmentDoc) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Validate that department belongs to the station
        if (departmentDoc.station_id.toString() !== station_id) {
            return res.status(400).json({
                success: false,
                message: 'Department does not belong to the specified station'
            });
        }

        // Validate unit if provided
        if (unit) {
            if (!mongoose.Types.ObjectId.isValid(unit)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid unit format'
                });
            }

            const unitDoc = await Unit.findById(unit);
            if (!unitDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Unit not found'
                });
            }

            // Validate that unit belongs to the specified department
            if (unitDoc.department.toString() !== department) {
                return res.status(400).json({
                    success: false,
                    message: 'Unit does not belong to the specified department'
                });
            }
        }

        const personnel = new FirePersonnel({
            serviceNumber,
            name, 
            rank, 
            unit, 
            department,
            role: role || 'Officer in charge (OIC)', 
            station_id, 
            tempPassword: hashedTempPassword,
            tempPasswordExpiry: tempPasswordExpiry,
            passwordResetRequired: true
        });
        await personnel.save();

        const populatedPersonnel = await FirePersonnel.findById(personnel._id)
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id');

        res.status(201).json({
            success: true,
            message: 'Fire personnel created successfully. Temporary password set for 7 days.',
            data: populatedPersonnel,
            tempPassword: generatedTempPassword, // Return the plain text temp password so admin can share it
            tempPasswordExpiry: tempPasswordExpiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All FirePersonnel
export const getAllFirePersonnel = async (req, res) => {
    try {
        const { unit, department, station_id, rank } = req.query;
        const filter = {};

        if (unit) filter.unit = unit;
        if (department) {
            if (!mongoose.Types.ObjectId.isValid(department)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department format'
                });
            }
            filter.department = department;
        }
        if (station_id) {
            if (!mongoose.Types.ObjectId.isValid(station_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid station_id format'
                });
            }
            filter.station_id = station_id;
        }
        if (rank) filter.rank = rank;

        const personnel = await FirePersonnel.find(filter)
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: personnel.length,
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Current FirePersonnel (Me)
export const getCurrentFirePersonnel = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Invalid or missing token' 
            });
        }

        const personnel = await FirePersonnel.findById(userId)
            .select('-password -tempPassword')
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id');

        if (!personnel) {
            return res.status(404).json({ 
                success: false, 
                message: 'Fire personnel not found' 
            });
        }

        // Calculate requiresPasswordReset flag - check if tempPassword exists by querying again
        const personnelWithTemp = await FirePersonnel.findById(userId)
            .select('+tempPassword');
        const requiresPasswordReset = personnel.passwordResetRequired || !!personnelWithTemp?.tempPassword;

        // Include passwordResetRequired in the response data
        const responseData = personnel.toObject();
        responseData.passwordResetRequired = requiresPasswordReset;

        res.status(200).json({ 
            success: true, 
            data: responseData,
            requiresPasswordReset
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get FirePersonnel By ID
export const getFirePersonnelById = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid personnel ID format'
            });
        }

        const personnel = await FirePersonnel.findById(req.params.id)
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id');

        if (!personnel) {
            return res.status(404).json({
                success: false,
                message: 'Fire personnel not found'
            });
        }

        res.status(200).json({
            success: true,
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update FirePersonnel
export const updateFirePersonnel = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid personnel ID format'
            });
        }

        // Get current personnel to check existing values
        const currentPersonnel = await FirePersonnel.findById(req.params.id);
        if (!currentPersonnel) {
            return res.status(404).json({
                success: false,
                message: 'Fire personnel not found'
            });
        }

        const { unit, department, station_id, role } = req.body;
        
        // Determine the station_id to use (new or existing)
        const targetStationId = station_id || currentPersonnel.station_id;
        const targetDepartment = department || currentPersonnel.department;
        const targetUnit = unit || currentPersonnel.unit;

        // Validate station_id if provided
        if (station_id) {
            if (!mongoose.Types.ObjectId.isValid(station_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid station_id format'
                });
            }

            // Check if station exists
            const stationDoc = await Station.findById(station_id);
            if (!stationDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Station not found'
                });
            }
        }

        // Validate department if provided
        if (department) {
            if (!mongoose.Types.ObjectId.isValid(department)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department format'
                });
            }

            const departmentDoc = await Department.findById(department);
            if (!departmentDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            // Validate that department belongs to the target station
            if (departmentDoc.station_id.toString() !== targetStationId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Department does not belong to the specified station'
                });
            }
        } else if (station_id) {
            // If station_id is being updated but department is not, validate existing department belongs to new station
            const departmentDoc = await Department.findById(currentPersonnel.department);
            if (departmentDoc && departmentDoc.station_id.toString() !== station_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Current department does not belong to the new station. Please update department as well.'
                });
            }
        }

        // Validate unit if provided
        if (unit) {
            if (!mongoose.Types.ObjectId.isValid(unit)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid unit format'
                });
            }

            const unitDoc = await Unit.findById(unit);
            if (!unitDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Unit not found'
                });
            }

            // Validate that unit belongs to the target department
            if (unitDoc.department.toString() !== targetDepartment.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Unit does not belong to the specified department'
                });
            }
        } else if (department) {
            // If department is being updated but unit is not, validate existing unit belongs to new department
            if (currentPersonnel.unit) {
                const unitDoc = await Unit.findById(currentPersonnel.unit);
                if (unitDoc && unitDoc.department.toString() !== department) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current unit does not belong to the new department. Please update unit as well.'
                    });
                }
            }
        }

        // Handle role as string
        const updateData = { ...req.body };
        if (role !== undefined) {
            updateData.role = role || 'Officer in charge (OIC)';
        }

        const personnel = await FirePersonnel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('rank')
        .populate({
            path: 'unit',
            populate: { path: 'department' }
        })
        .populate('department')
        .populate('station_id');

        if (!personnel) {
            return res.status(404).json({
                success: false,
                message: 'Fire personnel not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fire personnel updated successfully',
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete FirePersonnel
export const deleteFirePersonnel = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid personnel ID format'
            });
        }

        const personnel = await FirePersonnel.findByIdAndDelete(req.params.id);

        if (!personnel) {
            return res.status(404).json({
                success: false,
                message: 'Fire personnel not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fire personnel deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Personnel by Unit
export const getPersonnelByUnit = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.unitId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid unit ID format'
            });
        }

        const personnel = await FirePersonnel.find({ unit: req.params.unitId })
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: personnel.length,
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Personnel by Department
export const getPersonnelByDepartment = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.departmentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID format'
            });
        }

        // Find personnel directly by department
        const personnel = await FirePersonnel.find({ department: req.params.departmentId })
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: personnel.length,
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Personnel by Station
export const getPersonnelByStation = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.stationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid station ID format'
            });
        }

        const personnel = await FirePersonnel.find({ station_id: req.params.stationId })
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: personnel.length,
            data: personnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login Fire Personnel
export const loginFirePersonnel = async (req, res) => {
    try {
        const { serviceNumber, password } = req.body || {};

        console.log('serviceNumber', serviceNumber);
        console.log('password', password);


        if (!serviceNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Service number and password are required'
            });
        }

        console.log('serviceNumber', serviceNumber);
        console.log('password', password);

        // Normalize serviceNumber - trim and ensure consistent format
        const normalizedServiceNumber = String(serviceNumber || '').trim();

        // Find personnel by serviceNumber (case-insensitive if needed, but serviceNumber should be exact)
        const personnel = await FirePersonnel.findOne({ 
            serviceNumber: normalizedServiceNumber 
        })
            .select('+password +tempPassword +tempPasswordExpiry +passwordResetRequired')
            .populate('rank')
            .populate({
                path: 'unit',
                populate: { path: 'department' }
            })
            .populate('department')
            .populate('station_id');

        if (!personnel) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        let isValidPassword = false;
        let requiresPasswordReset = false;
        let isUsingTempPassword = false;
        let tempPasswordExpired = false;
        const passwordToCompare = String(password || '').trim();

        // Debug: Log password fields (remove in production)
        console.log('Login attempt:', {
            serviceNumber: normalizedServiceNumber,
            hasPassword: !!personnel.password,
            hasTempPassword: !!personnel.tempPassword,
            tempPasswordExpiry: personnel.tempPasswordExpiry,
            passwordResetRequired: personnel.passwordResetRequired
        });

        // Step 1: Check regular password if it exists
        let isRegularPasswordValid = false;
        if (personnel.password && typeof personnel.password === 'string' && personnel.password.length > 0) {
            try {
                isRegularPasswordValid = await bcrypt.compare(passwordToCompare, personnel.password);
                if (isRegularPasswordValid) {
                    isValidPassword = true;
                }
            } catch (error) {
                console.error('Error comparing regular password:', error);
            }
        }

        // Step 2: Check temp password if it exists (always check BOTH before deciding)
        let isTempPasswordValid = false;
        if (personnel.tempPassword && typeof personnel.tempPassword === 'string' && personnel.tempPassword.length > 0) {
            // Check if temp password expired
            if (personnel.tempPasswordExpiry && new Date(personnel.tempPasswordExpiry) < new Date()) {
                tempPasswordExpired = true;
            } else {
                // Check temp password
                try {
                    isTempPasswordValid = await bcrypt.compare(passwordToCompare, personnel.tempPassword);
                    if (isTempPasswordValid) {
                        isValidPassword = true;
                        isUsingTempPassword = true;
                        requiresPasswordReset = true;
                    }
                } catch (error) {
                    console.error('Error comparing temp password:', error);
                }
            }
        }

        // Step 3: Only after checking BOTH passwords, decide on response
        if (!isValidPassword) {
            // Neither password matched - check which error to return
            if (tempPasswordExpired && !isRegularPasswordValid) {
                return res.status(403).json({
                    success: false,
                    message: 'Temporary password has expired. Please request a new one.'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        }

        // Set requiresPasswordReset flag
        if (isUsingTempPassword) {
            requiresPasswordReset = true;
        } else {
            requiresPasswordReset = personnel.passwordResetRequired || false;
        }

        const token = jwt.sign(
            {
                id: personnel._id,
                serviceNumber: personnel.serviceNumber,
                role: 'fire_personnel'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('fire_personnel_token', token, {
            httpOnly: true,
            secure: false, // Changed to match station admin
            sameSite: 'lax', // Changed to match station admin
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const responseData = personnel.toObject();
        delete responseData.password;
        delete responseData.tempPassword;
        delete responseData.tempPasswordExpiry;

        res.status(200).json({
            success: true,
            message: requiresPasswordReset
                ? 'Login successful. Please reset your password.'
                : 'Login successful.',
            token,
            requiresPasswordReset,
            data: responseData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Logout Fire Personnel
export const logoutFirePersonnel = (req, res) => {
    res.clearCookie('fire_personnel_token', {
        httpOnly: true,
        secure: false, // Changed to match station admin
        sameSite: 'lax' // Changed to match station admin
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Change Password / Set Password (for temp password reset)
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password is required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters long' 
            });
        }

        const personnel = await FirePersonnel.findById(req.params.id)
            .select('+password +tempPassword +tempPasswordExpiry +passwordResetRequired');

        if (!personnel) {
            return res.status(404).json({ 
                success: false, 
                message: 'Fire personnel not found' 
            });
        }

        // If oldPassword is provided, verify it (for password change)
        // If not provided, check if temp password exists (for initial password setup)
        if (oldPassword) {
            let isValidPassword = false;
            
            // Check regular password
            if (personnel.password) {
                isValidPassword = await bcrypt.compare(oldPassword, personnel.password);
            }
            
            // Check temp password if regular password doesn't match
            if (!isValidPassword && personnel.tempPassword) {
                if (personnel.tempPasswordExpiry && personnel.tempPasswordExpiry < new Date()) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Temporary password has expired. Please request a new one.' 
                    });
                }
                isValidPassword = await bcrypt.compare(oldPassword, personnel.tempPassword);
            }
            
            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Old password is incorrect' 
                });
            }
        } else {
            // No oldPassword provided - check if password reset is required
            if (!personnel.passwordResetRequired && !personnel.tempPassword) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Old password is required for password change' 
                });
            }
        }

        // Hash and update new password
        personnel.password = await bcrypt.hash(newPassword, 10);
        // Clear temp password and reset flag
        personnel.tempPassword = undefined;
        personnel.tempPasswordExpiry = undefined;
        personnel.passwordResetRequired = false;
        await personnel.save();

        res.status(200).json({ 
            success: true, 
            message: 'Password set successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


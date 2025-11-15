import StationAdmin from '../models/StationAdmin.js';
import Station from '../models/Station.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to extract user ID from token
const getUserIdFromToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.station_admin_token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// Register StationAdmin
export const createStationAdmin = async (req, res) => {
    try {
        const { username, tempPassword, name, email, station_id } = req.body || {};

        if (!username || !email || !station_id || !tempPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'username, email, station_id, and tempPassword are required' 
            });
        }

        // Verify station exists
        const station = await Station.findById(station_id);
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station not found' 
            });
        }

        // Hash the temporary password
        const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
        
        // Set expiry for 7 days from now
        const tempPasswordExpiry = new Date();
        tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 7);

        // Create admin with ONLY tempPassword - do NOT set password field
        const stationAdmin = new StationAdmin({ 
            username: username.toLowerCase(),
            tempPassword: hashedTempPassword,
            tempPasswordExpiry: tempPasswordExpiry,
            passwordResetRequired: true,
            name,
            email: email.toLowerCase(),
            station_id,
            role: 'station_admin'
        });
        
        // Explicitly ensure password field is not set (remove if it exists)
        delete stationAdmin.password;
        
        await stationAdmin.save();

        // Return admin data without password
        const adminData = await StationAdmin.findById(stationAdmin._id)
            .select('-password -tempPassword')
            .populate('station_id');

        res.status(201).json({ 
            success: true, 
            message: 'Station admin created successfully. Temporary password set for 7 days.', 
            data: adminData,
            tempPassword: tempPassword, // Return the plain text temp password so admin can share it
            tempPasswordExpiry: tempPasswordExpiry
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Login StationAdmin
export const loginStationAdmin = async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find admin by username and include password fields
        const admin = await StationAdmin.findOne({ username: username.toLowerCase() })
            .select('+password +tempPassword +tempPasswordExpiry +passwordResetRequired');
        console.log('admin', admin);
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }



        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is deactivated' 
            });
        }

        let isValidPassword = false;
        let requiresPasswordReset = false;
        let isUsingTempPassword = false;
        let tempPasswordExpired = false;
        const passwordToCompare = String(password || '').trim();

        // Step 1: Check regular password if it exists
        let isRegularPasswordValid = false;
        if (admin.password && typeof admin.password === 'string') {
            isRegularPasswordValid = await bcrypt.compare(passwordToCompare, admin.password);
            if (isRegularPasswordValid) {
                isValidPassword = true;
            }
        }

        // Step 2: Check temp password if it exists (always check BOTH before deciding)
        let isTempPasswordValid = false;
        if (admin.tempPassword && typeof admin.tempPassword === 'string') {
            // Check if temp password expired
            if (admin.tempPasswordExpiry && new Date(admin.tempPasswordExpiry) < new Date()) {
                tempPasswordExpired = true;
            } else {
                // Check temp password
                isTempPasswordValid = await bcrypt.compare(passwordToCompare, admin.tempPassword);
                if (isTempPasswordValid) {
                    isValidPassword = true;
                    isUsingTempPassword = true;
                    requiresPasswordReset = true;
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
            requiresPasswordReset = admin.passwordResetRequired || false;
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role || 'station_admin', station_id: admin.station_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return token and admin data without password fields
        const adminData = await StationAdmin.findById(admin._id)
            .select('-password -tempPassword')
            .populate('station_id');

        res.cookie('station_admin_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const responseData = adminData.toObject();
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

// Logout StationAdmin
export const logoutStationAdmin = (req, res) => {
    res.clearCookie('station_admin_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Get All StationAdmins
export const getAllStationAdmins = async (req, res) => {
    try {
        const { isActive, station_id } = req.query;
        const filter = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (station_id !== undefined) filter.station_id = station_id;

        const admins = await StationAdmin.find(filter)
            .select('-password')
            .populate('station_id')
            .sort({ name: 1 });
        
        res.status(200).json({ 
            success: true, 
            count: admins.length, 
            data: admins 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Current StationAdmin (Me)
export const getCurrentStationAdmin = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Invalid or missing token' 
            });
        }

        const admin = await StationAdmin.findById(userId)
            .select('-password -tempPassword')
            .populate('station_id');

        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        // Calculate requiresPasswordReset flag - check if tempPassword exists by querying again
        const adminWithTemp = await StationAdmin.findById(userId)
            .select('+tempPassword');
        const requiresPasswordReset = admin.passwordResetRequired || !!adminWithTemp?.tempPassword;

        // Include passwordResetRequired in the response data
        const responseData = admin.toObject();
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

// Get StationAdmin By ID
export const getStationAdminById = async (req, res) => {
    try {
        const admin = await StationAdmin.findById(req.params.id)
            .select('-password')
            .populate('station_id');

        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: admin 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update StationAdmin
export const updateStationAdmin = async (req, res) => {
    try {
        const { username, password, name, email, station_id, isActive } = req.body;
        const updates = {};

        // Only update provided fields
        if (username !== undefined) updates.username = username.toLowerCase();
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email.toLowerCase();
        if (station_id !== undefined) {
            // Verify station exists
            const station = await Station.findById(station_id);
            if (!station) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Station not found' 
                });
            }
            updates.station_id = station_id;
        }
        if (isActive !== undefined) updates.isActive = isActive;

        // Hash new password if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 6 characters long' 
                });
            }
            updates.password = await bcrypt.hash(password, 10);
        }

        const admin = await StationAdmin.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
        .select('-password')
        .populate('station_id');

        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Station admin updated successfully', 
            data: admin 
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete StationAdmin
export const deleteStationAdmin = async (req, res) => {
    try {
        const admin = await StationAdmin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Station admin deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Change Password / Set Password (for temp password reset)
// Reset Temp Password (Admin function to set a new temp password)
export const resetTempPassword = async (req, res) => {
    try {
        const { newTempPassword } = req.body;
        const adminId = req.params.id;

        if (!newTempPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'New temporary password is required' 
            });
        }

        const admin = await StationAdmin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        // Hash the new temp password
        const hashedTempPassword = await bcrypt.hash(newTempPassword, 10);
        
        // Set expiry for 7 days from now
        const tempPasswordExpiry = new Date();
        tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 7);

        // Update the admin
        admin.tempPassword = hashedTempPassword;
        admin.tempPasswordExpiry = tempPasswordExpiry;
        admin.passwordResetRequired = true;
        await admin.save();

        res.status(200).json({ 
            success: true, 
            message: 'Temporary password reset successfully',
            tempPassword: newTempPassword, // Return plain text so admin can share it
            tempPasswordExpiry: tempPasswordExpiry
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

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

        const admin = await StationAdmin.findById(req.params.id)
            .select('+password +tempPassword +tempPasswordExpiry +passwordResetRequired');

        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station admin not found' 
            });
        }

        // Always require oldPassword to verify identity
        if (!oldPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Old password is required' 
            });
        }

        console.log('oldPassword', oldPassword);
        console.log('admin.password', admin.password);
        console.log('admin.tempPassword', admin.tempPassword);
        console.log('admin.tempPasswordExpiry', admin.tempPasswordExpiry);

        // Verify old password - check both regular and temp password
        let isValidOldPassword = false;
        const passwordToCompare = String(oldPassword || '').trim();
        
        // Check regular password first
        if (admin.password && typeof admin.password === 'string') {
            isValidOldPassword = await bcrypt.compare(passwordToCompare, admin.password);
        }
        
        // Check temp password if regular password didn't match
        if (!isValidOldPassword && admin.tempPassword && typeof admin.tempPassword === 'string') {
            // Check if temp password expired
            if (admin.tempPasswordExpiry && new Date(admin.tempPasswordExpiry) < new Date()) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Temporary password has expired. Please request a new one.' 
                });
            }
            isValidOldPassword = await bcrypt.compare(passwordToCompare, admin.tempPassword);
        }
           
        console.log('isValidOldPassword', isValidOldPassword);


        // If old password doesn't match, return error
        if (!isValidOldPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Old password is incorrect' 
            });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update: Set regular password and remove temp password
        admin.password = hashedNewPassword;
        admin.tempPassword = undefined;
        admin.tempPasswordExpiry = undefined;
        admin.passwordResetRequired = false;
        await admin.save();

        res.status(200).json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Station Admins by Station ID
export const getStationAdminsByStation = async (req, res) => {
    try {
        const { station_id } = req.params;
        const { isActive } = req.query;
        const filter = { station_id };

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Verify station exists
        const station = await Station.findById(station_id);
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station not found' 
            });
        }

        const admins = await StationAdmin.find(filter)
            .select('-password')
            .populate('station_id')
            .sort({ name: 1 });
        
        res.status(200).json({ 
            success: true, 
            count: admins.length, 
            data: admins 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


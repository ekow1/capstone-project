import Department from '../models/Department.js';
import Station from '../models/Station.js';
import mongoose from 'mongoose';

// Create Department
export const createDepartment = async (req, res) => {
    try {
        const { name, description, station_id } = req.body;

        if (!name || !station_id) {
            return res.status(400).json({
                success: false,
                message: 'Department name and station_id are required'
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

        const department = new Department({ name, description, station_id });
        await department.save();

        const populatedDepartment = await Department.findById(department._id)
            .populate('station_id')
            .populate('units');

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: populatedDepartment
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department name already exists for this station'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Departments
export const getAllDepartments = async (req, res) => {
    try {
        const { station_id } = req.query;
        const filter = {};
        
        // Filter by station if provided
        if (station_id) {
            filter.station_id = station_id;
        }

        const departments = await Department.find(filter)
            .populate('station_id')
            .populate('units')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Department By ID
export const getDepartmentById = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID format'
            });
        }

        const department = await Department.findById(req.params.id)
            .populate('station_id')
            .populate('units');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Department
export const updateDepartment = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID format'
            });
        }

        const { name, description, station_id } = req.body;
        const updates = {};

        // Only update provided fields
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (station_id !== undefined) {
            // Verify station exists if station_id is being updated
            const station = await Station.findById(station_id);
            if (!station) {
                return res.status(404).json({
                    success: false,
                    message: 'Station not found'
                });
            }
            updates.station_id = station_id;
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
        .populate('station_id')
        .populate('units');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department name already exists for this station'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID format'
            });
        }

        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Departments by Station ID
export const getDepartmentsByStation = async (req, res) => {
    try {
        const { stationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid station ID format'
            });
        }

        // Verify station exists
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        const departments = await Department.find({ station_id: stationId })
            .populate('station_id')
            .populate('units')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



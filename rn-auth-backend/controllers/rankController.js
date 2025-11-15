import Rank from '../models/Rank.js';

// Create Rank
export const createRank = async (req, res) => {
    try {
        const { name, initials, level, group, gender, description } = req.body;

        if (!name || !initials || !group) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rank name, initials, and group are required' 
            });
        }

        // Validate group
        if (!['junior', 'senior'].includes(group)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group must be either "junior" or "senior"' 
            });
        }

        // Validate gender for junior ranks
        if (group === 'junior' && !gender) {
            return res.status(400).json({ 
                success: false, 
                message: 'Gender is required for junior ranks' 
            });
        }

        // Senior ranks should not have gender
        if (group === 'senior' && gender) {
            return res.status(400).json({ 
                success: false, 
                message: 'Senior ranks should not have a gender specified' 
            });
        }

        const rank = new Rank({ 
            name, 
            initials: initials.toUpperCase(), 
            level, 
            group,
            gender: group === 'senior' ? null : gender,
            description 
        });
        await rank.save();

        res.status(201).json({ 
            success: true, 
            message: 'Rank created successfully', 
            data: rank 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rank name or initials already exists' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get All Ranks
export const getAllRanks = async (req, res) => {
    try {
        const { group, gender } = req.query;
        const filter = {};

        // Filter by group if provided
        if (group) {
            if (!['junior', 'senior'].includes(group)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Group must be either "junior" or "senior"' 
                });
            }
            filter.group = group;
        }

        // Filter by gender if provided
        if (gender) {
            if (!['male', 'female'].includes(gender)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gender must be either "male" or "female"' 
                });
            }
            filter.gender = gender;
        }

        const ranks = await Rank.find(filter).sort({ level: 1, name: 1 });
        
        res.status(200).json({ 
            success: true, 
            count: ranks.length, 
            data: ranks 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Rank By ID
export const getRankById = async (req, res) => {
    try {
        const rank = await Rank.findById(req.params.id);

        if (!rank) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rank not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: rank 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update Rank
export const updateRank = async (req, res) => {
    try {
        const { name, initials, level, group, gender, description } = req.body;
        const updates = { name, level, description };
        
        if (initials) {
            updates.initials = initials.toUpperCase();
        }

        if (group) {
            // Validate group
            if (!['junior', 'senior'].includes(group)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Group must be either "junior" or "senior"' 
                });
            }
            updates.group = group;

            // Validate gender based on group
            if (group === 'junior' && !gender) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gender is required for junior ranks' 
                });
            }
            if (group === 'senior') {
                updates.gender = null;
            } else if (gender) {
                updates.gender = gender;
            }
        } else if (gender) {
            // If updating gender without group, check existing rank
            const existingRank = await Rank.findById(req.params.id);
            if (!existingRank) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Rank not found' 
                });
            }
            if (existingRank.group === 'senior') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Senior ranks cannot have a gender specified' 
                });
            }
            updates.gender = gender;
        }

        const rank = await Rank.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!rank) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rank not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Rank updated successfully', 
            data: rank 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rank name or initials already exists' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete Rank
export const deleteRank = async (req, res) => {
    try {
        const rank = await Rank.findByIdAndDelete(req.params.id);

        if (!rank) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rank not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Rank deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};



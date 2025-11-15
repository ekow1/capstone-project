import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
        unique: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for units that have this group
// Groups are no longer linked to units, so virtual removed

// Indexes for efficient queries
groupSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Group', groupSchema);


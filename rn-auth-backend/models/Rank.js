import mongoose from 'mongoose';

const rankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Rank name is required'],
        unique: true,
        trim: true
    },
    initials: {
        type: String,
        required: [true, 'Rank initials are required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    level: {
        type: Number,
        default: 0
    },
    group: {
        type: String,
        enum: ['junior', 'senior'],
        required: [true, 'Rank group is required'],
        trim: true
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female'],
            message: 'Gender must be either male or female'
        },
        required: false,
        default: null,
        description: 'Gender-specific rank (for junior ranks only, null for senior ranks)'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        description: 'Description of the rank'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for fire personnel with this rank
rankSchema.virtual('personnel', {
    ref: 'FirePersonnel',
    localField: '_id',
    foreignField: 'rank',
    options: { sort: { name: 1 } }
});

// Indexes for efficient queries
rankSchema.index({ name: 1 }); // Index for name lookups
rankSchema.index({ level: 1 }); // Index for level-based queries
rankSchema.index({ group: 1 }); // Index for group-based queries
rankSchema.index({ group: 1, gender: 1 }); // Compound index for group and gender queries

export default mongoose.model('Rank', rankSchema);



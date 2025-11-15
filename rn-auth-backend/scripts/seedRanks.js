import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rank from '../models/Rank.js';

dotenv.config();

// Senior Ranks (GNFS Official Structure - gender: null)
const seniorRanks = [
    {
        name: 'Chief Fire Officer',
        initials: 'CFO',
        level: 1,
        group: 'senior',
        gender: null,
        description: 'Chief Fire Officer - Highest rank in GNFS (Ghana National Fire Service)'
    },
    {
        name: 'Deputy Chief Fire Officer',
        initials: 'DCFO',
        level: 2,
        group: 'senior',
        gender: null,
        description: 'Deputy Chief Fire Officer - Second highest rank in GNFS'
    },
    {
        name: 'Assistant Chief Fire Officer',
        initials: 'ACFO',
        level: 3,
        group: 'senior',
        gender: null,
        description: 'Assistant Chief Fire Officer - Third highest rank in GNFS'
    },
    {
        name: 'Divisional Officer Grade One',
        initials: 'DO I',
        level: 4,
        group: 'senior',
        gender: null,
        description: 'Divisional Officer Grade One - Senior divisional officer in GNFS'
    },
    {
        name: 'Divisional Officer Grade Two',
        initials: 'DO II',
        level: 5,
        group: 'senior',
        gender: null,
        description: 'Divisional Officer Grade Two - Mid-level divisional officer in GNFS'
    },
    {
        name: 'Divisional Officer Grade Three',
        initials: 'DO III',
        level: 6,
        group: 'senior',
        gender: null,
        description: 'Divisional Officer Grade Three - Entry-level divisional officer in GNFS'
    },
    {
        name: 'Assistant Divisional Officer Grade One',
        initials: 'ADO I',
        level: 7,
        group: 'senior',
        gender: null,
        description: 'Assistant Divisional Officer Grade One - Senior assistant divisional officer in GNFS'
    },
    {
        name: 'Assistant Divisional Officer Grade Two',
        initials: 'ADO II',
        level: 8,
        group: 'senior',
        gender: null,
        description: 'Assistant Divisional Officer Grade Two - Entry-level assistant divisional officer in GNFS'
    },
    {
        name: 'Cadet Officer',
        initials: 'CO',
        level: 9,
        group: 'senior',
        gender: null,
        description: 'Cadet Officer - Entry-level officer rank in GNFS'
    }
];

// Junior Ranks - Male (GNFS Official Structure)
// Ordered from highest (level 10) to lowest (level 17)
const juniorRanksMale = [
    {
        name: 'Station Officer Grade One',
        initials: 'STN/OI',
        level: 10,
        group: 'junior',
        gender: 'male',
        description: 'Station Officer Grade One - Highest rank in the Junior Officers corps for male personnel (GNFS)'
    },
    {
        name: 'Station Officer Grade Two',
        initials: 'STN/OII',
        level: 11,
        group: 'junior',
        gender: 'male',
        description: 'Station Officer Grade Two - Second grade station officer for male personnel (GNFS)'
    },
    {
        name: 'Assistant Station Officer',
        initials: 'ASO',
        level: 12,
        group: 'junior',
        gender: 'male',
        description: 'Assistant Station Officer - Assistant station officer rank for male personnel (GNFS)'
    },
    {
        name: 'Subordinate Officer',
        initials: 'SUB/O',
        level: 13,
        group: 'junior',
        gender: 'male',
        description: 'Subordinate Officer - Junior officer rank for male personnel (GNFS)'
    },
    {
        name: 'Leading Fireman',
        initials: 'LFM',
        level: 14,
        group: 'junior',
        gender: 'male',
        description: 'Leading Fireman - Leading rank for male personnel (GNFS)'
    },
    {
        name: 'Senior Fireman',
        initials: 'SFM',
        level: 15,
        group: 'junior',
        gender: 'male',
        description: 'Senior Fireman - Senior rank for male personnel (GNFS)'
    },
    {
        name: 'Fireman',
        initials: 'FM',
        level: 16,
        group: 'junior',
        gender: 'male',
        description: 'Fireman - Basic rank for male personnel (GNFS)'
    },
    {
        name: 'Recruit Fireman',
        initials: 'RFM',
        level: 17,
        group: 'junior',
        gender: 'male',
        description: 'Recruit Fireman - Lowest rank in the Service for male personnel (GNFS)'
    }
];

// Junior Ranks - Female (GNFS Official Structure)
// Ordered from highest (level 10) to lowest (level 17)
const juniorRanksFemale = [
    {
        name: 'Group Officer Grade One',
        initials: 'GOI',
        level: 10,
        group: 'junior',
        gender: 'female',
        description: 'Group Officer Grade One - Highest rank in the Junior Officers corps for female personnel (GNFS)'
    },
    {
        name: 'Group Officer Grade Two',
        initials: 'GOII',
        level: 11,
        group: 'junior',
        gender: 'female',
        description: 'Group Officer Grade Two - Second grade group officer for female personnel (GNFS)'
    },
    {
        name: 'Deputy Group Officer',
        initials: 'DGO',
        level: 12,
        group: 'junior',
        gender: 'female',
        description: 'Deputy Group Officer - Deputy group officer rank for female personnel (GNFS)'
    },
    {
        name: 'Assistant Group Officer',
        initials: 'AGO',
        level: 13,
        group: 'junior',
        gender: 'female',
        description: 'Assistant Group Officer - Junior officer rank for female personnel (GNFS)'
    },
    {
        name: 'Leading Firewoman',
        initials: 'LFW',
        level: 14,
        group: 'junior',
        gender: 'female',
        description: 'Leading Firewoman - Leading rank for female personnel (GNFS)'
    },
    {
        name: 'Senior Firewoman',
        initials: 'SFW',
        level: 15,
        group: 'junior',
        gender: 'female',
        description: 'Senior Firewoman - Senior rank for female personnel (GNFS)'
    },
    {
        name: 'Firewoman',
        initials: 'FW',
        level: 16,
        group: 'junior',
        gender: 'female',
        description: 'Firewoman - Basic rank for female personnel (GNFS)'
    },
    {
        name: 'Recruit Firewoman',
        initials: 'RFW',
        level: 17,
        group: 'junior',
        gender: 'female',
        description: 'Recruit Firewoman - Lowest rank in the Service for female personnel (GNFS)'
    }
];

// Combine all ranks
const ranks = [...seniorRanks, ...juniorRanksMale, ...juniorRanksFemale];

const seedRanks = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing ranks (optional - comment out if you want to keep existing ranks)
        // await Rank.deleteMany({});
        // console.log('🗑️  Cleared existing ranks');

        let created = 0;
        let skipped = 0;

        // First, update existing senior ranks to have group: 'senior' and gender: null
        console.log('\n🔄 Updating existing senior ranks...');
        const existingRanks = await Rank.find({ group: { $exists: false } });
        for (const existingRank of existingRanks) {
            try {
                existingRank.group = 'senior';
                existingRank.gender = null;
                await existingRank.save();
                console.log(`✅ Updated: ${existingRank.name} (${existingRank.initials}) - set to senior`);
            } catch (error) {
                console.error(`❌ Error updating ${existingRank.name}:`, error.message);
            }
        }

        // Insert ranks
        console.log('\n📝 Inserting new ranks...');
        for (const rankData of ranks) {
            try {
                // Check if rank already exists
                const existingRank = await Rank.findOne({
                    $or: [
                        { name: rankData.name },
                        { initials: rankData.initials }
                    ]
                });

                if (existingRank) {
                    // Update existing rank with group, gender, and level if different
                    let updated = false;
                    if (!existingRank.group || existingRank.group !== rankData.group) {
                        existingRank.group = rankData.group;
                        updated = true;
                    }
                    if (rankData.gender && existingRank.gender !== rankData.gender) {
                        existingRank.gender = rankData.gender;
                        updated = true;
                    }
                    if (existingRank.level !== rankData.level) {
                        existingRank.level = rankData.level;
                        updated = true;
                    }
                    if (updated) {
                        await existingRank.save();
                        console.log(`🔄 Updated: ${rankData.name} (${rankData.initials}) - level ${rankData.level}, ${rankData.group}${rankData.gender ? ` (${rankData.gender})` : ''}`);
                    } else {
                        console.log(`⏭️  Skipped: ${rankData.name} (${rankData.initials}) - already exists with correct data`);
                    }
                    skipped++;
                } else {
                    const rank = new Rank(rankData);
                    await rank.save();
                    const genderLabel = rankData.gender ? ` (${rankData.gender})` : '';
                    console.log(`✅ Created: ${rankData.name} (${rankData.initials}) - ${rankData.group}${genderLabel}`);
                    created++;
                }
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⏭️  Skipped: ${rankData.name} (${rankData.initials}) - duplicate`);
                    skipped++;
                } else {
                    console.error(`❌ Error creating ${rankData.name}:`, error.message);
                }
            }
        }

        // Get summary by group
        const seniorCount = await Rank.countDocuments({ group: 'senior' });
        const juniorMaleCount = await Rank.countDocuments({ group: 'junior', gender: 'male' });
        const juniorFemaleCount = await Rank.countDocuments({ group: 'junior', gender: 'female' });
        const totalCount = await Rank.countDocuments();

        console.log('\n📊 Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📝 Total processed: ${ranks.length}`);
        console.log('\n📈 Database Summary:');
        console.log(`   👔 Senior Ranks: ${seniorCount}`);
        console.log(`   👨 Junior Ranks (Male): ${juniorMaleCount}`);
        console.log(`   👩 Junior Ranks (Female): ${juniorFemaleCount}`);
        console.log(`   📊 Total Ranks in DB: ${totalCount}`);

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding ranks:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the seed function
seedRanks();


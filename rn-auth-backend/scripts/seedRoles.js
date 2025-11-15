import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';

dotenv.config();

const roles = [
    {
        name: 'Fire Fighter',
        description: 'Fire Fighter - Frontline personnel responsible for firefighting operations, rescue missions, and emergency response'
    },
    {
        name: 'Driver',
        description: 'Driver - Personnel responsible for operating fire service vehicles, ensuring safe transportation to emergency scenes, and maintaining vehicle readiness'
    },
    {
        name: 'Admin',
        description: 'Admin - Administrative personnel handling office duties, documentation, record keeping, and general administrative tasks'
    },
    {
        name: 'Officer in Charge',
        description: 'Officer in Charge (OIC) - Senior officer responsible for overseeing operations, making critical decisions, and coordinating emergency response teams'
    },
    {
        name: 'Control Room',
        description: 'Control Room - Personnel managing emergency communications, dispatching units, coordinating responses, and maintaining communication systems'
    },
    {
        name: 'Welfare',
        description: 'Welfare - Personnel responsible for personnel welfare, support services, and ensuring the well-being of fire service staff'
    },
    {
        name: 'Accounts',
        description: 'Accounts - Financial personnel handling budgeting, accounting, financial records, and fiscal management of the fire service'
    },
    {
        name: 'Dept Head',
        description: 'Department Head - Senior officer leading a department, responsible for strategic planning, department management, and operational oversight'
    },
    {
        name: 'Station Commander',
        description: 'Station Commander - Senior officer in charge of a fire station, can be MFO (Municipal Fire Officer) or DFO (Divisional Fire Officer), responsible for overall station operations and management'
    },
    {
        name: 'Stores',
        description: 'Stores - Personnel managing inventory, equipment storage, supply chain, and ensuring availability of necessary equipment and materials'
    },
    {
        name: 'PR',
        description: 'Public Relations (PR) - Personnel handling public communications, media relations, community outreach, and maintaining positive public image of the fire service'
    }
];

const seedRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let created = 0;
        let skipped = 0;
        let updated = 0;

        // Insert roles
        console.log('\n📝 Seeding roles...');
        for (const roleData of roles) {
            try {
                // Check if role already exists
                const existingRole = await Role.findOne({
                    name: { $regex: new RegExp(`^${roleData.name}$`, 'i') }
                });

                if (existingRole) {
                    // Update description if it's different
                    if (existingRole.description !== roleData.description) {
                        existingRole.description = roleData.description;
                        await existingRole.save();
                        console.log(`🔄 Updated: ${roleData.name} - description updated`);
                        updated++;
                    } else {
                        console.log(`⏭️  Skipped: ${roleData.name} - already exists`);
                    }
                    skipped++;
                } else {
                    const role = new Role(roleData);
                    await role.save();
                    console.log(`✅ Created: ${roleData.name}`);
                    created++;
                }
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⏭️  Skipped: ${roleData.name} - duplicate`);
                    skipped++;
                } else {
                    console.error(`❌ Error creating ${roleData.name}:`, error.message);
                }
            }
        }

        const totalCount = await Role.countDocuments();

        console.log('\n📊 Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   🔄 Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📝 Total processed: ${roles.length}`);
        console.log(`   📊 Total Roles in DB: ${totalCount}`);

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the seed function
seedRoles();


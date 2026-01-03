const mongoose = require('mongoose');
const { dbURI } = require('./library/settings');
const { User } = require('./database/model');
const { getHashedPassword, randomText } = require('./library/functions');

async function resetAdmin() {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB');

        const username = 'Darmawan';
        const password = 'darmawan123';
        const hashedPassword = getHashedPassword(password);

        const adminUser = await User.findOne({ username });

        if (adminUser) {
            adminUser.password = hashedPassword;
            adminUser.role = 'Admin';
            adminUser.premium = true;
            adminUser.limit = 1000000;
            adminUser.verif = true;
            await adminUser.save();
            console.log('Admin password reset to: ' + password);
        } else {
            await User.create({
                email: 'admin@darmawan.com',
                username: username,
                password: hashedPassword,
                apikey: randomText(15),
                role: 'Admin',
                premium: true,
                limit: 1000000,
                verif: true,
                since: 'Admin Creation',
                money: 1000000,
                url: '/images/logos.png'
            });
            console.log('Admin user created with password: ' + password);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

resetAdmin();

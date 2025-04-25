const mongoose = require('mongoose');
const Schema = mongoose.Schema;

async function seedUsers(count = 5000) {
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: `user${i}@example.com`, // guarantees uniqueness
            password: faker.internet.password(),
            avatar: faker.image.avatar(),
            status: faker.helpers.arrayElement(['active', 'inactive']),
            role: faker.helpers.arrayElement(['user', 'admin']),
        });
    }

    try {
        await User.insertMany(users);
        console.log(`${count} users inserted.`);
    } catch (err) {
        console.error('Failed to seed users:', err);
    } finally {
        mongoose.connection.close();
    }
}

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    avatar: {type: String, default: 'https://ts2.mm.bing.net/th?id=OIP.qOSjSxoUNci9aPL9spX_eQHaHa&pid=15.1'},
    status: {type: String, enum: ['active', 'inactive'], default: 'active'},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    createdAt: {type: Date, default: Date.now},
});

userSchema.set('toJSON', {
    transform: function(doc, result, options) {
        result.id = result._id;
        delete result._id;
        delete result.__v;
    }
});

var User = mongoose.model('User', userSchema);

module.exports = User;
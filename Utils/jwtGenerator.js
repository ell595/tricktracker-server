const jwt = require('jsonwebtoken');
require('dotenv').config();


function jwtGenerator(user_id) {
    console.log('cheese');
    const payload = {
        user: user_id
    };
    return jwt.sign(payload, `${process.env.JWTSECRET}`, {expiresIn: '24h'});
}

module.exports = jwtGenerator;
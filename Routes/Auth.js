const router = require('express').Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwtGenerator = require('../Utils/jwtGenerator');
const validInfo = require('../Middleware/validInfo');
const authorization = require('../Middleware/authorization');

// Register new user
router.post('/register', validInfo, async (req, res) => {
    try {
        // Gather user info by destructuring request body
        const { id, username, email, password } = req.body;
        console.log('cheese');

        //Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (user.rows.length !== 0) {
            return res.status(401).send('User already exists!');
        };

        // Encrypt user's password with Bcrypt
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // Add user to database
        const newUser = await pool.query(
            'INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, username, email, bcryptPassword]
        );
        console.log(newUser);

        // Generate JWT token
        const token = jwtGenerator(newUser.rows[0].id);
        return res.status(201).json({token});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

// Login user
router.post('/login', validInfo, async (req, res) => {
    try {
        console.log(req.body);
        // Gather user info by destructuring request body
        const { username, password } = req.body;

        //Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        console.log(user);

        const id = user.rows[0].id;

        if (user.rows.length === 0) {
            return res.status(401).json('Password or Email is incorrect');
        }

        //Check if incoming password matches stored password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json('Password or Email is incorrect');
        }

        // Generate JWT token
        const token = jwtGenerator(id);
        return res.status(200).json({token, id});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

// Verify JWT Token
router.get('/is-verify', authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

module.exports = router;
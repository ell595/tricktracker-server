const router = require('express').Router();
const pool = require('../db');
const authorization = require('../Middleware/authorization');

// Get all trick names
router.get('/names', authorization, async (req, res) => {
    try {
        const trickNames = await pool.query(
            'SELECT name, id from tricks ORDER BY ID'
        );

        return res.status(200).json(trickNames.rows);
    } catch (err) {
        console.err(err.message);
    }
});

// Get all of a users' tricks
router.get('/', authorization, async (req, res) => {
    try {
        const user_id = req.headers.id;
        
        const tricks = await pool.query(
            'SELECT ut.id AS id, variation, on_flat, down_stairs, t.name FROM users_tricks ut LEFT JOIN tricks t on t.id = ut.trick_id WHERE ut.user_id = $1 ORDER BY id',
            [user_id]
        );

        console.log(tricks.rows);

        return res.status(200).json(tricks.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Add a new trick for a user
router.post('/', authorization, async (req, res) => {
    try {
        const { user_id, trick_id, variation, down_stairs, on_flat } = req.body;

        const newTrick = await pool.query(
            'INSERT INTO users_tricks (user_id, trick_id, variation, on_flat, down_stairs) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, trick_id, variation, on_flat, down_stairs] 
        );

        console.log(newTrick);

        return res.status(200).json(newTrick.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Get a specific trick to update
router.get('/id', authorization, async (req, res) => {
    try {
        const id = req.headers.id;
        console.log(id);
        const trickToUpdate = await pool.query(
            'SELECT ut.id AS id, variation, on_flat, down_stairs, t.name FROM users_tricks ut LEFT JOIN tricks t on t.id = ut.trick_id WHERE ut.id = $1',
            [id]
        );

        console.log(trickToUpdate.rows);
        return res.status(200).json(trickToUpdate.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Save updated trick
router.put('/', authorization, async (req, res) => {
    try {
        const { id, variation, on_flat, down_stairs } = req.body;

        const updatedTrick = await pool.query(
            'UPDATE users_tricks SET variation = $1, on_flat = $2, down_stairs = $3 WHERE id = $4 RETURNING *',
            [variation, on_flat, down_stairs, id]
        );
        
        res.status(200).json(updatedTrick.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Delete a trick
router.delete('/', authorization, async (req, res) => {
    try {
        const id = req.body.id;

        const deletedTrick = await pool.query(
            'DELETE FROM users_tricks WHERE id = $1 RETURNING *',
            [id]
        );

        res.status(200).json(deletedTrick);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM companies`);
        console.log(results.rows)
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const results = await db.query('SELECT code, description FROM companies WHERE code = $1', [code]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404)
        }
        return res.send({ company: results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) =>{
    try{
        const { name, description } = req.body;
        let code = slugify(name, {lower: true});
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description', [name, description, code]);
        if ( results.row.length === 0) {
            throw new ExpressError(`Cannot update company with code of ${code}`, 404)
        }
        return res.send({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code]);
        if (results.rows.length == 0){
            throw new ExpressError(`No Such Company: ${code}`, 404)
        }else{
        return res.json({ msg: "Deleted!" })
        }
    } catch (e) {
        return next(e)
    }
});

module.exports = router;
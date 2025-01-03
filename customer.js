const express = require('express');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors()); 
const db = mysql.createConnection({
    host: 'mysql-1e3e5ecc-khonggo-1c2b.b.aivencloud.com',
    port: 21079,
    user: 'avnadmin',
    password: 'AVNS_3y1ddLS-w9AdmQtS7m5',
    database: 'customerDatabase'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected.');
});

app.post('/customer', (req, res) => {
    const { name, ic_number, dob, address, address_country, address_postcode } = req.body;

    if (!name || !ic_number || !dob || !address_country) {
        return res.status(400).send('Required fields are missing.');
    }

    if (!/^[0-9]{1,14}$/.test(ic_number)) {
        return res.status(400).send('Invalid IC Number format.');
    }
    if (address_postcode && !/^[0-9]{1,20}$/.test(address_postcode)) {
        return res.status(400).send('Invalid Postcode format.');
    }

    if (!isAtLeast18(dob)) {
        return res.status(400).send('Customer must be at least 18 years old.');
    }

    const query = 'INSERT INTO customer (name, ic_number, dob, address, address_country, address_postcode) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, ic_number, dob, address, address_country, address_postcode], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Customer added successfully.');
    });
});

function isAtLeast18(dob) {
    const dobDate = new Date(dob);
    const today = new Date();

    if (isNaN(dobDate.getTime())) {
        return false;
    }

    const age = today.getFullYear() - dobDate.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > dobDate.getMonth() ||
        (today.getMonth() === dobDate.getMonth() && today.getDate() >= dobDate.getDate());

    return age > 18 || (age === 18 && hasHadBirthdayThisYear);
}

app.get('/customer/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM customer WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching customer data' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
        } else {
            res.json(results[0]);
            console.log(results[0]);
        }
    });
});

app.put('/customer/:id', (req, res) => {
    const { id } = req.params;
    const { name, ic_number, dob, address, address_country, address_postcode } = req.body;
    const query = 'UPDATE customer SET name = ?, ic_number = ?, dob = ?, address = ?, address_country = ?, address_postcode = ? WHERE id = ?';
    db.query(query, [name, ic_number, dob, address, address_country, address_postcode, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Customer updated successfully.');
    });
});


app.get('/customer', (req, res) => {
    const { searchTerm } = req.query;
    let query = 'SELECT * FROM customer';
    const queryParams = [];
    if (searchTerm) {
        query += ' WHERE';
        query += ' name LIKE ? OR ic_number LIKE ?';
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    query += ' ORDER BY id DESC ';
    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

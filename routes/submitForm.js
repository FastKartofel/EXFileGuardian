const express = require('express');
const fs = require('fs');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const usersFilePath = path.join(__dirname, '..','public', 'dane.txt');
// login page
router.get('/login', (req, res) => {
    res.render('login');
});

// handling the login process
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        const users = usersData.split('\n');
        const userEntry = users.find(entry => entry.startsWith(username + ':'));

        if (!userEntry) {
            return res.send('User not found');
        }

        const [, hashedPassword] = userEntry.split(':');
        if (await bcrypt.compare(password, hashedPassword)) {
            req.session.userId = username;
            res.sendFile(path.join(__dirname, '..', 'public', 'searchFile.html'));
        } else {
            res.send('Invalid password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});



// registration page
router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const errors = validateFormData({ email: username, name: username });

    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }
    if (errors.email) {
        return res.render('errorPage', { errors });
    }

    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = usersData.split('\n');

    if (users.some(entry => entry.startsWith(username + ':'))) {
        return res.send('User already exists');
    }
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            fs.appendFileSync(usersFilePath, `${username}:${hashedPassword}\n`);
            res.redirect('/login');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        }
});

//function for validating the format of the provided email
function validateFormData(formData) {
  const errors = {};

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
    errors.email = 'Email must be a valid email address.';
  }

  return errors;
}


module.exports = router;

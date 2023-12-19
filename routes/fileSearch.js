let express = require('express');
let router = express.Router();
let fs = require('fs');
let path = require('path');
let bcrypt = require('bcrypt');

router.use(express.urlencoded({ extended: true }));


router.post('/', (req, res) => {
    const filename = req.body.fileName;
    if (!filename) {
        return res.status(400).send("Filename is required");
    }
    const filePath = path.join(__dirname, '..','public', 'files', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.render('errorPage', { errors: { file: 'File not found.' } });
        } else {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.render('errorPage', { errors: { file: 'Error reading file.' } });
                } else {
                    res.render('userContent', { fileContent: data });
                }
            });
        }
    });
});

module.exports = router;
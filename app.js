const express = require('express');
const exphbs = require('express-handlebars'); 
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const { json } = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs')
const path = require('path');



// Default Option
app.use(fileUpload());

// Static Files
app.use(express.static('public'));
app.use(express.static('upload'));

// Templating engine
const handlebars = exphbs.create({ extname: '.hbs', });
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');


// Connection to MySQL
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'imagegallery'
});


app.get('/', (req, res) => {
    connection.query('SELECT * FROM images', (err, rows) => {
        if (!err) {
            res.render('index', { rows });
        }
    });
});


app.post('/', (req, res) => {
    
    const title = req.body.title;
    const description = req.body.description;


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // name of the input is sampleFile
    const ext = path.extname(req.files.sampleFile.name);
    const sampleFile = req.files.sampleFile;
    const timestamp = (new Date()).getTime();
    const filename = timestamp + ext;
    uploadPath = __dirname + '/upload/' + filename;
    const sql = "insert into images (image, title, description) values (?, ?, ?)"
    const data = [filename, title, description]

    console.log(sampleFile);

    // Using mv() to place file on the server
    sampleFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        connection.query(sql, data, (err, rows) => {
            if (!err) {
                res.redirect('/');
            } else {
                console.log(err);
            }
        });
    });
});

 // Using fs.unlink to remove file from the database
app.post('/api/delete/:filename', (req, res) => {

    const sql = "delete from images where image = ?";
    const filename = req.params.filename
    const data = [filename]

    fs.unlink(__dirname + "/upload/" + filename, (err) => {
        connection.query(sql, data, (err, _) => {
            if (!err) {
                console.log("deleted the image: " + filename);
                res.redirect('/');
            } else {
                console.log(err);
            }
        });
    });
});


// Port
app.listen(port, () => console.log(`Listening on port ${port}`));


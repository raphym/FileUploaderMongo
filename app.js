const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const config_database = require('./config/database');
//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

//Mongo URI
const mongoUri = config_database.api + config_database.user + ':' + config_database.pswd + config_database.server + ':' + config_database.port + '/' + config_database.name;

//Create mongo connection
const conn = mongoose.createConnection(mongoUri);

//Init Gfs
let gfs;
conn.once('open', function () {
    //init the stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

//Create Storage
const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

//Get , load home page
app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files exist
        if (!files || files.length === 0) {
            res.render('index', { files: false });
        }
        else {
            files.map(file => {
                //if the file is an image to display it
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.isImage = true;
                }
                else {
                    file.isImage = false;
                }
            });
            //render index 
            res.render('index', { files: files });
        }
    });
});

//Post, upload a file
app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

// GET FILES , display all files in json
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files exist
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: ' No files exist'
            });
        }
        //Files exist
        return res.json(files);
    });
});

// GET FILE , display a file
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //check if file exist
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: ' No files exist'
            });
        }
        //Files exist
        return res.json(file);
    });
});

// GET image , display image
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //check if file exist
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: ' No files exist'
            });
        }
        //Files exist
        //check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'img/png') {
            //read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
        else {
            return res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});
//delete file
app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, function (err, gridStore) {
        if (err) {
            res.status(404).json({
                err: err
            });
        }
        else {
            res.redirect('/');
        }
    });
});

//download a file
app.get('/download/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
        if (err) {
            return res.status(400).send(err);
        }
        else if (!file) {
            return res.status(404).send('Error on the database looking for the file.');
        }

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

        var readstream = gfs.createReadStream({
            filename: req.params.filename,
            root: 'uploads'
        });

        readstream.on("error", function (err) {
            res.end();
        });
        readstream.pipe(res);
        readstream.on('end', function () {
            console.log('downloaded');
        });
    });
});

const port = 5000;
app.listen(port, () => {
    console.log('listen on port : ', port);
});
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: '../public/upload',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|bmp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only');
    }
}

module.exports = {
    upload() {
        multer({
            storage: storage,
            fileFilter: function (req, file, cb) {
                checkFileType(file, cb);
            }
        }).single('myImage');
    }
};
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        let directoryPath = path.join(__dirname, '../public/ProductImage')
        if (fs.existsSync(directoryPath)) {

            cb(null, directoryPath);

        } else {


            fs.mkdirSync(directoryPath);
            cb(null, directoryPath)

        }

    },

    filename: function (req, file, cb) {
        const name = Date.now() + '_' + file.originalname;
        cb(null, name)
    }
})

//Check filetype here
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}


const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
})

module.exports = upload;
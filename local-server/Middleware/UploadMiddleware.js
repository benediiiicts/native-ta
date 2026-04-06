import multer from "multer";
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const imageFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true)
    }
    else{
        cb(new Error(`Format file tidak didukung. Hanya menerima JPG/PNG!`), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

export default upload
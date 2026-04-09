import multer from "multer";
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.env.IMAGE_PATH)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true)
    }else{
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
}

// const imageFilter = (req, file, cb) => {
//     if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
//         cb(null, true)
//     }
//     else{
//         cb(new Error(`Format file tidak didukung. Hanya menerima JPG/PNG!`), false)
//     }
// }

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

export default upload
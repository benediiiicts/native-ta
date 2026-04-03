import sequelize from "../database.js";
import { versionImages } from "../Models/ImageModel.js";

async function saveImages(_tagVersionId, _images) {
    try {
        const result = await sequelize.transaction(async (t) => {
            let createdImages = [];

            for (const file of _images) {
                if (file && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
                    const image = await versionImages.create({
                        tagVersionId: _tagVersionId,
                        imageUrl: file.filename || file.originalname 
                    }, { transaction: t }); 

                    createdImages.push(image);
                } else {
                    const error = new Error(`File ${file.originalname} tidak valid. Hanya menerima JPEG/PNG.`);
                    error.status = 400;
                    throw error; 
                }
            }
            return createdImages;
        });

        return {
            status: 201,
            message: "Images have been saved successfully",
            data: result
        };

    } catch (error) {
        console.error(`Internal error while saving images:`, error);        
        if (error.status) {
            return {
                status: error.status,
                message: error.message
            };
        }
        return {
            status: 500,
            message: "Failed to save images due to server error"
        };
    }
}

export { saveImages };
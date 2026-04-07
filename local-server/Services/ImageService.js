import { versionImages } from "../Models/ImageModel.js";

async function saveImages(_tagVersionId, _images, t) {
    let createdImages = []
    
    for(const file of _images){
        const image = await versionImages.create({
            tagVersionId: _tagVersionId,
            imageUrl: file.filename
        }, {transaction: t})
        
        createdImages.push(image)
    }
    return createdImages
}

export { saveImages };
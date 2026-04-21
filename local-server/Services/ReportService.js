import { reports } from "../Models/MediaModel.js";
import sequelize from "../database.js";

async function createReport(_userId, _targetType, _targetId, _reason, _description, _images){
    try{
        const result = await sequelize.transaction(async (t) => {
            let savedImageUrls = []
            if(_images && _images.length > 0){
                savedImageUrls = _images.map(file => file.filename)
            }

            const newReport = await reports.create({
                userId: _userId,
                targetType: _targetType,
                targetId: _targetId,
                reason: _reason,
                description: _description,
                imageUrls: savedImageUrls.length > 0 ? savedImageUrls : null
            }, {transaction: t})
            
            return newReport
        })

        return{
            data: result,
            status: 201,
            message: "Report successfully created"
        }
    }
    catch(error){
        console.error(`Error while creating report: ${error}`)
        return{
            status: 500,
            message: "Internal server error while creating report"
        }
    }
}

export {createReport}
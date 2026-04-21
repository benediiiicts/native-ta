import { createReport } from "../Services/ReportService.js";

async function submitReport(req, res){
    try{
        const userId = req.user.id
        const {targetType, targetId, reason, description} = req.body
        const images = req.files || []

        if(!targetType || !targetId || !reason){
            return res.status(400).json({
                message: "targetType, targetId, reason field must be filled"
            })
        }

        const validTypes = ['User', 'TagVersion', 'Comment']
        if(!validTypes.includes(targetType)){
            return res.status(400).json({
                message: "Report type not valid"
            })
        }

        const reportResult = await createReport(userId, targetType, targetId, reason, description, images)
        return res.status(reportResult.status).json(reportResult)
    }
    catch(error){
        console.error(`Error while submitting report: ${error}`)
        return res.status(500).json({
            message: "internal server error while submitting report"
        })
    }
}

export {submitReport}
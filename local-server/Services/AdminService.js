import sequelize from '../database.js';
import { tagRoads, tagVersions } from '../Models/TagModel.js';
import { notification } from '../Models/NotificationModel.js'

async function manageTags(_tagId, _versionId, _isVerified, _visibility, _adminNotes){
    try{
        const result = await sequelize.transaction(async (t) => {
            const [version, road] = await Promise.all([
                tagVersions.findByPk(_versionId, {transaction: t}),
                tagRoads.findByPk(_tagId, {transaction: t})
            ])

            if(!version || !road){
                const error = new Error("Tag is not valid/ registered")
                error.status = 404
                throw error
            }

            if(_visibility === 'hide_version'){
                version.isHidden = true;
            } else if(_visibility === 'hide_road'){
                road.isHidden = true;
            } else if(_visibility === 'active') {
                road.isHidden = false;
                version.isHidden = false;
            }

            version.isVerified = _isVerified
            if(_isVerified){
                version.score = 9999
            }

            await version.save({transaction: t})
            await road.save({transaction: t})

            let notifTitle = ''
            let notifType = "info"
            
            if(_visibility === 'hide_road' || _visibility === 'hide_version') {
                notifTitle = "Konten Anda Disembunyikan";
                notifType = "warning";
            } else if(_isVerified) {
                notifTitle = "Laporan Anda Terverifikasi";
                notifType = "success";
            }
            
            if(notifTitle){
                await notification.create({
                    userId: version.userId,
                    title: notifTitle,
                    type: notifType,
                    message: _adminNotes || "Admin telah melakukan tindakan moderasi pada laporan Anda.",
                    actionType: _visibility
                }, {transaction: t})
            }

            return{
                status: 200,
                message: "Tag successfully updated"
            }
        })

        return result
    }
    catch(error){
        console.error(`Error while updating tag: ${error}`)
        return{
            status: error.status || 500,
            message: error.message || "Internal server error while managing tags"
        }
    }
}

export {
    manageTags
}
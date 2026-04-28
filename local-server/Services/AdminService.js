import sequelize from '../database.js';
import { Op } from "sequelize";
import { user } from '../Models/UserModel.js';
import { tagRoads, tagVersions } from '../Models/TagModel.js';
import { notification } from '../Models/NotificationModel.js'
import { comments, reports } from '../Models/MediaModel.js';

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

async function manageUserStatus(_userId, _action, _durationDays, _adminNotes){
    try{
        const result = await sequelize.transaction(async (t) => {
            const targetUser = await user.findByPk(_userId, {transaction: t})
            if(!targetUser){
                const error = new Error("Targeted user not found")
                error.status = 404
                throw error
            }
            if(targetUser.role == 'admin'){
                const error = new Error("Cannot edit other admin users")
                error.status = 403
                throw error
            }

            let notifTitle = "";
            let notifType = "warning";

            if(_action == "suspend"){
                const suspendDays = parseint(_durationDays) || 3
                const endDate = new Date
                endDate.setDate(endDate.getDate() + suspendDays)

                targetUser.isActive = false
                targetUser.banType = 'suspend'
                targetUser.bannedUntil = endDate

                notifTitle = `Akun Disuspend (${suspendDays} Hari)`;
                notifType = "danger";
            }
            else if(_action == "permanent_ban"){
                targetUser.isActive = false
                targetUser.banType = 'permanent'
                targetUser.bannedUntil = null

                notifTitle = "Akun Diblokir Permanen";
                notifType = "danger";
            }
            else if(_action == "revoke"){
                targetUser.isActive = true
                targetUser.banType = null
                targetUser.bannedUntil = null

                notifTitle = "Sanksi Akun Dicabut";
                notifType = "success";
            }
            else if(_action == "set_admin"){
                targetUser.role = 'admin'
                targetUser.isActive = true
                targetUser.banType = null
                targetUser.bannedUntil = null

                notifTitle = "Akun diubah sebagai administrator";
                notifType = "success";
            }

            await targetUser.save({transaction: t})

            await notification.create({
                userId: targetUser.id,
                title: notifTitle,
                message: _adminNotes || "Terdapat perubahan status pada akun Anda oleh Administrator.",
                type: notifType,
                actionType: _action
            }, {transaction: t})

            return{
                status: 200,
                message: "User status successfully changed, notification successfully saved"
            }
        })

        return result
    }
    catch(error){
        console.error(`Error while changing user status: ${error}`)
        return{
            status: error.status || 500,
            message: error.message || "Internal server error"
        }
    }
}

async function fetchAllUsers(_searchQuery = ''){
    try{
        let whereCondition = {}
        if(_searchQuery){
            whereCondition = {
                username: {
                    [Op.iLike]: `%${_searchQuery}%`
                }
            }
        }

        const usersList = await user.findAll({
            where: whereCondition,
            attributes: ['id', 'username', 'email', 'role', 'isActive', 'banType'],
            order: [['createdAt', 'DESC']],
            limit: 50
        })

        return{
            status: 200,
            data: usersList,
            message: "Users successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching users: ${error}`)
        return{
            status: 500,
            message: "Internal server error while fetching users"
        }
    }
}

async function fetchAllReports(_statusFilter = 'Pending'){
    try{
        let whereCondition = {}

        if(_statusFilter && _statusFilter !== 'All' ){
            whereCondition = {status: _statusFilter}
        }
        const reportsList = await reports.findAll({
            where: whereCondition,
            include: [{
                model: user,
                as: 'reporter',
                attributes: ['id', 'username', 'email']
            }],
            order: [['createdAt', 'ASC']],
            limit: 100
        })

        return {
            status: 200,
            data: reportsList,
            message: "Reports successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching reports: ${error}`)
        return{
            status: 500,
            message: "Internal server error while fetching reports"
        }
    }
}

async function manageReportStatus(_reportId, _status, _adminNotes='', _roadName=null){
    try{
        const result = await sequelize.transaction(async (t) => {
            const targetReport = await reports.findByPk(_reportId, {transaction: t})
            if(!targetReport){
                const error = new Error("Target report not found")
                error.status = 404
                throw error
            }

            let notifTitle = "";
            let notifType = "warning";
            let actionNote = ''

            targetReport.status = _status
            if(_status == 'Reviewed'){
                notifTitle = "Sedang dilakukan review terhadap laporan anda"
                notifType = "info"
                actionNote = "Sedang ditelusuri. Mohon tunggu informasi lebih lanjut"
            }
            else if(_status == 'Resolved'){
                notifTitle = "Laporan anda sudah disetujui!"
                notifType = "success"
                actionNote = "Telah disetujui"
            }
            else if(_status = 'Rejected'){
                notifTitle = "Laporan anda ditolak!"
                notifType = "danger"
                actionNote = "Ditolak"
            }

            await targetReport.save({transaction: t})

            const reportType = targetReport.targetType
            if(reportType == 'User'){
                const targetUser = await user.findByPk(targetReport.targetId)
                reportType = `pengguna: ${targetUser.username}`
            }
            else if(reportType == 'Comment'){
                const targetComment = await comments.findByPk(targetReport.targetId, {
                    include:[{
                        model: user,
                        as: "commentAuthor",
                        attributes: ['id', 'username']
                    }]
                })
                reportType = `komentar pengguna: ${targetComment.commentAuthor.username}`
            }
            else if(reportType == 'TagVersion'){
                const targetTag = await tagVersions.findByPk(targetReport.targetId, {
                    include: [{
                        model: user,
                        as: 'author',
                        attributes: ['id', 'username']
                    }],
                    include: [{
                        model: tagRoads,
                        as: "road",
                        attributes: ['issueType']
                    }]
                })
                reportType = 
                `laporan jalan mengenai: ${targetTag.road.issueType} 
                dengan status ${targetTag.status}\n
                yang dibuat oleh ${targetTag.author.username}`
            }

            const notes = `
            Laporan anda mengenai ${reportType}\n
            pada: ${targetReport.createdAt}\n
            alasan: ${targetReport.reason}\n
            keterangan: ${targetReport.description}\n
            ${actionNote}.\n ${_adminNotes}`

            await notification.create({
                userId: targetReport.userId,
                title: notifTitle,
                message: notes,
                type: notifType,
                actionType: null
            }, {transaction: t})

            return {
                status: 200,
                message: "Report status successfully changed, notification successfully saved"
            }
        })
        return result
    }
    catch(error){
        console.error(`Error while changing report status: ${error}`)
        return{
            status: error.status || 500,
            message: error.message || "Internal server error"
        }
    }
}

export {
    manageTags,
    manageUserStatus,
    fetchAllUsers,
    fetchAllReports,
    manageReportStatus
}
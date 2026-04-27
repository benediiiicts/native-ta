import sequelize from '../database.js';
import { Op } from "sequelize";
import { user } from '../Models/UserModel.js';
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
            message: error.message || "Terjadi kesalahan internal server"
        }
    }
}

async function fetchAllUsers(_searchQuery = ''){
    try{
        let whereCondition = ''
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

export {
    manageTags,
    manageUserStatus,
    fetchAllUsers
}
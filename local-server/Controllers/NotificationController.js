import {fetchUserNotifications, markNotificationAsRead, markAllNotificationAsRead} from '../Services/NotificationService.js'

async function getNotifications(req, res){
    try{
        const userId = req.user.id
        if(!userId){
            return res.status(401).json({
                message: "Request failed, no user found"
            })
        }
        const result = await fetchUserNotifications(userId)
        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error fetching notifications: ${error}`)
        return res.status(500).json({
            message: "Internal server error while fetching notifications"
        })
    }
}

async function readNotification(req, res){
    try{
        const userId = req.user.id
        const notificationId = req.params.id
        if(!userId){
            return res.status(401).json({
                message: "Request failed, no user found"
            })
        }
        const result = await markNotificationAsRead(notificationId, userId)
        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error marking notification: ${error}`)
        return res.status(500).json({
            message: "Internal server error while marking notification"
        })
    }
}

async function readAllNotifications(req, res){
    try{
        const userId = req.user.id
        if(!userId){
            return res.status(401).json({
                message: "Request failed, no user found"
            })
        }
        const result = await markAllNotificationAsRead(userId)
        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error marking notifications: ${error}`)
        return res.status(500).json({
            message: "Internal server error while marking notifications"
        })
    }
}

export {
    getNotifications,
    readNotification,
    readAllNotifications
}
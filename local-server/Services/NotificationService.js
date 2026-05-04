import { notification } from "../Models/NotificationModel.js";

async function fetchUserNotifications(_userId){
    try{
        const notificationList = await notification.findAll({
            where: {userId: _userId},
            order: [['createdAt', 'DESC']],
            limit: 50
        })

        const unreadCount = notificationList.filter(n => !n.isRead).length

        return{
            status: 200,
            data: {
                notifications: notificationList,
                unreadCount: unreadCount
            },
            message: "Notifications fetched successfully"
        }
    }
    catch(error){
        console.error(`Error while fetching notifications: ${error}`)
        return{
            status: 500,
            message: "Server error while fetching notifications"
        }
    }
}

async function markNotificationAsRead(_notificationId, _userId){
    try{
        const targetNotification = await notification.findOne({
            where:{id: _notificationId, userId: _userId}
        })
        if(!targetNotification){
            return{
                status: 404,
                message: "Notification not found"
            }
        }
        targetNotification.isRead = true
        await targetNotification.save()

        return{
            status: 200,
            message: "Notification marked as read"
        }
    }
    catch(error){
        console.error(`Error marking notification as read: ${error}`)
        return{
            status: 500,
            message: "Internal server error while marking notification"
        }
    }
}

async function markAllNotificationAsRead(_userId){
    try{
        await notification.update(
            {isRead: true},
            {where: {userId: _userId, isRead: false}}
        )
        return{
            status: 200,
            message: "All notifications marked as read"
        }
    }
    catch(error){
        console.error(`Error marking all as read: ${error}`)
        return{
            status: 500,
            message: "Internal server error while marking all notification as read"
        }
    }
}

export {
    fetchUserNotifications,
    markNotificationAsRead,
    markAllNotificationAsRead
}
import { manageTags, manageUserStatus, fetchAllUsers, fetchAllReports, manageReportStatus, fetchStatistic } from "../Services/AdminService.js";

async function manageTagAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role
        if(userRole !== 'admin' || !userId){
            return res.status(401).json({message: "Unauthorized user, feature prohibited"})
        }
        const {tagId, versionId, isVerified, visibility, adminNotes} = req.body
        const result = await manageTags(tagId, versionId, isVerified, visibility, adminNotes)

        return res.status(result.status).json({
            status: result.status,
            message: result.message
        })
    }
    catch(error){
        console.error(`Error while updating tag: ${error}`)
        return res.status(500).json({message: "Internal server error while updating tag"})
    }
}

async function manageUserAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(401).json({
                message: "Unauthorized user, feature prohibited"
            })
        }

        const targetUserId = req.params.id
        const { action, durationDays, adminNotes } = req.body

        const result = await manageUserStatus(targetUserId, action, durationDays, adminNotes)

        return res.status(result.status).json({
            status: result.status,
            message: result.message
        })
    }
    catch(error){
        console.error(`Error while managing user: ${error}`)
        return res.status(500).json({
            message: "Internal server error while managing user"
        })
    }
}

async function getUsersAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(403).json({
                message: "Unauthorized user, feature forbidden"
            })
        }

        const searchQuery = req.query.search || ''
        const result = await fetchAllUsers(searchQuery)

        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error while get users: ${error}`)
        return res.status(500).json({message: "Server error while fetching users"});
    }
}

async function getReportsAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(403).json({
                message: "Unauthorized user, feature forbidden"
            })
        }

        const statusFilter = req.query.status || 'Pending'
        const result = await fetchAllReports(statusFilter)

        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error while fetching reports: ${error}`)
        return res.status(500).json({
            message: "Server error while fetching reports"
        })
    }
}

async function manageReportAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(403).json({
                message: "Unauthorized user, feature forbidden"
            })
        }
        const reportId = req.params.id;
        const { status, adminNotes, roadName } = req.body;

        const result = await manageReportStatus(reportId, status, adminNotes, roadName);

        return res.status(result.status).json(result);
    } catch (error) {
        console.error(`Error manageReportStatusAdmin: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getStatisticAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(403).json({
                message: "Unauthorized user, feature forbidden"
            })
        }

        let bbox = null;
        if (req.query.minLat && req.query.maxLat && req.query.minLon && req.query.maxLon) {
            bbox = {
                minLat: req.query.minLat,
                maxLat: req.query.maxLat,
                minLon: req.query.minLon,
                maxLon: req.query.maxLon
            };
        }

        const result = await fetchStatistic(bbox)
        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error while fetching statistic: ${error}`)
        return res.status(500).json({
            message: "Internal server error while fetching statistic"
        })
    }
}

export {
    manageTagAdmin,
    manageUserAdmin,
    getUsersAdmin,
    getReportsAdmin,
    manageReportAdmin,
    getStatisticAdmin
}
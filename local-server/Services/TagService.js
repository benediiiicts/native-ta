import { tagRoads, tagVersions } from '../Models/TagModel.js';
import { user, userVotes } from '../Models/UserModel.js';
import { versionImages, comments } from '../Models/MediaModel.js';
import { Op, where } from "sequelize";
import cron from 'node-cron';
import sequelize from "../database.js";
import { saveImages } from "./MediaService.js";

async function checkRoadRadius(_latitude, _longitude){
    const earthRadius = 6371000
    const maxDistance = 10 //10 meter

    const distanceQuery = sequelize.literal(`
        ( ${earthRadius} * acos( 
            cos( radians(${_latitude}) ) 
            * cos( radians(latitude) ) 
            * cos( radians(longitude) - radians(${_longitude}) ) 
            + sin( radians(${_latitude}) ) 
            * sin( radians(latitude) ) 
        ) )
    `);

    try{
        let tagExist = await tagRoads.findOne({
            where: sequelize.where(distanceQuery, {
                [Op.lte]: maxDistance
            })
        })
        if (tagExist){
            return {
                status: 409,
                message: "A tag already exist within 5 meter radius",
                data: tagExist
            }
        }
        else{
            return{
                status: 200,
                message: "No tag found within 5 meter radius"
            }
        }
    }
    catch(error){
        console.log(`Radius check error: ${error}`)
        return{
            status: 500,
            message: "Internal error while checking location radius"
        }
    }
}

// TAG ROAD
async function createTagRoad(_userId, _latitude, _longitude, _roadClass, _issueType, _description, _forceCreate = false, _images){
    if(!_forceCreate){
        let tagExist = await checkRoadRadius(_latitude, _longitude)

        if(tagExist.status !== 200){
            return tagExist;
        }
    }
    
    try{
        const result = await sequelize.transaction(async t =>{
            const newRoad = await tagRoads.create({
                latitude: _latitude,
                longitude: _longitude,
                isHidden: false,
                roadClass: _roadClass,
                issueType: _issueType,
            }, {transaction: t})

            const newVersion = await tagVersions.create({
                tagRoadId: newRoad.id,
                userId: _userId,
                status: "Menunggu Tindakan",
                description: _description,
                score: 0,
                isVerified: false
            }, {transaction: t})

            await newRoad.update({
                activeVersionId: newVersion.id
            }, {transaction: t})

            let savedImages = []
            if(_images && _images.length > 0){
                console.log("images available")
                savedImages = await saveImages(newVersion.id, _images, t)
            }
            return {
                road: newRoad,
                version: newVersion,
                images: savedImages
            }
        })

        return{
            status: 201,
            message: "New tag road and its initial version has been created successfully",
            data: result
        }
    }
    catch(error){
        console.error(`Transaction error while creating tag road: ${error} `)
        if(error.status){
            return {
                status: error.status,
                message: error.message
            }
        }
        return{
            status: 500,
            message: "Failed to create tag road due to server error"
        }
    }
}

async function getTagRoad(_tagRoadId){
    try{
        const fetchRoad = await tagRoads.findByPk(_tagRoadId,{
            where: {isHidden: false}
        })
        if(fetchRoad){
            return {
                data: fetchRoad,
                status: 200
            }
        }
        return{
            status: 404,
            message: "Tag road not found"
        }
    }
    catch(error){
        console.error(`Error while fetching tag ${error}`)
        return{
            status: 500,
            message: "Failed to fetch tag due to server error"
        }
    }
}

async function getTagDetail(_tagId, _userId=null, _versionId=null){
    try{
        let targetVersionId = _versionId
        const road = await tagRoads.findOne({ where: { id: _tagId } });
        if(!road){
            return{
                status: 404,
                data: null,
                message: "Tag roads not found"
            }
        }

        if (road.isHidden) {
            if (!_userId) {
                return { status: 404, data: null, message: "Tag roads not found" };
            }
            const checkUser = await user.findByPk(_userId, { attributes: ['role'] });
            if (!checkUser || checkUser.role !== 'admin') {
                return { status: 404, data: null, message: "Tag roads not found" };
            }
        }

        if(!targetVersionId){
            targetVersionId = road.activeVersionId
        }

        const currVersion = { id: targetVersionId };

        const detail = await tagRoads.findOne({
            where: {id: _tagId },
            include:[
                {
                    model: tagVersions,
                    as: 'versions',
                    where: currVersion,
                    include:[
                        {model: user, as: 'author', attributes: ['id', 'username']},
                        {model: versionImages, as: 'images', attributes: ['imageUrl']}, 
                        {
                            model: comments,
                            as: 'comments', 
                            include: [{ model: user, as: 'commentAuthor', 
                                attributes: ['username', 'id'] }]
                        }
                    ]
                }
            ]
        })

        if (!detail || !detail.versions || detail.versions.length === 0) {
            return {
                status: 404,
                data: null,
                message: "Data laporan jalan tidak ditemukan."
            }
        }        
        const result = detail.toJSON()
        result.activeVersion = result.versions[0]
        delete result.versions

        let currentUserVote = null
        if(_userId && result.activeVersion){
            const vote = await userVotes.findOne({
                where: { userId: _userId, tagVersionId: result.activeVersion.id }
            });

            if (vote) {
                currentUserVote = vote.voteType;
            }
        }

        result.currentUserVote = currentUserVote;

        return {
            status: 200,
            data: result,
            message: "Tag detail successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching tag details ${error}`)
        error.status = 500; 
        throw error
    }
}

async function getAllTags(_userId=null, _includeHidden="false"){
    try{
        if(_includeHidden !== "false"){
            if(!_userId){
                return{
                    status: 401,
                    message: "User not authorized"
                }
            }
            const checkUser = await user.findByPk(_userId,{
                attributes: ['role']
            })
            if(checkUser.role !== 'admin'){
                return{
                    status: 401,
                    message: "User not authorized"
                }
            }
        }
        let whereCondition = {};
        
        if (_includeHidden === "false") {
            whereCondition.isHidden = false;
        }
        
        const fetchTags = await tagRoads.findAll({
            where: whereCondition
        })
        return {
            data: fetchTags,
            status: 200
        } 
    }
    catch(error){
        console.error(`Error while fetching tag ${error}`)
        return{
            status: 500,
            message: "Failed to fetch tags due to server error"
        }
    }
}

//TAG VERSION
async function createTagVersion(_tagRoadId, _userId, _status, _description, _images, _isAdmin=false){
    const tagRoadExist = await getTagRoad(_tagRoadId)
    if(!tagRoadExist){
        return{
            status: 404,
            message: "Tag road not found"
        }
    }
    try{
        const result = await sequelize.transaction(async t => {
            const newVersion = await tagVersions.create({
                tagRoadId: _tagRoadId,
                userId: _userId,
                status: _status,
                description: _description,
                score: 0,
                isVerified: _isAdmin
            }, {transaction: t})

            let roadUpdateData = { updatedAt: new Date() }

            if (_isAdmin) {
                roadUpdateData.activeVersionId = newVersion.id
            }

            await tagRoads.update(
                { updatedAt: new Date() }, 
                { where: { id: _tagRoadId }, transaction: t }
            );

            let savedImages = []
            if(_images && _images.length > 0){
                savedImages = await saveImages(newVersion.id, _images, t)
            }
            return {
                version: newVersion,
                images: savedImages
            }
        })

        return {
            status: 201,
            message: "New tag successfully created",
            data: result
        }
    }
    catch(error){
        console.log(`Error while creating new version of the tag: ${error}`)
        if(error.status){
            return{
                status: error.status,
                message: error.message
            }
        }
        return{
            status: 500,
            message: "Internal server error"
        }
    }
}

async function getVersionHistory(_tagId){
    try{
        const history = await tagVersions.findAll({
            where: {tagRoadId: _tagId},
            include: [{
                model: user,
                as: 'author',
                attributes: ['username', 'id']
            }],
            order: [['createdAt', 'DESC']]
        })

        return{
            status: 200,
            data: history,
            message: 'Version history fetched successfully'
        }
    }
    catch(error){
        console.error(`Error while fetching versions: ${error}`)
        return{
            status: 500,
            message: 'Internal server error while fetching version history'
        }
    }
}

async function deleteTagComments(_commentId){
    try{
        const comment = await comments.findByPk(_commentId)
        if(!comment){
            return {
                status: 404,
                message: "Comment not found"
            }
        }
        await comment.destroy()
        return {
            status: 200,
            message: "comment successfully deleted"
        }
    }
    catch(error){
        console.error(`Error while deleting comment: ${error}`)
        return{
            status: 500,
            message: "Internal server error while deleting comment"
        }
    }
}

async function voteTagVersion(_userId, _tagId, _voteType){
    try{
        const result = await sequelize.transaction(async (t) => {
            const existingVote = await userVotes.findOne({
                where: {userId: _userId, tagVersionId: _tagId},
                transaction: t
            })

            const version = await tagVersions.findByPk(_tagId, {transaction: t})
            if(!version){
                const error = new Error("Version not found")
                error.status = 404
                throw error
            }

            let actionMessage = "";
            let finalVoteStatus = _voteType;

            if(existingVote){
                if(existingVote.voteType == _voteType){
                    await existingVote.destroy({transaction: t})
                    if (_voteType === 'Approve') {
                        await version.decrement('approveCount', { transaction: t });
                    } else if (_voteType === 'Reject') {
                        await version.decrement('rejectCount', { transaction: t });
                    }
                    actionMessage = "Vote removed";
                    finalVoteStatus = null;
                }
                else{
                    await existingVote.update({voteType: _voteType}, {transaction: t})
                    if(_voteType == 'Approve'){
                        await version.increment('approveCount', {transaction: t})
                        await version.decrement('rejectCount', { transaction: t });
                    }
                    else if(_voteType == 'Reject'){
                        await version.decrement('approveCount', {transaction: t})
                        await version.increment('rejectCount', { transaction: t });
                    }
                    actionMessage = "Vote updated";
                }
            }
            else{
                await userVotes.create({
                    userId: _userId,
                    tagVersionId: _tagId,
                    voteType: _voteType
                }, {transaction: t})

                if(_voteType == 'Approve'){
                    await version.increment('approveCount', {transaction: t})
                }
                else if (_voteType == 'Reject'){
                    await version.increment('rejectCount', {transaction: t})
                }
                actionMessage = "Vote added";
            }

            await version.reload({ transaction: t });

            // Hitung usia dalam hari
            const ageInMs = Date.now() - new Date(version.createdAt).getTime();
            const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

            // Rumus time decay: (Approve - Reject) / (Age + 1)^1.5
            const baseVote = Math.max(0, (version.approveCount - version.rejectCount)) + 1
            const newScore = baseVote / Math.pow((ageInDays + 1), 1.5);

            await version.update({ score: newScore }, { transaction: t });

            // Cari versi dengan skor tertinggi untuk jalan ini
            const bestVersion = await tagVersions.findOne({
                where: { 
                    tagRoadId: version.tagRoadId,
                    isHidden: false,
                    [Op.or]: [ // lebih dari 3 vote atau sudah terverifikasi
                        { approveCount: { [Op.gte]: 3 } },
                        { isVerified: true } 
                    ]
                },
                order: [
                    ['score', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                transaction: t
            });

            const road = await tagRoads.findByPk(version.tagRoadId, { transaction: t });
            if (road && bestVersion && road.activeVersionId !== bestVersion.id) {
                await road.update({ 
                    activeVersionId: bestVersion.id 
                }, { transaction: t });
            }

            return { 
                status: (existingVote && existingVote.voteType !== _voteType) ? 200 : (existingVote ? 200 : 201), 
                message: actionMessage, 
                currentVote: finalVoteStatus 
            };
        })
        
        return result
    }
    catch(error){
        console.error(`Error while processing vote: ${error}`)
        return{
            status: error.status || 500,
            message: error.message || "Internal server error while processing vote"
        }
    }
}

async function countRelevanceScore(){
    try{
        console.log(`[CRON JOB] Calculating scores using time decay`)

        const gravitation = 1.5
        let offset = 0
        let processed = 0

        const BATCH_SIZE = 500 

        while(true){
            const roads = await tagRoads.findAll({
                where: {isHidden: false},
                limit: BATCH_SIZE,
                offset: offset,
                include: [
                    {
                        model: tagVersions,
                        as: 'versions'
                    }
                ]
            })

            if(roads.length == 0) break

            const versionUpdates = []
            const roadUpdates = []
            const roadHideUpdates = []

            for(let road of roads){
                if(!road.versions || road.versions.length == 0) continue
                
                let highestScore = -Infinity
                let bestVersionId = null
                let bestVersionDate = new Date(0)

                for(let version of road.versions){
                    let decayScore
                    //jika sudah terverifikasi, ubah skor menjadi sangat besar
                    if(version.isVerified){
                        decayScore = 9999
                    }
                    else{
                        //hitung usia dalam hari
                        const ageInMs = Date.now() - new Date(version.createdAt).getTime()
                        const ageInDays = ageInMs / (1000*60*60*24)
                        // Rumus Time Decay: ( (A - R) + 1 ) / (Age + 1)^1.5
                        const baseVote = Math.max(0, (version.approveCount - version.rejectCount)) + 1
                        const divisor = Math.pow(ageInDays + 1, gravitation)
                        decayScore = baseVote / divisor
                    }
                    
                    versionUpdates.push({id: version.id, score: decayScore})

                    const isEligible = (version.approveCount >= 3 || version.isVerified) && !version.isHidden

                    if(isEligible){
                        if(decayScore > highestScore){
                            highestScore = decayScore
                            bestVersionId = version.id
                            bestVersionDate = new Date(version.createdAt)
                        }
                        //jika skor sama, ambil yang terbaru
                        else if(decayScore == highestScore){
                            const currVersionDate = new Date(version.createdAt)
                            if(currVersionDate > bestVersionDate){
                                bestVersionId = version.id
                                bestVersionDate = currVersionDate
                            }
                        }
                    }
                }

                if(bestVersionId && road.activeVersionId !== bestVersionId){
                    roadUpdates.push({ id: road.id, activeVersionId: bestVersionId })                    
                }

                const activeVersionIdCheck = bestVersionId || road.activeVersionId
                const activeVersionCheck = road.versions.find((v) =>{
                    return v.id == activeVersionIdCheck
                })

                if(activeVersionCheck){
                    const isResolved = activeVersionCheck.status == 'Sudah Diperbaiki' || activeVersionCheck.status == 'Kedaluwarsa / Tidak Valid'
                    const dateDiff = (Date.now() - new Date(activeVersionCheck.createdAt).getTime()) / (1000*60*60*24)

                    //jika versi utama menunjukkan jalan sudah diperbaiki
                    //beri waktu 1 minggu sebelum tag disembunyikan
                    if(isResolved){
                        if(activeVersionCheck.status == 'Sudah Diperbaiki' && dateDiff >= 7){
                            roadHideUpdates.push(road.id)
                        }
                        else if(activeVersionCheck.status == 'Kedaluwarsa / Tidak Valid'){
                            roadHideUpdates.push(road.id)
                        }
                    }  
                    //jika versi utama sudah berumur lebih dari 1 bulan
                    //dan belum mendapakan > 3 approve vote
                    else if(dateDiff >= 30 && activeVersionCheck.approveCount < 3 && !activeVersionCheck.isVerified){
                        roadHideUpdates.push(road.id)
                    }
                    //jika suatu tag sudah berumur lebih dari 2 bulan
                    //dan belum mendapatkan update versi (tentunya belum resovle)
                    else if(dateDiff >= 60){
                        roadHideUpdates.push(road.id)
                    }
                }
            }

            if (versionUpdates.length > 0) {
                await Promise.all(
                    versionUpdates.map((v) => {
                        return tagVersions.update({score: v.score}, {where: {id: v.id}})
                    })
                )
            }

            if(roadUpdates.length > 0){
                await Promise.all(
                    roadUpdates.map((r) => {
                        return tagRoads.update({activeVersionId: r.activeVersionId}, {where: {id: r.id}})
                    })
                )
            }

            if(roadHideUpdates.length > 0){
                await tagRoads.update(
                    {isHidden: true},
                    {where: {id: {[Op.in]: roadHideUpdates}}}
                )
                console.log(`[CRON JOB] ${roadHideUpdates.length} roads automatically hidden`);
            }

            processed += roads.length
            console.log(`[CRON JOB] Processed ${processed} roads...`)
            offset += BATCH_SIZE
        }
    }
    catch(error){
        console.error(`[CRON JOB] Error while calculating time decay: ${error}`)
    }
}

async function checkRecentUpdate(lat, lon, lastFetchTime){
    try{
        const fetchDate = new Date(lastFetchTime)

        const offset = 0.045 //5 km
        const minLat = parseFloat(lat) - offset;
        const maxLat = parseFloat(lat) + offset;
        const minLon = parseFloat(lon) - offset;
        const maxLon = parseFloat(lon) + offset;
        
        const updatesCount = await tagRoads.count({
            //hitung semua tag baru di radius
            where:{
                updatedAt: {[Op.gt]: fetchDate},
                latitude: {[Op.between]: [minLat, maxLat]},
                longitude: { [Op.between]: [minLon, maxLon] }
            }
        })

        return{
            status: 200,
            data: {
                hasUpdates: updatesCount > 0, 
                count: updatesCount
            },
            message: "Update check successfull"
        }
    }
    catch(error){
        console.error(`Error while checking recent updates: ${error}`)
        return{
            status: 500,
            message: "Internal server error while checking updates"
        }
    }
}

export {
    createTagRoad, 
    getTagRoad,
    getTagDetail,
    getAllTags,
    createTagVersion,
    getVersionHistory,
    voteTagVersion,
    countRelevanceScore,
    checkRecentUpdate,
    deleteTagComments
}
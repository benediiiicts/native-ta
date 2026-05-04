import {commentTagVersion, loadComment} from '../Services/CommentService.js'

async function handleComment(req, res){
    try{
        const userId = req.user.id
        const tagId = req.params.id
        const {content} = req.body
        const images = req.files || []
        let commentResult = await commentTagVersion(userId, tagId, content, images)
        return res.status(commentResult.status).json({
            data: commentResult.data,
            status: commentResult.status,
            message: commentResult.message
        })
    }
    catch(error){
        console.error(`Error while posting comment: ${error}`)
        return res.status(500).json({message: `Internal error while posting comment`})
    }
}

async function handleLoadComment(req, res){
    try{
        const tagId = req.params.id
        let commentResult = await loadComment(tagId)
        return res.status(commentResult.status).json({
            data: commentResult.data,
            status: commentResult.status,
            message: commentResult.message
        })
    }
    catch(error){
        console.error(`Error while fetching comments: ${error}`)
        return res.status(500).json({message: `Internal error while fetching comments`})
    }
}

export {handleComment, handleLoadComment} 
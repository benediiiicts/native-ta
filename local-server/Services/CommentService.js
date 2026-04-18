import { user } from '../Models/UserModel.js';
import { comments } from '../Models/MediaModel.js';
import sequelize from "../database.js";

async function commentTagVersion(_userId, _tagId, _content, _image=null){
    try{
        const result = await sequelize.transaction(async (t) => {
            const newComment = await comments.create({
                tagVersionId: _tagId,
                userId: _userId,
                content: _content,
            }, {transaction: t})

            if(_image && _image.length > 0){    
                newComment.update({
                    imageUrl: _image[0].filename
                }, {transaction: t})
            }

            return newComment
        })
        return{
            status: 201,
            message: 'New comment successfully added',
            data: result
        }
    }
    catch(error){
        console.error(`Error while posting comment [${error}]`)
        if(error.status && error.message){
            return{
                status: error.status,
                message: error.message
            }
        }
        else{
            return {
                status: 500,
                message: 'Internal server error while posting comment'
            }    
        }
    }
}

//hanya untuk reload comment ketika user klik tombol refresh
async function loadComment(_tagId){
    try{
        const fetchComments = await comments.findAll({
            where: {tagVersionId: _tagId},
            include: [{ model: user, as: 'commentAuthor', attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
        })
        return{
            status: 200,
            data: fetchComments,
            message: `Comments successfully loaded`
        }
    }
    catch(error){
        console.error(`Error while fetching comments [${error}]`)
        return {
            status: 500,
            message: 'Failed to fetch comments due to server error'
        }
    }
}

export {
    commentTagVersion,
    loadComment
}
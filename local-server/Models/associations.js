import { user } from './UserModel.js';
import { tagRoads, tagVersions } from './TagModel.js';
import { versionImages, comments } from './MediaModel.js';

tagRoads.belongsTo(tagVersions, {foreignKey: 'activeVersionId', as: 'activeVersion'})

tagVersions.belongsTo(user, {foreignKey: 'userId', as: 'author'})
tagVersions.hasMany(versionImages, {foreignKey: 'tagVersionId', as: 'images'})
tagVersions.hasMany(comments, {foreignKey: 'tagVersionId', as: 'comments'})

versionImages.belongsTo(tagVersions, { foreignKey: 'tagVersionId' })

comments.belongsTo(tagVersions, { foreignKey: 'tagVersionId' });
comments.belongsTo(user, { foreignKey: 'userId', as: 'commentAuthor' });

export default function setupAssociations(){
    console.log("Database associations setup complete.");
}
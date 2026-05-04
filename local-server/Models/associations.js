import { user } from './UserModel.js';
import { tagRoads, tagVersions } from './TagModel.js';
import { versionImages, comments, reports } from './MediaModel.js';

tagRoads.belongsTo(tagVersions, {
    foreignKey: 'activeVersionId', 
    as: 'activeVersion',
    constraints: false
});
tagRoads.hasMany(tagVersions, {foreignKey: 'tagRoadId', as: 'versions'});

tagVersions.belongsTo(tagRoads, {foreignKey: 'tagRoadId', as: 'road'})
tagVersions.belongsTo(user, {foreignKey: 'userId', as: 'author'});
tagVersions.hasMany(versionImages, {foreignKey: 'tagVersionId', as: 'images'});
tagVersions.hasMany(comments, {foreignKey: 'tagVersionId', as: 'comments'});

versionImages.belongsTo(tagVersions, { foreignKey: 'tagVersionId' });

comments.belongsTo(tagVersions, { foreignKey: 'tagVersionId' });
comments.belongsTo(user, { foreignKey: 'userId', as: 'commentAuthor' });

reports.belongsTo(user, { foreignKey: 'userId', as: 'reporter' })

user.hasMany(reports, {foreignKey: 'userId', as: 'reports'})

export default function setupAssociations(){
    console.log("Database associations setup complete.");
}
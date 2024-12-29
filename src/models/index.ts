import user from "./user";
import video from "./video";
import link from "./link";
import setting from "./setting";

video.hasMany(link, {
    foreignKey: 'videoId'
});
link.belongsTo(video, {
    foreignKey: 'videoId'
});

export {
    user,
    video,
    link,
    setting
}
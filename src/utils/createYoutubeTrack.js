// const { Track } = require("discord-player");
// const ytdl = require("ytdl-core");

// async function createYoutubeTrack(player, url) {
//   const trackInfo = await ytdl.getInfo(url).then((info) => info.videoDetails);
//   return new Track(player, {
//     title: trackInfo.title,
//     url,
//     source: "youtube",
//     duration: trackInfo.lengthSeconds,
//   });
// }

// module.exports = createYoutubeTrack;
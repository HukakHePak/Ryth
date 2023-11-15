// const BOT = require("./consts");

// async function managePlayer(message, { command, title, url }) {
//   const queue = BOT.QUEUE;

//   if (queue.playing) {
//     switch (command) {
//     case "pause":
//       queue.setPaused(true);
//       return;

//     case "skip":
//       if (queue.tracks.length) queue.skip();
//       return;

//     case "back":
//       if (queue.previousTracks.length > 1) queue.back();
//       return;

//     case "to":
//       if (+title <= BOT.PLAYLIST.size) {
//         const tracks = Array.from(BOT.PLAYLIST.values()).slice(+title - 1);
//         queue.clear();
//         queue.addTracks(tracks);
//         queue.play();
//       }
//       return;

//     case "play":
//       if (queue.connection.paused) queue.setPaused(false);
//       return;

//     case "add":
//       //   const track = queue.current;
//       //   if (track) BOT.PLAYLIST.set(title ? title : track.title, track);
//       //   return;
//     }
//   }
//   switch (command) {
//   case "remove":
//     if (+title) {
//       const key = Array.from(BOT.PLAYLIST.keys())[+title - 1];
//       BOT.PLAYLIST.delete(key);
//       return;
//     }

//     BOT.PLAYLIST.delete(title);
//     return;

//   case "list":
//     if (!BOT.PLAYLIST.size) {
//       message.reply(BOT.PHRASE.TRACK.LIST_EMPTY);
//       return;
//     }

//     // let trackList = "";
//     // let count = 0;

//     // BOT.PLAYLIST.forEach((track, name) => {
//     //   trackList +=
//     //       ++count +
//     //       `\t|\t**${name}**` +
//     //       (track.raw.duration ? "" : "\t/\tradio") +
//     //       "\n";
//     // });

//     // if (trackList) message.reply(trackList);
//     return;

//   case "help":
//     message.reply(BOT.PHRASE.HELP);
//     return;

//   case "dream":
//     if (message.author.username === BOT.OWNER) {
//       await message.reply(BOT.PHRASE.DREAM);
//       if (queue.playing) queue.stop();
//       client.destroy();
//       process.exit();
//     }
//     return;
//   }

//   if (message.member.voice.channel) {
//     switch (command) {
//     case "play":
//       try {
//         await queue.connect(message.member.voice.channel);
//       } catch {
//         console.log("Can't connect to voice");
//         return;
//       }

//       if (message.author.username === BOT.OWNER)
//         message.reply(BOT.PHRASE.OWNER.PLAY);

//       if (BOT.PLAYLIST.size) {
//         queue.addTracks(Array.from(BOT.PLAYLIST.values()));
//         queue.play();
//         return;
//       }

//       if (!queue.tracks.length) {
//         queue.play(await createTrack(BOT.DEFAULT.TRACK_URL));
//         return;
//       }

//       message.reply(BOT.PHRASE.PLAYER.PLAY);
//       return;

//     case "stop":
//       if (queue.connection) queue.stop();
//       return;
//     }

//     if (command) return;

//     if (!queue.connection) await queue.connect(message.member.voice.channel);

//     if (url) {
//       const track = await createTrack(url);

//       if (title) BOT.PLAYLIST.set(title, track);

//       queue.play(track);
//       return;
//     }

//     if (title) {
//       let track = BOT.PLAYLIST.get(title);

//       if (!track) {
//         track = await BOT.PLAYER.search(title, {
//           requestedBy: message.author,
//         }).then((response) => response.tracks[0]);
//       }

//       queue.play(track);
//     }
//   } else message.reply(BOT.PHRASE.VOICE.DISCONNECT);
// }

// module.exports = managePlayer;

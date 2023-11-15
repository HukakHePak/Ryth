import { Player } from "discord-player";
import { BOT } from "../constants/bot";

export function createPlayer(client) {
  const player = new Player(client);

  player.on("connectionError", (queue) => {
    const track = queue.previousTracks[0];
    if (!track.raw.duration) {
      queue.play(track);
    }
  });

  player.on("queueEnd", (queue) => {
    // if (BOT.PLAYLIST.size) {
    //   queue.addTracks(Array.from(BOT.PLAYLIST.values()));
    //   queue.play();
    // }
  });

  player.on("trackAdd", (queue, track) =>
    queue.metadata.channel.send(BOT.PHRASE.PLAYER.ADD)
  );

  player.on("trackStart", (queue, track) =>
    queue.metadata.channel.send(BOT.PHRASE.PLAYER.START(track.raw.title))
  );
}
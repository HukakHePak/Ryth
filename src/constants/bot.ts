import { config } from "dotenv";
config();

export const BOT = {
  TOKEN: process.env.BOT_TOKEN,
  NAME: process.env.BOT_NAME,
  OWNER: process.env.BOT_OWNER,
  PHRASE: {
    MEMBER: {
      JOIN: "Congratulations and welcome to the server! I believe that a strong group of People can do much more together and surpass what an individual can do alone",
      LEAVE: "We have lost a worthy fighter. Rest in peace...",
      HELLO(userName: string) {
        return "Hi, **" + userName + "**, glad to see you! 😄";
      },
    },
    OWNER: {
      PLAY: "Oh, yes, my **master**",
    },
    PLAYER: {
      START(title: string) {
        return `🎶 | Now playing **${title}**!`;
      },
      STOP: "Player stopped",
      PLAY: "Player always play",
      ADD: "Track added on queue",
    },
    VOICE: {
      DISCONNECT: "Not connect to voice",
      CONNECT: "Voice always connected",
    },
    TRACK: {
      START: "",
      LIST_EMPTY: "Playlist is empty",
    },
    DREAM: "Bye ☺️☺️☺️",
    BANANA: "💦",
    HELP:
      "ryth play - connect to voice and start list \n" +
      "ryth < track > - add track from list in queue or search on youtube \n" +
      "ryth < url > - add track from url in queue\n" +
      "ryth < url > < name > - add named track from url in list\n" +
      "ryth add < name > - add named track from player in list\n" +
      "ryth add - add track with default name\n" +
      "ryth list - show list tracks\n" +
      "ryth remove < id / name > - remove track from list\n" +
      "ryth to < id / name > - play current track from list\n" +
      "ryth stop / pause / skip / back / help",
  },
  COMMANDS: [
    "play",
    "skip",
    "pause",
    "stop",
    "back",
    "to",
    "remove",
    "skip",
    "list",
    "help",
    "dream",
    "add",
  ],
  DEFAULT: {},
};
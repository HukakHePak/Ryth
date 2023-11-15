import { Client, ClientOptions } from "discord.js";
import { BOT } from "constants/bot";
import { GatewayIntentBits } from "discord-api-types/v10";

// import { createPlayer } from "core/player";

const client = new Client(<ClientOptions>{
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// client.player = createPlayer(client);

client.on("guildMemberAdd", (action) => {
  action.send(BOT.PHRASE.MEMBER.JOIN);
});

client.on("guildMemberRemove", (action) => {
  action.send(BOT.PHRASE.MEMBER.LEAVE);
});

client.once("ready", () => {
  console.log("I'm ready!");
});

// client.on("messageCreate", messageHandler);
client.on("messageCreate", (message) => {
  message.reply("hello");
});

client.login(BOT.TOKEN);

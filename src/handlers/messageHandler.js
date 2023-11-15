// export async function messageHandler(message) {
//     if (message.author.bot) return;
  
//     const crumbs = parseContent(message.content);
  
//     switch (crumbs.botName) {
//     case BOT.NAME:
//     //   if (!BOT.QUEUE || BOT.QUEUE.destroyed)
//     //     BOT.QUEUE = BOT.PLAYER.createQueue(message.guild, {
//     //       metadata: { channel: message.channel },
//     //       leaveOnEnd: false,
//     //     });
  
//       //managePlayer(message, crumbs);
//       break;
  
//     case "🍌":
//       message.reply(BOT.PHRASE.BANANA);
//       break;
  
//     case "hi,":
//       if (message.content.toLowerCase().includes(BOT.NAME))
//         message.reply(BOT.PHRASE.MEMBER.HELLO(message.author.username));
//       break;
//     }
//   }
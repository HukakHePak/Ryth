// export function parseContent(content) {
//   const crumbs = content.trim().split(" ");
//   const botName = crumbs[0].toLowerCase();
//   let command = crumbs[1] ? crumbs[1].toLowerCase() : undefined;
//   let title = crumbs[2];

//   if (!BOT.COMMANDS.includes(command)) {
//     command = undefined;
//     title = crumbs
//       .filter((crumb) => {
//         return crumb !== BOT.NAME && !isUrl(crumb);
//       })
//       .join(" ");
//   }
//   const url = crumbs.find(isUrl);

//   return { botName, command, title, url };
// }

// export function parseMessage (message) {

// }
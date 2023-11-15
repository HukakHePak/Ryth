import { CommandInterface } from "interfaces/command";

export const commands:CommandInterface[] = [
  {
    name: "play",
    description: "connect to voice and start list",
    type: "command",
    run: () => {},
  },
  {
    name: "track",
    description: "add track from list in queue or search on youtube",
    type: "crumbs",
    crumbs: ["track"],
    run: () => {},
  },
];
export interface CommandInterface {
  name: string;
  description: string;
  type: "command" | "crumbs";
  crumbs?: string[];
  group?: string;
  run: () => void;
}

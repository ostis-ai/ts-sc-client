import { ScAddr } from "./ScAddr";
import { ScLinkContent } from "./ScLinkContent";
import { ScType } from "./ScType";
import { invalidValue } from "./errors";
import { ScConstructionCommand } from "./ScConstructionCommand";

export class ScConstruction {
  private _commands: ScConstructionCommand[];
  private _aliases: Record<string, number>;

  constructor() {
    this._commands = [];
    this._aliases = {};
  }

  public createNode(type: ScType, alias?: string) {
    if (!type.isNode()) {
      invalidValue("You should pass node type there");
    }

    const cmd = new ScConstructionCommand(type);
    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public createEdge(
    type: ScType,
    src: string | ScAddr,
    trg: string | ScAddr,
    alias?: string
  ) {
    if (!type.isEdge()) {
      invalidValue("You should pass edge type there");
    }
    const cmd = new ScConstructionCommand(type, {
      src: src,
      trg: trg,
    });

    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public createLink(type: ScType, content: ScLinkContent, alias?: string) {
    if (!type.isLink()) {
      invalidValue("You should pass link type there");
    }
    const cmd = new ScConstructionCommand(type, {
      content: content.data,
      type: content.type,
    });

    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public get commands() {
    return this._commands;
  }

  public getIndex(alias: string) {
    return this._aliases[alias];
  }
}

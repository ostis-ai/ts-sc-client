import { ScAddr } from "./ScAddr";
import { ScLinkContent } from "./ScLinkContent";
import { ScType } from "./scType";
import { InvalidValue } from "./errors";
import { ScConstructionCommand } from "./ScConstructionCommand";

export class ScConstruction {
  private _commands: ScConstructionCommand[];
  private _aliases: Record<string, number>;

  constructor() {
    this._commands = [];
    this._aliases = {};
  }

  public CreateNode(type: ScType, alias?: string) {
    if (!type.isNode()) {
      InvalidValue("You should pass node type there");
    }

    const cmd: ScConstructionCommand = new ScConstructionCommand(type);
    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public CreateEdge(
    type: ScType,
    src: string | ScAddr,
    trg: string | ScAddr,
    alias?: string
  ) {
    if (!type.isEdge()) {
      InvalidValue("You should pass edge type there");
    }
    const cmd: ScConstructionCommand = new ScConstructionCommand(type, {
      src: src,
      trg: trg,
    });

    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public CreateLink(type: ScType, content: ScLinkContent, alias?: string) {
    if (!type.isLink()) {
      InvalidValue("You should pass link type there");
    }
    const cmd: ScConstructionCommand = new ScConstructionCommand(type, {
      content: content.data,
      type: content.type,
    });

    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  public get commands(): ScConstructionCommand[] {
    return this._commands;
  }

  public GetIndex(alias: string) {
    return this._aliases[alias];
  }
}

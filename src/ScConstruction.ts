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

  public generateNode(type: ScType, alias?: string) {
    if (!type.isNode()) {
      invalidValue("You should pass node type there");
    }

    const cmd = new ScConstructionCommand(type);
    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  /*!
   * @deprecated ScConstruction `createNode` method is deprecated. Use `generateNode` instead.
   */
  public createNode(type: ScType, alias?: string) {
    console.warn("Warning: ScConstruction `createNode` method is deprecated. Use `generateNode` instead.");
    this.generateNode(type, alias);
  }

  public generateConnector(
    type: ScType,
    source: string | ScAddr,
    target: string | ScAddr,
    alias?: string
  ) {
    if (!type.isConnector()) {
      invalidValue("You should pass connector type there");
    }
    const cmd = new ScConstructionCommand(type, {
      src: source,
      trg: target,
    });

    if (alias) {
      this._aliases[alias] = this._commands.length;
    }
    this._commands.push(cmd);
  }

  /*!
   * @deprecated ScConstruction `createEdge` method is deprecated. Use `generateConnector` instead.
   */
  public createEdge(
    type: ScType,
    source: string | ScAddr,
    target: string | ScAddr,
    alias?: string
  ) {
    console.warn("Warning: ScConstruction `createEdge` method is deprecated. Use `generateConnector` instead.");
    this.generateConnector(type, source, target, alias);
  }

  public generateLink(type: ScType, content: ScLinkContent, alias?: string) {
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

  /*!
   * @deprecated ScConstruction `createLink` method is deprecated. Use `generateLink` instead.
   */
  public createLink(type: ScType, content: ScLinkContent, alias?: string) {
    console.warn("Warning: ScConstruction `createLink` method is deprecated. Use `generateLink` instead.");
    this.generateLink(type, content, alias);
  }

  public get commands() {
    return this._commands;
  }

  public getIndex(alias: string) {
    return this._aliases[alias];
  }
}

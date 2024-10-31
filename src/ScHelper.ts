import { ScAddr } from "./ScAddr";
import { ScClient } from "./ScClient";
import { ScConstruction } from "./ScConstruction";
import { ScEventType } from "./ScEventSubscription";
import { ScEventSubscriptionParams } from "./ScEventSubscriptionParams";
import { ScLinkContent, ScLinkContentType } from "./ScLinkContent";
import { ScTemplate } from "./ScTemplate";
import { ScType } from "./ScType";
import { snakeToCamelCase } from "./utils";

export class ScHelper {
  private _client: ScClient;

  constructor(client: ScClient) {
    this._client = client;
  }

  public async getMainIdentifierLinkAddr(addr: ScAddr, lang: string) {
    const { nrelMainIdtf, ...rest } = await this._client.searchKeynodes(
      "nrel_main_idtf",
      lang
    );
    const foundLang = rest[snakeToCamelCase(lang)];

    const template = new ScTemplate();
    const linkAlias = "_link";

    template.quintuple(
      addr,
      ScType.VarCommonArc,
      [ScType.VarNodeLink, linkAlias],
      ScType.VarPermPosArc,
      nrelMainIdtf
    );
    template.triple(foundLang, ScType.VarPermPosArc, linkAlias);
    const result = await this._client.searchByTemplate(template);

    if (!result.length) {
      return null;
    }

    return result[0].get(linkAlias);
  }

  public async getMainIdentifier(addr: ScAddr, lang: string) {
    const linkAddr = await this.getMainIdentifierLinkAddr(addr, lang);

    if (!linkAddr) return null;

    const contents = await this._client.getLinkContents([linkAddr]);
    return contents[0].data;
  }

  public async getSystemIdentifier(addr: ScAddr) {
    const { nrelSystemIdentifier } = await this._client.searchKeynodes(
      "nrel_system_identifier"
    );

    const template = new ScTemplate();
    const linkAlias = "_link";

    template.quintuple(
      addr,
      ScType.VarCommonArc,
      [ScType.VarNodeLink, linkAlias],
      ScType.VarPermPosArc,
      nrelSystemIdentifier
    );
    const result = await this._client.searchByTemplate(template);

    if (!result.length) {
      return null;
    }
    const contents = await this._client.getLinkContents([
      result[0].get(linkAlias),
    ]);
    return String(contents[0].data);
  }

  public async getScIdentifier(addr: ScAddr, lang: string) {
    const mainId = await this.getMainIdentifier(addr, lang);
    if (mainId) return String(mainId);

    const systemId = await this.getSystemIdentifier(addr);
    if (systemId) return String(systemId);

    return String(addr.value);
  }

  public async getAddrOrSystemIdentifierAddr(addrOrSystemId: string | number) {
    const numericAddr = Number(addrOrSystemId);
    if (numericAddr) return numericAddr;
    const keynodes = await this._client.searchKeynodes(String(addrOrSystemId));
    return keynodes[snakeToCamelCase(String(addrOrSystemId))].value;
  }

  public getResult(actionNode: ScAddr) {
    return new Promise<ScAddr>((resolve) => {
      (async () => {
        const { nrelResult } = await this._client.searchKeynodes("nrel_result");

        const onActionFinished = async (
          _subscribedAddr: ScAddr,
          arc: ScAddr,
          anotherAddr: ScAddr,
          eventId: number
        ) => {
          const template = new ScTemplate();
          template.triple(nrelResult, ScType.VarPermPosArc, arc);
          const isNrelResult = (await this._client.searchByTemplate(template))
            .length;
          if (!isNrelResult) return;
          this._client.destroyElementaryEventSubscriptions(eventId);
          resolve(anotherAddr);
        };

        const eventParams = new ScEventSubscriptionParams(
          actionNode,
          ScEventType.AfterGenerateOutgoingArc,
          onActionFinished
        );

        const [eventId] = await this._client.createElementaryEventSubscriptions(eventParams);

        const resultAlias = "_result";

        const template = new ScTemplate();
        template.quintuple(
          actionNode,
          ScType.VarCommonArc,
          [ScType.VarNode, resultAlias],
          ScType.VarPermPosArc,
          nrelResult
        );
        const searchRes = await this._client.searchByTemplate(template);

        const result = searchRes[0]?.get(resultAlias);

        if (!result) return;

        this._client.destroyElementaryEventSubscriptions(eventId.id);
        resolve(result);
      })();
    });
  }

  /*!
   * @deprecated ScHelper `getAnswer` method is deprecated. Use `getResult` instead.
   */
  public getAnswer(actionNode: ScAddr) {
    console.warn("Warning: ScHelper `getAnswer` method is deprecated. Use `getResult` instead.");
    return this.getResult(actionNode);
  }

  public async generateLink(item: string) {
    const constructionLink = new ScConstruction();
    constructionLink.generateLink(
      ScType.ConstNodeLink,
      new ScLinkContent(item, ScLinkContentType.String)
    );

    const resultLinkNode = await this._client.generateElements(constructionLink);
    if (resultLinkNode.length) return resultLinkNode[0];
    return null;
  }

  /*!
   * @deprecated ScHelper `createLink` method is deprecated. Use `generateLink` instead.
   */
  public async createLink(item: string) {
    console.warn("Warning: ScHelper `createLink` method is deprecated. Use `generateLink` instead.");
    return this.generateLink(item);
  }
}

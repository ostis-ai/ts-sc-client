import { ScAddr } from "./ScAddr";
import { ScClient } from "./ScClient";
import { ScConstruction } from "./ScConstruction";
import { ScEventType } from "./ScEvent";
import { ScEventParams } from "./ScEventParams";
import { ScLinkContent, ScLinkContentType } from "./ScLinkContent";
import { ScTemplate } from "./ScTemplate";
import { ScType } from "./ScType";
import { snakeToCamelCase } from "./utils";

export class ScHelpers {
  private _client: ScClient;

  constructor(client: ScClient) {
    this._client = client;
  }

  public async getMainIdLinkAddr(addr: ScAddr, lang: string) {
    const { nrelMainIdtf, ...rest } = await this._client.findKeynodes(
      "nrel_main_idtf",
      lang
    );
    const foundLang = rest[snakeToCamelCase(lang)];

    const template = new ScTemplate();
    const linkAlias = "_link";

    template.tripleWithRelation(
      addr,
      ScType.EdgeDCommonVar,
      [ScType.LinkVar, linkAlias],
      ScType.EdgeAccessVarPosPerm,
      nrelMainIdtf
    );
    template.triple(foundLang, ScType.EdgeAccessVarPosPerm, linkAlias);
    const result = await this._client.templateSearch(template);

    if (!result.length) {
      return null;
    }

    return result[0].get(linkAlias);
  }

  public async getMainId(addr: ScAddr, lang: string) {
    const linkAddr = await this.getMainIdLinkAddr(addr, lang);

    if (!linkAddr) return null;

    const contents = await this._client.getLinkContents([linkAddr]);
    return contents[0].data;
  }

  public async getSystemId(addr: ScAddr) {
    const { nrelSystemIdentifier } = await this._client.findKeynodes(
      "nrel_system_identifier"
    );

    const template = new ScTemplate();
    const linkAlias = "_link";

    template.tripleWithRelation(
      addr,
      ScType.EdgeDCommonVar,
      [ScType.LinkVar, linkAlias],
      ScType.EdgeAccessVarPosPerm,
      nrelSystemIdentifier
    );
    const result = await this._client.templateSearch(template);

    if (!result.length) {
      return null;
    }
    const contents = await this._client.getLinkContents([
      result[0].get(linkAlias),
    ]);
    return String(contents[0].data);
  }

  public async getScId(addr: ScAddr, lang: string) {
    const mainId = await this.getMainId(addr, lang);
    if (mainId) return String(mainId);

    const systemId = await this.getSystemId(addr);
    if (systemId) return String(systemId);

    return String(addr.value);
  }

  public async addrOrSystemIdAddr(addrOrSystemId: string | number) {
    const numericAddr = Number(addrOrSystemId);
    if (numericAddr) return numericAddr;
    const keynodes = await this._client.findKeynodes(String(addrOrSystemId));
    return keynodes[snakeToCamelCase(String(addrOrSystemId))].value;
  }

  public getAnswer(actionNode: ScAddr) {
    return new Promise<ScAddr>((resolve) => {
      (async () => {
        const { nrelAnswer } = await this._client.findKeynodes("nrel_answer");

        const onActionFinished = async (
          _subscibedAddr: ScAddr,
          arc: ScAddr,
          anotherAddr: ScAddr,
          eventId: number
        ) => {
          const template = new ScTemplate();
          template.triple(nrelAnswer, ScType.EdgeAccessVarPosPerm, arc);
          const isNrelAnswer = (await this._client.templateSearch(template))
            .length;
          if (!isNrelAnswer) return;
          this._client.eventsDestroy(eventId);
          resolve(anotherAddr);
        };

        const eventParams = new ScEventParams(
          actionNode,
          ScEventType.AddOutgoingEdge,
          onActionFinished
        );

        const [eventId] = await this._client.eventsCreate(eventParams);

        const answerAlias = "_answer";

        const template = new ScTemplate();
        template.tripleWithRelation(
          actionNode,
          ScType.EdgeDCommonVar,
          [ScType.NodeVar, answerAlias],
          ScType.EdgeAccessVarPosPerm,
          nrelAnswer
        );
        const searchRes = await this._client.templateSearch(template);

        const answer = searchRes[0]?.get(answerAlias);

        if (!answer) return;

        this._client.eventsDestroy(eventId.id);
        resolve(answer);
      })();
    });
  }

  public async createLink(item: string) {
    const constructionLink = new ScConstruction();
    constructionLink.createLink(
      ScType.LinkConst,
      new ScLinkContent(item, ScLinkContentType.String)
    );

    const resultLinkNode = await this._client.createElements(constructionLink);
    if (resultLinkNode.length) return resultLinkNode[0];
    return null;
  }
}

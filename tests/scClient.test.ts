import { ScAddr } from "../src/ScAddr";
import { ScClient } from "../src/ScClient";
import { ScConstruction } from "../src/ScConstruction";
import { ScType } from "../src/ScType";
import WS from "jest-websocket-mock";
import { ScLinkContent, ScLinkContentType } from "../src/ScLinkContent";
import { ScTemplate } from "../src/ScTemplate";
import { ScEvent, ScEventType } from "../src/ScEvent";
import { ScEventParams } from "../src/ScEventParams";
import { setupServer } from "./utils";
import { ScTemplateResult } from "../src/ScTemplateResult";

const URL = "ws://localhost:1234";

describe("ScClient", () => {
  let client: ScClient;
  let server: WS;

  beforeEach(async () => {
    server = new WS(URL, { jsonProtocol: true });

    setupServer(server);
    client = new ScClient(URL);

    await server.connected;
  });

  afterEach(() => {
    WS.clean();
  });

  test("createElements", async () => {
    const myNode = "_node";
    const myLink = "_link";

    const linkContent = "my_content";
    const fakeNodeAddr = new ScAddr(123);

    const construction = new ScConstruction();

    construction.createNode(ScType.NodeConst, myNode);
    construction.createLink(
      ScType.LinkConst,
      new ScLinkContent(linkContent, ScLinkContentType.String),
      myLink
    );
    construction.createEdge(
      ScType.EdgeAccessConstPosPerm,
      myNode,
      fakeNodeAddr
    );

    const res = await client.createElements(construction);

    expect(res).toHaveLength(3);
    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements",
        payload: expect.arrayContaining([
          {
            el: "node",
            type: ScType.NodeConst.value,
          },
          {
            el: "link",
            type: ScType.LinkConst.value,
            content: linkContent,
            content_type: ScLinkContentType.String,
          },
          {
            el: "edge",
            src: {
              type: "ref",
              value: 0,
            },
            trg: {
              type: "addr",
              value: fakeNodeAddr.value,
            },
            type: ScType.EdgeAccessConstPosPerm.value,
          },
        ]),
      })
    );
  });

  test("deleteElements", async () => {
    const fakeNodeAddr1 = new ScAddr(123);
    const fakeNodeAddr2 = new ScAddr(12223);

    const res = await client.deleteElements([fakeNodeAddr1, fakeNodeAddr2]);

    expect(res).toBeTruthy();

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "delete_elements",
        payload: expect.arrayContaining([
          fakeNodeAddr1.value,
          fakeNodeAddr2.value,
        ]),
      })
    );
  });

  test("checkElements", async () => {
    const fakeNodeAddr1 = new ScAddr(123);
    const fakeNodeAddr2 = new ScAddr(12223);

    const res = await client.checkElements([fakeNodeAddr1, fakeNodeAddr2]);

    expect(res).toHaveLength(2);
    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScType));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "check_elements",
        payload: expect.arrayContaining([
          fakeNodeAddr1.value,
          fakeNodeAddr2.value,
        ]),
      })
    );
  });

  test("setContent", async () => {
    const content = "my_content";
    const linkContent = new ScLinkContent(content, ScLinkContentType.String);

    const res = await client.setLinkContents([linkContent]);

    expect(res).toHaveLength(1);
    expect(res[0]).toBeTruthy();

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "content",
        payload: expect.arrayContaining([
          {
            command: "set",
            type: "string",
            data: content,
          },
        ]),
      })
    );
  });

  test("getContent", async () => {
    const fakeNodeAddr = new ScAddr(123);

    const res = await client.getLinkContents([fakeNodeAddr]);

    expect(res).toHaveLength(1);
    expect(res[0]).toBeInstanceOf(ScLinkContent);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "content",
        payload: expect.arrayContaining([
          {
            command: "get",
            addr: fakeNodeAddr.value,
          },
        ]),
      })
    );
  });

  test("resolveKeynodes", async () => {
    const id1 = "id1";
    const id2 = "id2";

    const keynodes = [
      { id: id1, type: ScType.EdgeDCommon },
      { id: id2, type: new ScType() },
    ];

    const res = await client.resolveKeynodes(keynodes);

    expect(res).toEqual({
      [id1]: expect.any(ScAddr),
      [id2]: expect.any(ScAddr),
    });

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "keynodes",
        payload: expect.arrayContaining([
          { command: "resolve", idtf: id1, elType: ScType.EdgeDCommon.value },
          { command: "find", idtf: id2 },
        ]),
      })
    );
  });

  test("templateSearch", async () => {
    const fakeAddr1 = new ScAddr(123);
    const fakeAddr2 = new ScAddr(1232333);

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.tripleWithRelation(
      fakeAddr1,
      ScType.EdgeDCommonVar,
      [ScType.NodeVarStruct, circuitDialogAlias],
      ScType.EdgeAccessVarPosPerm,
      fakeAddr2
    );
    template.triple(circuitDialogAlias, ScType.EdgeAccessVarPosPerm, [
      ScType.NodeVar,
      dialog,
    ]);

    const res = await client.templateSearch(template);

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
        payload: expect.objectContaining({
          templ: expect.arrayContaining([
            expect.arrayContaining([
              {type: "addr", value: fakeAddr1.value},
              {
                alias: expect.any(String),
                type: "type",
                value: ScType.EdgeDCommonVar.value,
              },
              {
                alias: circuitDialogAlias,
                type: "type",
                value: ScType.NodeVarStruct.value,
              },
            ]),
            expect.arrayContaining([
              {type: "addr", value: fakeAddr2.value},
              {type: "type", value: ScType.EdgeAccessVarPosPerm.value},
              {type: "alias", value: expect.any(String)},
            ]),
            expect.arrayContaining([
              {type: "alias", value: circuitDialogAlias},
              {type: "type", value: ScType.EdgeAccessVarPosPerm.value},
              {alias: dialog, type: "type", value: ScType.NodeVar.value},
            ]),
          ]),
        }),
      }),
    );
  });

  test("templateGenerate", async () => {
    const fakeAddr1 = new ScAddr(123);
    const fakeAddr2 = new ScAddr(1232333);

    const fakeParamAddr = new ScAddr(777);

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.tripleWithRelation(
      fakeAddr1,
      ScType.EdgeDCommonVar,
      [ScType.NodeVarStruct, circuitDialogAlias],
      ScType.EdgeAccessVarPosPerm,
      fakeAddr2
    );
    template.triple(circuitDialogAlias, ScType.EdgeAccessVarPosPerm, [
      ScType.NodeVar,
      dialog,
    ]);

    const params = {
      [dialog]: fakeParamAddr,
    };

    const res = await client.templateGenerate(template, params);

    expect(res).toBeInstanceOf(ScTemplateResult);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "generate_template",
        payload: expect.objectContaining({
          templ: expect.arrayContaining([
            expect.arrayContaining([
              { type: "addr", value: fakeAddr1.value },
              {
                alias: expect.any(String),
                type: "type",
                value: ScType.EdgeDCommonVar.value,
              },
              {
                alias: circuitDialogAlias,
                type: "type",
                value: ScType.NodeVarStruct.value,
              },
            ]),
            expect.arrayContaining([
              { type: "addr", value: fakeAddr2.value },
              { type: "type", value: ScType.EdgeAccessVarPosPerm.value },
              { type: "alias", value: expect.any(String) },
            ]),
            expect.arrayContaining([
              { type: "alias", value: circuitDialogAlias },
              { type: "type", value: ScType.EdgeAccessVarPosPerm.value },
              { alias: dialog, type: "type", value: ScType.NodeVar.value },
            ]),
          ]),
          params: {
            [dialog]: fakeParamAddr.value,
          },
        }),
      }),
    );
  });

  test("eventsCreate", async () => {
    const eventCallback = jest.fn();

    const fakeAddr1 = new ScAddr(123);
    const fakeAddr2 = new ScAddr(12311);

    const evtParams1 = new ScEventParams(
      fakeAddr1,
      ScEventType.AddIngoingEdge,
      eventCallback
    );
    const evtParams2 = new ScEventParams(
      fakeAddr2,
      ScEventType.RemoveIngoingEdge,
      () => void 0
    );

    const res = await client.eventsCreate([evtParams1, evtParams2]);

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScEvent));

    expect(eventCallback).toHaveBeenCalledWith(
      expect.any(ScAddr),
      expect.any(ScAddr),
      expect.any(ScAddr),
      expect.any(Number)
    );

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "events",
        payload: expect.objectContaining({
          create: expect.arrayContaining([
            {
              type: ScEventType.AddIngoingEdge,
              addr: fakeAddr1.value,
            },
            {
              type: ScEventType.RemoveIngoingEdge,
              addr: fakeAddr2.value,
            },
          ]),
        }),
      })
    );
  });

  test("eventsDestroy", async () => {
    const eventIds = [1, 2];

    const res = await client.eventsDestroy(eventIds);

    expect(res).toBe(undefined);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "events",
        payload: expect.objectContaining({
          delete: expect.arrayContaining(eventIds),
        }),
      })
    );
  });
});

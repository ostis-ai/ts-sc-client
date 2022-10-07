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
    const preparationConstruction = new ScConstruction();
    preparationConstruction.createNode(ScType.NodeConst);
    const addrs = await client.createElements(preparationConstruction);
    await server.nextMessage;

    const myNode = "_node";
    const myLink = "_link";

    const linkContent = "my_content";
    const fakeNodeAddr = addrs[0];

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

  test("createElementsBySCs", async () => {
    const res = await client.createElementsBySCs(["my_class -> node1;;", "my_class -> rrel_1: node1;;"]);

    expect(res).toHaveLength(2);

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "create_elements_by_scs",
          payload: expect.arrayContaining([
            "my_class -> node1;;",
            "my_class -> rrel_1: node1;;",
          ]),
        })
    );
  });

  test("createElementsBySCsUnsuccessful", async () => {
    client.createElementsBySCs(["->;;"])
        .then(null).catch((errors) => { expect(errors).toHaveLength(1); });

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "create_elements_by_scs",
          payload: expect.arrayContaining([
            "->;;",
          ]),
        })
    );
  });

  test("deleteElements", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConst)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

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
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConst)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

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
    const construction = new ScConstruction();
    construction.createLink(ScType.LinkConst, new ScLinkContent("old_content", ScLinkContentType.String));
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const content = "new_content";
    const linkContent = new ScLinkContent(content, ScLinkContentType.String, addrs[0]);

    const res = await client.setLinkContents([linkContent]);

    expect(res).toHaveLength(1);
    expect(res[0]).toBeTruthy();

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "content",
        payload: expect.arrayContaining([
          {
            addr: addrs[0].value,
            command: "set",
            type: "string",
            data: content,
          },
        ]),
      })
    );
  });

  test("getContent", async () => {
    const content = "my_content";
    const construction = new ScConstruction();
    construction.createLink(ScType.LinkConst, new ScLinkContent(content, ScLinkContentType.String));
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const nodeAddr = addrs[0];

    const res = await client.getLinkContents([nodeAddr]);

    expect(res).toHaveLength(1);
    expect(res[0]).toBeInstanceOf(ScLinkContent);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "content",
        payload: expect.arrayContaining([
          {
            command: "get",
            addr: nodeAddr.value,
          },
        ]),
      })
    );
  });

  test("getLinksByContents", async () => {
    const linkContent1 = "test_content1";
    const linkContent2 = "test_content2";

    const res = await client.getLinksByContents([linkContent1, linkContent2]);

    expect(res).toHaveLength(2);
    expect(res[0][0]).toBeInstanceOf(ScAddr);
    expect(res[1][0]).toBeInstanceOf(ScAddr);

    res.forEach((resItem) => resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr)));

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "content",
          payload: expect.arrayContaining([
            {
              command: "find",
              data: linkContent1,
            },
            {
              command: "find",
              data: linkContent2,
            },
          ]),
        })
    );
  });

  test("getLinksByContentSubstrings", async () => {
    const linkContent1 = "con";
    const linkContent2 = "content";

    const res = await client.getLinksByContentSubstrings([linkContent1, linkContent2]);

    expect(res).toHaveLength(2);
    expect(res[0][0]).toBeInstanceOf(ScAddr);
    expect(res[1][0]).toBeInstanceOf(ScAddr);

    res.forEach((resItem) => resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr)));

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "content",
          payload: expect.arrayContaining([
            {
              command: "find_links_by_substr",
              data: linkContent1,
            },
            {
              command: "find_links_by_substr",
              data: linkContent2,
            },
          ]),
        })
    );
  });

  test("getStringsBySubstrings", async () => {
    const linkContent1 = "test_content1";
    const linkContent2 = "test_content2";

    const res = await client.getLinksContentsByContentSubstrings([linkContent1, linkContent2]);

    expect(res).toHaveLength(2);

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "content",
          payload: expect.arrayContaining([
            {
              command: "find_strings_by_substr",
              data: linkContent1,
            },
            {
              command: "find_strings_by_substr",
              data: linkContent2,
            },
          ]),
        })
    );
  });

  test("resolveKeynodes", async () => {
    const id1 = "id1";
    const id2 = "id2";

    const keynodes = [
      { id: id1, type: ScType.NodeConst },
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
          { command: "resolve", idtf: id1, elType: ScType.NodeConst.value },
          { command: "find", idtf: id2 },
        ]),
      })
    );
  });

  test("templateSearch", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConst)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.tripleWithRelation(
      fakeNodeAddr1,
      ScType.EdgeDCommonVar,
      [ScType.NodeVarStruct, circuitDialogAlias],
      ScType.EdgeAccessVarPosPerm,
      fakeNodeAddr2
    );
    template.triple(circuitDialogAlias, ScType.EdgeAccessVarPosPerm, [
      ScType.NodeVar,
      dialog,
    ]);

    const res = await client.templateSearch(template);

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
        payload: expect.objectContaining({
          templ: expect.arrayContaining([
            expect.arrayContaining([
              {type: "addr", value: fakeNodeAddr1.value},
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
              {type: "addr", value: fakeNodeAddr2.value},
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

  test("templateSearchBySCs", async () => {
    const res = await client.templateSearch("concept_node _-> _node1;;");

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
        payload: expect.objectContaining({
          templ: "concept_node _-> _node1;;",
          params: {},
        }),
      }),
    );
  });

  test("templateSearchByString", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConst)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: fakeNodeAddr2,
    };

    const res = await client.templateSearch("test_template_1", params);

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
        payload: expect.objectContaining({
          templ: expect.objectContaining({
            type: "idtf",
            value: "test_template_1",
          }),
          params: {
            ["_node1"]: fakeNodeAddr1.value,
            ["_node2"]: fakeNodeAddr2.value,
          },
        }),
      }),
    );
  });

  test("templateSearchByAddr", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConstStruct)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeTemplateAddr = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: "test_node",
    };

    const res = await client.templateSearch(fakeTemplateAddr, params);

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "search_template",
          payload: expect.objectContaining({
            templ: expect.objectContaining({
              type: "addr",
              value: fakeTemplateAddr.value,
            }),
            params: {
              ["_node1"]: fakeNodeAddr1.value,
              ["_node2"]: "test_node",
            },
          }),
        }),
    );
  });

  test("templateGenerate", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst);
    construction.createNode(ScType.NodeConst);
    construction.createNode(ScType.NodeConst);
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];
    const fakeParamAddr = addrs[2];

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.tripleWithRelation(
      fakeNodeAddr1,
      ScType.EdgeDCommonVar,
      [ScType.NodeVarStruct, circuitDialogAlias],
      ScType.EdgeAccessVarPosPerm,
      fakeNodeAddr2
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
              { type: "addr", value: fakeNodeAddr1.value },
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
              { type: "addr", value: fakeNodeAddr2.value },
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

  test("templateGenerateBySCs", async () => {
    const res = await client.templateGenerate("concept_node _-> _node1;;");

    expect(res).toBeTruthy();
    expect(res).toBeInstanceOf(ScTemplateResult);

    await expect(server).toReceiveMessage(
        expect.objectContaining({
          type: "generate_template",
          payload: expect.objectContaining({
            templ: "concept_node _-> _node1;;",
            params: {},
          }),
        }),
    );
  });

  test("templateGenerateByString", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConst)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: fakeNodeAddr2,
    };

    const res = await client.templateGenerate("test_template_1", params);

    expect(res).toBeTruthy();
    expect(res).toBeInstanceOf(ScTemplateResult);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "generate_template",
        payload: expect.objectContaining({
          templ: expect.objectContaining({
            type: "idtf",
            value: "test_template_1",
          }),
          params: {
            ["_node1"]: fakeNodeAddr1.value,
            ["_node2"]: fakeNodeAddr2.value,
          },
        }),
      }),
    );
  });

  test("templateGenerateByAddr", async () => {
    const construction = new ScConstruction();
    construction.createNode(ScType.NodeConst)
    construction.createNode(ScType.NodeConstStruct)
    const addrs = await client.createElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeTemplateAddr = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: "test_node",
    };

    const res = await client.templateGenerate(fakeTemplateAddr, params);

    expect(res).toBeTruthy();
    expect(res).toBeInstanceOf(ScTemplateResult);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "generate_template",
        payload: expect.objectContaining({
          templ: expect.objectContaining({
            type: "addr",
            value: fakeTemplateAddr.value,
          }),
          params: {
            ["_node1"]: fakeNodeAddr1.value,
            ["_node2"]: "test_node",
          },
        }),
      }),
    );
  });

  test("eventsCreate", async () => {
    const eventCallback = jest.fn();

    const preparationConstruction = new ScConstruction();
    preparationConstruction.createNode(ScType.NodeConst);
    preparationConstruction.createNode(ScType.NodeConst);
    const addrs = await client.createElements(preparationConstruction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const evtParams1 = new ScEventParams(
      fakeNodeAddr1,
      ScEventType.AddIngoingEdge,
      eventCallback
    );
    const evtParams2 = new ScEventParams(
      fakeNodeAddr2,
      ScEventType.RemoveIngoingEdge,
      () => void 0
    );

    const res = await client.eventsCreate([evtParams1, evtParams2]);

    const construction = new ScConstruction();

    construction.createEdge(
      ScType.EdgeAccessConstPosPerm,
      fakeNodeAddr2,
      fakeNodeAddr1
    );

    const edgeAddr = await client.createElements(construction);
    await client.deleteElements(edgeAddr);

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
              addr: fakeNodeAddr1.value,
            },
            {
              type: ScEventType.RemoveIngoingEdge,
              addr: fakeNodeAddr2.value,
            },
          ]),
        }),
      })
    );
  });

  test("eventsDestroy", async () => {
    const eventIds = [1, 2];

    const res = await client.eventsDestroy(eventIds);

    expect(res).toBe(true);

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

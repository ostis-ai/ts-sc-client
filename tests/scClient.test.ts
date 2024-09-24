import { ScAddr } from "../src/ScAddr";
import { ScClient } from "../src/ScClient";
import { ScConstruction } from "../src/ScConstruction";
import { ScType } from "../src/ScType";
import WS from "jest-websocket-mock";
import { ScLinkContent, ScLinkContentType } from "../src/ScLinkContent";
import { ScTemplate } from "../src/ScTemplate";
import { ScEventSubscription, ScEventType } from "../src/ScEventSubscription";
import { ScEventSubscriptionParams } from "../src/ScEventSubscriptionParams";
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

  test("getUser", async () => {
    const userAddr = await client.getUser();
    expect(userAddr).toBeInstanceOf(ScAddr);
    expect(userAddr.isValid()).toBe(true);
  });

  test("generateElements", async () => {
    const preparationConstruction = new ScConstruction();
    preparationConstruction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(preparationConstruction);
    await server.nextMessage;

    const myNode = "_node";
    const myLink = "_link";

    const linkContent = "my_content";
    const fakeNodeAddr = addrs[0];

    const construction = new ScConstruction();

    construction.generateNode(ScType.NodeConst, myNode);
    construction.generateLink(
      ScType.LinkConst,
      new ScLinkContent(linkContent, ScLinkContentType.String),
      myLink
    );
    construction.generateConnector(
      ScType.EdgeAccessConstPosPerm,
      myNode,
      fakeNodeAddr
    );

    const res = await client.generateElements(construction);

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

  test("generateElementsBySCs", async () => {
    const res = await client.generateElementsBySCs([
      "my_class -> node1;;",
      "my_class -> rrel_1: node1;;",
    ]);

    expect(res).toHaveLength(2);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements_by_scs",
        payload: expect.arrayContaining([
          {
            scs: "my_class -> node1;;",
            output_structure: 0,
          },
          {
            scs: "my_class -> rrel_1: node1;;",
            output_structure: 0,
          },
        ]),
      })
    );
  });

  test("generateElementsBySCsUnsuccessful", async () => {
    client
      .generateElementsBySCs(["->;;"])
      .then(null)
      .catch((errors) => {
        expect(errors).toHaveLength(1);
      });

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements_by_scs",
        payload: expect.arrayContaining([
          {
            scs: "->;;",
            output_structure: 0,
          },
        ]),
      })
    );
  });

  test("generateElementsBySCsWithOutputStruct", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const res = await client.generateElementsBySCs([
      { scs: "my_class -> node1;;", output_structure: addrs[0] },
    ]);

    expect(res).toHaveLength(1);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements_by_scs",
        payload: expect.arrayContaining([
          {
            scs: "my_class -> node1;;",
            output_structure: 0,
          },
        ]),
      })
    );
  });

  test("generateElementsBySCsWithOutputStructNewScAddr", async () => {
    const res = await client.generateElementsBySCs([
      { scs: "my_class -> node1;;", output_structure: new ScAddr(0) },
    ]);

    expect(res).toHaveLength(1);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements_by_scs",
        payload: expect.arrayContaining([
          {
            scs: "my_class -> node1;;",
            output_structure: 0,
          },
        ]),
      })
    );
  });

  test("generateElementsBySCsWithOutputStructNewScAddr", async () => {
    const res = await client.generateElementsBySCs([
      { scs: "my_class -> node1;;", output_structure: new ScAddr(1) },
      { scs: "my_class -> node2;;", output_structure: new ScAddr(2) },
    ]);

    expect(res).toHaveLength(2);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "create_elements_by_scs",
        payload: expect.arrayContaining([
          {
            scs: "my_class -> node1;;",
            output_structure: 1,
          },
          {
            scs: "my_class -> node2;;",
            output_structure: 2,
          },
        ]),
      })
    );
  });

  test("eraseElements", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const res = await client.eraseElements([fakeNodeAddr1, fakeNodeAddr2]);

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

  test("getElementsTypes", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const res = await client.getElementsTypes([fakeNodeAddr1, fakeNodeAddr2]);

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
    construction.generateLink(
      ScType.LinkConst,
      new ScLinkContent("old_content", ScLinkContentType.String)
    );
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const content = "new_content";
    const linkContent = new ScLinkContent(
      content,
      ScLinkContentType.String,
      addrs[0]
    );

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
    construction.generateLink(
      ScType.LinkConst,
      new ScLinkContent(content, ScLinkContentType.String)
    );
    const addrs = await client.generateElements(construction);
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

  test("searchLinksByContents", async () => {
    const linkContent1 = "test_content1";
    const linkContent2 = "test_content2";

    const res = await client.searchLinksByContents([linkContent1, linkContent2]);

    expect(res).toHaveLength(2);
    expect(res[0][0]).toBeInstanceOf(ScAddr);
    expect(res[1][0]).toBeInstanceOf(ScAddr);

    res.forEach((resItem) =>
      resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr))
    );

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

  test("searchLinksByContentSubstrings", async () => {
    const linkContent1 = "con";
    const linkContent2 = "content";

    const res = await client.searchLinksByContentSubstrings([
      linkContent1,
      linkContent2,
    ]);

    expect(res).toHaveLength(2);
    expect(res[0][0]).toBeInstanceOf(ScAddr);
    expect(res[1][0]).toBeInstanceOf(ScAddr);

    res.forEach((resItem) =>
      resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr))
    );

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

  test("searchLinkContentsByContentSubstrings", async () => {
    const linkContent1 = "test_content1";
    const linkContent2 = "test_content2";

    const res = await client.searchLinkContentsByContentSubstrings([
      linkContent1,
      linkContent2,
    ]);

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

  test("searchByTemplate", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.quintuple(
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

    const res = await client.searchByTemplate(template);

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
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
        }),
      })
    );
  });

  test("searchByTemplateBySCs", async () => {
    const res = await client.searchByTemplate("concept_node _-> _node1;;");

    expect(res).toBeTruthy();

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "search_template",
        payload: expect.objectContaining({
          templ: "concept_node _-> _node1;;",
          params: {},
        }),
      })
    );
  });

  test("searchByTemplateByString", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: fakeNodeAddr2,
    };

    const res = await client.searchByTemplate("test_template_1", params);

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
      })
    );
  });

  test("searchByTemplateByAddr", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConstStruct);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeTemplateAddr = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: "test_node",
    };

    const res = await client.searchByTemplate(fakeTemplateAddr, params);

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
      })
    );
  });

  test("generateByTemplate", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];
    const fakeParamAddr = addrs[2];

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.quintuple(
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

    const res = await client.generateByTemplate(template, params);

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
      })
    );
  });

  test("generateByTemplateBySCs", async () => {
    const res = await client.generateByTemplate("concept_node _-> _node1;;");

    expect(res).toBeTruthy();
    expect(res).toBeInstanceOf(ScTemplateResult);

    await expect(server).toReceiveMessage(
      expect.objectContaining({
        type: "generate_template",
        payload: expect.objectContaining({
          templ: "concept_node _-> _node1;;",
          params: {},
        }),
      })
    );
  });

  test("generateByTemplateByString", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: fakeNodeAddr2,
    };

    const res = await client.generateByTemplate("test_template_1", params);

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
      })
    );
  });

  test("generateByTemplateByAddr", async () => {
    const construction = new ScConstruction();
    construction.generateNode(ScType.NodeConst);
    construction.generateNode(ScType.NodeConstStruct);
    const addrs = await client.generateElements(construction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeTemplateAddr = addrs[1];

    const params = {
      ["_node1"]: fakeNodeAddr1,
      ["_node2"]: "test_node",
    };

    const res = await client.generateByTemplate(fakeTemplateAddr, params);

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
      })
    );
  });

  test("createElementaryEventSubscriptions", async () => {
    const eventCallback = jest.fn();

    const preparationConstruction = new ScConstruction();
    preparationConstruction.generateNode(ScType.NodeConst);
    preparationConstruction.generateNode(ScType.NodeConst);
    const addrs = await client.generateElements(preparationConstruction);
    await server.nextMessage;

    const fakeNodeAddr1 = addrs[0];
    const fakeNodeAddr2 = addrs[1];

    const evtParams1 = new ScEventSubscriptionParams(
      fakeNodeAddr1,
      ScEventType.AfterGenerateIncomingArc,
      eventCallback
    );
    const evtParams2 = new ScEventSubscriptionParams(
      fakeNodeAddr2,
      ScEventType.BeforeEraseIncomingArc,
      () => void 0
    );

    const res = await client.createElementaryEventSubscriptions([evtParams1, evtParams2]);

    const construction = new ScConstruction();

    construction.generateConnector(
      ScType.EdgeAccessConstPosPerm,
      fakeNodeAddr2,
      fakeNodeAddr1
    );

    const edgeAddr = await client.generateElements(construction);
    await client.eraseElements(edgeAddr);

    res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScEventSubscription));

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
              type: ScEventType.AfterGenerateIncomingArc,
              addr: fakeNodeAddr1.value,
            },
            {
              type: ScEventType.BeforeEraseIncomingArc,
              addr: fakeNodeAddr2.value,
            },
          ]),
        }),
      })
    );
  });

  test("destroyElementaryEventSubscriptions", async () => {
    const eventIds = [1, 2];

    const res = await client.destroyElementaryEventSubscriptions(eventIds);

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

  test("searchKeynodes. Correct output", async () => {
    const res = await client.searchKeynodes("aa_bb", "cc_d", "f");
    expect(Object.keys(res)).toEqual(["aaBb", "ccD", "f"]);
    Object.values(res).forEach((value) => expect(value).toBeInstanceOf(ScAddr));
  });

  test("searchKeynodes. Correct cache implementation", async () => {
    // TODO: test correct caching. Check if server receives messages only for new keynodes
    expect(1).toBe(1);
  });
});

import {
    ScAddr, ScClient, ScConstruction, ScEvent, ScEventParams, ScEventType,
    ScLinkContent, ScLinkContentType, ScTemplate, ScTemplateResult, ScType
} from "../src";

// Default Sc-machine WebSocket address
const URL = "ws://localhost:8090";

// Increase this value if you have timeout error (in ms)
const timeoutForSimpleTest = 100;
const timeoutForComplexTest = 500;
const nodeTypes = [
    ScType.Node,
    ScType.NodeConst,
    ScType.NodeVar,
    ScType.NodeAbstract,
    ScType.NodeClass,
    ScType.NodeRole,
    ScType.NodeNoRole,
    ScType.NodeStruct,
    ScType.NodeMaterial,
    ScType.NodeTuple,
    ScType.NodeConstAbstract,
    ScType.NodeConstClass,
    ScType.NodeConstRole,
    ScType.NodeConstNoRole,
    ScType.NodeConstStruct,
    ScType.NodeConstMaterial,
    ScType.NodeConstTuple,
    ScType.NodeVarAbstract,
    ScType.NodeVarClass,
    ScType.NodeVarRole,
    ScType.NodeVarNoRole,
    ScType.NodeVarStruct,
    ScType.NodeVarMaterial,
    ScType.NodeVarTuple
]

const linkTypes = [
    ScType.Link,
    ScType.LinkVar,
    ScType.LinkConst
]

const edgeTypes = [
    ScType.EdgeAccess,
    ScType.EdgeDCommon,
    ScType.EdgeDCommonVar,
    ScType.EdgeDCommonConst,
    ScType.EdgeUCommon,
    ScType.EdgeUCommonVar,
    ScType.EdgeUCommonConst,
    ScType.EdgeAccessConstFuzTemp,
    ScType.EdgeAccessConstFuzPerm,
    ScType.EdgeAccessConstPosTemp,
    ScType.EdgeAccessConstPosPerm,
    ScType.EdgeAccessConstNegTemp,
    ScType.EdgeAccessConstNegPerm,
    ScType.EdgeAccessVarFuzTemp,
    ScType.EdgeAccessVarFuzPerm,
    ScType.EdgeAccessVarPosTemp,
    ScType.EdgeAccessVarPosPerm,
    ScType.EdgeAccessVarNegTemp,
    ScType.EdgeAccessVarNegPerm
]

describe("Sc-Client with real sc-machine server", () => {
    let client: ScClient;

    beforeAll(async () => {
        client = new ScClient(URL);
    })

    test("createNode", async () => {
        const construction = new ScConstruction();
        const expectedNodeType = ScType.NodeConst;
        construction.createNode(expectedNodeType);
        const res = await client.createElements(construction);

        expect(res).toHaveLength(1);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));
        const checkedNode = (await client.checkElements(res))[0]
        expect(checkedNode).toStrictEqual(expectedNodeType);

    }, timeoutForSimpleTest);


    test("createNodes", async () => {
        const construction = new ScConstruction();

        for (let type of nodeTypes) {
            construction.createNode(type);
        }
        const res = await client.createElements(construction);

        expect(res).toHaveLength(nodeTypes.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));
        const checkedNodes = await client.checkElements(res);
        for (let i = 0; i < nodeTypes.length; i++) {
            expect(checkedNodes[i]).toStrictEqual(nodeTypes[i]);
        }
    }, timeoutForSimpleTest);

    test("createIncorrectNodes", async () => {
        const construction = new ScConstruction();
        for (let incorrectType of Object.values(ScType)) {
            if (!nodeTypes.includes(incorrectType)) {
                try {
                    construction.createNode(incorrectType);
                    expect("This line must not be executed")
                        .toBe("But it ran because type " + (incorrectType as ScType).value + " was incorrectly assumed to be a Node type ")
                } catch (e) {
                    // ToDo Change code after implementing normal exceptions
                }
            }
        }

    }, timeoutForSimpleTest);

    test("createLink", async () => {
        const construction = new ScConstruction();
        const linkContentTest = "ts-sc-client-link-content-test";
        const expectedType = ScType.LinkConst;
        construction.createLink(expectedType, new ScLinkContent(linkContentTest, ScLinkContentType.String))
        const res = await client.createElements(construction);
        expect(res).toHaveLength(1);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));
        const checkedLink = (await client.checkElements(res))[0]
        expect(checkedLink).toStrictEqual(expectedType);

        const actualContent = (await client.getLinkContents(res))[0];
        expect(actualContent.data).toStrictEqual(linkContentTest);
        expect(actualContent.type).toStrictEqual(ScLinkContentType.String);
    }, timeoutForSimpleTest)

    test("createLinks", async () => {
        const construction = new ScConstruction();
        const linkContentTest = "ts-sc-client-link-content-test";
        for (let type of linkTypes) {
            construction.createLink(type, new ScLinkContent(linkContentTest, ScLinkContentType.String));
        }
        const res = await client.createElements(construction);

        expect(res).toHaveLength(linkTypes.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));
        const checkedLinks = await client.checkElements(res);
        for (let i = 0; i < linkTypes.length; i++) {
            expect(checkedLinks[i]).toStrictEqual(linkTypes[i]);
        }
    }, timeoutForSimpleTest);

    test("createEdges", async () => {
        const preparationConstruction = new ScConstruction();
        preparationConstruction.createNode(ScType.NodeConst);
        const addrs = await client.createElements(preparationConstruction);

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
        for (let type of edgeTypes) {
            construction.createEdge(
                type,
                myNode,
                fakeNodeAddr
            );
        }

        let res = await client.createElements(construction);
        res = res.slice(2, res.length)

        expect(res).toHaveLength(edgeTypes.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr));
        const checkedEdges = await client.checkElements(res);
        for (let i = 0; i < edgeTypes.length; i++) {
            expect(checkedEdges[i]).toStrictEqual(edgeTypes[i]);
        }
    }, timeoutForSimpleTest);

    test("createElementsBySCs", async () => {
        const res = await client.createElementsBySCs(["my_class -> node1;;", "my_class -> rrel_1: node1;;"]);
        expect(res).toHaveLength(2);
        res.forEach((resItem) => expect(resItem).toStrictEqual(true));
    }, timeoutForSimpleTest);

    test("createElementsByIncorrectSCs", async () => {
        client.createElementsBySCs(["->;;"])
            .then(null).catch((errors) => {
            expect(errors).toHaveLength(1);
        });
    }, timeoutForSimpleTest);

    test("deleteElements", async () => {
        const construction = new ScConstruction();
        construction.createNode(ScType.NodeConst)
        construction.createNode(ScType.NodeConst)
        const addrs = await client.createElements(construction);

        const fakeNodeAddr1 = addrs[0];
        const fakeNodeAddr2 = addrs[1];

        const res = await client.deleteElements([fakeNodeAddr1, fakeNodeAddr2]);
        expect(res).toStrictEqual(true);
        const checkedNodes = await client.checkElements(addrs);
        checkedNodes.forEach((node) => expect(node).toStrictEqual(new ScType(0)));
    }, timeoutForSimpleTest);

    test("checkExistingElements", async () => {
        const construction = new ScConstruction();
        construction.createNode(ScType.NodeConst)
        construction.createNode(ScType.NodeConst)
        const addrs = await client.createElements(construction);

        const fakeNodeAddr1 = addrs[0];
        const fakeNodeAddr2 = addrs[1];

        const res = await client.checkElements([fakeNodeAddr1, fakeNodeAddr2]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toStrictEqual(ScType.NodeConst));
    }, timeoutForSimpleTest);

    test("checkNonexistentElements", async () => {
        const construction = new ScConstruction();
        construction.createNode(ScType.NodeConst)
        construction.createNode(ScType.NodeConst)
        const addrs = await client.createElements(construction);

        const fakeNodeAddr1 = addrs[0];
        const fakeNodeAddr2 = addrs[1];

        await client.deleteElements([fakeNodeAddr1, fakeNodeAddr2]);
        const res = await client.checkElements([fakeNodeAddr1, fakeNodeAddr2]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toStrictEqual(new ScType(0)));
    }, timeoutForSimpleTest);

    test("getContentString", async () => {
        const contentString = "my_content";
        const construction = new ScConstruction();
        construction.createLink(ScType.LinkConst, new ScLinkContent(contentString, ScLinkContentType.String));
        const addrs = await client.createElements(construction);
        const stringLinkAddr = addrs[0];

        const res = await client.getLinkContents([stringLinkAddr]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScLinkContent));
        expect(res[0].data).toStrictEqual(contentString);
        expect(res[0].type).toStrictEqual(ScLinkContentType.String);
    }, timeoutForSimpleTest);

    test("getContentInt", async () => {
        const contentInt = 42;
        const construction = new ScConstruction();
        construction.createLink(ScType.LinkConst, new ScLinkContent(contentInt, ScLinkContentType.Int));
        const addrs = await client.createElements(construction);
        const intLinkAddr = addrs[0];

        const res = await client.getLinkContents([intLinkAddr]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScLinkContent));
        expect(res[0].data).toStrictEqual(contentInt);
        expect(res[0].type).toStrictEqual(ScLinkContentType.Int);
    }, timeoutForSimpleTest);

    test("getContentFloat1", async () => {
        const contentFloat = 4.0;
        const construction = new ScConstruction();
        construction.createLink(ScType.LinkConst, new ScLinkContent(contentFloat, ScLinkContentType.Float));
        const addrs = await client.createElements(construction);
        const floatLinkAddr = addrs[0];

        const res = await client.getLinkContents([floatLinkAddr]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScLinkContent));
        expect(res[0].data).toStrictEqual(contentFloat);
        expect(res[0].type).toStrictEqual(ScLinkContentType.Float);
    }, timeoutForSimpleTest);

    test("getContentFloat2", async () => {
        const contentFloat = 4.2;
        const construction = new ScConstruction();
        construction.createLink(ScType.LinkConst, new ScLinkContent(contentFloat, ScLinkContentType.Float));
        const addrs = await client.createElements(construction);
        const floatLinkAddr = addrs[0];

        const res = await client.getLinkContents([floatLinkAddr]);

        expect(res).toHaveLength(addrs.length);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScLinkContent));
        expect(res[0].data).toStrictEqual(contentFloat);
        expect(res[0].type).toStrictEqual(ScLinkContentType.Float);
    }, timeoutForSimpleTest);

    //ToDo binary content test
    //
    // test("getContentBinary", async () => {
    //     const contentBinary = "";
    //     const construction = new ScConstruction();
    //     construction.createLink(ScType.LinkConst, new ScLinkContent(contentBinary, ScLinkContentType.Binary));
    //     const addrs = await client.createElements(construction);
    //     const binaryLinkAddr = addrs[0];
    //
    //     const res = await client.getLinkContents([binaryLinkAddr]);
    //
    //     expect(res).toHaveLength(addrs.length);
    //     res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScLinkContent));
    //     expect(res[0].data).toStrictEqual(contentBinary);
    //     expect(res[0].type).toStrictEqual(ScLinkContentType.Binary);
    // });


    test("setStringContent", async () => {
        const construction = new ScConstruction();
        const oldContent = "old_content";
        construction.createLink(ScType.LinkConst, new ScLinkContent(oldContent, ScLinkContentType.String));
        const addrs = await client.createElements(construction);
        const newContent = "new_content";
        const linkContent = new ScLinkContent(newContent, ScLinkContentType.String, addrs[0]);
        const res = await client.setLinkContents([linkContent]);
        expect(res).toHaveLength(addrs.length);
        expect(res[0]).toStrictEqual(true);

        const actualLinkData = await client.getLinkContents(addrs);
        expect(actualLinkData[0].data).toStrictEqual(newContent);
    }, timeoutForSimpleTest);

    test("setIntContent", async () => {
        const construction = new ScConstruction();
        const oldContent = 42;
        construction.createLink(ScType.LinkConst, new ScLinkContent(oldContent, ScLinkContentType.Int));
        const addrs = await client.createElements(construction);
        const newContent = 530;
        const linkContent = new ScLinkContent(newContent, ScLinkContentType.Int, addrs[0]);
        const res = await client.setLinkContents([linkContent]);
        expect(res).toHaveLength(addrs.length);
        expect(res[0]).toStrictEqual(true);

        const actualLinkData = await client.getLinkContents(addrs);
        expect(actualLinkData[0].data).toStrictEqual(newContent);
    }, timeoutForSimpleTest);

    test("setFloatContent", async () => {
        const construction = new ScConstruction();
        const oldContent = 4.2;
        construction.createLink(ScType.LinkConst, new ScLinkContent(oldContent, ScLinkContentType.Float));
        const addrs = await client.createElements(construction);
        const newContent = 53.4;
        const linkContent = new ScLinkContent(newContent, ScLinkContentType.Float, addrs[0]);
        const res = await client.setLinkContents([linkContent]);
        expect(res).toHaveLength(addrs.length);
        expect(res[0]).toStrictEqual(true);

        const actualLinkData = await client.getLinkContents(addrs);
        expect(actualLinkData[0].data).toStrictEqual(newContent);
    }, timeoutForSimpleTest);

    test("getLinksByContents", async () => {
        const linkContent1 = (Math.random() + 1).toString(36).substring(2);
        const linkContent2 = (Math.random() + 1).toString(36).substring(3);
        const construction = new ScConstruction();
        const expectedType = ScType.LinkConst;
        construction.createLink(expectedType, new ScLinkContent(linkContent1, ScLinkContentType.String));
        construction.createLink(expectedType, new ScLinkContent(linkContent2, ScLinkContentType.String));
        const linkAddrs = await client.createElements(construction);

        const res = await client.getLinksByContents([linkContent1, linkContent2]);

        expect(res).toHaveLength(linkAddrs.length);
        res.forEach((resItem) => resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr)));
        expect(linkAddrs).toContainEqual(res[0][0]);
        expect(linkAddrs).toContainEqual(res[1][0]);
    }, timeoutForSimpleTest);

    test("getLinksByContentSubstrings", async () => {
        const linkContent1 = (Math.random() + 1).toString(36).substring(2);
        const linkContent2 = (Math.random() + 1).toString(36).substring(3);
        const linkSubcontent1 = linkContent1.substring(0, 4);
        const linkSubcontent2 = linkContent2.substring(0, 6);
        const construction = new ScConstruction();
        const expectedType = ScType.LinkConst;
        construction.createLink(expectedType, new ScLinkContent(linkContent1, ScLinkContentType.String));
        construction.createLink(expectedType, new ScLinkContent(linkContent2, ScLinkContentType.String));
        const linkAddrs = await client.createElements(construction);

        const res = await client.getLinksByContentSubstrings([linkSubcontent1, linkSubcontent2]);

        expect(res).toHaveLength(2);
        expect(res[0][0]).toBeInstanceOf(ScAddr);
        expect(res[1][0]).toBeInstanceOf(ScAddr);

        expect(res).toHaveLength(linkAddrs.length);
        res.forEach((resItem) => resItem.forEach((resItem) => expect(resItem).toBeInstanceOf(ScAddr)));
        expect(linkAddrs).toContainEqual(res[0][0]);
        expect(linkAddrs).toContainEqual(res[1][0]);
    }, timeoutForSimpleTest);

    test("getStringsBySubstrings", async () => {
        const linkContent1 = (Math.random() + 1).toString(36).substring(2);
        const linkContent2 = (Math.random() + 1).toString(36).substring(3);
        const linkContents = [linkContent1, linkContent2];
        const linkSubcontent1 = linkContent1.substring(0, 4);
        const linkSubcontent2 = linkContent2.substring(0, 6);
        const construction = new ScConstruction();
        const expectedType = ScType.LinkConst;
        construction.createLink(expectedType, new ScLinkContent(linkContent1, ScLinkContentType.String));
        construction.createLink(expectedType, new ScLinkContent(linkContent2, ScLinkContentType.String));
        const linkAddrs = await client.createElements(construction);

        const res = await client.getLinksContentsByContentSubstrings([linkSubcontent1, linkSubcontent2]);

        expect(res).toHaveLength(linkAddrs.length);
        expect(linkContents).toContainEqual(res[0][0]);
        expect(linkContents).toContainEqual(res[1][0]);
    }, timeoutForSimpleTest);

    test("resolveKeynodes", async () => {
        const id1 = "id1";
        const id2 = "id2";

        const keynodes = [
            {id: id1, type: ScType.NodeConst},
            {id: id2, type: new ScType()},
        ];

        const res = await client.resolveKeynodes(keynodes);

        expect(res).toEqual({
            [id1]: expect.any(ScAddr),
            [id2]: expect.any(ScAddr),
        });
    }, timeoutForSimpleTest);

    test("templateSearchBasicTriple", async () => {
        const nodeAlias = "_nodeAlias";
        const prepareConstruction = new ScConstruction();
        prepareConstruction.createNode(ScType.NodeConst);
        prepareConstruction.createNode(ScType.NodeConst);
        const nodeAddrs = await client.createElements(prepareConstruction);
        const nodeAddr1 = nodeAddrs[0];
        const nodeAddr2 = nodeAddrs[1];

        const construction = new ScConstruction();
        construction.createEdge(ScType.EdgeAccessConstPosPerm, nodeAddr1, nodeAddr2);
        const edgeAddrs = await client.createElements(construction);

        const template = new ScTemplate();

        template.triple(
            nodeAddr1,
            ScType.EdgeAccessVarPosPerm,
            [ScType.NodeVar, nodeAlias]);

        const res = await client.templateSearch(template);

        expect(res).toBeTruthy();
        expect(res).toHaveLength(1);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));
        const allAddrs = nodeAddrs.concat(edgeAddrs);
        expect(res[0].size).toStrictEqual(allAddrs.length);
        expect(allAddrs).toContainEqual(res[0].get(0));
        expect(allAddrs).toContainEqual(res[0].get(1));
        expect(allAddrs).toContainEqual(res[0].get(nodeAlias));
    }, timeoutForSimpleTest);

    test("templateSearchBasicTriplets", async () => {
        const nodeAlias = "_nodeAlias";

        const fixedNodeConstruction = new ScConstruction();
        fixedNodeConstruction.createNode(ScType.NodeConst);
        const fixedNodeAddrs = await client.createElements(fixedNodeConstruction);
        const fixedNodeAddr = fixedNodeAddrs[0];

        const tempNodeConstruction = new ScConstruction();
        tempNodeConstruction.createNode(ScType.NodeConst);
        tempNodeConstruction.createNode(ScType.NodeConst);
        tempNodeConstruction.createNode(ScType.NodeConst);
        tempNodeConstruction.createNode(ScType.NodeConst);
        const tempNodeAddrs = await client.createElements(tempNodeConstruction);

        const edgeContruction = new ScConstruction();
        for (let tempNodeAddr of tempNodeAddrs) {
            edgeContruction.createEdge(ScType.EdgeAccessConstPosPerm, fixedNodeAddr, tempNodeAddr);
        }
        const edgeAddrs = await client.createElements(edgeContruction);

        const template = new ScTemplate();

        template.triple(
            fixedNodeAddr,
            ScType.EdgeAccessVarPosPerm,
            [ScType.NodeVar, nodeAlias]);

        const res = await client.templateSearch(template);

        expect(res).toBeTruthy();
        expect(res).toHaveLength(4);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));
        const allAddrs = fixedNodeAddrs.concat(edgeAddrs).concat(tempNodeAddrs);
        for (let templateResult of res) {
            expect(templateResult.size).toStrictEqual(3);
            templateResult.forEachTriple((first, second, third) => {
                expect(allAddrs).toContainEqual(first);
                expect(allAddrs).toContainEqual(second);
                expect(allAddrs).toContainEqual(third);
            })
        }

    }, timeoutForSimpleTest);

    test("templateSearchTripleWithRelation", async () => {
        const relNodeAlias = "_relNodeAlias";
        const prepareConstruction = new ScConstruction();
        prepareConstruction.createNode(ScType.NodeConst);
        prepareConstruction.createNode(ScType.NodeConst);
        prepareConstruction.createNode(ScType.NodeConstRole);
        const nodeAddrs = await client.createElements(prepareConstruction);
        const nodeAddr1 = nodeAddrs[0];
        const nodeAddr2 = nodeAddrs[1];
        const relAddr = nodeAddrs[2];

        const mainEdgeConstruction = new ScConstruction();
        mainEdgeConstruction.createEdge(ScType.EdgeUCommonConst, nodeAddr1, nodeAddr2);
        const edgeAddrs = await client.createElements(mainEdgeConstruction);

        const relEdgeConstruction = new ScConstruction();
        relEdgeConstruction.createEdge(ScType.EdgeAccessConstPosPerm, relAddr, edgeAddrs[0]);
        const relEdgeAddrs = await client.createElements(relEdgeConstruction);

        const template = new ScTemplate();

        template.tripleWithRelation(
            nodeAddr1,
            ScType.EdgeUCommonVar,
            nodeAddr2,
            ScType.EdgeAccessVarPosPerm,
            [ScType.NodeVarRole, relNodeAlias]
        );

        const res = await client.templateSearch(template);

        expect(res).toBeTruthy();
        expect(res).toHaveLength(1);
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));
        const allAddrs = nodeAddrs.concat(edgeAddrs).concat(relEdgeAddrs);
        expect(res[0].size).toStrictEqual(allAddrs.length + 1); // +1 because of template5 returns two triplets
        expect(allAddrs).toContainEqual(res[0].get(0));
        expect(allAddrs).toContainEqual(res[0].get(1));
        expect(allAddrs).toContainEqual(res[0].get(relNodeAlias));
        expect(allAddrs).toContainEqual(res[0].get(3));
        expect(allAddrs).toContainEqual(res[0].get(4));
    }, timeoutForSimpleTest);

    test("templateSearchBySCs", async () => {
        const prepareConstruction = new ScConstruction();
        prepareConstruction.createNode(ScType.NodeConst);
        const nodeAddrs = await client.createElements(prepareConstruction);
        const nodeAddr1 = nodeAddrs[0];
        const nodeAddr2 = (await client.resolveKeynodes([{
            id: "node_for_client_testing",
            type: ScType.NodeConst
        }])).node_for_client_testing
        const construction = new ScConstruction();
        construction.createEdge(ScType.EdgeDCommon, nodeAddr2, nodeAddr1);
        const edgeAddrs = await client.createElements(construction);

        // const type_type = ScType.EdgeAccessConstPosPerm;

        const res = await client.templateSearch("node_for_client_testing _=> _node1;;");

        await client.deleteElements([nodeAddr2]); //delete resolved node
        expect(res).toBeTruthy();
        expect(res).toHaveLength(1)
        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));
        const allAddrs = edgeAddrs.concat(nodeAddr1).concat(nodeAddr2);
        expect(res[0].size).toStrictEqual(allAddrs.length);
        expect(allAddrs).toContainEqual(res[0].get(0));
        expect(allAddrs).toContainEqual(res[0].get(1));
        expect(allAddrs).toContainEqual(res[0].get("_node1"));
    }, timeoutForSimpleTest);

    // ToDo Complete the test when there is an appropriate sc-machine fix. Currently this test dumps sc-machine
    //
    // test("templateSearchByIncorrectSCs", async () => {
    //     const res = await client.templateSearch("node_for_client_testing _-> _node1;;");
    // //    ToDo assert
    // }, timeoutForSimpleTest);

    // ToDo Complete the test when there is an appropriate sc-machine fix. Currently this test dumps sc-machine
    //
    // test("templateSearchByString", async () => {
    //     const construction = new ScConstruction();
    //     construction.createNode(ScType.NodeConst)
    //     construction.createNode(ScType.NodeConst)
    //     const addrs = await client.createElements(construction);
    //
    //     const fakeNodeAddr1 = addrs[0];
    //     const fakeNodeAddr2 = addrs[1];
    //
    //     const params = {
    //         ["_node1"]: fakeNodeAddr1,
    //         ["_node2"]: fakeNodeAddr2,
    //     };
    //
    //     const res = await client.templateSearch("test_template_1", params);
    //
    //     expect(res).toBeTruthy();
    //
    //     res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScTemplateResult));
    //
    // }, timeoutForSimpleTest);

    test("templateGenerateByAddr", async () => {
        const construction = new ScConstruction();
        construction.createNode(ScType.NodeConst)
        construction.createNode(ScType.NodeConstStruct)
        const addrs = await client.createElements(construction);

        const fakeNodeAddr1 = addrs[0];
        const fakeTemplateAddr = addrs[1];

        const params = {
            ["_node1"]: fakeNodeAddr1,
            ["_node2"]: "test_node",
        };

        const res = await client.templateGenerate(fakeTemplateAddr, params);

        expect(res).toBeTruthy();
        expect(res).toBeInstanceOf(ScTemplateResult);
    }, timeoutForSimpleTest);

    test("eventsCreate", async () => {
        const eventCallback = jest.fn();

        const preparationConstruction = new ScConstruction();
        preparationConstruction.createNode(ScType.NodeConst);
        preparationConstruction.createNode(ScType.NodeConst);
        const addrs = await client.createElements(preparationConstruction);

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

        res.forEach((resItem) => expect(resItem).toBeInstanceOf(ScEvent));
        res.forEach((resItem) => expect(resItem.IsValid()).toBeTruthy());

        const construction = new ScConstruction();

        construction.createEdge(
            ScType.EdgeAccessConstPosPerm,
            fakeNodeAddr2,
            fakeNodeAddr1
        );

        const edgeAddr = await client.createElements(construction);
        await client.deleteElements(edgeAddr);

        expect(eventCallback).toHaveBeenCalledWith(
            expect.any(ScAddr),
            expect.any(ScAddr),
            expect.any(ScAddr),
            expect.any(Number)
        );

    }, timeoutForSimpleTest);

    test("eventsDestroy", async () => {
        const eventIds = [1, 2];

        const res = await client.eventsDestroy(eventIds);

        expect(res).toStrictEqual(true);
    }, timeoutForSimpleTest);

    test("eventsInteraction", async () => {
        const eventCallback = jest.fn();

        const preparationConstruction = new ScConstruction();
        preparationConstruction.createNode(ScType.NodeConst);
        preparationConstruction.createNode(ScType.NodeConst);
        const addrs = await client.createElements(preparationConstruction);

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
        const eventIds = [1, 2];
        await client.eventsDestroy(eventIds);
        res.forEach((resItem) => expect(resItem.IsValid()).toBeFalsy());
    }, timeoutForSimpleTest);
});



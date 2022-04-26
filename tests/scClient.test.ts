import { ScAddr } from "../src/ScAddr";
import { ScClient } from "../src/ScClient";
import { ScConstruction } from "../src/ScConstruction";
import { ScEventType } from "../src/scEvent";
import { ScEventParams } from "../src/ScEventParams";
import { ScType } from "../src/ScType";

const URL = "";

const baseKeynodes = [
  { id: "action_get_dialog", type: ScType.NodeConstClass },
] as const;

describe("ScClient", () => {
  let client: ScClient;

  beforeAll(() => {
    client = new ScClient(URL);
  });

  test("createElements", async () => {
    const construction = new ScConstruction();

    construction.createNode(ScType.NodeConst);

    const res = await client.createElements(construction);

    expect(res.length).toBe(1);
  });

  test("createElementsWithAlias", async () => {
    const construction = new ScConstruction();

    construction.createNode(ScType.NodeConst, "myAlias1");
    construction.createNode(ScType.NodeConst, "myAlias2");
    construction.createEdge(ScType.EdgeDCommonConst, "myAlias1", "myAlias2");

    const res = await client.createElements(construction);
    expect(res.length).toBe(3);
  });

  test("deleteElements & checkElements", async () => {
    const construction = new ScConstruction();

    construction.createNode(ScType.NodeConst, "myAlias");

    const createRes = await client.createElements(construction);
    expect(createRes.length).toBe(1);

    const checkResAfterCreate = await client.checkElements(createRes);
    expect(checkResAfterCreate.length).toBe(1);

    const deleteRes = await client.deleteElements(createRes);
    expect(deleteRes).toBeTruthy();

    const checkResAfterDelete = await client.checkElements(createRes);
    checkResAfterDelete.forEach((scAddr) => {
      expect(scAddr.isValid()).toBeFalsy();
    });
  });

  test("resolveKeynodes", async () => {
    const res = await client.resolveKeynodes(baseKeynodes);
    expect(res["action_get_dialog"].isValid()).toBeTruthy();
  });

  test("createEvent", async () => {
    const evtParams = new ScEventParams(
      new ScAddr(),
      ScEventType.AddIngoingEdge,
      async (_subscibedAddr, _arc, _anotherAddr, eventId) => {
        await client.eventsDestroy([eventId]);
      }
    );
    const res = await client.eventsCreate(evtParams);
  });
});

import { ScClient } from "../src/ScClient";
import { ScType } from "../src/ScType";

const URL = "wss://pcare.scserver.eu.ngrok.io/ws_json";

const baseKeynodes = [
  { id: "action_get_dialog", type: ScType.NodeConstClass },
] as const;

describe("ScClient", () => {
  let client: ScClient | undefined;

  beforeAll(() => {
    client = new ScClient(URL);
  });

  test("resolveKeynodes", async () => {
    const res = await client.resolveKeynodes(baseKeynodes);
    expect(res["action_get_dialog"].isValid()).toBeTruthy();
  });
});

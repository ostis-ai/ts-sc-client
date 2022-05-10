import { invalidValue } from "./errors";
import { ScAddr } from "./ScAddr";
import { ScConstruction } from "./ScConstruction";

export const transformEdgeInfo = (
  construction: ScConstruction,
  aliasOrAddr: ScAddr | string
) => {
  if (typeof aliasOrAddr !== "string") {
    return {
      type: "addr",
      value: aliasOrAddr.value,
    };
  }

  const aliasIndex = construction.getIndex(aliasOrAddr);

  if (aliasIndex === undefined) {
    return invalidValue(`Invalid alias: ${aliasIndex}`);
  }

  return {
    type: "ref",
    value: aliasIndex,
  };
};

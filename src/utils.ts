import { invalidValue } from "./errors";
import { ScAddr } from "./ScAddr";
import { ScConstruction } from "./ScConstruction";
import { SnakeToCamelCase } from "./types";

export const transformConnectorInfo = (
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

export const shiftMap = (map: Map<any, any>, to = 1) => {
  if (to < 1) return;

  let isDone = false;
  let ind = 0;
  const mapIterator = map.keys();
  while (ind < to && !isDone) {
    const elem = mapIterator.next();
    isDone = !!elem.done;
    map.delete(elem.value);
    ind++;
  }
};

export const snakeToCamelCase = <Str extends string>(
  str: Str
): SnakeToCamelCase<Str> =>
  str.replace(/_(\w)/g, (_, p1) => p1.toUpperCase()) as SnakeToCamelCase<Str>;

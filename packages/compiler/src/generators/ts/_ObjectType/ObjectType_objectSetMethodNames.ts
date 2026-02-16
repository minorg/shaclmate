import { camelCase, trainCase } from "change-case";
import plur from "plur";

export function ObjectType_objectSetMethodNames(this: {
  readonly name: string;
}) {
  const prefixSingular = camelCase(this.name);
  const thisNameParts = trainCase(this.name).split("-");
  let prefixPlural = camelCase(
    `${thisNameParts.slice(0, thisNameParts.length - 1).join("")}${plur(thisNameParts[thisNameParts.length - 1])}`,
  );
  if (prefixPlural === prefixSingular) {
    // Happens with singular-s nouns like "series"
    prefixPlural = `${prefixPlural}s`;
  }

  return {
    object: prefixSingular,
    objectIdentifiers: `${prefixSingular}Identifiers`,
    objects: prefixPlural,
    objectsCount: `${prefixPlural}Count`,
  };
}

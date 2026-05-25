import { camelCase, trainCase } from "change-case";
import plur from "plur";
import type { TsGenerator } from "../TsGenerator.js";

export function ObjectType_objectSetMethodNames(this: {
  readonly alias: string;
  readonly configuration: TsGenerator.Configuration;
}) {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

  const prefixSingular = camelCase(this.alias, {
    prefixCharacters: syntheticNamePrefix,
  });
  const thisNameParts = trainCase(this.alias, {
    prefixCharacters: syntheticNamePrefix,
  }).split("-");
  let prefixPlural = camelCase(
    `${thisNameParts.slice(0, thisNameParts.length - 1).join("")}${plur(thisNameParts[thisNameParts.length - 1])}`,
    { prefixCharacters: syntheticNamePrefix },
  );
  if (prefixPlural === prefixSingular) {
    // Happens with singular-s nouns like "series"
    prefixPlural = `${prefixPlural}s`;
  }

  return {
    object: prefixSingular,
    objectCount: `${prefixSingular}Count`,
    objectIdentifiers: `${prefixSingular}Identifiers`,
    objects: prefixPlural,
  };
}

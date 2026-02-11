import { camelCase, trainCase } from "change-case";
import plur from "plur";

export function objectSetMethodNames(this: { readonly nameString: string }) {
  const prefixSingular = camelCase(this.nameString);
  const thisNameParts = trainCase(this.nameString).split("-");
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

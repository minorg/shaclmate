import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_PropertyPath } from "./snippets_PropertyPath.js";

export const snippets_sparqlPropertyPath = conditionalOutput(
  `${syntheticNamePrefix}sparqlPropertyPath`,
  code`\
/**
 * Convert a ${snippets_PropertyPath} to a ${imports.sparqljs}.PropertyPath.
 */  
function ${syntheticNamePrefix}sparqlPropertyPath(propertyPath: ${snippets_PropertyPath}): ${imports.NamedNode} | ${imports.sparqljs}.PropertyPath {
  switch (propertyPath.termType) {
    case "AlternativePath":
      return {
        type: "path",
        pathType: "|",
        items: propertyPath.members.map(${syntheticNamePrefix}sparqlPropertyPath),
      };

    case "InversePath":
      return {
        type: "path",
        pathType: "^",
        items: [${syntheticNamePrefix}sparqlPropertyPath(propertyPath.path)],
      };

    case "NamedNode":
      return propertyPath;

    case "OneOrMorePath":
      return {
        type: "path",
        pathType: "+",
        items: [${syntheticNamePrefix}sparqlPropertyPath(propertyPath.path)],
      };

    case "SequencePath":
      return {
        type: "path",
        pathType: "/",
        items: propertyPath.members.map(${syntheticNamePrefix}sparqlPropertyPath),
      };

    case "ZeroOrMorePath":
      return {
        type: "path",
        pathType: "*",
        items: [${syntheticNamePrefix}sparqlPropertyPath(propertyPath.path)],
      };

    case "ZeroOrOnePath":
      return {
        type: "path",
        pathType: "?",
        items: [${syntheticNamePrefix}sparqlPropertyPath(propertyPath.path)],
      };

    default: {
      propertyPath satisfies never;
      throw new Error(\`unhandled property path termType: \${(propertyPath as any).termType}\`);
    }
  }
}`,
);

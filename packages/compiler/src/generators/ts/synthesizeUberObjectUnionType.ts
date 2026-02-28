import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type { TsFeature } from "../../enums/TsFeature.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

/**
 * Synthesize the $Object union.
 */
export function synthesizeUberObjectUnionType(parameters: {
  objectTypes: readonly ObjectType[];
}): ObjectUnionType {
  const objectTypes = parameters.objectTypes.filter(
    (objectType) => !objectType.extern, // && !objectType.name.startsWith(syntheticNamePrefix),
  );

  const nodeKinds = objectTypes.reduce((nodeKinds, objectType) => {
    for (const nodeKind of objectType.identifierType.nodeKinds) {
      nodeKinds.add(nodeKind);
    }
    return nodeKinds;
  }, new Set<IdentifierNodeKind>());

  let identifierType: BlankNodeType | IdentifierType | IriType;
  if (nodeKinds.size === 2) {
    identifierType = new IdentifierType({
      comment: Maybe.empty(),
      label: Maybe.empty(),
    });
  } else {
    switch ([...nodeKinds][0]) {
      case "BlankNode":
        identifierType = new BlankNodeType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
        });
        break;
      case "NamedNode":
        identifierType = new IriType({
          comment: Maybe.empty(),
          hasValues: [],
          in_: [],
          label: Maybe.empty(),
        });
        break;
    }
  }

  return new ObjectUnionType({
    comment: Maybe.empty(),
    export_: true,
    features: objectTypes.reduce((features, objectType) => {
      for (const feature of objectType.features) {
        features.add(feature);
      }
      features.delete("graphql");
      return features;
    }, new Set<TsFeature>()),
    identifierType,
    label: Maybe.empty(),
    memberTypes: objectTypes,
    name: `${syntheticNamePrefix}Object`,
  });
}

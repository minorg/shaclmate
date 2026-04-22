import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { TsFeature } from "../../enums/TsFeature.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

/**
 * Synthesize the $Object union.
 */
export function synthesizeUberObjectUnionType(parameters: {
  namedObjectTypes: readonly NamedObjectType[];
}): NamedObjectUnionType {
  const namedObjectTypes = parameters.namedObjectTypes.filter(
    (namedObjectType) => !namedObjectType.extern, // && !namedObjectType.name.startsWith(syntheticNamePrefix),
  );
  invariant(namedObjectTypes.length > 0);

  const nodeKinds = namedObjectTypes.reduce((nodeKinds, namedObjectType) => {
    for (const nodeKind of namedObjectType.identifierType.nodeKinds) {
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
      case "IRI":
        identifierType = new IriType({
          comment: Maybe.empty(),
          hasValues: [],
          in_: [],
          label: Maybe.empty(),
        });
        break;
    }
  }

  return new NamedObjectUnionType({
    comment: Maybe.empty(),
    features: namedObjectTypes.reduce((features, namedObjectType) => {
      for (const feature of namedObjectType.features) {
        features.add(feature);
      }
      features.delete("graphql");
      return features;
    }, new Set<TsFeature>()),
    identifierType,
    label: Maybe.empty(),
    members: namedObjectTypes.map((namedObjectType) => ({
      discriminantValue: Maybe.empty(),
      type: namedObjectType,
    })),
    name: `${syntheticNamePrefix}Object`,
    recursive: false,
  });
}

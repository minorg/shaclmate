import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type { TsFeature } from "../../enums/TsFeature.js";
import { IdentifierType } from "./IdentifierType.js";
import type { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

/**
 * Synthesize the $Object union.
 */
export function synthesizeUberObjectUnionType({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): ObjectUnionType {
  //   const objectTypes = parameters.objectTypes.filter(
  //     (objectType) => !objectType.abstract,
  //   );
  return new ObjectUnionType({
    comment: Maybe.empty(),
    export_: true,
    features: objectTypes.reduce((features, objectType) => {
      for (const feature of objectType.features) {
        features.add(feature);
      }
      return features;
    }, new Set<TsFeature>()),
    identifierType: new IdentifierType({
      comment: Maybe.empty(),
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: [],
      label: Maybe.empty(),
      nodeKinds: objectTypes.reduce((nodeKinds, objectType) => {
        for (const nodeKind of objectType.identifierType.nodeKinds) {
          nodeKinds.add(nodeKind);
        }
        return nodeKinds;
      }, new Set<IdentifierNodeKind>()),
    }),
    label: Maybe.empty(),
    memberTypes: objectTypes,
    name: `${syntheticNamePrefix}Object`,
  });
}

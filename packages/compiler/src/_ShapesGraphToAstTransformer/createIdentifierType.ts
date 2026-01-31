import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { BlankNodeType } from "../ast/BlankNodeType.js";
import { IdentifierType } from "../ast/IdentifierType.js";
import { NamedNodeType } from "../ast/NamedNodeType.js";

export function createIdentifierType(
  nodeKinds: ReadonlySet<IdentifierNodeKind>,
  options?: {
    comment?: Maybe<string>;
    defaultValue?: Maybe<NamedNode>;
    hasValues?: readonly NamedNode[];
    in_?: readonly NamedNode[];
    label?: Maybe<string>;
  },
): BlankNodeType | IdentifierType | NamedNodeType {
  const comment = options?.comment ?? Maybe.empty();
  const defaultValue = options?.defaultValue ?? Maybe.empty();
  const label = options?.label ?? Maybe.empty();

  if (nodeKinds.size === 2) {
    return new IdentifierType({
      comment,
      defaultValue,
      label,
    });
  }

  invariant(nodeKinds.size === 1);
  switch ([...nodeKinds][0]) {
    case "BlankNode":
      return new BlankNodeType({
        comment,
        label,
      });
    case "NamedNode":
      return new NamedNodeType({
        comment,
        defaultValue,
        hasValues: options?.hasValues ?? [],
        in_: options?.in_ ?? [],
        label,
      });
  }
}

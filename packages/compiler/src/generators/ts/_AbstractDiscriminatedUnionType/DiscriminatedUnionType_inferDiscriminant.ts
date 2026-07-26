import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractType } from "../AbstractType.js";
import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import type { Typeof } from "../Typeof.js";

function termTypes(
  type: Type,
): ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> {
  switch (type.kind) {
    case "BlankNode":
    case "Iri":
    case "Identifier":
    case "Literal":
    case "Term":
      return type.termTypes;
    default:
      return emptyTermTypesSet;
  }
}

export function DiscriminatedUnionType_inferDiscriminant<
  MemberTypeT extends Type,
>(
  this: DiscriminatedUnionType<MemberTypeT>,
  members: readonly {
    readonly discriminantValue: Maybe<number | string>;
    readonly type: Type;
  }[],
): DiscriminatedUnionType.Discriminant {
  // extrinsic with user-specified values
  if (members.some((member) => member.discriminantValue.isJust())) {
    return {
      jsonName: this.configuration.objectDiscriminantProperty.jsonName,
      kind: "Extrinsic",
      memberValues: members.map((member, memberI) =>
        member.discriminantValue.orDefault(memberI),
      ),
      name: this.configuration.objectDiscriminantProperty.name,
    };
  }

  const memberTypes = members.map((member) => member.type);

  // intrinsic
  {
    let intrinsicDiscriminantProperty:
      | AbstractType.DiscriminantProperty
      | undefined;
    let memberValues: AbstractType.DiscriminantProperty.Value[] = [];
    for (const memberType of memberTypes) {
      const memberTypeDiscriminantProperty =
        memberType.discriminantProperty.extract();
      if (!memberTypeDiscriminantProperty) {
        intrinsicDiscriminantProperty = undefined;
        break;
      }
      if (!intrinsicDiscriminantProperty) {
        intrinsicDiscriminantProperty = memberTypeDiscriminantProperty;
      } else if (
        memberTypeDiscriminantProperty.name !==
        intrinsicDiscriminantProperty.name
      ) {
        intrinsicDiscriminantProperty = undefined;
        break;
      }
      memberValues = memberValues.concat(memberTypeDiscriminantProperty.values);
    }

    if (intrinsicDiscriminantProperty) {
      return {
        jsonName: intrinsicDiscriminantProperty.jsonName,
        kind: "Intrinsic",
        memberValues,
        name: intrinsicDiscriminantProperty.name,
      };
    }
  }

  // typeof
  {
    const memberTypeofs: Typeof[] = [];
    const memberTypeofsSet = new Set<Typeof>();
    for (const memberType of memberTypes) {
      for (const memberJsType of memberType.jsTypes) {
        memberTypeofs.push(memberJsType.typeof);
        memberTypeofsSet.add(memberJsType.typeof);
      }
    }
    if (memberTypeofsSet.size === memberTypes.length) {
      return {
        memberValues: memberTypeofs,
        kind: "Typeof",
      };
    }
  }

  // hybrid
  // If some member type is an RDF/JS term then reuse "termType" as the discriminant.
  if (memberTypes.some((memberType) => termTypes(memberType).size > 0)) {
    const extrinsicMemberTypeAliasesSet = new Set<string>();
    let extrinsicMemberTypeCount = 0;
    for (const memberType of memberTypes) {
      if (termTypes(memberType).size > 0) {
        continue;
      }
      extrinsicMemberTypeCount++;
      if (memberType.name.isJust()) {
        extrinsicMemberTypeAliasesSet.add(memberType.name.extract());
      } else {
        break;
      }
    }

    return {
      jsonName: "termType",
      kind: "Hybrid",
      memberValues: memberTypes.map((memberType, memberTypeI) => {
        const memberTermTypes = termTypes(memberType);
        if (memberTermTypes.size > 0) {
          return {
            kind: "Intrinsic",
            values: [...memberTermTypes],
          };
        }

        return {
          kind: "Extrinsic",
          values:
            extrinsicMemberTypeAliasesSet.size === extrinsicMemberTypeCount
              ? [memberType.name.unsafeCoerce()]
              : [memberTypeI.toString()],
        };
      }),
      name: "termType",
    };
  }

  // extrinsic with inferred values
  {
    let memberValues: readonly AbstractType.DiscriminantProperty.Value[];
    {
      const memberTypeNames: readonly string[] = memberTypes.map((memberType) =>
        memberType.name.orDefault(memberType.jsTypes[0].typeof),
      );
      const memberTypeNamesSet = new Set(memberTypeNames);
      if (memberTypeNamesSet.size === memberTypeNames.length) {
        memberValues = memberTypeNames;
      } else {
        // Otherwise prefix the non-unique strings with an index and use those as the discriminant values.
        memberValues = memberTypeNames.map(
          (memberTypeName, memberTypeI) => `${memberTypeI}-${memberTypeName}`,
        );
      }
    }
    invariant(memberValues.length === memberTypes.length);
    return {
      jsonName: this.configuration.objectDiscriminantProperty.jsonName,
      kind: "Extrinsic",
      memberValues,
      name: this.configuration.objectDiscriminantProperty.name,
    };
  }
}

const emptyTermTypesSet: ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> =
  new Set();

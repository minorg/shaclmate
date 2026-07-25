import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { AbstractType } from "../AbstractType.js";
import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import type { Typeof } from "../Typeof.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_conversionFunctionExpression<
  MemberTypeT extends Type,
>(
  this: DiscriminatedUnionType<MemberTypeT>,
): Maybe<AbstractType.ConversionFunction> {
  if (this.discriminant.kind === "Typeof") {
    // If the members are discriminated by typeof, they can all be used as source types.
    return Maybe.of({
      code: code`${this.reusables.snippets.identityConversionFunction}`,
      sourceTypes: this.members.flatMap(({ type }) =>
        type.jsTypes.map((jsType) => ({
          expression: type.expression,
          jsType,
        })),
      ),
    });
  }

  if (this.discriminant.kind === "Intrinsic") {
    // Allow discriminated unions with intrinsic discriminants (e.g., a "termType" property) to accept additional
    // source types with typeofs besides "object".

    const memberIdentitySourceTypes: AbstractType.ConversionFunction.SourceType[] =
      [];
    const otherMemberConversionsByTypeof = new Map<
      Typeof,
      [
        AbstractType.ConversionFunction.SourceType,
        AbstractType.ConversionFunction,
      ]
    >();
    for (const member of this.members) {
      const memberConversionFunction = member.type.conversionFunction.extract();

      const memberIdentitySourceType: AbstractType.ConversionFunction.SourceType =
        {
          expression: member.type.expression,
          jsType: {
            instanceof: "Object",
            typeof: "object",
          },
        };
      memberIdentitySourceTypes.push(memberIdentitySourceType);

      if (!memberConversionFunction) {
        // Identity conversion
        continue;
      }

      const memberSourceTypes = memberConversionFunction.sourceTypes;
      invariant(
        memberSourceTypes.length > 1,
        "member type should return Maybe.empty() instead of returning an identity conversion alone",
      );
      let haveMemberIdentitySourceType = false;
      for (const memberSourceType of memberSourceTypes) {
        if (
          AbstractType.ConversionFunction.SourceType.equals(
            memberSourceType,
            memberIdentitySourceType,
          )
        ) {
          haveMemberIdentitySourceType = true;
          continue;
        }

        if (memberSourceType.jsType.typeof === "object") {
          this.logger.debug(
            "%s: member type %s conversion function has more than one source type with typeof === 'object'",
            this,
            member.type,
          );
          return Maybe.empty();
        }

        if (
          otherMemberConversionsByTypeof.has(memberSourceType.jsType.typeof)
        ) {
          this.logger.debug(
            "%s: member type %s conversion function has a source type with the same non-object typeof as another member type",
            this,
            member.type,
          );
          return Maybe.empty();
        }
        otherMemberConversionsByTypeof.set(memberSourceType.jsType.typeof, [
          memberSourceType,
          memberConversionFunction,
        ]);
      }
      invariant(
        haveMemberIdentitySourceType,
        "member conversion source types should include the member type itself",
      );
    }
    invariant(memberIdentitySourceTypes.length === this.members.length);
    if (otherMemberConversionsByTypeof.size === 0) {
      return Maybe.empty();
    }
    const otherMemberConversions = [...otherMemberConversionsByTypeof.values()];
    const sourceTypes = memberIdentitySourceTypes.concat([
      ...otherMemberConversions.map((_) => _[0]),
    ]);
    return Maybe.of({
      code: code`\
((value: ${joinCode(sourceTypes.map((sourceType) => sourceType.expression, { on: " | " }))}) => {
  if (typeof value === "object") {
    return value;
  }
  ${joinCode(otherMemberConversions.map(([otherMemberSourceType, otherMemberConversionFunction]) => code`if (typeof value === ${otherMemberSourceType.jsType.typeof}) { return ${otherMemberConversionFunction}(value); }`))}
  value satisfies never;
  throw new Error("should never reach this point");
})`,
      sourceTypes,
    });
  }

  return Maybe.empty();
}

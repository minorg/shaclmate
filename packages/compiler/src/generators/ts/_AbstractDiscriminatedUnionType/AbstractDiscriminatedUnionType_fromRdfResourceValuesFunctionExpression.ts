import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  // Two passes:
  // 1. Apportion input values to different union members. For each value, let each member try to map the value until one succeeds (Right). If none succeed, return Left.
  // 2. Pass all of a member's successfully-mapped input values back into the member's mapper so it can potentially reorder them (by e.g., preferred language)
  return code`\
(((inputValues, options) => {
  const memberInputValues: ${this.reusables.imports.Resource}.Values[] = Array.from({ length: ${this.members.length} }).map(() => ${this.reusables.imports.Resource}.Values.empty({
    focusResource: inputValues.focusResource,
    propertyPath: inputValues.propertyPath
  }));
  for (const inputValue of inputValues) {
    const inputValueAsValues = inputValue.toValues();
    let memberOutputValuesEither: ${this.reusables.imports.Either}<Error, unknown> | undefined;
    for (let memberI = 0; memberI < ${this.members.length}; memberI++) {
${joinCode(
  this.members.map(
    (member, memberI) => code`\
      if (memberI === ${memberI}) {
        memberOutputValuesEither = ${member.type.fromRdfResourceValuesFunction}(inputValueAsValues, { ...options, ignoreRdfType: false, schema: options.schema.members[${literalOf(member.primaryDiscriminantValue)}].type })
        if (memberOutputValuesEither.isRight()) {
          memberInputValues[memberI] = memberInputValues[memberI].concat(inputValue);
          break;
        }
      }`,
  ),
  { on: " else " },
)}
    }
    if (memberOutputValuesEither!.isLeft()) {
      return memberOutputValuesEither;
    }
  }

  let collectedOutputValues: ${this.reusables.imports.Resource}.Values<${this.expression}> = ${this.reusables.imports.Resource}.Values.empty({
    focusResource: inputValues.focusResource,
    propertyPath: inputValues.propertyPath
  });
  for (let memberI = 0; memberI < ${this.members.length}; memberI++) {
    if (memberInputValues[memberI].length === 0) {
      continue;
    }
    switch (memberI) {
${joinCode(
  this.members.map((member, memberI) => {
    let memberFromRdfResourceValuesExpression = code`${member.type.fromRdfResourceValuesFunction}(memberInputValues[memberI], { ...options, ignoreRdfType: false, schema: options.schema.members[${literalOf(member.primaryDiscriminantValue)}].type })`;
    if (
      this.discriminant.kind === "Extrinsic" ||
      (this.discriminant.kind === "Hybrid" &&
        this.discriminant.memberValues[memberI].kind === "Extrinsic")
    ) {
      memberFromRdfResourceValuesExpression = code`${memberFromRdfResourceValuesExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(member.primaryDiscriminantValue)} as const, value }) as (${this.expression})))`;
    }
    return code`\
      case ${memberI}:
        collectedOutputValues = collectedOutputValues.concat(...(${memberFromRdfResourceValuesExpression}).unsafeCoerce());
        break;
      `;
  }),
  { on: "\n" },
)}
    }
  }
  return ${this.reusables.imports.Right}(collectedOutputValues);
}) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>)`;
}

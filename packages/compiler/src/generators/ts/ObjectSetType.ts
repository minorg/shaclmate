import { Memoize } from "typescript-memoize";
import { AbstractObjectSetType } from "./AbstractObjectSetType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ObjectSetType extends AbstractObjectSetType {
  @Memoize()
  get declaration(): Code {
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

    return code`\
export interface ${syntheticNamePrefix}ObjectSet {
  ${joinCode(
    this.namedObjectTypes
      .flatMap((namedObjectType) =>
        Object.values(this.methodSignatures(namedObjectType)),
      )
      .concat(
        this.namedObjectUnionTypes.flatMap((namedObjectUnionType) =>
          Object.values(this.methodSignatures(namedObjectUnionType)),
        ),
      )
      .map(
        (methodSignature) =>
          code`${methodSignature.name}(${methodSignature.parameters}): ${methodSignature.returnType};`,
      ),
    { on: "\n\n" },
  )}
}

export namespace ${syntheticNamePrefix}ObjectSet {
  export interface Query<ObjectFilterT, ObjectIdentifierT extends ${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode}> {
    readonly filter?: ObjectFilterT;
    readonly graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}>;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
    readonly preferredLanguages?: readonly string[];
  }
}`;
  }
}

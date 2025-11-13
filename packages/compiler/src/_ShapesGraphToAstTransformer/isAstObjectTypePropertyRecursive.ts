import { invariant } from "ts-invariant";
import { arrayEquals } from "../ast/equals.js";
import * as ast from "../ast/index.js";

const DEBUG = false;

export function isAstObjectTypePropertyRecursive(
  rootObjectType: ast.ObjectType,
  rootProperty: ast.ObjectType.Property,
): boolean {
  function helper(
    stack: {
      objectType: ast.ObjectType;
      property: ast.ObjectType.Property;
      propertyType?: readonly ast.Type[];
    }[],
  ): boolean {
    const currentStackFrame = stack.at(-1)!;
    const { objectType, property, propertyType } = currentStackFrame;

    if (DEBUG) {
      process.stderr.write(
        `${[
          stack.length.toString(),
          ast.Type.toString(rootObjectType),
          ast.ObjectType.Property.toString(rootProperty),
          ast.Type.toString(objectType),
          ast.ObjectType.Property.toString(property),
          propertyType
            ? `[${propertyType.map(ast.Type.toString).join(", ")}]`
            : "undefined",
        ].join(",")}\n`,
      );
    }

    for (const lowerStackFrame of stack.slice(0, -1)) {
      if (
        !ast.Type.equals(
          currentStackFrame.objectType,
          lowerStackFrame.objectType,
        )
      ) {
        continue;
      }
      if (
        !ast.ObjectType.Property.equals(
          currentStackFrame.property,
          lowerStackFrame.property,
        )
      ) {
        continue;
      }
      if (
        !arrayEquals(
          currentStackFrame.propertyType ?? [],
          lowerStackFrame.propertyType ?? [],
          ast.Type.equals,
        )
      ) {
        continue;
      }

      // We've seen this combination before and don't want to recurse further, to avoid infinite recursion
      if (DEBUG) {
        process.stderr.write("recursion detected, halting");
      }
      return true;
    }

    if (!propertyType) {
      const partialType = property.partialType.extract();
      if (partialType) {
        if (
          helper(
            stack.concat({
              objectType,
              property,
              propertyType: [partialType],
            }),
          )
        ) {
          return true;
        }
      }

      return helper(
        stack.concat({
          objectType,
          property,
          propertyType: [property.type],
        }),
      );
    }

    invariant(propertyType.length > 0);
    const currentPropertyType = propertyType.at(-1)!;

    switch (currentPropertyType.kind) {
      case "IdentifierType":
      case "LiteralType":
      case "PlaceholderType":
      case "TermType":
        return false;
      case "ObjectType": {
        if (DEBUG) {
          process.stderr.write(
            `recurse into ${ast.Type.toString(currentPropertyType)}`,
          );
        }
        for (const property of currentPropertyType.properties) {
          if (
            helper(
              stack.concat({
                objectType: currentPropertyType,
                property,
              }),
            )
          ) {
            return true;
          }
        }

        return false;
      }
      case "IntersectionType":
      case "UnionType": {
        if (DEBUG) {
          process.stderr.write(
            `recurse into ${ast.Type.toString(currentPropertyType)}`,
          );
        }
        for (const memberType of currentPropertyType.memberTypes) {
          if (
            helper(
              stack.concat({
                objectType,
                property,
                propertyType: propertyType.concat(memberType),
              }),
            )
          ) {
            return true;
          }
        }
        return false;
      }
      case "ObjectIntersectionType":
      case "ObjectUnionType": {
        if (DEBUG) {
          process.stderr.write(
            `recurse into ${ast.Type.toString(currentPropertyType)}`,
          );
        }
        for (const memberType of currentPropertyType.memberTypes) {
          for (const property of memberType.properties) {
            if (
              helper(
                stack.concat({
                  objectType: memberType,
                  property,
                }),
              )
            ) {
              return true;
            }
          }
        }
        return false;
      }
      case "ListType":
      case "OptionType":
      case "SetType":
        return helper(
          stack.concat({
            objectType,
            property,
            propertyType: propertyType.concat(currentPropertyType.itemType),
          }),
        );
    }
  }

  return helper([{ objectType: rootObjectType, property: rootProperty }]);
}

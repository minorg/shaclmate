interface Properties {
  [key: string]: PropertyValue;
}

type PropertyValue =
  | boolean
  | null
  | number
  | string
  | undefined
  | Properties
  | PropertyValue[];

function propertyInitializer(propertyValue: PropertyValue): string | undefined {
  switch (typeof propertyValue) {
    case "object":
      if (propertyValue === null) {
        return "null";
      }

      if (Array.isArray(propertyValue)) {
        return `[${propertyValue
          .map(propertyInitializer)
          .filter((_) => typeof _ !== "undefined")
          .join(", ")}]`;
      }

      return objectInitializer(propertyValue);
    case "undefined":
      return undefined;
    default:
      return propertyValue.toString();
  }
}

/**
 * Convert a compile-time, JSON-compatible TypeScript object to a TypeScript object initializer that can be used at runtime.
 *
 * Uses shorthand properties and doesn't quote strings like JSON.stringify would.
 */
export function objectInitializer(properties: Properties): string {
  return `{ ${Object.keys(properties)
    .sort()
    .flatMap((propertyName) => {
      const propertyValue = properties[propertyName];

      if (typeof propertyValue === "string" && propertyName === propertyValue) {
        return [propertyName]; // Shorthand
      }

      const propertyInitializer_ = propertyInitializer(propertyValue);
      if (typeof propertyInitializer_ === "undefined") {
        return [];
      }

      return [`${propertyName}: ${propertyInitializer_}`];
    })
    .join(", ")} }`;
}

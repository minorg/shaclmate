import namespace, { type NamespaceBuilder } from "@rdfjs/namespace";
import type { NamedNode } from "@rdfjs/types";

export interface Shaclmate {
  "": NamedNode<"http://minorg.github.io/shaclmate/ns#">;

  // Resources
  SHA256: NamedNode<"http://minorg.github.io/shaclmate/ns#SHA256">;
  UUIDv4: NamedNode<"http://minorg.github.io/shaclmate/ns#UUIDv4">;

  // Properties
  inline: NamedNode<"http://minorg.github.io/shaclmate/ns#inline">;
  mintingStrategy: NamedNode<"http://minorg.github.io/shaclmate/ns#mintingStrategy">;
  name: NamedNode<"http://minorg.github.io/shaclmate/ns#name">;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const builder = namespace("http://minorg.github.io/shaclmate/ns#") as any;
export const strict = builder as NamespaceBuilder<keyof Shaclmate> & Shaclmate;
export const loose = builder as NamespaceBuilder & Shaclmate;

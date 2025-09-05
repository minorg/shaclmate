import type {
  ClassDeclarationStructure,
  InterfaceDeclarationStructure,
  ModuleDeclarationStructure,
  TypeAliasDeclarationStructure,
} from "ts-morph";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";

export abstract class DeclaredType extends Type {
  abstract readonly declarationImports: readonly Import[];
  abstract readonly declarations: readonly (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
    | TypeAliasDeclarationStructure
  )[];
  readonly export: boolean;
  readonly features: Set<TsFeature>;
  readonly name: string;

  constructor({
    export_,
    features,
    name,
  }: {
    export_: boolean;
    features: Set<TsFeature>;
    name: string;
  }) {
    super();
    this.export = export_;
    this.features = features;
    this.name = name;
  }
}

// private get typeAliasDeclaration(): TypeAliasDeclarationStructure {
//   return {
//     isExported: true,
//     leadingTrivia: this.comment.alt(this.label).map(tsComment).extract(),
//     kind: StructureKind.TypeAlias,
//     name: this.name,
//     type: this.memberTypes.map((memberType) => memberType.name).join(" | "),
//   };
// }

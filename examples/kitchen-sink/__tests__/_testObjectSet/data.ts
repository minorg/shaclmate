import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";

export const data = {
  blankNodeOrIriIdentifieres: [...new Array(4)].map((_, i) =>
    kitchenSink.BlankNodeOrIriIdentifier.$create({
      $identifier:
        i % 2 === 0
          ? dataFactory.blankNode()
          : dataFactory.namedNode(
              `http://example.com/blankNodeOrIriIdentifier${i}`,
            ),
    }),
  ) satisfies readonly kitchenSink.BlankNodeOrIriIdentifier[],

  concreteChildren: [...new Array(4)].map((_, i) =>
    kitchenSink.ConcreteChild.$create({
      baseWithPropertiesProperty: `ABC string ${i}`,
      concreteChildProperty: `child string ${i}`,
      concreteParentProperty: `parent string ${i}`,
      $identifier: dataFactory.namedNode(
        `http://example.com/concreteChild${i}`,
      ),
    }),
  ) satisfies readonly kitchenSink.ConcreteChild[],

  // directRecursivees: [...new Array(4)].map(
  //   (_, i) =>
  //     kitchenSink.DirectRecursive.$create({
  //       directRecursiveProperty: kitchenSink.DirectRecursive.$create({
  //         $identifier: dataFactory.namedNode(
  //           `http://example.com/directRecursive${i}/directRecursiveProperty/value`,
  //         ),
  //       }),
  //       $identifier: dataFactory.namedNode(
  //         `http://example.com/directRecursive${i}`,
  //       ),
  //     }),
  // ) satisfies readonly kitchenSink.DirectRecursive[],

  noRdfTypeUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return kitchenSink.NoRdfTypeUnionMember1.$create({
          $identifier: dataFactory.namedNode(
            `http://example.com/noRdfTypeUnion${i}`,
          ),
          noRdfTypeUnionMember1Property: `member ${i}`,
        });
      case 1:
        return kitchenSink.NoRdfTypeUnionMember2.$create({
          $identifier: dataFactory.namedNode(
            `http://example.com/noRdfTypeUnion${i}`,
          ),
          noRdfTypeUnionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.NoRdfTypeUnion[],

  unions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return kitchenSink.UnionMember1.$create({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommonParentProperty: `common parent ${i}`,
          unionMember1Property: `member ${i}`,
        });
      case 1:
        return kitchenSink.UnionMember2.$create({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommonParentProperty: `common parent ${i}`,
          unionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.Union[],
};

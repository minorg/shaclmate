import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";

export const data = {
  blankNodeOrIriIdentifierObjects: [...new Array(4)].map((_, i) =>
    kitchenSink.BlankNodeOrIriIdentifierStruct.createUnsafe({
      $identifier:
        i % 2 === 0
          ? dataFactory.blankNode()
          : dataFactory.namedNode(
              `http://example.com/blankNodeOrIriIdentifier${i}`,
            ),
    }),
  ),

  // directRecursivees: [...new Array(4)].map(
  //   (_, i) =>
  //     kitchenSink.DirectRecursive.createUnsafe({
  //       directRecursiveProperty: kitchenSink.DirectRecursive.createUnsafe({
  //         $identifier: dataFactory.namedNode(
  //           `http://example.com/directRecursive${i}/directRecursiveProperty/value`,
  //         ),
  //       }),
  //       $identifier: dataFactory.namedNode(
  //         `http://example.com/directRecursive${i}`,
  //       ),
  //     }),
  // ),

  noRdfTypeUnionObjects: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return kitchenSink.NoRdfTypeUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            `http://example.com/noRdfTypeUnion${i}`,
          ),
          noRdfTypeUnionMember1Property: `member ${i}`,
        });
      case 1:
        return kitchenSink.NoRdfTypeUnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(
            `http://example.com/noRdfTypeUnion${i}`,
          ),
          noRdfTypeUnionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.NoRdfTypeUnion[],

  termPropertiesObjects: [...new Array(4)].map((_, i) =>
    kitchenSink.TermPropertiesStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        `http://example.com/termProperties${i}`,
      ),
      stringTermProperty: `string ${i}`,
    }),
  ),

  unionObjects: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return kitchenSink.UnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommonProperty: `common parent ${i}`,
          unionMember1Property: `member ${i}`,
        });
      case 1:
        return kitchenSink.UnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommonProperty: `common parent ${i}`,
          unionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.Union[],
};

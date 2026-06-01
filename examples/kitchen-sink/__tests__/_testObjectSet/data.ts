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
  //       directRecursive: kitchenSink.DirectRecursive.createUnsafe({
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
          noRdfTypeUnionMember1String: `member ${i}`,
        });
      case 1:
        return kitchenSink.NoRdfTypeUnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(
            `http://example.com/noRdfTypeUnion${i}`,
          ),
          noRdfTypeUnionMember2String: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.NoRdfTypeUnion[],

  termObjects: [...new Array(4)].map((_, i) =>
    kitchenSink.TermsStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        `http://example.com/termProperties${i}`,
      ),
      stringTerm: `string ${i}`,
    }),
  ),

  unionObjects: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return kitchenSink.UnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommon: `common parent ${i}`,
          unionMember1Distinct: `member ${i}`,
        });
      case 1:
        return kitchenSink.UnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
          unionMemberCommon: `common parent ${i}`,
          unionMember2Distinct: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.Union[],
};

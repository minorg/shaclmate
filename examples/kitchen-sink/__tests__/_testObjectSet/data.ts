import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";

export const data = {
  blankNodeOrIriIdentifierClasses: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.BlankNodeOrIriIdentifierClass({
        $identifier:
          i % 2 === 0
            ? N3.DataFactory.blankNode()
            : N3.DataFactory.namedNode(
                `http://example.com/blankNodeOrIriIdentifierClass${i}`,
              ),
      }),
  ) satisfies readonly kitchenSink.BlankNodeOrIriIdentifierClass[],

  classUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.ClassUnionMember1({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnion${i}`,
          ),
          classUnionMemberCommonParentProperty: `common parent ${i}`,
          classUnionMember1Property: `member ${i}`,
        });
      case 1:
        return new kitchenSink.ClassUnionMember2({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnion${i}`,
          ),
          classUnionMemberCommonParentProperty: `common parent ${i}`,
          classUnionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.ClassUnion[],

  concreteChildClasses: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.ConcreteChildClass({
        abstractBaseClassWithPropertiesProperty: `ABC string ${i}`,
        concreteChildClassProperty: `child string ${i}`,
        concreteParentClassProperty: `parent string ${i}`,
        $identifier: N3.DataFactory.namedNode(
          `http://example.com/concreteChildClass${i}`,
        ),
      }),
  ) satisfies readonly kitchenSink.ConcreteChildClass[],

  // directRecursiveClasses: [...new Array(4)].map(
  //   (_, i) =>
  //     new kitchenSink.DirectRecursiveClass({
  //       directRecursiveProperty: new kitchenSink.DirectRecursiveClass({
  //         $identifier: N3.DataFactory.namedNode(
  //           `http://example.com/directRecursiveClass${i}/directRecursiveProperty/value`,
  //         ),
  //       }),
  //       $identifier: N3.DataFactory.namedNode(
  //         `http://example.com/directRecursiveClass${i}`,
  //       ),
  //     }),
  // ) satisfies readonly kitchenSink.DirectRecursiveClass[],

  interfaceUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMemberCommonParentProperty: `common parent ${i}`,
          interfaceUnionMember1Property: `string ${i}`,
          $type: "InterfaceUnionMember1",
        } satisfies kitchenSink.InterfaceUnion;
      case 1:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMemberCommonParentProperty: `common parent ${i}`,
          interfaceUnionMember2Property: `string ${i}`,
          $type: "InterfaceUnionMember2",
        } satisfies kitchenSink.InterfaceUnion;
      default:
        throw new RangeError(i.toString());
    }
  }) as kitchenSink.InterfaceUnion[],

  noRdfTypeClassUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.NoRdfTypeClassUnionMember1({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/noRdfTypeClassUnion${i}`,
          ),
          noRdfTypeClassUnionMember1Property: `member ${i}`,
        });
      case 1:
        return new kitchenSink.NoRdfTypeClassUnionMember2({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/noRdfTypeClassUnion${i}`,
          ),
          noRdfTypeClassUnionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.NoRdfTypeClassUnion[],
};

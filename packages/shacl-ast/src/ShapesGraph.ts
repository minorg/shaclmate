import TermMap from "@rdfjs/term-map";
import TermSet from "@rdfjs/term-set";
import type {
  BlankNode,
  DatasetCore,
  DefaultGraph,
  NamedNode,
  Term,
} from "@rdfjs/types";
import { owl, sh } from "@tpluscode/rdf-ns-builders";
import { Either, Maybe } from "purify-ts";
import { Resource, ResourceSet } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import type { Factory } from "./Factory.js";
import type { OntologyLike } from "./OntologyLike.js";

export class ShapesGraph<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> {
  private readonly nodeShapesByIdentifier = new TermMap<
    BlankNode | NamedNode,
    NodeShapeT
  >();
  private readonly ontologiesByIdentifier = new TermMap<
    BlankNode | NamedNode,
    OntologyT
  >();
  private readonly propertyGroupsByIdentifier = new TermMap<
    BlankNode | NamedNode,
    PropertyGroupT
  >();
  private readonly propertyShapesByIdentifier = new TermMap<
    BlankNode | NamedNode,
    PropertyShapeT
  >();

  static fromDataset<
    NodeShapeT extends ShapeT,
    OntologyT extends OntologyLike,
    PropertyGroupT,
    PropertyShapeT extends ShapeT,
    ShapeT,
  >(parameters: {
    dataset: DatasetCore;
    factory: Factory<
      NodeShapeT,
      OntologyT,
      PropertyGroupT,
      PropertyShapeT,
      ShapeT
    >;
    prefixMap?: PrefixMap;
    ignoreUndefinedShapes?: boolean;
  }): Either<
    Error,
    ShapesGraph<NodeShapeT, OntologyT, PropertyGroupT, PropertyShapeT, ShapeT>
  > {
    const { dataset, factory } = parameters;
    const ignoreUndefinedShapes = !!parameters?.ignoreUndefinedShapes;

    function datasetHasMatch(
      subject?: Term | null,
      predicate?: Term | null,
      object?: Term | null,
      graph?: Term | null,
    ): boolean {
      for (const _ of dataset.match(subject, predicate, object, graph)) {
        return true;
      }
      return false;
    }

    const resourceSet = new ResourceSet({ dataset });
    const shapesGraph = new ShapesGraph<
      NodeShapeT,
      OntologyT,
      PropertyGroupT,
      PropertyShapeT,
      ShapeT
    >();

    return Either.encase(() => {
      function readGraph(): BlankNode | DefaultGraph | NamedNode | null {
        const graphs = new TermSet();
        for (const quad of dataset) {
          graphs.add(quad.graph);
        }
        if (graphs.size !== 1) {
          return null;
        }
        const graph = [...graphs.values()][0];
        switch (graph.termType) {
          case "BlankNode":
          case "DefaultGraph":
          case "NamedNode":
            return graph;
          default:
            throw new RangeError(
              `expected NamedNode or default graph, actual ${graph.termType}`,
            );
        }
      }

      const graph = readGraph();

      // Read ontologies
      for (const ontologyResource of resourceSet.instancesOf(owl.Ontology, {
        graph,
      })) {
        if (
          shapesGraph.ontologiesByIdentifier.has(ontologyResource.identifier)
        ) {
          continue;
        }
        factory
          .ontologyFromRdf({
            resource: ontologyResource,
            shapesGraph,
          })
          .ifRight((ontology) =>
            shapesGraph.ontologiesByIdentifier.set(
              ontologyResource.identifier,
              ontology,
            ),
          );
      }

      // Read property groups
      for (const propertyGroupResource of resourceSet.instancesOf(
        sh.PropertyGroup,
        { graph },
      )) {
        if (propertyGroupResource.identifier.termType !== "NamedNode") {
          continue;
        }
        if (
          shapesGraph.propertyGroupsByIdentifier.has(
            propertyGroupResource.identifier,
          )
        ) {
          continue;
        }
        factory
          .propertyGroupFromRdf({
            resource: propertyGroupResource,
            shapesGraph,
          })
          .ifRight((propertyGroup) =>
            shapesGraph.propertyGroupsByIdentifier.set(
              propertyGroupResource.identifier,
              propertyGroup,
            ),
          );
      }

      // Read shapes
      // Collect the shape identifiers in sets
      const shapeNodeSet = new TermSet<BlankNode | NamedNode>();

      // Utility function for adding to the shapeNodeSet
      function addShapeNode(
        shapeNode: Term,
      ): shapeNode is BlankNode | NamedNode {
        switch (shapeNode.termType) {
          case "BlankNode":
          case "NamedNode":
            shapeNodeSet.add(shapeNode);
            return true;
          default:
            throw new RangeError(
              `unexpected shape node identifier term type: ${shapeNode.termType}`,
            );
        }
      }

      // Test each shape condition
      // https://www.w3.org/TR/shacl/#shapes

      // Subject is a SHACL instance of sh:NodeShape or sh:PropertyShape
      for (const rdfType of [sh.NodeShape, sh.PropertyShape]) {
        for (const resource of resourceSet.instancesOf(rdfType, {
          graph,
        })) {
          addShapeNode(resource.identifier);
        }
      }

      // Subject of a triple with sh:targetClass, sh:targetNode, sh:targetObjectsOf, or sh:targetSubjectsOf predicate
      for (const predicate of [
        sh.targetClass,
        sh.targetNode,
        sh.targetObjectsOf,
        sh.targetSubjectsOf,
      ]) {
        for (const quad of dataset.match(null, predicate, null, graph)) {
          addShapeNode(quad.subject);
        }
      }

      // Subject of a triple that has a parameter as predicate
      // https://www.w3.org/TR/shacl/#constraints
      // https://www.w3.org/TR/shacl/#core-components
      for (const predicate of [
        sh.class,
        sh.datatype,
        sh.nodeKind,
        sh.minCount,
        sh.maxCount,
        sh.minExclusive,
        sh.minInclusive,
        sh.maxExclusive,
        sh.maxInclusive,
        sh.minLength,
        sh.maxLength,
        sh.pattern,
        sh.languageIn,
        sh.uniqueLang,
        sh.equals,
        sh.disjoint,
        sh.lessThan,
        sh.lessThanOrEquals,
        sh.not,
        sh.and,
        sh.or,
        sh.xone,
        sh.node,
        sh.property,
        sh.qualifiedValueShape,
        sh.qualifiedMinCount,
        sh.qualifiedMaxCount,
        sh.closed,
        sh.ignoredProperties,
        sh.hasValue,
        sh.in,
      ]) {
        for (const quad of dataset.match(null, predicate, null, graph)) {
          addShapeNode(quad.subject);
        }
      }

      // Object of a shape-expecting, non-list-taking parameter such as sh:node
      for (const predicate of [sh.node, sh.property]) {
        for (const quad of dataset.match(null, predicate, null, graph)) {
          addShapeNode(quad.object);

          if (!ignoreUndefinedShapes && !datasetHasMatch(quad.object)) {
            throw new Error(
              `undefined shape: ${Resource.Identifier.toString(quad.object as Resource.Identifier)}`,
            );
          }
        }
      }

      // Member of a SHACL list that is a value of a shape-expecting and list-taking parameter such as sh:or
      for (const predicate of [sh.and, sh.or, sh.xone]) {
        for (const quad of dataset.match(null, predicate, null, graph)) {
          switch (quad.object.termType) {
            case "BlankNode":
            case "NamedNode":
              break;
            default:
              throw new RangeError(
                `expected list term to be a blank or named node, not ${quad.object.termType}`,
              );
          }

          for (const value of resourceSet
            .resource(quad.object)
            .toList()
            .unsafeCoerce()) {
            const identifier = value.toIdentifier().unsafeCoerce();

            addShapeNode(identifier);

            if (!ignoreUndefinedShapes && !datasetHasMatch(identifier)) {
              throw new Error(
                `undefined shape: ${Resource.Identifier.toString(identifier as Resource.Identifier)}`,
              );
            }
          }
        }
      }

      // Separate shapes into node and property shapes.
      for (const shapeNode of shapeNodeSet) {
        if (dataset.match(shapeNode, sh.path, null, graph).size > 0) {
          // A property shape is a shape in the shapes graph that is the subject of a triple that has sh:path as its predicate. A shape has at most one value for sh:path. Each value of sh:path in a shape must be a well-formed SHACL property path. It is recommended, but not required, for a property shape to be declared as a SHACL instance of sh:PropertyShape. SHACL instances of sh:PropertyShape have one value for the property sh:path.
          factory
            .propertyShapeFromRdf({
              resource: resourceSet.resource(shapeNode),
              shapesGraph,
            })
            .ifRight((propertyShape) =>
              shapesGraph.propertyShapesByIdentifier.set(
                shapeNode,
                propertyShape,
              ),
            );
        } else {
          // A node shape is a shape in the shapes graph that is not the subject of a triple with sh:path as its predicate. It is recommended, but not required, for a node shape to be declared as a SHACL instance of sh:NodeShape. SHACL instances of sh:NodeShape cannot have a value for the property sh:path.
          factory
            .nodeShapeFromRdf({
              resource: resourceSet.resource(shapeNode),
              shapesGraph,
            })
            .ifRight((nodeShape) =>
              shapesGraph.nodeShapesByIdentifier.set(shapeNode, nodeShape),
            );
        }
      }

      return shapesGraph;
    });
  }

  @Memoize()
  get nodeShapes(): readonly NodeShapeT[] {
    return [...this.nodeShapesByIdentifier.values()];
  }

  nodeShapeByIdentifier(
    nodeShapeNode: BlankNode | NamedNode,
  ): Maybe<NodeShapeT> {
    return Maybe.fromNullable(this.nodeShapesByIdentifier.get(nodeShapeNode));
  }

  @Memoize()
  get ontologies(): readonly OntologyT[] {
    return [...this.ontologiesByIdentifier.values()];
  }

  ontologyByIdentifier(identifier: BlankNode | NamedNode): Maybe<OntologyT> {
    return Maybe.fromNullable(this.ontologiesByIdentifier.get(identifier));
  }

  propertyGroupByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Maybe<PropertyGroupT> {
    return Maybe.fromNullable(this.propertyGroupsByIdentifier.get(identifier));
  }

  @Memoize()
  get propertyGroups(): readonly PropertyGroupT[] {
    return [...this.propertyGroupsByIdentifier.values()];
  }

  propertyShapeByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Maybe<PropertyShapeT> {
    return Maybe.fromNullable(this.propertyShapesByIdentifier.get(identifier));
  }

  @Memoize()
  get propertyShapes(): readonly PropertyShapeT[] {
    return [...this.propertyShapesByIdentifier.values()];
  }

  shapeByIdentifier(identifier: BlankNode | NamedNode): Maybe<ShapeT> {
    const nodeShape = this.nodeShapeByIdentifier(identifier);
    if (nodeShape.isJust()) {
      return nodeShape;
    }
    return this.propertyShapeByIdentifier(identifier);
  }
}

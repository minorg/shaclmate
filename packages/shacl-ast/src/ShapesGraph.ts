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
import { Either, Left } from "purify-ts";
import { Resource, ResourceSet } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import * as generated from "./generated.js";
import { NodeShape } from "./NodeShape.js";
import { Ontology } from "./Ontology.js";
import type { OntologyLike } from "./OntologyLike.js";
import { PropertyGroup } from "./PropertyGroup.js";
import { PropertyShape } from "./PropertyShape.js";
import type { Shape } from "./Shape.js";

export class ShapesGraph<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> {
  private readonly nodeShapesByIdentifier: TermMap<
    BlankNode | NamedNode,
    NodeShapeT
  >;
  private readonly ontologiesByIdentifier: TermMap<
    BlankNode | NamedNode,
    OntologyT
  >;
  private readonly propertyGroupsByIdentifier: TermMap<
    BlankNode | NamedNode,
    PropertyGroupT
  >;
  private readonly propertyShapesByIdentifier: TermMap<
    BlankNode | NamedNode,
    PropertyShapeT
  >;

  constructor(parameters: {
    nodeShapesByIdentifier: TermMap<BlankNode | NamedNode, NodeShapeT>;
    ontologiesByIdentifier: TermMap<BlankNode | NamedNode, OntologyT>;
    propertyGroupsByIdentifier: TermMap<BlankNode | NamedNode, PropertyGroupT>;
    propertyShapesByIdentifier: TermMap<BlankNode | NamedNode, PropertyShapeT>;
  }) {
    this.nodeShapesByIdentifier = parameters.nodeShapesByIdentifier;
    this.ontologiesByIdentifier = parameters.ontologiesByIdentifier;
    this.propertyGroupsByIdentifier = parameters.propertyGroupsByIdentifier;
    this.propertyShapesByIdentifier = parameters.propertyShapesByIdentifier;
  }

  @Memoize()
  get nodeShapes(): readonly NodeShapeT[] {
    return [...this.nodeShapesByIdentifier.values()];
  }

  nodeShapeByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Either<Error, NodeShapeT> {
    const nodeShape = this.nodeShapesByIdentifier.get(identifier);
    return nodeShape
      ? Either.of(nodeShape)
      : Left(
          new Error(
            `no such node shape ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  @Memoize()
  get ontologies(): readonly OntologyT[] {
    return [...this.ontologiesByIdentifier.values()];
  }

  ontologyByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Either<Error, OntologyT> {
    const ontology = this.ontologiesByIdentifier.get(identifier);
    return ontology
      ? Either.of(ontology)
      : Left(
          new Error(
            `no such ontology ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  propertyGroupByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Either<Error, PropertyGroupT> {
    const propertyGroup = this.propertyGroupsByIdentifier.get(identifier);
    return propertyGroup
      ? Either.of(propertyGroup)
      : Left(
          new Error(
            `no such property group ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  @Memoize()
  get propertyGroups(): readonly PropertyGroupT[] {
    return [...this.propertyGroupsByIdentifier.values()];
  }

  propertyShapeByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Either<Error, PropertyShapeT> {
    const propertyShape = this.propertyShapesByIdentifier.get(identifier);
    return propertyShape
      ? Either.of(propertyShape)
      : Left(
          new Error(
            `no such property shape ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  @Memoize()
  get propertyShapes(): readonly PropertyShapeT[] {
    return [...this.propertyShapesByIdentifier.values()];
  }

  shapeByIdentifier(identifier: BlankNode | NamedNode): Either<Error, ShapeT> {
    return (
      this.nodeShapeByIdentifier(identifier) as Either<Error, ShapeT>
    ).alt(this.propertyShapeByIdentifier(identifier));
  }
}

export namespace ShapesGraph {
  export abstract class Factory<
    NodeShapeT extends ShapeT,
    OntologyT extends OntologyLike,
    PropertyGroupT,
    PropertyShapeT extends ShapeT,
    ShapeT,
  > {
    protected preferredLanguages: readonly string[];

    constructor(parameters?: { preferredLanguages?: readonly string[] }) {
      this.preferredLanguages = parameters?.preferredLanguages ?? ["en", ""];
    }

    createShapesGraph({
      dataset,
      ignoreUndefinedShapes,
    }: {
      dataset: DatasetCore;
      ignoreUndefinedShapes?: boolean;
    }): Either<
      Error,
      ShapesGraph<NodeShapeT, OntologyT, PropertyGroupT, PropertyShapeT, ShapeT>
    > {
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

      const nodeShapesByIdentifier = new TermMap<
        BlankNode | NamedNode,
        NodeShapeT
      >();
      const ontologiesByIdentifier = new TermMap<
        BlankNode | NamedNode,
        OntologyT
      >();
      const propertyGroupsByIdentifier = new TermMap<
        BlankNode | NamedNode,
        PropertyGroupT
      >();
      const propertyShapesByIdentifier = new TermMap<
        BlankNode | NamedNode,
        PropertyShapeT
      >();
      // Have to instantiate ShapesGraph here so the shapes have references to it
      // Pass in the mutable TermMap's and then mutate them
      const shapesGraph = new ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >({
        nodeShapesByIdentifier,
        ontologiesByIdentifier,
        propertyGroupsByIdentifier,
        propertyShapesByIdentifier,
      });

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
          if (ontologiesByIdentifier.has(ontologyResource.identifier)) {
            continue;
          }
          this.createOntology({
            resource: ontologyResource,
            shapesGraph,
          }).ifRight((ontology) =>
            ontologiesByIdentifier.set(ontologyResource.identifier, ontology),
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
            propertyGroupsByIdentifier.has(propertyGroupResource.identifier)
          ) {
            continue;
          }
          this.createPropertyGroup({
            resource: propertyGroupResource,
            shapesGraph,
          }).ifRight((propertyGroup) =>
            propertyGroupsByIdentifier.set(
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
            this.createPropertyShape({
              resource: resourceSet.resource(shapeNode),
              shapesGraph,
            }).ifRight((propertyShape) =>
              propertyShapesByIdentifier.set(shapeNode, propertyShape),
            );
          } else {
            // A node shape is a shape in the shapes graph that is not the subject of a triple with sh:path as its predicate. It is recommended, but not required, for a node shape to be declared as a SHACL instance of sh:NodeShape. SHACL instances of sh:NodeShape cannot have a value for the property sh:path.
            this.createNodeShape({
              resource: resourceSet.resource(shapeNode),
              shapesGraph,
            }).ifRight((nodeShape) =>
              nodeShapesByIdentifier.set(shapeNode, nodeShape),
            );
          }
        }

        return shapesGraph;
      });
    }

    protected abstract createNodeShape(parameters: {
      resource: Resource;
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >;
    }): Either<Error, NodeShapeT>;

    protected abstract createOntology(parameters: {
      resource: Resource;
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >;
    }): Either<Error, OntologyT>;

    protected abstract createPropertyGroup(parameters: {
      resource: Resource;
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >;
    }): Either<Error, PropertyGroupT>;

    protected abstract createPropertyShape(parameters: {
      resource: Resource;
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >;
    }): Either<Error, PropertyShapeT>;
  }

  type DefaultNodeShape = NodeShape<
    any,
    Ontology,
    PropertyGroup,
    DefaultPropertyShape,
    DefaultShape
  >;

  type DefaultPropertyShape = PropertyShape<
    DefaultNodeShape,
    Ontology,
    PropertyGroup,
    any,
    DefaultShape
  >;

  type DefaultShape = Shape<
    DefaultNodeShape,
    Ontology,
    PropertyGroup,
    DefaultPropertyShape,
    any
  >;

  type DefaultShapesGraph = ShapesGraph<
    DefaultNodeShape,
    Ontology,
    PropertyGroup,
    DefaultPropertyShape,
    DefaultShape
  >;

  class DefaultFactory extends Factory<
    DefaultNodeShape,
    Ontology,
    PropertyGroup,
    DefaultPropertyShape,
    DefaultShape
  > {
    protected override createNodeShape({
      resource,
      shapesGraph,
    }: {
      resource: Resource;
      shapesGraph: DefaultShapesGraph;
    }) {
      return generated.ShaclCoreNodeShape.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map((generatedShape) => new NodeShape(generatedShape, shapesGraph));
    }

    protected override createOntology({
      resource,
    }: {
      resource: Resource;
      shapesGraph: DefaultShapesGraph;
    }): Either<Error, Ontology> {
      return generated.OwlOntology.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map((generatedOntology) => new Ontology(generatedOntology));
    }

    protected override createPropertyGroup({
      resource,
    }: {
      resource: Resource;
      shapesGraph: DefaultShapesGraph;
    }): Either<Error, PropertyGroup> {
      return generated.ShaclCorePropertyGroup.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map((propertyGroup) => new PropertyGroup(propertyGroup));
    }

    protected override createPropertyShape({
      resource,
      shapesGraph,
    }: {
      resource: Resource;
      shapesGraph: DefaultShapesGraph;
    }): Either<Error, DefaultPropertyShape> {
      return generated.ShaclCorePropertyShape.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map(
        (generatedShape) => new PropertyShape(generatedShape, shapesGraph),
      );
    }
  }

  const defaultFactory = new DefaultFactory();

  export function create(
    parameters: Parameters<DefaultFactory["createShapesGraph"]>[0],
  ): Either<Error, DefaultShapesGraph> {
    return defaultFactory.createShapesGraph(parameters);
  }
}

import DataFactory from "@rdfjs/data-model";
import DatasetFactory from "@rdfjs/dataset";
import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
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
import type { Curie } from "./Curie.js";
import { CurieFactory } from "./CurieFactory.js";
import type * as generated from "./generated.js";

export abstract class AbstractShapesGraph<
  NodeShapeT extends generated.NodeShape,
  OntologyT extends generated.Ontology,
  PropertyGroupT extends generated.PropertyGroup,
  PropertyShapeT extends generated.PropertyShape,
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

  get nodeShapes(): readonly NodeShapeT[] {
    return [...this.nodeShapesByIdentifier.values()];
  }

  get ontologies(): readonly OntologyT[] {
    return [...this.ontologiesByIdentifier.values()];
  }

  get propertyGroups(): readonly PropertyGroupT[] {
    return [...this.propertyGroupsByIdentifier.values()];
  }

  get propertyShapes(): readonly PropertyShapeT[] {
    return [...this.propertyShapesByIdentifier.values()];
  }

  addNodeShape<TypelessNodeShapeT extends Omit<NodeShapeT, "$type">>(
    typelessNodeShape: TypelessNodeShapeT,
  ): TypelessNodeShapeT {
    const nodeShape: NodeShapeT = {
      ...typelessNodeShape,
      $type: "NodeShape",
    } as unknown as NodeShapeT;
    this.nodeShapesByIdentifier.set(nodeShape.$identifier, nodeShape);
    return typelessNodeShape;
  }

  addOntology<TypelessOntologyT extends Omit<OntologyT, "$type">>(
    typelessOntology: TypelessOntologyT,
  ): TypelessOntologyT {
    const ontology: OntologyT = {
      ...typelessOntology,
      $type: "Ontology",
    } as unknown as OntologyT;
    this.ontologiesByIdentifier.set(ontology.$identifier, ontology);
    return typelessOntology;
  }

  addPropertyGroup<
    TypelessPropertyGroupT extends Omit<PropertyGroupT, "$type">,
  >(typelessPropertyGroup: TypelessPropertyGroupT): TypelessPropertyGroupT {
    const propertyGroup: PropertyGroupT = {
      ...typelessPropertyGroup,
      $type: "PropertyGroup",
    } as unknown as PropertyGroupT;
    this.propertyGroupsByIdentifier.set(
      propertyGroup.$identifier,
      propertyGroup,
    );
    return typelessPropertyGroup;
  }

  addPropertyShape<
    TypelessPropertyShapeT extends Omit<PropertyShapeT, "$type">,
  >(typelessPropertyShape: TypelessPropertyShapeT): TypelessPropertyShapeT {
    const propertyShape: PropertyShapeT = {
      ...typelessPropertyShape,
      $type: "PropertyShape",
    } as unknown as PropertyShapeT;
    this.propertyShapesByIdentifier.set(
      propertyShape.$identifier,
      propertyShape,
    );
    return typelessPropertyShape;
  }

  addShape(shape: NodeShapeT | PropertyShapeT): NodeShapeT | PropertyShapeT {
    switch (shape.$type) {
      case "NodeShape":
        return this.addNodeShape(shape);
      case "PropertyShape":
        return this.addPropertyShape(shape);
    }
  }

  nodeShape(identifier: BlankNode | NamedNode): Either<Error, NodeShapeT> {
    const nodeShape = this.nodeShapesByIdentifier.get(identifier);
    return nodeShape
      ? Either.of(nodeShape)
      : Left(
          new Error(
            `no such node shape ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  ontology(identifier: BlankNode | NamedNode): Either<Error, OntologyT> {
    const ontology = this.ontologiesByIdentifier.get(identifier);
    return ontology
      ? Either.of(ontology)
      : Left(
          new Error(
            `no such ontology ${Resource.Identifier.toString(identifier)}`,
          ),
        );
  }

  propertyGroup(
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

  propertyShape(
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

  shape(
    identifier: BlankNode | NamedNode,
  ): Either<Error, NodeShapeT | PropertyShapeT> {
    return (
      this.nodeShape(identifier) as Either<Error, NodeShapeT | PropertyShapeT>
    ).alt(this.propertyShape(identifier));
  }

  protected addDataset(
    dataset: DatasetCore,
    {
      fromRdfResourceFunctions,
      ignoreUndefinedShapes,
      prefixMap,
    }: {
      fromRdfResourceFunctions: {
        NodeShape: FromRdfResourceFunction<NodeShapeT>;
        Ontology: FromRdfResourceFunction<OntologyT>;
        PropertyGroup: FromRdfResourceFunction<PropertyGroupT>;
        PropertyShape: FromRdfResourceFunction<PropertyShapeT>;
      };
      ignoreUndefinedShapes?: boolean;
      prefixMap?: PrefixMap;
    },
  ): Either<Error, this> {
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

    let curieDataset: DatasetCore;
    if (prefixMap) {
      const curieCache = new Map<string, Curie | NamedNode>();
      curieDataset = DatasetFactory.dataset();
      const curieFactory = new CurieFactory({
        prefixMap,
      });

      const termToCurie = <TermT extends Term>(term: TermT): TermT => {
        if (term.termType !== "NamedNode") {
          return term;
        }
        const cachedCurie = curieCache.get(term.value);
        if (cachedCurie) {
          return cachedCurie as TermT;
        }
        const curie = curieFactory.create(term).extract() ?? term;
        curieCache.set(term.value, curie);
        return curie as TermT;
      };

      for (const quad of dataset) {
        const curieObject = termToCurie(quad.object);
        const curieSubject = termToCurie(quad.subject);

        if (
          !Object.is(curieObject, quad.object) ||
          !Object.is(curieSubject, quad.subject)
        ) {
          curieDataset.add(
            DataFactory.quad(
              curieSubject,
              quad.predicate,
              curieObject,
              quad.graph,
            ),
          );
        } else {
          curieDataset.add(quad);
        }
      }
    } else {
      curieDataset = dataset;
    }

    const curieResourceSet = new ResourceSet(curieDataset);

    return Either.encase(() => {
      function readGraph(): BlankNode | DefaultGraph | NamedNode | undefined {
        const graphs = new TermSet();
        for (const quad of dataset) {
          graphs.add(quad.graph);
        }
        if (graphs.size !== 1) {
          return undefined;
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
      for (const ontologyResource of curieResourceSet.instancesOf(
        owl.Ontology,
        {
          graph,
        },
      )) {
        if (this.ontologiesByIdentifier.has(ontologyResource.identifier)) {
          continue;
        }
        fromRdfResourceFunctions
          .Ontology(ontologyResource, { ignoreRdfType: true })
          .ifRight((ontology) => this.addOntology(ontology));
      }

      // Read property groups
      for (const propertyGroupResource of curieResourceSet.instancesOf(
        sh.PropertyGroup,
        { graph },
      )) {
        if (propertyGroupResource.identifier.termType !== "NamedNode") {
          continue;
        }

        if (
          this.propertyGroupsByIdentifier.has(propertyGroupResource.identifier)
        ) {
          continue;
        }

        fromRdfResourceFunctions
          .PropertyGroup(
            curieResourceSet.resource(propertyGroupResource.identifier),
            { ignoreRdfType: true },
          )
          .ifRight((propertyGroup) => this.addPropertyGroup(propertyGroup));
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
        for (const resource of curieResourceSet.instancesOf(rdfType, {
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
      for (const predicate of [sh.node, sh.not, sh.property]) {
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

          for (const value of curieResourceSet
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
          this.addPropertyShape(
            fromRdfResourceFunctions
              .PropertyShape(curieResourceSet.resource(shapeNode), {
                ignoreRdfType: true,
              })
              .unsafeCoerce(),
          );
        } else {
          // A node shape is a shape in the shapes graph that is not the subject of a triple with sh:path as its predicate. It is recommended, but not required, for a node shape to be declared as a SHACL instance of sh:NodeShape. SHACL instances of sh:NodeShape cannot have a value for the property sh:path.
          this.addNodeShape(
            fromRdfResourceFunctions
              .NodeShape(curieResourceSet.resource(shapeNode), {
                ignoreRdfType: true,
              })
              .unsafeCoerce(),
          );
        }
      }

      return this;
    });
  }
}

type FromRdfResourceFunction<T> = (
  resource: Resource,
  options?: { ignoreRdfType?: boolean },
) => Either<Error, T>;

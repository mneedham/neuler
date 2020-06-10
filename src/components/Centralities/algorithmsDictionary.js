import PageRankForm from './PageRankForm'
import {runAlgorithm} from "../../services/centralities"
import { centralityParams, getFetchCypher, streamQueryOutline } from '../../services/queries'
import BetweennesForm from "./BetweennesForm"
import DegreeForm from "./DegreeForm"
import ApproxBetweennessForm from "./ApproxBetweennessForm"
import {Card} from "semantic-ui-react/dist/commonjs/views/Card"
import React from "react"
import CentralityResult from "./CentralityResult"
import ClosenessCentralityForm from "./ClosenessCentralityForm"


let algorithms = {
  "Degree": {
    Form: DegreeForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      direction: 'Reverse',
      persist: true,
      writeProperty: "degree",
      defaultValue: 1.0,
      concurrency: 8,
      relationshipWeightProperty: null
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.degree.stream($config) YIELD nodeId, score`),
    storeQuery: `CALL gds.alpha.degree.write($config)`,
    getFetchQuery: getFetchCypher,
    description: `detects the number of direct connections a node has`
  },
  "Eigenvector": {
    Form: PageRankForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      direction: 'Natural',
      persist: true,
      writeProperty: "eigenvector",
      maxIterations: 20,
      defaultValue: 1.0,
      normalization: "none"
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.eigenvector.stream($config) YIELD nodeId, score`),
    storeQuery: `CALL gds.alpha.eigenvector.write($config)`,
    getFetchQuery: getFetchCypher,
    description: <div>Measures the <strong>transitive</strong> influence or connectivity of nodes</div>
  },
  "Page Rank": {
    Form: PageRankForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      direction: 'Natural',
      persist: true,
      writeProperty: "pagerank",
      dampingFactor: 0.85,
      maxIterations: 20,
      defaultValue: 1.0,
      concurrency: 8,
      relationshipWeightProperty: null
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.pageRank.stream($config) YIELD nodeId, score`),
    storeQuery: `CALL gds.pageRank.write($config)`,
    getFetchQuery: getFetchCypher,
    description: <div>Measures the <strong>transitive</strong> influence or connectivity of nodes</div>
  },
  'Article Rank': {
    Form: PageRankForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      direction: 'Natural',
      persist: true,
      writeProperty: "articlerank",
      dampingFactor: 0.85,
      maxIterations: 20,
      defaultValue: 1.0,
      concurrency: 8,
      relationshipWeightProperty: null
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.articleRank.stream($config) YIELD nodeId, score`),
    storeQuery: `CALL gds.alpha.articleRank.write($config)`,
    getFetchQuery: getFetchCypher,
    description: `a variant of the PageRank algorithm`
  },
  'Betweenness': {
    Form: BetweennesForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      direction: 'Natural',
      persist: true,
      writeProperty: "betweenness",
      concurrency: 8
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.betweenness.stream($config) YIELD nodeId, centrality AS score`),
    storeQuery: `CALL gds.alpha.betweenness.write($config)`,
    getFetchQuery: getFetchCypher,
    description: `a way of detecting the amount of influence a node has over the flow of information in a graph`
  },
  'Approx Betweenness': {
    Form: ApproxBetweennessForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: {
      strategy: "random",
      direction: "Natural",
      persist: true,
      concurrency: 8,
      maxDepth: null,
      probability: null,
      writeProperty: "approxBetweenness"
    },
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.betweenness.sampled.stream($config) YIELD nodeId, centrality AS score`),
    storeQuery: `CALL gds.alpha.betweenness.sampled.write($config)`,
    getFetchQuery: getFetchCypher,
    description: `calculates shortest paths between a subset of nodes, unlike Betweenness which considers all pairs of nodes`
  },
  "Closeness": {
    Form: ClosenessCentralityForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: { persist: true, writeProperty: "closeness", concurrency: 8, direction:"Natural"},
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.closeness.stream($config) YIELD nodeId, centrality AS score`),
    storeQuery: `CALL gds.alpha.closeness.write($config)`,
    getFetchQuery: getFetchCypher,
    description: `detect nodes that are able to spread information very efficiently through a graph`
  },
  "Harmonic": {
    Form: ClosenessCentralityForm,
    service: runAlgorithm,
    ResultView: CentralityResult,
    parameters: { persist: true, writeProperty: "harmonic", concurrency: 8, direction:"Natural"},
    parametersBuilder: centralityParams,
    streamQuery: streamQueryOutline(`CALL gds.alpha.harmonic.stream($config) YIELD nodeId, centrality AS score`),
    storeQuery: `CALL gds.alpha.harmonic.stream($config)`,
    getFetchQuery: getFetchCypher,
    description: `a variant of closeness centrality, that was invented to solve the problem the original
-                  formula had when dealing with unconnected graphs.`
  }
};
export default {
  algorithmList: [
    "Degree",
    "Eigenvector",
    "Page Rank",
    "Article Rank",
    "Betweenness",
    "Approx Betweenness",
    "Closeness",
    // "Harmonic"
  ],
  algorithmDefinitions: algorithm => algorithms[algorithm],
}

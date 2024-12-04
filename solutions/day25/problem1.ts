type Graph = { [key: string]: string[] }
type Edge = [string, string]

function removeEdge(graph: Graph, name1: string, name2: string) {
  // Remove the attachment between the two nodes
  graph[name1] = graph[name1].filter(name => name !== name2)
  graph[name2] = graph[name2].filter(name => name !== name1)
}

function graphDfs(graph: Graph, start: string, set = new Set<string>().add(start)) {
  graph[start].forEach(child => {
    if (!set.has(child)) {
      set.add(child)
      graphDfs(graph, child, set)
    }
  })
  return set
}

function testSeperation(graph: Graph) {
  const branches: Set<string>[] = [];
  Object.keys(graph).forEach(node => {
    const children = graph[node];
    const foundBranch = branches.find(branch => branch.has(node) || children.some(child => branch.has(child)))
    if (foundBranch) {
      graphDfs(graph, node).forEach(foundNode => foundBranch.add(foundNode))
    } else {
      branches.push(graphDfs(graph, node))
    }
  })
  return branches
}

function getCombinations(arr: Edge[], k: number): Edge[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;

  const include = getCombinations(rest, k - 1).map(combination => [first, ...combination]);
  const exclude = getCombinations(rest, k);

  return [...include, ...exclude];
}

function getAllEdges(graph: Graph) {
  const edges: Edge[] = []
  Object.keys(graph).forEach(node => {
    graph[node].forEach(child => {
      const newEdge: Edge = [ node, child ]
      const exists = edges.some(edge => JSON.stringify(edge) === JSON.stringify(newEdge) || JSON.stringify(edge) === JSON.stringify(newEdge.toReversed()))
      if (!exists) {
        edges.push(newEdge)
      }
    })
  })
  console.log('all edges done')
  return edges
}

// function getAllEdges(graph: Graph): Edge[] {
//   const edges: Edge[] = [];
//   const seen = new Set<string>();
// 
//   // for (const node in graph) {
//   Object.keys(graph).forEach((node, i) => {
//     for (const neighbor of graph[node]) {
//       // Create a unique key to avoid duplicate edges
//       const edgeKey = [node, neighbor].sort().join(",");
//       if (!seen.has(edgeKey)) {
//         edges.push([node, neighbor]);
//         seen.add(edgeKey);
//       }
//     }
//     console.log(i, Object.keys(graph).length)
//   })
// 
//   return edges;
// }

function findCuts(graph: Graph) {
  // const allCuts = generateCombinations(Object.keys(graph))
  const allCuts = getCombinations(getAllEdges(graph), 3)
  allCuts.forEach((cut, i) => {
    process.stdout.write(`\r${i}/${allCuts.length}`)
    const graphCopy = JSON.parse(JSON.stringify(graph))
    cut.forEach(edge => {
      removeEdge(graphCopy, edge[0], edge[1])
    })
    const branches = testSeperation(graphCopy)
    if (branches.length > 1) {
      console.log(
        'found result',
        branches.map(branch => branch.size),
        branches.map(branch => branch.size).reduce((tot, num) => tot * num),
      )
      
    }
  })
}

const graph = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((data, line) => {
    const [ name, childStr ] = line.split(': ')
    const children = childStr.split(/\s+/)
    // Visualize graph
    // children.forEach(child => console.log(`${name},${child}`))

    // !data[name] ? data[name] = children : data[name] = data[name].concat(children)
    data[name] = !data[name] ? children : data[name].concat(children)

    children.forEach(child => {
      data[child] ? data[child].push(name) : data[child] = [ name ]
    })

    return data
  }, {} as Graph)
)

// Graph visualization tool: https://cosmograph.app/
// ANSWER FOR REAL INPUTS:
// rrz -> pzq
// mtq -> jtr
// znv -> ddj
removeEdge(graph, 'rrz', 'pzq')
removeEdge(graph, 'mtq', 'jtr')
removeEdge(graph, 'znv', 'ddj')
const groups = testSeperation(graph)
console.log(groups.map(group => group.size))
console.log(groups.map(group => group.size).reduce((tot, size) => tot * size))

// console.log(Object.keys(graph).length)
// console.log(findCuts(graph))
// console.log(generateCombinations(Object.keys(graph)))

// console.log(generateCombinations(Object.keys(graph)).length)
// The goal is to divide the graph by only removing three edges
// Then multiply the number of nodes in each group together to get the final answer
// console.log(graph)
// removeEdge(graph, 'hfx', 'pzl')
// removeEdge(graph, 'bvb', 'cmg')
// removeEdge(graph, 'nvd', 'jqt')
// console.log(graph)
// console.log(testSeperation(graph))
// console.log(Object.keys(graph), Object.keys(graph).length)
// console.log(graphDfs(graph, Object.keys(graph)[0]))

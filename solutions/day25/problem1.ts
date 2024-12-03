type Graph = { [key: string]: string[] }

function removeEdge(graph: Graph, name1: string, name2: string) {
  // Remove the attachment between the two nodes
  graph[name1] = graph[name1].filter(name => name !== name2)
  graph[name2] = graph[name2].filter(name => name !== name1)
}

function testSeperation(graph: Graph) {
  const branches: Set<string>[] = [ new Set(Object.keys(graph)[0]) ]
  Object.keys(graph).forEach(node => {
    const children = graph[node];
    branches.forEach(branch => {
      if (branch.has(node)) {
        children.forEach(child => branch.add(child))
      }
    })
  })
}

const graph = (
  (await Bun.file('example.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((data, line) => {
    // Visualize graph
    // children.forEach(child => console.log(`${name} ${child}`))

    const [ name, childStr ] = line.split(': ')
    const children = childStr.split(/\s+/)

    !data[name] ? data[name] = children : data[name] = data[name].concat(children)

    children.forEach(child => {
      data[child] ? data[child].push(name) : data[child] = [ name ]
    })

    return data
  }, {} as Graph)
)

// The goal is to divide the graph by only removing three edges
// Then multiply the number of nodes in each group together to get the final answer
console.log(graph)
removeEdge(graph, 'hfx', 'pzl')
removeEdge(graph, 'bvb', 'cmg')
removeEdge(graph, 'nvd', 'jqt')
console.log(graph)

type Graph = { [key: string]: Graph }

function sumDepths(graph: Graph, depth = 0): number {
  if (!Object.keys(graph).length) return depth
  return depth + Object.keys(graph).reduce((total, key) => {
    return total + sumDepths(graph[key], depth + 1) - 1
  }, 0)
}

function buildGraph(orbits: string[][], name: string) {
  const children = orbits.filter(orbit => orbit[0] === name).map(orbit => orbit[1])
  if (!children.length) return {}
  return children.reduce((obj, child) => {
    obj[child] = buildGraph(orbits, child)
    return obj
  }, {} as Graph)
} 

function printGraph(graph: Graph, spacing = 0) {
  Object.keys(graph).forEach(key => {
    console.log('|' + '-'.repeat(spacing) + key)
    printGraph(graph[key], spacing + 1)
  })
}

const orbits = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(/\)/))
)

const graph = { COM: buildGraph(orbits, 'COM') }
const part1 = sumDepths(graph)
console.log(part1, [ 42, 271151 ].includes(part1))
printGraph(graph)

type Graph = { [key: string]: Graph }

function sumDepths(graph: Graph, depth = 0): number {
  return depth + Object.keys(graph).reduce((total, key) => {
    return total + sumDepths(graph[key], depth + 1) - 1;
  }, 0);
}

function buildGraph(orbits: string[][], name: string) {
  return orbits.filter(orbit => orbit[0] === name)
    .map(orbit => orbit[1])
    .reduce((obj, child) => {
      obj[child] = buildGraph(orbits, child);
      return obj;
    }, {} as Graph);
} 

function graphDfs(graph: Graph, name: string): boolean {
  if (graph[name]) return true;
  return Object.keys(graph).some(key => {
    return graphDfs(graph[key], name);
  });
}

function closestRoot(graph: Graph, names: string[]) {
  const next = Object.keys(graph).find(key => {
    return names.every(name => graphDfs(graph[key], name))
  });
  if (!next) return graph;
  return closestRoot(graph[next], names);
}

function getDepth(graph: Graph, name: string, depth = 0): number | undefined {
  if (Object.keys(graph).includes(name)) return depth;
  return Object.keys(graph).reduce((result, key) => {
    return getDepth(graph[key], name, depth + 1) || result;
  }, 0);
}

function distanceBetween(graph: Graph, names: string[]) {
  const closest = closestRoot(graph, names)!;
  return names.reduce((distance, name) => {
    return distance + getDepth(closest, name)!
  }, 0);
}

const orbits = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(/\)/))
);
const graph = { COM: buildGraph(orbits, 'COM') };

const part1 = sumDepths(graph);
console.log(part1, [ 42, 271151 ].includes(part1));

const part2 = distanceBetween(graph, [ 'YOU', 'SAN' ])
console.log(part2, [ 4, 388 ].includes(part2));

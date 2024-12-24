type Graph = { [key: string]: string[] }

function solvePart1(data: Graph) {
  const set = new Set<string>();
  Object.keys(data).forEach(key => {
    data[key].forEach(key2 => {
      data[key2].forEach(key3 => {
        if (data[key3].includes(key)) {
          const arr = [ key, key2, key3 ];
          if (arr.some(key => key[0] === 't')) {
            set.add(arr.toSorted().join());
          }
        }
      })
    })
  })
  return set.size;
}

function search(sets: Set<string>, name: string, set: Set<string>) {
  const key = [ ...set ].toSorted().join(',');
  if (sets.has(key)) return;
  sets.add(key);
  data[name].forEach(child => {
    if (set.has(child)) return;
    if (![ ...set ].every(child2 => data[child2].includes(child))) return;
    search(sets, child, new Set<string>(set).add(child));
  })
}

function solvePart2(data: Graph) {
  const sets = new Set<string>();
  Object.keys(data).forEach(child => {
    search(sets, child, new Set([ child ]));
  });
  return [ ...sets ].toSorted((a, b) => b.length - a.length)[0];
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((graph, line) => {
    const [ _, a, b ] = line.match(/(\w+)-(\w+)/)!
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
    return graph;
  }, {} as Graph)
);

const part1 = solvePart1(data);
console.log(part1, [ 7, 1304 ].includes(part1));

const part2 = solvePart2(data);
console.log(part2, [
  'co,de,ka,ta',
  'ao,es,fe,if,in,io,ky,qq,rd,rn,rv,vc,vl'
].includes(part2));

// ANSWER PART 1: 1304
// ANSWER PART 2: ao,es,fe,if,in,io,ky,qq,rd,rn,rv,vc,vl

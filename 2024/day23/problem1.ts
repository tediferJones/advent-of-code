type Graph = { [key: string]: string[] }

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((graph, line) => {
    const [ a, b ] = line.split('-');
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
    return graph;
  }, {} as Graph)
);

const set = new Set<string>();
Object.keys(data).forEach(key => {
  data[key].forEach(key2 => {
    data[key2].forEach(key3 => {
      if (data[key3].includes(key)) {
        const arr = [key, key2, key3];
        if (arr.some(key => key[0] === 't')) {
          set.add(arr.toSorted().join());
        }
      }
    })
  })
})

const part1 = set.size;
console.log(part1, [ 7, 1304 ].includes(part1));

// ANSWER PART 1: 1304

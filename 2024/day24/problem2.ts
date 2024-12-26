const ops: Record<string, (a: number, b: number) => number> = {
  'AND': (a, b) => a && b,
  'OR': (a, b) => a || b,
  'XOR': (a, b) => a ^ b,
}

function solve(all: string[][], nodes: Record<string, number>) {
  if (all.length === 0) {
    const sorted = Object.keys(nodes).toSorted().filter(str => str[0] === 'z').toReversed()
    return Number(`0b${sorted.map(name => nodes[name]).join('')}`)
  }
  const [ name1, op, name2, output ] = all.shift()!
  if (nodes[name1] > -1 && nodes[name2] > -1) {
    nodes[output] = ops[op](nodes[name1], nodes[name2])
  } else {
    all.push([ name1, op, name2, output ])
  }
  return solve(all, nodes)
}

function getDesiredAnswer(nodes: Record<string, number>) {
  const result: Record<string, number[]> = { x: [], y: [] }
  Object.keys(nodes).forEach(name => {
    const match = name.match(/([x|y])(\d+)/)
    if (match) {
      const [ _, type, index ] = match
      const val = nodes[name]
      result[type][Number(index)] = val
    }
  })
  return Number(`0b${result.x.toReversed().join('')}`) + Number(`0b${result.y.toReversed().join('')}`)
}

function getCopy(item: any) {
  return JSON.parse(JSON.stringify(item))
}

function findSwaps(nodes: Record<string, number>, flows: string[][]) {
  const keys = Object.keys(nodes)
  const lookingFor = getDesiredAnswer(nodes)
  const set = new Set<string>()
  console.log('looking for', lookingFor)
  // this only checks 2 pairs (4 wires), we need to check 4 pairs (8 wires)
  return keys.some((key, i) => {
    return keys.slice(i + 1).some((key2, j) => {
      console.log(i, j)
      return keys.slice(j + 1).some((key3, k) => {
        return keys.slice(k + 1).some((key4, l) => {
          // console.log(i, j, k, l)
          const strId = `${[key, key2].toSorted().join('')}:${[key3, key4].toSorted().join('')}`
          if (set.has(strId)) return // console.log('skipping')
          set.add(strId)
          const nodesCopy = getCopy(nodes)
          const flowCopy = getCopy(flows)
          swapFlows(flowCopy, key, key2)
          swapFlows(flowCopy, key3, key4)
          return solve(flowCopy, nodesCopy) === lookingFor
        })
      })
    })
  })
}

function swapFlows(flows: string[][], name1: string, name2: string) {
  const first = flows.findIndex(flow => flow[3] === name1)
  const second = flows.findIndex(flow => flow[3] === name2)
  if (first === -1 || second === -1) return
  flows[first][3] = name2
  flows[second][3] = name1
}

const [ init, flow ] = (await Bun.file(process.argv[2]).text()).split(/\n\n/)

const nodes = init.split(/\n/).filter(Boolean).reduce((nodes, line) => {
  const [ _, name, val ] = line.match(/(.+):\s+(\d)/)!
  nodes[name]= Number(val)
  return nodes
}, {} as Record<string, number>)

const allFlow = flow.split(/\n/).filter(Boolean).reduce((allFlow, line) => {
  const [ _, name1, op, name2, output ] = line.match(/(.+)\s+(.+)\s+(.+)\s+->\s+(.+)/)!
  allFlow.push([ name1, op, name2, output ])
  return allFlow
}, [] as string[][])

const part1 = solve(getCopy(allFlow), getCopy(nodes))
console.log(part1, [ 4, 2024, 65635066541798 ].includes(part1))

// const lookingFor = getDesiredAnswer(nodes)
// console.log(lookingFor)
// const currentResult = solve(getCopy(allFlow), nodes)
// console.log(currentResult)
// console.log((currentResult >>> 0).toString(2))
// console.log(Object.keys(nodes).filter(name => name[0] === 'z').toReversed().map(name => nodes[name]).join(''))
// console.log(findSwaps(nodes, allFlow))

// EXAMPLE 3
// swapFlows(allFlow, 'z05', 'z00')
// swapFlows(allFlow, 'z02', 'z01')
// solve(allFlow, nodes)
// console.log(nodes)

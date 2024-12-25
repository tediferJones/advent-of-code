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
  return Number(`0b${result.x.join('')}`) + Number(`0b${result.y.join('')}`)
}

function findSwaps(nodes: Record<string, number>) {
  const keys = Object.keys(nodes)

}

function swapFlows(flows: string[][], name1: string, name2: string) {
  const first = flows.findIndex(flow => flow[3] === name1)
  const second = flows.findIndex(flow => flow[3] === name2)
  // const temp = flows[first]
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

const part1 = solve(JSON.parse(JSON.stringify(allFlow)), nodes)
console.log(part1, [ 4, 2024, 65635066541798 ].includes(part1))

// console.log(allFlow)
// swapFlows(allFlow, 'z00', 'z05')
// swapFlows(allFlow, 'z02', 'z01')
// console.log(solve(allFlow, nodes))
// console.log(nodes)
// // console.log(nodes)
// const temp = getDesiredAnswer(nodes)
// console.log(temp)

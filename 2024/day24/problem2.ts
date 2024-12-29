type Bit = { tempResult: string, longCarry: string }
type Ops = 'AND' | 'OR' | 'XOR'
type Flow = { op: Ops, operands: string[], output: string }
type FlowsObj = Record<string, Flow>

const ops: Record<string, (a: number, b: number) => number> = {
  'AND': (a, b) => a & b,
  'OR': (a, b) => a | b,
  'XOR': (a, b) => a ^ b,
}

function solve(flows: FlowsObj, nodes: Record<string, number>, keys = Object.keys(flows)) {
  if (keys.length === 0) {
    const sorted = Object.keys(nodes).toSorted().filter(str => str[0] === 'z').toReversed()
    return Number(`0b${sorted.map(name => nodes[name]).join('')}`)
  }

  const key = keys.shift()!
  if (flows[key]) {
    const { output, op, operands } = flows[key]
    const [ name1, name2 ] = operands
    if (nodes[name1] > -1 && nodes[name2] > -1) {
      nodes[output] = ops[op](nodes[name1], nodes[name2])
    } else {
      keys.push(key)
    }
  }
  return solve(flows, nodes, keys)
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

function getCopy<T>(item: T): T {
  return JSON.parse(JSON.stringify(item))
}

// we assume that z00 and z01 are correct, and that no swaps need to happen beyond the root node
// i.e. if name1 XOR name2 = zNum fails, we only test all swaps for name1, name2, and zNum
function solvePart2(flows: FlowsObj) {
  const swaps: [string, string][] = []
  const initial: Bit[] = [
    {},
    {
      tempResult: flows['z01'].operands[isTempResult(1, flows[flows['z01'].operands[0]]) ? 0 : 1],
      longCarry: flows['z01'].operands[isTempResult(1, flows[flows['z01'].operands[0]]) ? 1 : 0],
    }
  ] as Bit[]

  for (let i = 2; i < 45; i++) {
    const check = verifyBit(i, flows, initial)
    if (!check) {
      const found = fixFlow(flows, i, initial, swaps)
      if (!found) throw Error('couldnt fix answer')
    }
  }
  return swaps
}

function swapFlows(flows: FlowsObj, key1: string, key2: string) {
  const first = flows[key1]
  const second = flows[key2]
  first.output = key2
  second.output = key1
  flows[key1] = second
  flows[key2] = first
}

function fixFlow(flows: FlowsObj, i: number, bits: Bit[], swaps: [string, string][]) {
  const key = 'z' + i.toString().padStart(2, '0')
  return [ key ].concat(flows[key].operands).some(key => {
    const swap = Object.keys(flows).find(swapKey => {
      const flowsCopy = getCopy(flows)
      swapFlows(flowsCopy, key, swapKey)
      return verifyBit(i, flowsCopy, bits)
    })
    if (swap) {
      swaps.push([ key, swap ])
      swapFlows(flows, key, swap)
      return true
    }
  })
}

function verifyBit(num: number, flows: Record<string, Flow>, init: Bit[]) {
  const key = 'z' + num.toString().padStart(2, '0')
  const root = flows[key]
  if (root.op !== 'XOR') return

  const first = flows[root.operands[0]]
  const second = flows[root.operands[1]]
  if (isTempResult(num, first) && isLongCarry(num, second, flows, init)) {
    init.push({
      tempResult: root.operands[0],
      longCarry: root.operands[1],
    })
    return true
  }
  if (isTempResult(num, second) && isLongCarry(num, first, flows, init)) {
    init.push({
      tempResult: root.operands[1],
      longCarry: root.operands[0],
    })
    return true
  }
}

function isCarryBit(num: number, flow: Flow) {
  return flow.op === 'AND' && flow.operands
    .map(reg => Number(reg.slice(1)))
    .every(regNum => regNum === num - 1)
}

function isLongCarry(num: number, flow: Flow, flows: FlowsObj, init: Bit[]) {
  return flow.op === 'OR' && (
    (isCarryBit(num, flows[flow.operands[0]]) && andOfPrev(flows[flow.operands[1]], init[num - 1]))
    || (isCarryBit(num, flows[flow.operands[1]]) && andOfPrev(flows[flow.operands[0]], init[num - 1]))
  )
}

function andOfPrev(flow: Flow, prevBit: Bit) {
  return flow.op === 'AND' && (
    (flow.operands[0] === prevBit.longCarry && flow.operands[1] === prevBit.tempResult)
    || (flow.operands[1] === prevBit.longCarry && flow.operands[0] === prevBit.tempResult) 
  )
}

function isTempResult(num: number, flow: Flow) {
  return flow?.op === 'XOR' && flow.operands
    .map(operand => Number(operand.slice(1)))
    .every(operand => operand === num)
}

function testSwaps(swaps: [string, string][], nodes: Record<string, number>, flows: FlowsObj) {
  const desiredAnswer = getDesiredAnswer(nodes)
  swaps.forEach(swap => swapFlows(flows, ...swap))
  return desiredAnswer === solve(flows, nodes)
}

const [ init, flow ] = (await Bun.file(process.argv[2]).text()).split(/\n\n/)

const nodes = init.split(/\n/).filter(Boolean).reduce((nodes, line) => {
  const [ _, name, val ] = line.match(/(.+):\s+(\d)/)!
  nodes[name]= Number(val)
  return nodes
}, {} as Record<string, number>)

const allFlow = flow.split(/\n/).filter(Boolean).reduce((allFlow, line) => {
  const [ _, name1, op, name2, output ] = line.match(/(.+)\s+(.+)\s+(.+)\s+->\s+(.+)/)!
  allFlow[output] = {
    operands: [ name1, name2 ],
    op: op as Ops,
    output,
  }
  return allFlow
}, {} as FlowsObj)

const part1 = solve(getCopy(allFlow), getCopy(nodes))
console.log(part1, [ 4, 2024, 65635066541798 ].includes(part1))

const part2Swaps = solvePart2(getCopy(allFlow))!
const part2 = part2Swaps.flat().toSorted().join()
console.log(part2, [ 'dgr,dtv,fgc,mtj,vvm,z12,z29,z37' ].includes(part2))
console.log('addition test', testSwaps(part2Swaps, nodes, allFlow))

// SOLVING BY HAND
//
// THE REAL FORMULA
// longCarry XOR tempResult = result
// xNum XOR yNum = tempResult
// andOfPrev OR carryBit = longCarry
// xNum-1 AND yNum-1 = carrybit
// prevTempResult AND prevLongCarry = andOfPrev
//
// SOLVE FOR z12
// tempResult = qts
// prevTempResult = qqn
// prevLongCarry = tnj
// andOfPrev = njh
// longCarry = jmr
// jmr XOR qts = z12 but it actually points to fgc
// so swap fgc and z12? (that worked)
//
// SOLVE FOR z29
// y29 XOR x29 -> vkb // tempResult
// x28 AND y28 -> jvp // carryBit
// gwd // prevTempResult
// rhr // prevLongCarry
// gwd AND rhr -> rjs // andOfPrev
// jvp OR rjs -> jfk
//
// vkb = tempResult
//
// rjs OR jvp = jfk // longCarry
// jfk XOR vkb = z29 (should be)
// vkb XOR jfk -> mtj (actual)
// swap mtj and z29? (that worked)
//
// SOLVE FOR z33
// y33 XOR x33 -> vvm // tempResult
// x32 AND y32 -> gtw // carryBit
// dtp AND hdp -> wng // andOfPrev
// wng OR gtw -> rrd // longCarry
// dgr XOR rrd = z33 (actual)
// swap dgr and vvm?
//
// SOLVE FOR z37
// y37 XOR x37 -> bkj // tempResult
// y36 AND x36 -> rkd // carryBit
// mbs AND kvv -> gvm // andOfPrev
// rkd OR gvm -> fhq // longCarry
// fhq XOR bkj = z37 (should be)
// bkj XOR fhq -> dtv (actual)
// swap dtv and z37?

// TESTING
// x00 XOR y00 = z00 result
//
// njb XOR tkb = z01
// x00 AND y00 = njb carryBit from z00
// x01 XOR y01 = tkb temp result for z01
// (x00 AND y00) XOR (x01 XOR y01) = z01 result
//
// knm XOR vvh = z02
// vjw OR hfp = knm longCarry z02
// y01 AND x01 = vjw carryBit from z01
// tkb AND njb = hfp temp result for z01 AND carryBit from z00
// y02 XOR x02 = vvh temp result for z02
// ((carryBit z01) OR (temp result z01 AND carryBit from z00)) XOR (temp result z02) = z02
//
// wvr XOR sfq = z03
// qhs OR fwv = wvr longCarry z03
// x02 AND y02 = qhs carryBit from z02
// vvh AND knm = fwv temp result for z02 AND longCarry z02
// y03 XOR x03 = sfq temp result z03
// ((carryBit z02) OR (temp result z02 AND longCarry z02)) XOR (temp result z03) = z03
//
// qjk XOR fck = z04
// hgm OR gwk = qjk longCarry z04
// sfq AND wvr = hgm temp result z03 AND longCarry z03
// y03 AND x03 = gwk carryBit from z03
// x04 XOR y04 = fck temp result z04
// (carryBit z03 OR (temp result z03 AND longCarry z03)) XOR (temp result z04)
//
// This is essentially the formula
// (prevCarry OR prevTempResult AND prevLongCarry) XOR tempResult

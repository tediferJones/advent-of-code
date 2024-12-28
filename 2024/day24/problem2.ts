const ops: Record<string, (a: number, b: number) => number> = {
  'AND': (a, b) => a && b,
  'OR': (a, b) => a || b,
  'XOR': (a, b) => a ^ b,
}

function solve(all: string[][], nodes: Record<string, number>, fixer = { count: 0, length: all.length }) {
  if (all.length === 0) {
    const sorted = Object.keys(nodes).toSorted().filter(str => str[0] === 'z').toReversed()
    return Number(`0b${sorted.map(name => nodes[name]).join('')}`)
  }
  if (fixer.count > fixer.length) return NaN
  const [ name1, op, name2, output ] = all.shift()!
  if (nodes[name1] > -1 && nodes[name2] > -1) {
    nodes[output] = ops[op](nodes[name1], nodes[name2])
    fixer.count = 0
    fixer.length = all.length
  } else {
    all.push([ name1, op, name2, output ])
    fixer.count++
  }
  return solve(all, nodes, fixer)
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

function findSwaps(nodes: Record<string, number>, flows: string[][], keys: string[]) {
  // const keys = Object.keys(nodes)
  const time = Bun.nanoseconds()
  const lookingFor = getDesiredAnswer(nodes)
  const set = new Set<string>()
  console.log('looking for', lookingFor)
  console.log(keys)
  // this only checks 2 pairs (4 wires), we need to check 4 pairs (8 wires)
  return keys.some((key, i) => {
    return keys.slice(i + 1).some((key2, j) => {
      // console.log(i, j)
      return keys.slice(i + j + 2).some((key3, k) => {
        return keys.slice(i + j + k + 3).some((key4, l) => {
          console.log(i, j, k, l)
          console.log(key, key2, key3, key4)
          if (j === 1) {
            throw Error(`TIME: ${(Bun.nanoseconds() - time) / 10**9}`)
          }
          const strId = `${[key, key2].toSorted().join('')}:${[key3, key4].toSorted().join('')}`
          if (set.has(strId)) return // console.log('skipping')
          set.add(strId)
          const nodesCopy = getCopy(nodes)
          const flowCopy = getCopy(flows)
          const swap1 = swapFlows(flowCopy, key, key2)
          const swap2 = swapFlows(flowCopy, key3, key4)
          if (swap1 && swap2) {
            return solve(flowCopy, nodesCopy) === lookingFor
          }
        })
      })
    })
  })
}

function getChildren(flows: string[][], name: string, answer: string[] = []): string[] {
  const foundFlows = flows.filter(flow => flow[3] === name)
  answer.push(name)
  if (foundFlows.length === 0) return answer
  return answer.concat(
    foundFlows.map(flow => {
      const first = getChildren(flows, flow[0], answer)
      const second = getChildren(flows, flow[2], answer)
      const temp = first.concat(second)
      return temp
    }).flat()
  )
}

function swapFlows(flows: string[][], name1: string, name2: string) {
  const first = flows.findIndex(flow => flow[3] === name1)
  const second = flows.findIndex(flow => flow[3] === name2)
  if (first === -1 || second === -1) return false
  if (flows[first].includes(name2)) return false
  if (flows[second].includes(name1)) return false
  flows[first][3] = name2
  flows[second][3] = name1
  return true
}

function getBinDiff(bin1: string, bin2: string) {
  const bin1Arr = bin1.split('').toReversed()
  const bin2Arr = bin2.split('').toReversed()
  return bin1Arr.reduce((diff, char, i) => {
    if (char !== bin2Arr[i]) {
      return diff.concat(i)
    }
    return diff
  }, [] as number[])
}

function testSwaps(nodes: Record<string, number>, flows: string[][], keys: string[], lookingFor: string) {
  console.log(keys.length)
  // console.log(lookingFor)
  const originalDiff = getBinDiff(part1.toString(2), lookingFor)
  const pairs: [string, string][] = []
  keys.forEach((key1, i) => {
    keys.slice(i + 1).forEach((key2) => {
      const nodesCopy = getCopy(nodes)
      const flowCopy = getCopy(flows)
      const swap1 = swapFlows(flowCopy, key1, key2)
      // const swap2 = swapFlows(flowCopy, key3, key4)
      if (swap1) {
        const solution = solve(flowCopy, nodesCopy).toString(2)
        if (getBinDiff(solution, lookingFor).length < originalDiff.length) {
          pairs.push([ key1, key2 ])
          // throw Error(`found key swap to improve: ${key1}, ${key2}`)
        }
      }
    })
  })
  return pairs
}

function solvePart2(allFlow: string[][], nodes: Record<string, number>) {
  console.log('START PART 2')
  allFlow = getCopy(allFlow)
  nodes = getCopy(nodes)
  const lookingFor = getDesiredAnswer(nodes)
  console.log('looking for', lookingFor)
  console.log('answer', part1)
  const binaryLookingFor = lookingFor.toString(2)
  console.log(binaryLookingFor, 'binary looking for')
  console.log(part1.toString(2), 'binary part 1')
  const differences = getBinDiff(lookingFor.toString(2), part1.toString(2))
  const diffNames = differences.map(i => `z${i.toString().padStart(2, '0')}`)
  const diffChildren = diffNames.map(name => getChildren(allFlow, name)).flat().filter(name => ![ 'x', 'y' ].includes(name[0]))
  // console.log(new Set(diffChildren).size)
  // console.log(findSwaps(nodes, allFlow, [ ...new Set(diffChildren) ]))
  console.log(testSwaps(getCopy(nodes), getCopy(allFlow), [ ...new Set(diffChildren) ], binaryLookingFor).length)

  // swapFlows(allFlow, 'z29', 'z30')
  // swapFlows(allFlow, 'z14', 'z15')
  // console.log(allFlow)
  // const part2 = solve(getCopy(allFlow), getCopy(nodes))
  // console.log(part2.toString(2), 'binary part 2')
  // console.log('part2', part2)
  // console.log('children', getChildren(allFlow, 'wrb'))
}

// pretty sure we only need to track longCarry and tempResult
// result is almost certainly not needed
type Bit = {
  result: string,
  tempResult: string,
  carryBit: string,
  longCarry: string,
}
type Ops = 'AND' | 'OR' | 'XOR'
type Flow = {
  op: Ops,
  operands: string[],
  output: string
}
type FlowsObj = Record<string, Flow>
function solvePart2V2(nodes: Record<string, number>, flows: string[][]) {
  // get these keys, sort alphabetically, join with commas, and we might just have our answer
  // swapFlows(flows, 'z12', 'fgc')
  // swapFlows(flows, 'z29', 'mtj')
  // swapFlows(flows, 'dgr', 'vvm')
  // swapFlows(flows, 'dtv', 'z37')

  const swaps = [
    [ 'z12', 'fgc' ],
    [ 'z29', 'mtj' ],
    [ 'dgr', 'vvm' ],
    [ 'dtv', 'z37' ],
  ] as [string, string][]

  swaps.forEach(swap => swapFlows(flows, ...swap))

  const flowsObj = flows.reduce((obj, flow) => {
    obj[flow[3]] = {
      op: flow[1] as Ops,
      operands: [ flow[0], flow[2] ],
      output: flow[3],
    }
    return obj
  }, {} as FlowsObj)
  // console.log(flowsObj)
  const initial: Bit[] = []
  initial.push({ result: 'z00' } as Bit)
  // initial.push({ result: 'z01', carryBit: 'njb', tempResult: 'tkb' } as Bit)
  initial.push({ result: 'z01', longCarry: 'njb', tempResult: 'tkb' } as Bit)
  // console.log(flowsObj['z01'])
  // console.log('CHECKING 2')
  // const check2 = verifyBit(2, flowsObj, initial)
  // console.log(check2)
  // console.log('CHECKING 3')
  // const check3 = verifyBit(3, flowsObj, initial)
  // console.log(check3)
  // console.log('CHECKING 4')
  // const check4 = verifyBit(4, flowsObj, initial)
  // console.log(check4)

  // manually determine swaps via console.log outputs
  // add a new swap once determined and try again
  // check number should get higher every time
  //
  // (carryBit z03 OR (temp result z03 AND longCarry z03)) XOR (temp result z04)
  // = longCarry XOR tempResult
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
  //
  // THE REAL FORMULA
  // longCarry XOR tempResult = result
  // xNum XOR yNum = tempResult
  // andOfPrev OR carryBit = longCarry
  // xNum-1 AND yNum-1 = carrybit
  // prevTempResult AND prevLongCarry = andOfPrev
  for (let i = 2; i < 45; i++) {
    console.log(`CHECKING ${i}`)
    const check = verifyBit(i, flowsObj, initial)
    console.log('result', check)
    if (!check) break
    if (i === 44) console.log('WINNER WINNER, CHICKEN DINNER')
  }
}

function verifyBit(num: number, flows: Record<string, Flow>, init: Bit[]) {
  const key = 'z' + num.toString().padStart(2, '0')
  // console.log(key)
  const root = flows[key]
  if (root.op !== 'XOR') return console.log('ROOT OP IS NOT XOR', root, init)

  const first = flows[root.operands[0]]
  const second = flows[root.operands[1]]
  console.log(init)
  console.log('root', root)
  console.log('first', first)
  console.log('second', second)
  // const isValid = (
  //   isTempResult(num, first) && isLongCarry(num, second, flows, init)
  //   || isTempResult(num, second) && isLongCarry(num, first, flows, init)
  // )
  if (isTempResult(num, first)) {
    const longCarry = isLongCarry(num, second, flows, init)
    if (!longCarry) return console.log('first is temp result, second is not long carry')
    init.push({
      tempResult: root.operands[0],
      longCarry: root.operands[1],
      carryBit: longCarry.carryBit,
      result: root.output
    })
    return true
  }
  if (isTempResult(num, second)) {
    const longCarry = isLongCarry(num, first, flows, init)
    console.log(first)
    if (!longCarry) return console.log('second is temp result, first is not long carry')
    init.push({
      tempResult: root.operands[1],
      longCarry: root.operands[0],
      carryBit: longCarry.carryBit,
      result: root.output
    })
    return true
  }
  console.log('neither first nor second is tempResult')
  // console.log(isValid)
  // console.log(isCarryBit(num, second))
}

function isCarryBit(num: number, flow: Flow) {
  return flow.op === 'AND' && flow.operands.map(reg => Number(reg.slice(1))).every(regNum => regNum === num - 1)
}

function isLongCarry(num: number, flow: Flow, flows: FlowsObj, init: Bit[]) {
  console.log('~~~~~~~~')
  console.log('long carry', flow)
  console.log('first is carryBit', isCarryBit(num, flows[flow.operands[0]]))
  console.log('second is andOfPrev', init, flows[flow.operands[1]])// andOfPrev(flows[flow.operands[1]], init[num - 1]))
  console.log('~~~~~~~~')
  if (flow.op !== 'OR') return
  if (isCarryBit(num, flows[flow.operands[0]]) && andOfPrev(flows[flow.operands[1]], init[num - 1])) {
    return {
      carryBit: flow.operands[0],
      andOfPrev: flow.operands[1]
    }
  }
  if (isCarryBit(num, flows[flow.operands[1]]) && andOfPrev(flows[flow.operands[0]], init[num - 1])) {
    return {
      carryBit: flow.operands[1],
      andOfPrev: flow.operands[0]
    }
  }
  // return flow.op === 'OR' && (
  //   isCarryBit(num, flows[flow.operands[0]]) && andOfPrev(flows[flow.operands[1]], init[num - 1])
  // ) || (
  //   isCarryBit(num, flows[flow.operands[1]]) && andOfPrev(flows[flow.operands[0]], init[num - 1])
  // )
}

function andOfPrev(flow: Flow, prevBit: Bit) {
  return flow.op === 'AND' && (
    // (flow.operands[0] === prevBit.carryBit && flow.operands[1] === prevBit.tempResult)
    // || (flow.operands[1] === prevBit.carryBit && flow.operands[0] === prevBit.tempResult) 
    (flow.operands[0] === prevBit.longCarry && flow.operands[1] === prevBit.tempResult)
    || (flow.operands[1] === prevBit.longCarry && flow.operands[0] === prevBit.tempResult) 
  )
}

function isTempResult(num: number, flow: Flow) {
  return flow.op === 'XOR' && flow.operands.map(operand => Number(operand.slice(1))).every(operand => operand === num)
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

// console.log(solvePart2(allFlow, nodes))
console.log(solvePart2V2(getCopy(nodes), getCopy(allFlow)))

// function addBin(bin1: string, bin2: string) {
//   return (Number(`0b${bin1}`) + Number(`0b${bin2}`)).toString(2)
// }
// console.log(addBin('111', '111'))

// EXAMPLE 3
// swapFlows(allFlow, 'z05', 'z00')
// swapFlows(allFlow, 'z02', 'z01')
// solve(allFlow, nodes)
// console.log(nodes)

// xNum XOR yNum = tempResult
// xNum-1 AND yNum-1 = carryBit
// prevCarryBit OR prevTempResult AND prevLongCarry = longCarry
// longCarry XOR tempResult = result (this is the digit we actually return)
//
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
//
// This is essentially the formula
// (prevCarry OR prevTempResult AND prevLongCarry) XOR tempResult
// Can we start from z00 and increment until we find a zNum that does follow this pattern?
// 0 and 1 are special cases

// TEST
//  11
//   11
// + 11
// -----
//    0
// const mineNodes = {
//   x00: 1,
//   x01: 1,
//   y00: 1,
//   y01: 1,
// }
// const mineFlows = [
//   [ 'x00', 'AND', 'y00', 'z01' ],
//   [ 'x00', 'XOR', 'y00', 'z02' ],
//   [ 'x01', 'AND', 'y01', 'z02' ],
//   [ 'x01', 'XOR', 'y01', 'z03' ],
// ]
// console.log(solve(mineFlows, mineNodes))
// console.log(mineNodes)

// Guide: https://codeforces.com/blog/entry/72593

// type Eq = { a: number, b: number, deckSize: number }
// to represent y = (mx + b) % mod
type Eq = { m: number, b: number }
type EqMod = Eq & { mod: number }
type Shuffles = 'new stack' | 'cut' | 'increment'

const shuffleTypesV2: Record<Shuffles, (n: number) => Eq> = {
  'new stack': () => ({ m: -1, b: -1  }),
  'cut': (n) => ({ m: 1, b: n * -1 }),
  'increment': (n) => ({ m: n, b: 0 }),
}

// because javascript is a dumpster fire
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function composeEq(f: Eq, g: EqMod) {
  // compose function such that result is f(g(x))
  // where f is the current shuffle and g is the existing eq
  //
  // f(g(x))
  // fm*g(x) + fb
  // fm(gm + gb) + fb
  // fm*gm + fm*gb + fb
  //
  // m = fm*gm
  // b = fm*gb + fb
  return {
    m: mod(f.m * g.m, g.mod),
    b: mod((f.m * g.b) + f.b, g.mod),
    mod: g.mod
  }
}

function buildEqV2(eq: EqMod, shuffles: string[]) {
  const shuffle = shuffles[0]
  if (!shuffle) return eq
  const shuffleType = Object.keys(shuffleTypesV2).find(key => shuffle.includes(key)) as Shuffles
  if (!shuffleType) throw Error(`cannot find shuffle type for: ${shuffle}`)
  const [ num ] = shuffle.match(/-?\d+/)?.map(Number) || [ Infinity ]
  const newEq = composeEq(shuffleTypesV2[shuffleType](num), eq)
  return buildEqV2(newEq, shuffles.slice(1))
}

function showDeckV2(eq: EqMod) {
  const arr = Array.from({ length: eq.mod }).map((_, i) => i)
  return arr.reduce((arr, i) => {
    const newIndex = ((eq.m * i) + eq.b) % eq.mod
    return arr.with(newIndex, i)
  }, arr)
}

// binary exponentation but with composing functions
function repeatShuffle(eq: EqMod, count: number) {
  let g = { m: 1, b: 0, mod: eq.mod }
  while (count > 0) {
    if (count % 2) g = composeEq(g, eq)
    count = Math.floor(count / 2)
    eq = composeEq(eq, eq)
  }
  return g
}

function getFinalPos(eq: EqMod, startPos: number) {
  return (eq.m * startPos + eq.b) % eq.mod
}

function getFinalCard(eq: EqMod, cardNum: number) {
  // invert equation (might need to use modInv)
  // y = (mx + b) % mod
  // y - b = mx
  // (y - b) / m = x
  // x = (y - b) / m
  //
  // OR
  // (3x === 4) mod 7
  // return modInv(cardNum - eq.b)
  // return ((cardNum - eq.b) / eq.m) % eq.mod
  const inv = modInv(eq.m, eq.mod)
  return mod(((cardNum - eq.b) * inv), eq.mod)
}

function solvePart1(pos: number, deckSize: number, shuffles: string[]) {
  const initEq = { m: 1, b: 0, mod: deckSize }
  const shuffledEq = buildEqV2(initEq, shuffles)
  return getFinalPos(shuffledEq, pos)
}

function solvePart2(
  pos: number,
  deckSize: number,
  shuffleCount: number,
  shuffles: string[]
) {
  const initEq = { m: 1, b: 0, mod: deckSize }
  const shuffleEq = buildEqV2(initEq, shuffles)
  const multiShuffleEq = repeatShuffle(shuffleEq, shuffleCount)
  return getFinalCard(multiShuffleEq, pos)
}

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)

// TESTING
// it is important to note that the resulting equation will output the final position of the input
// example:
// eq(2019) => 5136; meaning card 2019 will move to position 5136
//
// eq(2019) absolutely does not indicate which card will end up at position 2019
// const initEq = { m: 1, b: 0, mod: 10007 }
// const builtEq = buildEqV2(initEq, shuffleOrder)
// console.log('builtEq', builtEq)
// console.log('part1', getFinalPos(builtEq, 2019))
// console.log('part1 backward', getFinalCard(builtEq, 5169))

const part1 = solvePart1(2019, 10007, shuffleOrder)
console.log(part1, [ 5169 ].includes(part1))

const part2 = solvePart2(2020, 119315717514047, 101741582076661, shuffleOrder)
console.log(part2)

// Test repeated shuffles
// console.log(repeatShuffle(builtEq, 2))
// console.log(composeEq(builtEq, builtEq))

function modInv(a: number, m: number): number {
  let m0 = m;
  let y = 0, x = 1;

  if (m === 1) {
    return 0;
  }

  while (a > 1) {
    const q = Math.floor(a / m);
    let t = m;

    m = a % m;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0) {
    x += m0;
  }

  return x;
}

// ##############################################
// ######## CAN ONLY TRACK INDEX FORWARD ########
// ##############################################
// // type EqState = { x: number, deckSize: number }
// type ShuffleFunc = (i: number, deckSize: number, num: number) => number
// const shuffleTypes: Record<string, ShuffleFunc> = {
//   // 'new stack': (eq: EqState) => eq.deckSize - eq.x - 1,
//   // 'cut': (eq: EqState, num: number) => (eq.x - num) % eq.deckSize,
//   // 'increment': (eq: EqState, num: number) => (eq.x * num) % eq.deckSize
//   'new stack': (i) => (i * -1) - 1,
//   'cut': (i, deckSize, num) => (i - num) % deckSize,
//   'increment': (i, deckSize, num) => (i * num) % deckSize
// }
// 
// function handleShuffles(
//   // eq: EqState,
//   index: number,
//   deckSize: number,
//   shuffles: string[],
// ) {
//   const shuffle = shuffles[0]
//   if (!shuffle) return index
//   // console.log('shuffle:', shuffle)
//   const shuffleType = Object.keys(shuffleTypes).find(key => shuffle.includes(key))
//   if (!shuffleType) throw Error(`cant find shuffle type: ${shuffle}`)
//   // console.log('shuffle type:', shuffleType)
//   const [ num ] = shuffle.match(/-?\d+/)?.map(Number) || [ Infinity ]
//   // const newIndex = shuffleTypes[shuffleType]({ x: index, deckSize }, num)
//   const newIndex = shuffleTypes[shuffleType](index, deckSize, num)
//   // return handleShuffles(newIndex, deckSize, shuffles.slice(1))
//   return handleShuffles(fixNegative(newIndex, deckSize), deckSize, shuffles.slice(1))
// }
// 
// function fixNegative(num: number, deckSize: number) {
//   if (num >= 0) return num
//   return fixNegative(num + deckSize, deckSize)
// }
// 
// function showDeck(deckSize: number, shuffleOrder: string[]) {
//   const temp: number[] = Array(deckSize).fill(0)
//   return temp.reduce((arr, _, i) => {
//     const newIndex = handleShuffles(i, deckSize, shuffleOrder)
//     // console.log(`${i} -> ${newIndex}`)
//     return arr.with(newIndex, i)
//   }, temp)
// }
// 
// const shuffleOrder = (
//   (await Bun.file(process.argv[2]).text())
//   .split(/\n/)
//   .filter(Boolean)
// )
// 
// // console.log(showDeck(10, shuffleOrder))
// // console.log(handleShuffles(0, 10, shuffleOrder))
// 
// // part1 test
// // WORKING
// // console.log(handleShuffles(2019, 10007, shuffleOrder))
// // console.log(showDeck(10007, shuffleOrder)[5169])

// ######################################
// ######## PROBABLY DOESNT WORK ########
// ######################################
// function buildEq(eq: Eq, shuffles: string[]) {
//   const current = shuffles[0]
//   if (!current) return eq
//   if (current.includes('increment')) {
//     const [ num ] = current.match(/-?\d+/)!.map(Number)
//     eq.a = (eq.a * num) % eq.deckSize
//   } else if (current.includes('cut')) {
//     const [ num ] = current.match(/-?\d+/)!.map(Number)
//     console.log(num)
//     eq.b -= num
//   } else if (current.includes('new stack')) {
//     eq.a = eq.a * -1
//     eq.b = (eq.deckSize - eq.b - 1) % eq.deckSize
//   }
//   return buildEq(eq, shuffles.slice(1))
// }
// 
// function finalEq(eq: Eq) {
//   const inv = modInv(eq.a, eq.deckSize)
//   console.log('inv', inv)
//   return {
//     a: inv,
//     // b: (inv * eq.b) % eq.deckSize,
//     b: fixNeg(inv * eq.b * -1, eq.deckSize),
//     deckSize: eq.deckSize
//   }
// }
// 
// function showDeck(eq: Eq) {
//   console.log(
//     Array(eq.deckSize).fill(0).map((_, i) => {
//       return ((eq.a * i) + eq.b) % eq.deckSize
//     })
//   )
// }
// 
// function fixNeg(num: number, deckSize: number) {
//   if (num > deckSize) return num % deckSize
//   return fixNeg(num + deckSize, deckSize)
// }
// 
// const shuffleOrder = (
//   (await Bun.file(process.argv[2]).text())
//   .split(/\n/)
//   .filter(Boolean)
// )
// console.log(shuffleOrder)
// 
// const initEq = { a: 1, b: 0, deckSize: 10 }
// const tempEq = buildEq(initEq, shuffleOrder)
// console.log(tempEq)
// const eq = finalEq(tempEq)
// console.log(eq)
// showDeck(eq)

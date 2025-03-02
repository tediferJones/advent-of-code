// Guide: https://codeforces.com/blog/entry/72593

type Eq = { a: number, b: number, deckSize: number }

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

// type EqState = { x: number, deckSize: number }
type ShuffleFunc = (i: number, deckSize: number, num: number) => number
const shuffleTypes: Record<string, ShuffleFunc> = {
  // 'new stack': (eq: EqState) => eq.deckSize - eq.x - 1,
  // 'cut': (eq: EqState, num: number) => (eq.x - num) % eq.deckSize,
  // 'increment': (eq: EqState, num: number) => (eq.x * num) % eq.deckSize
  'new stack': (i) => (i * -1) - 1,
  'cut': (i, deckSize, num) => (i - num) % deckSize,
  'increment': (i, deckSize, num) => (i * num) % deckSize
}

function handleShuffles(
  // eq: EqState,
  index: number,
  deckSize: number,
  shuffles: string[],
) {
  const shuffle = shuffles[0]
  if (!shuffle) return index
  // console.log('shuffle:', shuffle)
  const shuffleType = Object.keys(shuffleTypes).find(key => shuffle.includes(key))
  if (!shuffleType) throw Error(`cant find shuffle type: ${shuffle}`)
  // console.log('shuffle type:', shuffleType)
  const [ num ] = shuffle.match(/-?\d+/)?.map(Number) || [ Infinity ]
  // const newIndex = shuffleTypes[shuffleType]({ x: index, deckSize }, num)
  const newIndex = shuffleTypes[shuffleType](index, deckSize, num)
  // return handleShuffles(newIndex, deckSize, shuffles.slice(1))
  return handleShuffles(fixNegative(newIndex, deckSize), deckSize, shuffles.slice(1))
}

function fixNegative(num: number, deckSize: number) {
  if (num >= 0) return num
  return fixNegative(num + deckSize, deckSize)
}

function showDeck(deckSize: number, shuffleOrder: string[]) {
  const temp: number[] = Array(deckSize).fill(0)
  return temp.reduce((arr, _, i) => {
    const newIndex = handleShuffles(i, deckSize, shuffleOrder)
    // console.log(`${i} -> ${newIndex}`)
    return arr.with(newIndex, i)
  }, temp)
}

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)
// console.log(showDeck(10, shuffleOrder))
// console.log(handleShuffles(0, 10, shuffleOrder))

// part1 test
console.log(handleShuffles(2019, 10007, shuffleOrder))
console.log(showDeck(10007, shuffleOrder)[5169])

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

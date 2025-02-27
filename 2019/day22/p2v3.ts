type Eq = { a: number, b: number, deckSize: number }

// we want to shuffle some number of time and be able to determine the card at a given index
//
// newPos = (a * oldPos + b) % N
// where:
//  - a = slope
//  - b = offset
//  - N = deckSize

// const shuffleTypes: Record<string, (eq: Eq, num: number) => Eq> = {
//   'new stack': (eq) => {
//     return {
//       // a: ((eq.a * -1) + eq.deckSize) % eq.deckSize,
//       // a: eq.a * -1,
//       a: fixNeg(eq.a * -1, eq.deckSize),
//       b: (eq.deckSize - eq.b - 1) % eq.deckSize,
//       deckSize: eq.deckSize,
//     }
//   },
//   'increment': (eq, num) => {
//     const inv = modInv(num, eq.deckSize)
//     console.log(inv)
//     return {
//       a: (eq.a * inv) % eq.deckSize,
//       b: eq.b,
//       // b: (eq.b * inv) % eq.deckSize,
//       // b: ((eq.b * inv) % eq.deckSize + eq.deckSize) % eq.deckSize,
//       deckSize: eq.deckSize,
//     }
//   },
//   'cut': (eq, num) => {
//     // console.log('test', fixNeg(eq.b + num, eq.deckSize))
//     return {
//       a: eq.a,
//       b: (eq.b + eq.deckSize + num) % eq.deckSize,
//       // b: (eq.b - num + eq.deckSize) % eq.deckSize,
//       deckSize: eq.deckSize,
//     }
//   }
// }

// I also have no idea whats going on here
const shuffleTypes: Record<string, (eq: Eq, num: number) => Eq> = {
  'new stack': (eq) => {
    return {
      a: eq.a * -1,
      b: (eq.b - 1) % eq.deckSize,
      deckSize: eq.deckSize,
    }
  },
  'increment': (eq, num) => {
    const inv = modInv(num, eq.deckSize)
    return {
      a: (eq.a * inv) % eq.deckSize,
      b: (eq.b * inv) % eq.deckSize,
      deckSize: eq.deckSize,
    }
  },
  'cut': (eq, num) => {
    return {
      a: eq.a,
      b: (eq.b - num + eq.deckSize) % eq.deckSize,
      deckSize: eq.deckSize,
    }
  }
}

// should probably double check this as there are numbers that do not have modInv
// a and b must be coprime, i.e. they have must ahve a gcd of 1
function modInv(a: number, modBase: number, inv = 1, valid = gcd(a, modBase) === 1) {
  // console.log(inv, (a * inv) % modBase)
  if (!valid) throw Error('mod inv does not exist')
  // find number such that (a * b) % modBase = 1
  if ((a * inv) % modBase === 1) return inv
  return modInv(a, modBase, inv + 1)
}

// I have no idea what's actually going on here
function modExp(base: number, exp: number, modBase: number, result = 1) {
  base = base % modBase
  if (exp === 0) return result
  if (exp % 2 === 1) result = (result * base) % modBase
  exp = exp >> 1 // Divide exp by 2
  base = (base * base) % modBase
  return modExp(base, exp, modBase, result)
}

function gcd(a: number, b: number) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

// function shuffle(
//   eq: Eq,
//   shuffleCount: number,
//   targetIndex: number,
//   shuffleOrder: string[],
// ) {
//   // a = slope
//   // b = offset (i.e. y intercept)
//   // const eq: Eq = { a: 1, b: 0, deckSize: cardCount }
//   const finalEq = shuffleOrder.reduce((eq, shuffleStr) => {
//     const type = Object.keys(shuffleTypes).find(type => shuffleStr.includes(type))
//     if (!type) throw Error(`cant match type for: '${shuffleStr}'`)
//     const [ num ] = shuffleStr.match(/-?\d+/)?.map(Number) || []
//     // console.log('found type', type)
//     return shuffleTypes[type](eq, num)
//     // return shuffleTypes[shuffleStr](eq, num)
//   }, eq)
//   console.log(finalEq)
//   return ((finalEq.a * targetIndex) + finalEq.b + eq.deckSize) % eq.deckSize
// }

function getShuffledEq(eq: Eq, shuffleOrder: string[]) {
  return shuffleOrder.reduce((eq, shuffleStr) => {
    console.log('eq before shuffle op', eq)
    console.log(shuffleStr)
    const type = Object.keys(shuffleTypes).find(type => shuffleStr.includes(type))
    if (!type) throw Error(`cant match type for: '${shuffleStr}'`)
    const [ num ] = shuffleStr.match(/-?\d+/)?.map(Number) || []
    return shuffleTypes[type](eq, num)
  }, eq)
}

function getCard(eq: Eq, index: number) {
  // const finalB = fixNeg(-1 * eq.b * modInv(eq.a, eq.deckSize), eq.deckSize) % eq.deckSize
  // const temp = ((eq.a * index) + finalB)
  // console.log('original b', eq.b, 'final b', finalB)
  // const temp = ((eq.a * index) + eq.b)
  // console.log('test final b', fixNeg(-1 * eq.b * modInv(eq.a, eq.deckSize), eq.deckSize) % eq.deckSize)
  const bFinal = (eq.b * (1 - modExp(eq.a, shuffleCount, cardCount) + cardCount) * modInv(1 - eq.a + cardCount, cardCount)) % cardCount;
  const temp = ((eq.a * index) + bFinal)

  return temp % eq.deckSize
  // return fixNeg(temp, eq.deckSize) % eq.deckSize
  // return (((eq.a * index) + eq.deckSize * 99) + eq.b) % eq.deckSize
}

function fixNeg(number: number, deckSize: number) {
  if (number >= 0) return number
  return fixNeg(number + deckSize, deckSize)
}

function showDeck(eq: Eq) {
  const deck = Array(eq.deckSize).fill(0).map((_, i) => getCard(eq, i))
  console.log(deck)
}

// a = -3
// b = 6

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)// .slice(0, 2)
// examples
const cardCount = 10

// part 1
// const cardCount = 10007
const shuffleCount = 1

// testing
// const cardCount = 10
// const shuffleCount = 1
// const targetIndex = 10
// const shuffleOrder = [ 'new stack', 'new stack', 'new stack' ]
// const shuffleOrder = [ 'deal with increment 3' ]
// const shuffleOrder = [ 'cut 3' ]
// const shuffleOrder = [ 'increment 3', 'cut 3' ].toReversed()
const eq: Eq = { a: 1, b: 0, deckSize: cardCount }
const newEq = getShuffledEq(eq, shuffleOrder)
// const newEq = { a: -3, b: 6, deckSize: cardCount }
console.log('eq', newEq)
showDeck(newEq)

// There is something wrong with increment or cut, we can't solve example3.txt
// try running 'deal with increment 3, cut 3'
// verify this works for positive and negative cuts
// also very this works in the opposite order (cut then increment)

// part 2
// const cardCount = 119315717514047
// const shuffleCount = 101741582076661
// const targetIndex = 2020

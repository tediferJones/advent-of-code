// Guide: https://codeforces.com/blog/entry/72593

// to represent y = (mx + b) % mod
type Eq = { m: bigint, b: bigint }
type Deck = Eq & { mod: bigint }
type Shuffles = 'new stack' | 'cut' | 'increment'

const shuffleTypesV2: Record<Shuffles, (n: bigint) => Eq> = {
  'new stack': () => ({ m: -1n, b: -1n }),
  'cut': (n) => ({ m: 1n, b: n * -1n }),
  'increment': (n) => ({ m: n, b: 0n }),
}

// because javascript is a dumpster fire
function mod(n: bigint, m: bigint) {
  return ((n % m) + m) % m
}

function composeEq(f: Eq, g: Deck) {
  // compose function such that result is f(g(x))
  // where f is the current shuffle eq and g is the existing eq
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

// apply shuffles by composing shuffle equations together to form a single equation
function buildEq(eq: Deck, shuffles: string[]) {
  const shuffle = shuffles[0]
  if (!shuffle) return eq
  const shuffleType = Object.keys(shuffleTypesV2).find(key => shuffle.includes(key)) as Shuffles
  if (!shuffleType) throw Error(`cannot find shuffle type for: ${shuffle}`)
  const [ num ] = shuffle.match(/-?\d+/)?.map(BigInt) || [ 0n ]
  const newEq = composeEq(shuffleTypesV2[shuffleType](num), eq)
  return buildEq(newEq, shuffles.slice(1))
}

// binary exponentation but with composing functions
function repeatShuffle(eq: Deck, count: bigint) {
  let g = { m: 1n, b: 0n, mod: eq.mod }
  while (count > 0) {
    if (count % 2n) g = composeEq(g, eq)
    count = count / 2n
    eq = composeEq(eq, eq)
  }
  return g
}

function getFinalPos(eq: Deck, startPos: bigint) {
  return mod(eq.m * startPos + eq.b, eq.mod)
}

function modPow(base: bigint, exp: bigint, mod: bigint, result = 1n) {
  if (exp === 0n) return result
  const isOdd = exp % 2n === 1n
  return modPow(
    (base * base) % mod,
    exp / 2n,
    mod,
    isOdd ? (result * base) % mod : result,
  )
}

function modInvFermat(m: bigint, mod: bigint) {
  if (mod <= 1) throw Error('mod must be greater than 1')
  return modPow(m, mod - 2n, mod)
}

function getFinalCard(eq: Deck, cardNum: bigint) {
  // solve for x instead of for y
  // y = (mx + b) % mod
  // y - b = mx % mod
  // x = ((y - b) / m) % mod
  // x = (y - b) * modInv(m, mod)
  const inv = modInvFermat(eq.m, eq.mod)
  return mod(((cardNum - eq.b) * inv), eq.mod)
}

function solvePart1(pos: bigint, deckSize: bigint, shuffles: string[]) {
  const initEq = { m: 1n, b: 0n, mod: deckSize }
  const shuffledEq = buildEq(initEq, shuffles)
  return getFinalPos(shuffledEq, pos)
}

function solvePart2(
  pos: bigint,
  deckSize: bigint,
  shuffleCount: bigint,
  shuffles: string[]
) {
  const initEq = { m: 1n, b: 0n, mod: deckSize }
  const shuffleEq = buildEq(initEq, shuffles)
  const multiShuffleEq = repeatShuffle(shuffleEq, shuffleCount)
  return getFinalCard(multiShuffleEq, pos)
}

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)

const part1 = solvePart1(2019n, 10007n, shuffleOrder)
console.log(part1, [ 5169n ].includes(part1))

const part2 = solvePart2(
  2020n,
  119315717514047n,
  101741582076661n,
  shuffleOrder
)
console.log(part2)

// TESTING
// it is important to note that the resulting equation will output the final position of the input
// example:
// eq(2019) => 5136; meaning card 2019 will move to position 5136
//
// eq(2019) absolutely does not indicate which card will end up at position 2019
// const initEq = { m: 1, b: 0, mod: 10007 }
// const builtEq = buildEq(initEq, shuffleOrder)
// console.log('builtEq', builtEq)
// console.log('part1', getFinalPos(builtEq, 2019))
// console.log('part1 backward', getFinalCard(builtEq, 5169))

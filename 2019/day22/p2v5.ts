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

function buildEq(eq: Eq, shuffles: string[]) {
  const current = shuffles[0]
  if (!current) return eq
  if (current.includes('increment')) {
    const [ num ] = current.match(/-?\d+/)!.map(Number)
    eq.a = (eq.a * num) % eq.deckSize
  } else if (current.includes('cut')) {
    const [ num ] = current.match(/-?\d+/)!.map(Number)
    console.log(num)
    eq.b -= num
  } else if (current.includes('new stack')) {
    eq.a = eq.a * -1
    eq.b = (eq.deckSize - eq.b - 1) % eq.deckSize
  }
  return buildEq(eq, shuffles.slice(1))
}

function finalEq(eq: Eq) {
  const inv = modInv(eq.a, eq.deckSize)
  console.log('inv', inv)
  return {
    a: inv,
    // b: (inv * eq.b) % eq.deckSize,
    b: fixNeg(inv * eq.b * -1, eq.deckSize),
    deckSize: eq.deckSize
  }
}

function showDeck(eq: Eq) {
  console.log(
    Array(eq.deckSize).fill(0).map((_, i) => {
      return ((eq.a * i) + eq.b) % eq.deckSize
    })
  )
}

function fixNeg(num: number, deckSize: number) {
  if (num > deckSize) return num % deckSize
  return fixNeg(num + deckSize, deckSize)
}

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)
console.log(shuffleOrder)

const initEq = { a: 1, b: 0, deckSize: 10 }
const tempEq = buildEq(initEq, shuffleOrder)
console.log(tempEq)
const eq = finalEq(tempEq)
console.log(eq)
showDeck(eq)

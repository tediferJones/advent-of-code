const shuffleTypes: { [key: string]: (cards: number[], num: number) => number[] } = {
  'deal with increment': (cards, increment) => {
    return cards.reduce(({ original, shuffled, count }) => {
      const nextIndex = (increment * count) % original.length
      shuffled[nextIndex] = original[count]
      return {
        original: original,
        shuffled: shuffled,
        count: count + 1
      }
    }, { original: cards, shuffled: [] as number[], count: 0 }).shuffled
  },
  'deal into new stack': (cards) => {
    return cards.toReversed()
  },
  'cut': (cards, num) => {
    return cards.slice(num).concat(cards.slice(0, num))
  }
}

function generateDeck(length: number) {
  return Array(length).fill(0).map((_, i) => i)
}

const shuffleWithMath: { [key: string]: (eq: Equation, num: number) => Equation } = {
  'deal with increment': (eq, num) => {
    return {
      ...eq,
      m: (eq.m * num) % eq.deckSize
    }
  },
  'deal into new stack': function dealIntoNewStack(eq: Equation): Equation {
    const { b, deckSize } = eq;
    return {
      ...eq,
      m: (eq.m * -1 + deckSize) % deckSize, // Ensure m stays within bounds
      b: ((deckSize - 1 - b) + deckSize) % deckSize, // Adjust b for modular arithmetic
    };
  },
  'cut': (eq, num) => {
    return {
      ...eq,
      b: (eq.b - num + eq.deckSize) % eq.deckSize
    }
  }
}

// Modular multiplicative inverse function
// Thanks chatGPT
function modInverse(a: number, mod: number): number {
  let m0 = mod, x0 = 0, x1 = 1;

  if (mod === 1) return 0;

  while (a > 1) {
    const q = Math.floor(a / mod);
    [a, mod] = [mod, a % mod];
    [x0, x1] = [x1 - q * x0, x0];
  }

  return x1 < 0 ? x1 + m0 : x1;
}

// Function to print the deck
// Thanks chatGPT
function printDeck(eq: Equation): number[] {
  const { m, b, deckSize } = eq;
  const incrementInverse = modInverse(m, deckSize); // Modular inverse of the multiplier
  const deck: number[] = Array.from({ length: deckSize }, (_, newIndex) => {
    // Reverse mapping: calculate original index
    return (incrementInverse * (newIndex - b + deckSize)) % deckSize;
  });

  return deck;
}

// Equations should look something like this
// ValueAtIndex = ((m * index) + b) % deckSize
type Equation = { m: number, b: number, deckSize: number }

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)

const deckSize = process.argv[2].includes('example') ? 10 : 10007
const initEq = { m: 1, b: 0, deckSize: 10 }

const shuffledCards = shuffleOrder.reduce((cards, shuffleType) => {
  const [ _, type, num ] = shuffleType.match(/^(.*?)(?: (-?\d+))?$/)!
  // console.log(shuffleTypes[type](cards, Number(num)))
  return shuffleTypes[type](cards, Number(num))
}, generateDeck(deckSize))

const buildEq = shuffleOrder.reduce((eq, shuffleType) => {
  const [ _, type, num ] = shuffleType.match(/^(.*?)(?: (-?\d+))?$/)!
  // console.log(shuffleTypes[type](cards, Number(num)))
  return shuffleWithMath[type](eq , Number(num))
}, initEq)

const doubler = shuffleOrder.reduce((outputs, shuffleType) => {
  const [ _, type, num ] = shuffleType.match(/^(.*?)(?: (-?\d+))?$/)!
  console.log('OLD EQ', outputs.eq)
  const deck = shuffleTypes[type](outputs.deck, Number(num))
  const nextEq = shuffleWithMath[type](outputs.eq, Number(num))
  const eq = {
    ...nextEq,
    m: nextEq.m % nextEq.deckSize,
    b: nextEq.b % nextEq.deckSize,
  }
  console.log(shuffleType)
  console.log(deck)
  console.log(printDeck(eq))
  return { deck, eq }
}, { deck: generateDeck(deckSize), eq: initEq })

const part1 = shuffledCards.findIndex(num => num === 2019)
console.log(part1, [ 5169 ].includes(part1))

// console.log('TESTING')
// console.log(printDeck(buildEq))
// const testDeck = generateDeck(10)
// console.log(shuffleTypes['deal with increment'](testDeck, 3))

// // TEST INCREMENT
// const newEq = shuffleWithMath['deal with increment'](initEq, 3)
// console.log(newEq)
// console.log(printDeck(newEq))
// 
// // TEST REVERSAL
// const newEq2 = shuffleWithMath['deal into new stack'](initEq, 3)
// console.log(newEq2)
// console.log(printDeck(newEq2))
// 
// // TEST CUT
// const newEq3 = shuffleWithMath['cut'](initEq, 3)
// console.log(newEq3)
// console.log(printDeck(newEq3))

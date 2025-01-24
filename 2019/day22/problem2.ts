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

// const deshufflers = {
//   'deal with increment': () => {},
//   'deal into new stack': () => {},
//   'cut': () => {}
// }

// first we need to track a single index through the entire shuffling process
//  
// remember the result of each shuffle, try to find a cycle
// then do some LCM math to figure out where we will be at for the total shuffle count
//
// Apparently this wont work
// fancy math is required to solve this problem in a reasonable amount of time
function deshuffle(shuffleTypes: string[], deck: number[], i: number) {

}

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)

const deckSize = process.argv[2].includes('example') ? 10 : 10007

const shuffledCards = shuffleOrder.reduce((cards, shuffleType) => {
  const [ _, type, num ] = shuffleType.match(/^(.*?)(?: (-?\d+))?$/)!
  console.log(shuffleTypes[type](cards, Number(num)))
  return shuffleTypes[type](cards, Number(num))
}, generateDeck(deckSize))

const part1 = shuffledCards.findIndex(num => num === 2019)
console.log(part1, [ 5169 ].includes(part1))

// console.log('TESTING')
// const testDeck = generateDeck(10)
// console.log(testDeck)
// console.log(shuffleTypes['deal with increment'](testDeck, 3))

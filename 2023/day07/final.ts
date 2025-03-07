// Hands by value
// 5x1 (all cards have same value, i.e. 5xK)
// 4x1
// Full House (3x1 and 2x1 of different values)
// 3x1
// 2x2 (two pair) 
// 2x1 (one pair)
// Highest value card (no matching cards)
//
// If two hands have the same value
// Compare first card of hand1 to first card of hand2
// do this until cards do not have matching value
// hand with the higher value at whatever position is the "better" hand

const start = Bun.nanoseconds()

// When these functions are run in order
// the first function to return true 
// indicates the best possible hand
const types = [
  // 0 = 5x1
  (handVal: number[], jokerCount: number) => {
    if (jokerCount === 5) return true;
    return handVal.includes(5 - jokerCount)
  },
  // 1 = 4x1
  (handVal: number[], jokerCount: number) => {
    return handVal.includes(4 - jokerCount)
  },
  // 2 = FullHouse
  (handVal: number[], jokerCount: number) => {
    if (!jokerCount) {
      return handVal.includes(3) && handVal.includes(2)
    }
    if (jokerCount === 1) {
      return handVal.filter(count => count === 2).length === 2
    }
    if (jokerCount === 2) {
      return handVal.includes(2)
    }
  },
  // 3 = 3x1
  (handVal: number[], jokerCount: number) => {
    return handVal.includes(3 - jokerCount)
  },
  // 4 = 2x2
  (handVal: number[], jokerCount: number) => {
    if (jokerCount === 1 && handVal.includes(2)) return true
    return handVal.filter(count => count === 2).length === 2
  },
  // 5 = 2x1
  (handVal: number[], jokerCount: number) => {
    return handVal.includes(2 - jokerCount)
  },
  // If it's none of the other cases, it has to be a highcard
  () => true,
]

// Higher index indicates higher "value"
const cards = [
  '2', '3', '4', '5', '6', '7',
  '8', '9', 'T', 'J', 'Q', 'K', 'A',
]

const part2 = true;
const orderedCards = !part2 ? cards :
  // Move 'J' to lowest value position, keep all other cards in original order
  ['J']
  .concat(cards.slice(0, cards.indexOf('J')))
  .concat(cards.slice(cards.indexOf('J')))

const answer = (
  // (await Bun.file('./example.txt').text())
  (await Bun.file('./inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => {
    const [hand, bid] = line.split(/\s+/)
    const handVals = hand.split('').reduce((values, char) => {
      values[char] ? values[char]++ : values[char] = 1;
      return values;
    }, {} as { [key: string]: number })

    return {
      hand,
      bid,
      bestType: types.findIndex(checkFunc => {
        return checkFunc(
          Object.values({ ...handVals, J: (part2 ? 0 : handVals['J']) }),
          part2 ? handVals['J'] || 0 : 0
        )
      })
    }
  })
  .sort((hand1, hand2) => {
    if (hand1.bestType !== hand2.bestType) {
      return hand1.bestType > hand2.bestType ? -1 : 1;
    }
    // Hands are never identical so we dont need to worry about this returning -1
    const index = hand1.hand.split('').findIndex((card, i) => card !== hand2.hand[i])
    return orderedCards.indexOf(hand1.hand[index]) < orderedCards.indexOf(hand2.hand[index]) ? -1 : 1;
  })
  .reduce((total, hand, i) => total += Number(hand.bid) * (i + 1), 0)
)

console.log(answer)
console.log([6440, 247815719, 5905, 248747492].includes(answer))

const end = Bun.nanoseconds();
console.log('Total Time:', (end - start) / 10**9, 'seconds')

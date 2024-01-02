// THE ANSWER:
// 248747492
const start = Date.now();

interface Hand {
  hand: string,
  bid: string,
  bestType: number,
};

interface HandVal {
  [key: string]: number
};

// EXAMPLE DATA
//
// 32T3K 765
// T55J5 684
// KK677 28
// KTJJT 220
// QQQJA 483
//
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

// When these functions are run (in order)
// The first function to return true indicates the best possible hand
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
      let counter = 0;
      handVal.forEach(n => {
        if (n === 2) counter++
      })
      return counter === 2
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
    let counter = 0;
    for (let i = 0; i < handVal.length; i++) {
      if (handVal[i] === 2) counter++;
      if (counter === 2) break;
    }
    return counter === 2
  },
  // 5 = 2x1
  (handVal: number[], jokerCount: number) => {
    return handVal.includes(2 - jokerCount)
  },
]

// Higher index indicates higher "value"
const cards = [
  'J', '2', '3', '4', '5', '6', '7',
  '8', '9', 'T', 'Q', 'K', 'A',
]

function compareHands(hand1: Hand, hand2: Hand) {
  if (hand1.bestType !== hand2.bestType) {
    // return hand1.bestType > hand2.bestType;
    return hand1.bestType > hand2.bestType ? -1 : 1;
  }
  for (let i = 0; i < hand1.hand.length; i++) {
    if (hand1.hand[i] !== hand2.hand[i]) {
      // return cards.indexOf(hand1.hand[i]) < cards.indexOf(hand2.hand[i])
      return cards.indexOf(hand1.hand[i]) < cards.indexOf(hand2.hand[i]) ? -1 : 1;
    }
  }

  // Theoretically we can only reach this point if the cards are identical
  // If cards are identical, they must have the same bid too
  // Since the answer is dependent on the sorted order,
  // I would bet AoC checks to make sure no two hands are identical
  // It is possible to have two identical hands, but the bids would need to be identical too
  // return true
  return 0
}

function getHandVal(hand: string) {
  const values: HandVal = {};
  for (let i = 0; i < hand.length; i++) {
    values[hand[i]] ? values[hand[i]]++ : values[hand[i]] = 1;
  }
  return values;
}

function getHandType(handStr: string) {
  const hand = getHandVal(handStr);
  for (const key in types) {
    if (types[key](Object.values({ ...hand, J: 0 }), hand['J'] ? hand['J'] : 0)) {
      return Number(key)
    }
  }
  return types.length
}

// const fileContent = await Bun.file('./example.txt').text();
const fileContent = await Bun.file('./inputs.txt').text();
const lines = fileContent.split(/\n/).filter(line => line)
const allHands = lines.map((e: string, i: number) => {
  const [hand, bid] = lines[i].split(/\s+/)
  const bestType = getHandType(hand)
  return { hand, bid, bestType }
})

// WORKING
// let sorting = true;
// let counter = 1;
// while (sorting) {
//   sorting = false;
//   for (let i = 0; i < allHands.length - counter; i++) {
//     if (!compareHands(allHands[i], allHands[i + 1])) {
//       [allHands[i], allHands[i + 1]] = [allHands[i + 1], allHands[i]]
//       sorting = true
//     }
//   }
//   counter++
// }

let total = 0;
allHands.sort((a, b) => compareHands(a, b))
  .forEach((e: Hand, i) => total += Number(e.bid)*(i + 1))

// allHands.sort((a, b) => compareHands(a, b))
//   .reduce((total, e, i, arr) => {
//     if (i === 1) return total + Number(arr[0].bid) + (Number(e.bid)*2)
//     return total + (Number(e.bid)*(i + 1));
//   }, 0)

console.log('THE ANSWER: ', total)
console.log('ANSWER IS CORRECT: ', total === 248747492)

const end = Date.now()
console.log('TOTAL TIME: ', end - start)
// 1881ms
// DOWN TO
// 36ms
// 9ms


interface Hand {
  hand: string,
  bid: string,
}

// EXAMPLE DATA
//
// 32T3K 765
// T55J5 684
// KK677 28
// KTJJT 220
// QQQJA 483

// const fileContent = await Bun.file('./example.txt').text();
const fileContent = await Bun.file('./inputs.txt').text();
// console.log(fileContent)
const lines = fileContent.split(/\n/).filter(line => line)
// console.log(lines)
const allHands = lines.map((e: string, i: number) => {
  const [hand, bid] = lines[i].split(/\s+/)
  return { hand, bid }
})

// Order array by strength of hand
// Multiply each bid by rank and sum all

// Higher index indicates higher "value"
const cards = [
  '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'T', 'J', 'Q', 'K', 'A',
]

// Hands by value
// 5x1 (all cards have same value, i.e. 5xK)
// 4x1
// Full House (3x1 and 2x1 of different values)
// 3x1
// 2x2 (two pair) 
// 2x1 (one pair)
// Highest value card (no matching cards)
//
// If cards two hands have the same value
// Compare first card of hand1 to first card of hand2
// do this until cards do not have matching value
// hand with the higher value at whatever position is the "better" hand
// const types: { [key: string]: Function } = {
//   7: (handVal: number[]) => handVal.includes(5),
//   6: (handVal: number[]) => handVal.includes(4),
//   5: (handVal: number[]) => handVal.includes(3) && handVal.includes(2),
//   4: (handVal: number[]) => handVal.includes(3),
//   3: (handVal: number[]) => {
//     let counter = 0;
//     for (let i = 0; i < handVal.length; i++) {
//       if (handVal[i] === 2) counter++;
//       if (counter === 2) break;
//     }
//     return counter === 2
//   },
//   2: (handVal: number[]) => handVal.includes(2),
//   // If it's none of the other cases, it has to be a highcard
//   1: (handVal: number[]) => true,
// }

const types = [
  // 0 = 5x1
  (handVal: number[]) => handVal.includes(5),
  // 1 = 4x1
  (handVal: number[]) => handVal.includes(4),
  // 2 = FullHouse
  (handVal: number[]) => handVal.includes(3) && handVal.includes(2),
  // 3 = 3x1
  (handVal: number[]) => handVal.includes(3),
  // 4 = 2x2
  (handVal: number[]) => {
    let counter = 0;
    for (let i = 0; i < handVal.length; i++) {
      if (handVal[i] === 2) counter++;
      if (counter === 2) break;
    }
    return counter === 2
  },
  // 5 = 2x1
  (handVal: number[]) => handVal.includes(2),
  // If it's none of the other cases, it has to be a highcard
  (handVal: number[]) => true,
]

const orderedHands = [];

// WEAKEST HAND GOES TO RANK 1
let sorting = true;
while (sorting) {
  sorting = false;
  // console.log(allHands)
  console.log('SORTING')
  for (let i = 0; i < allHands.length - 1; i++) {
    // console.log(allHands)
    // WORKING
    const result = compareHands(allHands[i], allHands[i + 1])
    // console.log(result)
    if (!result) {
      [allHands[i], allHands[i + 1]] = [allHands[i + 1], allHands[i]]
      sorting = true
    }

    // We just want to check one iteration for now
    // break;
    // console.log(allHands[i])
    // console.log(getHandType(getHandVal(allHands[i].hand)))
  }
  // sorting = false
  // console.log('AFTER SORTING')
  // console.log(allHands)
}

console.log('DO THE SUMMING')
let total = 0;
allHands.forEach((e: Hand, i) => {
  total += Number(e.bid)*(i + 1)
})
console.log('THE ANSWER: ', total)

// Repeat this until the array does not change
// return true or false,
// if right order, return true
// if wrong order, return false
// Then have the main function swap the positions
function compareHands(hand1: Hand, hand2: Hand) {
  // console.log(hand1, hand2)
  // console.log(getHandVal(hand1.hand))
  // console.log(getHandVal(hand2.hand))
  // VALUES DONT MATTER
  // 3xAce is not neccessarily better than 3x2
  // GET HAND TYPE, IF TYPES MATCH, THEN ITERATE FROM LEFT TO RIGHT
  // const hand1Val = getHandVal(hand1.hand)
  // const hand2Val = getHandVal(hand2.hand)
  // console.log(hand1Val)
  // console.log(getHandType(hand1Val))
  // GET BEST TYPE FROM VALUES
  const hand1Type = getHandType(getHandVal(hand1.hand))
  const hand2Type = getHandType(getHandVal(hand2.hand))
  if (hand2Type === undefined || hand1Type === undefined) console.log('YOURE FUCKED')
  if (hand1Type === hand2Type) {
    // console.log('MATCHING TYPES FOUND')
    // scroll each left to right and compare each card,
    // First card that is higher than the other determines best hand
    for (let i = 0; i < hand1.hand.length; i++) {
      if (hand1.hand[i] !== hand2.hand[i]) {
        const hand1CardVal = cards.indexOf(hand1.hand[i])
        const hand2CardVal = cards.indexOf(hand2.hand[i])
        return hand1CardVal < hand2CardVal
        // return hand2CardVal < hand1CardVal
      }
    }
  }
  // @ts-ignore
  // return hand1Type < hand2Type
  return hand1Type > hand2Type
}

interface HandVal { [key: string]: number };
function getHandVal(hand: string) {
  const values: HandVal = {};
  for (let i = 0; i < hand.length; i++) {
    if (values[hand[i]]) {
      values[hand[i]]++
    } else {
      values[hand[i]] = 1
    }
  }
  return values;
}

function getHandType(hand: HandVal) {
  const handValues = Object.values(hand)
  // console.log(types)
  for (const key in types) {
    // console.log('CHECKING ', key)
    const result = types[key](handValues)
    if (result) return key
  }
}

// function getHandStrength(hand: string) {
//   console.log(hand)
//   let value;
//   const strength = new Array(hand.length).fill(0)
//   console.log(strength)
//   for (let i = 0; i < hand.length; i++) {
//     // console.log(card)
//     for (const cardCompare of hand) {
//       if (cardCompare === hand[i]) {
//         strength += 1
//       }
//     }
//   }
// }

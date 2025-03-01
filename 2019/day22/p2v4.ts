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

function showDeckV2(deckSize: number, shuffles: string[]) {
  console.log(
    Array(deckSize).fill(0).map((_, i) => {
      return traceIndex(i, deckSize, shuffles)
    })
  )
}

// solve backwards
function traceIndex(index: number, deckSize: number, shuffles: string[]) {
  if (!shuffles.length) return index
  const shuffle = shuffles[0]
  if (shuffle.includes('increment')) {
    const [ inc ] = shuffle.match(/-?\d+/)?.map(Number) || []
    if (!inc) throw Error('no increment found')
    const inv = modInv(inc, deckSize)
    // console.log(inv)
    index = (inv * index) % deckSize
  } else if (shuffle.includes('new stack')) {
    index = deckSize - index - 1
  } else if (shuffle.includes('cut')) {
    const [ cut ] = shuffle.match(/-?\d+/)?.map(Number) || []
    if (!cut) throw Error('no increment found')
    index = (index + cut + deckSize) % deckSize
  }
  return traceIndex(index, deckSize, shuffles.slice(1))
}

const results: number[] = []
const resSet = new Set<number>()
let iterCount = 0
function deshuffleMultiple(
  index: number,
  deckSize: number,
  revShuffles: string[],
  shuffleCount: number,
  foundRepeat: boolean,
) {
  // console.log(shuffleCount)
  if (shuffleCount === 0) return index
  // console.log(`${foundRepeat} ${shuffleCount}`)
  // console.log(foundRepeat, index, `cycle: ${Math.floor(iterCount / results.length)}`)
  // console.write(`\r${foundRepeat}, cycle: ${Math.floor(iterCount / results.length)}, ${shuffleCount}`)
  console.write(`\r${foundRepeat}, ${shuffleCount}`)
  if (shuffleCount === 101741578825957) console.log('\ncycle start?')
  const cycleLen = findCycle(results.toReversed())
  if (cycleLen) {
    console.log('cycle len', cycleLen)
    throw Error('FOUND CYCLE')
  }
  // if (resSet.has(index)) {
  //   console.log(`result index ${results.findIndex(i => i === index)}`)
  //   throw Error('found repeat')
  // }
  // resSet.add(index)
  // if (!foundRepeat && results[0] === index) {
  //   console.log('found repeat')
  //   return deshuffleMultiple(
  //     index,
  //     deckSize,
  //     revShuffles,
  //     // shuffleCount % repeatDetector.size,
  //     shuffleCount,
  //     true
  //   )
  // }
  // if (foundRepeat) {
  //   if (results[iterCount % results.length] !== index) {
  //     throw Error('mismatch in cycle')
  //   }
  // }
  results.push(index)
  const newIndex = traceIndex(index, deckSize, revShuffles)
  iterCount++
  return deshuffleMultiple(
    newIndex,
    deckSize,
    revShuffles,
    shuffleCount - 1,
    foundRepeat
  )
}

// showDeckV2(10, [ 'increment 7' ])
// showDeckV2(10, [ 'new stack', 'new stack', 'new stack' ]) 
// showDeckV2(10, [ 'cut 3' ])
// showDeckV2(10, [ 'cut -4' ])
// showDeckV2(10, shuffleOrder.toReversed())

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)// .slice(0, 2)

// console.log(traceIndex(5169, 10007, shuffleOrder.toReversed()))

// const cardCount = 119315717514047
// // const deckSize = 119315717514047
// const shuffleCount = 101741582076661
// const targetIndex = 2020

// const firstIndex = traceIndex(targetIndex, cardCount, shuffleOrder.toReversed())
// console.log(firstIndex)
// const secondIndex = traceIndex(firstIndex, cardCount, shuffleOrder.toReversed())
// console.log(secondIndex)
// console.log('diff', firstIndex - secondIndex)
// const thirdIndex = traceIndex(secondIndex, cardCount, shuffleOrder.toReversed())
// console.log(thirdIndex)
// console.log('diff', secondIndex - thirdIndex)

const revShuffles = shuffleOrder.toReversed()
// let tempShuffleCount = shuffleCount
// let index = targetIndex
// const testSet = new Set<number>()
// let iterCount = 0;
// while (tempShuffleCount > 0) {
//   console.log(tempShuffleCount)
//   const newIndex = traceIndex(index, cardCount, revShuffles)
//   // const diff = newIndex - index
//   // console.log('diff', diff)
//   const diff = index
//   if (testSet.has(diff)) break
//   if (newIndex === 74258074061935) throw Error('thats the answer')
//   testSet.add(diff)
//   index = newIndex
//   tempShuffleCount--
//   iterCount++
// } 
// 
// console.log(iterCount)
// console.log(shuffleCount % iterCount)
// 
// let neededShuffles = 1557973
// let answer = 2020
// while (neededShuffles > 0) {
//   console.log(neededShuffles)
//   answer = traceIndex(answer, cardCount, revShuffles)
//   neededShuffles--
// } 
// console.log(answer)

// part1
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

// const shuffleOrder = (
//   (await Bun.file(process.argv[2]).text())
//   .split(/\n/)
//   .filter(Boolean)
// )

// const deckSize = process.argv[2].includes('example') ? 10 : 10007

function getShuffledDeck(cards: number[], shuffles: string[]) {
  return shuffleOrder.reduce((cards, shuffleType) => {
    const [ _, type, num ] = shuffleType.match(/^(.*?)(?: (-?\d+))?$/)!
    return shuffleTypes[type](cards, Number(num))
  }, cards)
}

function shuffleMultiple(
  cards: number[],
  shuffleOrder: string[],
  shuffleCount: number,
  target: number
) {
  if (shuffleCount === 0) return cards[target]
  return shuffleMultiple(
    getShuffledDeck(cards, shuffleOrder),
    shuffleOrder,
    shuffleCount - 1,
    target,
  )
}

let cacheStart = 0
// const deckSize = 10
// const shuffleCount = 100
// const targetIndex = 8

// const deckSize = 10007
// const shuffleCount = 1000
// const targetIndex = 2019

const deckSize = 119315717514047
const shuffleCount = 101741582076661
const targetIndex = 2020
// // const shuffleCount = 1
// 
// const working = shuffleMultiple(generateDeck(deckSize), shuffleOrder, shuffleCount, targetIndex)
// console.log('working done')
const testing = deshuffleMultiple(targetIndex, deckSize, revShuffles, shuffleCount, false)
// console.log('testing done')
// console.log(working)
console.log(testing)

// function findCycle(arr: number[], index = cacheStart, offSet = 1) {
//   // console.log(arr, index, offSet, arr[index], arr[index + offSet])
//   if (index === offSet) return offSet
//   if (offSet > Math.floor(arr.length / 2)) {
//     cacheStart = offSet - 1
//     return false
//   }
//   if (arr[index] !== arr[index + offSet]) return findCycle(arr, 0, offSet + 1)
//   return findCycle(
//     arr,
//     index + 1,
//     offSet
//   )
// }
// console.log(findCycle([1,2,3,1,2,3]))

// test on example, set shuffle count to a number where we can find a repeat with deshuffle

// const indexOne = traceIndex(69, deckSize, revShuffles)
// // console.log(indexOne)
// const indexTwo = traceIndex(indexOne, deckSize, revShuffles)
// const indexThree = traceIndex(indexTwo, deckSize, revShuffles)
// console.log(indexThree)

// const part1 = shuffledCards.findIndex(num => num === 2019)
// console.log(part1, [ 5169 ].includes(part1))

function matchLength(arr: number[], length: number, i = 0) {
  if (i === length) return true;
  if (arr[arr.length - i - 1] !== arr[arr.length - (length + i) - 1]) return false;
  return matchLength(arr, length, i + 1);
}

function findCycle(vels: number[], length = 1): number | undefined {
  if (length > Math.floor(vels.length / 2)) return;
  const foundCycle = matchLength(vels, length);
  if (foundCycle) return length;
  return findCycle(vels, length + 1);
}

// console.log(findCycle([9,1,2,3,1,2,3]))

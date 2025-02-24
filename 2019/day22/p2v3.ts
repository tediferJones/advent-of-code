type Eq = { a: number, b: number, deckSize: number }

// we want to shuffle some number of time and be able to determine the card at a given index

const shuffleTypes: Record<string, (eq: Eq) => Eq> = {
  'new stack': (eq) => {
    return {
      a: eq.a * -1,
      b: eq.b + eq.deckSize,
      deckSize: eq.deckSize
    }
  }
}

function shuffle(
  cardCount: number,
  shuffleCount: number,
  targetIndex: number,
  shuffleOrder: string[],
) {
  // a = slope
  // b = offset (i.e. y intercept)
  const eq: Eq = { a: 1, b: 0, deckSize: cardCount }
  const finalEq = shuffleOrder.reduce((eq, shuffleStr) => {
    return shuffleTypes[shuffleStr](eq)
  }, eq)
  console.log(finalEq)
  return (finalEq.a * targetIndex) + finalEq.b
}

// const shuffleOrder = (
//   (await Bun.file(process.argv[2]).text())
//   .split(/\n/)
//   .filter(Boolean)
// )
// 
// const cardCount = 119315717514047
// const shuffleCount = 101741582076661
// const targetIndex = 2020

const cardCount = 9
const shuffleCount = 1
const targetIndex = 10
const shuffleOrder = [ 'new stack' ]
console.log(shuffle(cardCount, shuffleCount, targetIndex, shuffleOrder))

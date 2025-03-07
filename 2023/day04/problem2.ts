const fileContent = await Bun.file('./inputs.txt').text()
// const fileContent = await Bun.file('./example.txt').text()

// Split into an array of lines, and remove blank lines
const data = fileContent.split('\n').filter((line: string) => line)
// console.log(data)

// EXAMPLE DATA
// Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
// Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
// Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
// Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
// Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
// Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
//

function splitIntoArrOfNums(str: string) {
  return str.trim().split(/\ +/)
    .map((num: string) => Number(num));
}

// If we find a card with 3 winners, copy the next 3 cards
// process all "winners" and print the total number of scratch cards
// i.e. the original plus all winners
// THIS SEEMS LIKE A FUCKING MARKOV CHAIN WHAT THE FUCK

// Should probably use a map but that sounds like more work
const winTracker: { [key: string]: number } = {}
const cardTracker: { [key: string]: { cardCount: number, winCount: number } } = {}

let total = 0;
for (const line of data) {
  const [card, winningNums] = line.split('|');
  const winningNumsArr = splitIntoArrOfNums(winningNums);
  const [cardName, cardNums] = card.split(':');
  const cardNumsArr = splitIntoArrOfNums(cardNums);
  const cardNum = cardName.slice(cardName.indexOf(' ') + 1);
  let winCounter = 0;
  console.log(cardNumsArr)
  console.log(winningNumsArr)
  for (const cardNum of cardNumsArr) {
    if (winningNumsArr.includes(cardNum)) {
      console.log('THATS A WINNER', cardNum)
      winCounter++
      // SOMEWHERE AROUND HERE WE NEED TO IMPLEMENT THE COPYING LOGIC
    }
  }
  if (winCounter) {
    // total += 2**(winCounter-1)
    winTracker[cardNum] = winCounter;
  }
  cardTracker[cardNum.trim()] = {
    cardCount: 1,
    winCount: winCounter
  }
  // For each line, each winning number doubles the amount of points
  // Once we have figured out all winners, sum the 'point' total
}

console.log(total)
console.log(winTracker)
console.log(cardTracker)

// WE NEED TO FIGURE OUT THE TOTAL NUMBER OF CARDS
for (const gameNum in cardTracker) {
  console.log('CHECKING GAME NUMBER: ', gameNum)
  console.log(cardTracker[gameNum])
  if (cardTracker[gameNum].winCount) {
    let counter = 1
    while (counter <= cardTracker[gameNum].winCount) {
      // cardTracker[(Number(gameNum) + counter).toString()].cardCount++
      cardTracker[(Number(gameNum) + counter).toString()].cardCount += cardTracker[gameNum].cardCount;
      counter++
    }
  }
}
console.log(cardTracker)
let cardTotal = 0;
for (const gameNum in cardTracker) {
  cardTotal += cardTracker[gameNum].cardCount
}
console.log(cardTotal)

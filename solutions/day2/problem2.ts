const fileContent = await Bun.file('./inputs.txt').text()
// Split into an array of lines, and remove blank lines
const lines = fileContent.split('\n').filter((line: string) => line)
console.log(lines)

const organizedData: {
  [key: string]: {
    [key: string]: string | number
  }[]
} = {}

for (const line of lines) {
  const [gameNum, gameData] = line.split(': ')
  // console.log(gameNum, gameData)

  const games = gameData.split('; ')
  console.log(games)
  const orgGameData = []

  for (const game of games) {
    const gameObj: { [key: string]: string } = {};
    const gameResults = game.split(', ')
    for (const gameResult of gameResults) {
      const [num, color] = gameResult.split(' ')
      gameObj[color] = num
    }
    orgGameData.push(gameObj);
  }
  organizedData[gameNum] = orgGameData;
}
console.log(organizedData)

// WE HAVE THE GAME DATA ORGANIZED, 
let total = 0;
for (const gameNum in organizedData) {
  let redMax, greenMax, blueMax;
  redMax = greenMax = blueMax = 0;
  console.log(organizedData[gameNum])
  for (const gameData of organizedData[gameNum]) {
    if (gameData.red && Number(gameData.red) > redMax) {
      redMax = Number(gameData.red);
    }
    if (gameData.green && Number(gameData.green) > greenMax) {
      greenMax = Number(gameData.green);
    }
    if (gameData.blue && Number(gameData.blue) > blueMax) {
      blueMax = Number(gameData.blue);
    }
  }
  console.log('red: ', redMax, 'green: ', greenMax, 'blue: ', blueMax)
  console.log('\'Power\' value', redMax*greenMax*blueMax)
  total += redMax*greenMax*blueMax;
}
console.log(total)

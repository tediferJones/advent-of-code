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
// NOW WE JUST NEED TO SUM THE GAME NUMS THAT ARE IMPOSSIBLE
// Test Case: 12 red, 13 green, 14 blue
// If any object contains more than 12 red, or 13 green, or 14 blue, add them to a total var
let total = 0;
for (const gameNum in organizedData) {
  const [theWordGame, actualNum] = gameNum.split(' ')
  let shouldBreak;
  for (const gameData of organizedData[gameNum]) {
    if (shouldBreak) break;
    // if (gameData.red && Number(gameData.red) > 12) {
    if (gameData.red && Number(gameData.red) > 12) {
      // total += Number(actualNum);
      shouldBreak = true;
      break;
    }
    if (gameData.green && Number(gameData.green) > 13) {
      // total += Number(actualNum);
      shouldBreak = true;
      break;
    }
    if (gameData.blue && Number(gameData.blue) > 14) {
      // total += Number(actualNum);
      shouldBreak = true;
      break;
    }
      console.log(gameNum, gameData)
    // total += Number(actualNum);
  }
  if (!shouldBreak) total += Number(actualNum)
}
console.log(total)

type Position = { x: number, y: number }

type Game = {
  a: Position,
  b: Position,
  prize: Position,
}

function getPrizeV2(game: Game) {
  // prizeX = aX*n1 + bX*n2
  // prizeY = aY*n1 + bX*n2
  const aCount = (((game.a.y * -1) * game.prize.x) + (game.a.x * game.prize.y)) / ((game.a.x * game.b.y) - (game.a.y * game.b.x))
  const bCount = (game.prize.x - (game.b.x * aCount)) / game.a.x
  if (aCount % 1 || bCount % 1) return
  if (aCount > 100 || bCount > 100) return
  return bCount * 3 + aCount
}

const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
  .reduce((total, game) => {
    const [ buttonA, buttonB, prizeLocation ] = game.split(/\n/).filter(Boolean)
    const [ adx, ady ] = buttonA.match(/(\d+)/g)!.map(Number)
    const [ bdx, bdy ] = buttonB.match(/(\d+)/g)!.map(Number)
    const [ px, py ] = prizeLocation.match(/(\d+)/g)!.map(Number)
    const gameData = { 
      a: { x: adx, y: ady }, 
      b: { x: bdx, y: bdy }, 
      prize: { x: px, y: py },
    }
    const result = getPrizeV2(gameData)
    if (!result) return total
    return total + result
  }, 0)
)
console.log(answer, [ 480, 32067 ].includes(answer))

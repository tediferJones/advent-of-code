type Game = {
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number,
}

function getPrize({ ax, ay, bx, by, px, py }: Game) {
  // See bottom of this file for how we derive these equations
  const aCount = ((py * bx) - (by * px)) / ((ay * bx) - (by * ax));
  const bCount = (px - (ax * aCount)) / bx;
  return (aCount % 1 || bCount % 1) ? 0 : aCount * 3 + bCount;
}

const part2Step = 10000000000000;
const { part1, part2 } = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
  .reduce((answer, game) => {
    const [ ax, ay, bx, by, px, py ] = game.match(/(\d+)/g)!.map(Number);
    const gameData = { ax, ay, bx, by, px, py };
    answer.part1 += getPrize(gameData);
    gameData.px += part2Step;
    gameData.py += part2Step;
    answer.part2 += getPrize(gameData);
    return answer;
  }, { part1: 0, part2: 0 })
);

console.log(part1, [ 480, 32067 ].includes(part1));
console.log(part2, [ 92871736253789 ].includes(part2));

// ANSWER PART 1: 32067
// ANSWER PART 2: 92871736253789

// HOW TO GET EQUATIONS FOR getPrize()
// prizeX = aX*aCount + bX*bCount
// prizeY = aY*aCount + bY*bCount
//
// prizeX - aX*aCount = bX*bCount
// bCount = (prizeX - aX*aCount) / bX
//
// prizeY = aY*aCount + bY((prizeX - aX*aCount) / bX)
// prizeY = aY*aCount + (bY(prizeX - aX*aCount)) / bx
// prizeY = aY*aCount + ((bY*prizeX - bY*aX*aCount) / bx)
// prizeY - aY*aCount = ((bY*prizeX - bY*aX*aCount) / bx)
// (prizeY - aY*aCount)*bX = bY*prizeX - bY*aX*aCount
// prizeY*bX - aY*aCount*bX = bY*prizeX - bY*aX*aCount
// prizeY*bX = aY*aCount*bx + bY*prizeX - bY*aX*aCount
// prizeY*bX - bY*prizeX = aY*aCount*bX - bY*aX*aCount
// prizeY*bX - bY*prizeX = aCount*(aY*bX - bY*aX)
// (prizeY*bX - bY*prizeX) / (aY*bX - bY*aX) = aCount
// aCount = (prizeY*bX - bY*prizeX) / (aY*bX - bY*aX)

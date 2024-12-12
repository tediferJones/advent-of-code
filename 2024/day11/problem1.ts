function blink(stones: number[]) {
  return stones.reduce((newStones, stone) => {
    if (stone === 0) {
      return newStones.concat(1)
    } else if (stone.toString().length % 2 === 0) {
      const strStone = stone.toString()
      const middle = Math.floor(strStone.length / 2)
      return newStones.concat(
        Number(strStone.slice(0, middle)),
        Number(strStone.slice(middle))
      )
    } else {
      return newStones.concat(stone * 2024)
    }
  }, [] as number[])
}

function blinkCount(stones: number[], count: number) {
  return Array(count).fill(0).reduce((stones, _, i) => {
    console.log(i, stones.length, `${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
    return blink(stones)
  }, stones).length
}

const startTime = Bun.nanoseconds()
const stones = (
  (await Bun.file(process.argv[2]).text())
  .split(/\s+/)
  .filter(Boolean)
  .map(Number)
)

const answerPart1 = blinkCount(stones, 25);
console.log(answerPart1, [ 55312, 199753 ].includes(answerPart1))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

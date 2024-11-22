type Position = { x: number, y: number, z: number }

type Hail = {
  vel: Position,
  pos: Position,
  id: number,
}

function getDiff(a: Position, b: Position, step = 1) {
  // console.log('diffing', a, b)
  return {
    x: (b.x - a.x) / step,
    y: (b.y - a.y) / step,
    z: (b.z - a.z) / step,
  }
}

function distanceBetweenPoints(a: Position, b: Position) {
  return ((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)**0.5
}

function isConvergent(rock: Hail, stone: Hail, time: number) {
  // given a position and direction, see if the stone is converging or diverging
  // Our hope is that there is only one path where all points converge
  // But we will still have to check all stones at all possible time combinations

  const firstDistance = distanceBetweenPoints(posAtTime(rock, time), posAtTime(stone, time))
  const secondDistance = distanceBetweenPoints(posAtTime(rock, time + 1), posAtTime(stone, time + 1))
  return firstDistance > secondDistance
}

function posAtTime(stone: Hail, time: number) {
  return {
    x: stone.pos.x + stone.vel.x * time,
    y: stone.pos.y + stone.vel.y * time,
    z: stone.pos.z + stone.vel.z * time,
  }
}

function allConverge(rock: Hail, used: number[], time: number) {
  return hailStones.filter(stone => !used.includes(stone.id)).every(stone => {
    console.log(stone.id, isConvergent(rock, stone, time))
    return isConvergent(rock, stone, time)
  })
}

const fileContents = await Bun.file('example.txt').text();
// const fileContents = await Bun.file('inputs.txt').text()

const hailStones = fileContents
.split(/\n/)
.filter(line => line)
.map<Hail>((line, i) => {
  const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
  const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
  return {
    pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    id: i,
  }
})

const timeSpan = hailStones.length;

// hailStones.some(hail1 => {
//   return hailStones.some(hail2 => {
//     if (hail1 === hail2) return
// 
//     for (let time1 = 1; time1 <= timeSpan; time1++) {
//       for (let time2 = time1 + 1; time2 <= timeSpan; time2++) {
//         const diff = getDiff(
//           posAtTime(hail1, time1),
//           posAtTime(hail2, time2),
//           time2 - time1
//         )
//         const rock = {
//           vel: diff,
//           pos: posAtTime(hail2, time2),
//           id: NaN,
//         }
//         console.log(
//           'stone1', hail1.id,
//           'stone2', hail2.id,
//           'time1', time1,
//           'time2', time2,
//         )
//         const result = allConverge(rock, [ hail1.id, hail2.id ], time2 + 1)
//         if (result) {
//           throw Error('is this what winning looks like?')
//         }
//       }
//     }
//     timeSpan + 1
//   })
// })

// This should output true (assuming the input is correct)
console.log(
  allConverge(
    {
      vel: getDiff(
        posAtTime(hailStones[4], 1),
        posAtTime(hailStones[1], 3),
        3 - 1
      ),
      pos: posAtTime(hailStones[1], 3),
      id: NaN
    },
    [ 4, 1 ],
    4
  )
)

// input format: px py pz @ vx vy vz

type Hail = {
  pos: {
    x: number,
    y: number,
    z: number,
  },
  vel: {
    x: number,
    y: number,
    z: number,
  },
  m: number,
  b: number,
}

function getIntersection(a: Hail, b: Hail) {
  if (a.m === b.m) return
  const x = (b.b - a.b) / (a.m - b.m)
  const y = a.m * x + a.b
  return { x, y }
}

function printHail(hail: Hail) {
  return `${hail.pos.x}, ${hail.pos.y}, ${hail.pos.z} @ ${hail.vel.x}, ${hail.vel.y}, ${hail.vel.z}`
}

const isInPast: ((hail: Hail, int: { x: number, y: number }) => boolean)[] = [
  (hail, int) => hail.vel.x < 0 && int.x > hail.pos.x,
  (hail, int) => hail.vel.x > 0 && int.x < hail.pos.x,
  (hail, int) => hail.vel.y < 0 && int.y > hail.pos.y,
  (hail, int) => hail.vel.y > 0 && int.y < hail.pos.y,
]

function withinBoundsInc(min: number, val: number, max: number) {
  return min <= val && val <= max
}

function testPast(hail: Hail, int: { x: number, y: number }) {
  return isInPast.some(func => func(hail, int))
}

const config = { fileName: 'inputs.txt', min: 200000000000000, max: 400000000000000 }
// const config = { fileName: 'example.txt', min: 7, max: 27 }

const fileContents = await Bun.file(config.fileName).text()

const answer = fileContents
.split(/\n/)
.filter(line => line)
.map<Hail>(line => {
  const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
  const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
  const m = vy / vx
  const b = py - m * px
  return {
    pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    m,
    b,
  }
}).reduce((total1, hail1, i, arr) => {
  return total1 + arr.slice(i).reduce((total2, hail2) => {
    const int = getIntersection(hail1, hail2);
    if (int) {
      const { x, y } = int;
      if (withinBoundsInc(config.min, x, config.max) && withinBoundsInc(config.min, y, config.max)) {
        if (!testPast(hail1, int) && !testPast(hail2, int)) {
          return total2 + 1
        }
      }
    }
    return total2
  }, 0)
}, 0)
console.log(answer, answer === 16172)

// let count = 0;
// test.forEach((hail1, i) => {
//   test.slice(i).forEach(hail2 => {
//     const int = getIntersection(hail1, hail2);
//     if (!int) return;
//     const { x, y } = int;
//     if (withinBoundsInc(config.min, x, config.max) && withinBoundsInc(config.min, y, config.max)) {
//       if (testPast(hail1, int) || testPast(hail2, int)) return
//       count++
//       // console.log(
//       //   'intersect within window\n',
//       //   printHail(hail1),
//       //   '\n',
//       //   printHail(hail2),
//       //   '\n',
//       //   `intersects at (${x}, ${y})`
//       // )
//     }
//   })
// })
// console.log('success', count)

// ANSWER PART 1: 16172

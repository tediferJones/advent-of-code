type Coor3D = { x: number, y: number, z: number }
type Moon = { pos: Coor3D, vel: Coor3D }

function timeStep(moons: Moon[]) {
  const moonsCopy: Moon[] = JSON.parse(JSON.stringify(moons))

  const afterGravity = moons.map((moon, i) => {
    const otherMoons = moonsCopy.toSpliced(i, 1)
    otherMoons.forEach(otherMoon => {
      if (otherMoon.pos.x > moon.pos.x) moon.vel.x += 1
      if (otherMoon.pos.x < moon.pos.x) moon.vel.x -= 1
      if (otherMoon.pos.y > moon.pos.y) moon.vel.y += 1
      if (otherMoon.pos.y < moon.pos.y) moon.vel.y -= 1
      if (otherMoon.pos.z > moon.pos.z) moon.vel.z += 1
      if (otherMoon.pos.z < moon.pos.z) moon.vel.z -= 1
    })
    return moon
  })

  const afterVelocity = afterGravity.map((moon, i) => {
    moon.pos.x += moon.vel.x
    moon.pos.y += moon.vel.y
    moon.pos.z += moon.vel.z
  })
}

function passTime(moons: Moon[], maxCount: number, count = 0) {
  if (count >= maxCount) return moons
  timeStep(moons)
  return passTime(moons, maxCount, count + 1)
}

function calcEnergy(moons: Moon[]) {
  return moons.reduce((total, moon) => {
    return total + (Math.abs(moon.pos.x) + Math.abs(moon.pos.y) + Math.abs(moon.pos.z)) * (Math.abs(moon.vel.x) + Math.abs(moon.vel.y) + Math.abs(moon.vel.z))
  }, 0)
}

const moons = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ x, y, z ] = line.match(/(-?\d+)/g)!.map(Number)
    return {
      pos: { x, y, z },
      vel: { x: 0, y: 0, z: 0 }
    }
  })
)

const step = {
  'example.txt': 10,
  'example2.txt': 100,
  'inputs.txt': 1000,
}[process.argv[2]]
if (!step) throw Error('could not determine step size for given file')

passTime(moons, step)
const part1 = calcEnergy(moons)
console.log(part1, [ 179, 1940, 7471 ].includes(part1))

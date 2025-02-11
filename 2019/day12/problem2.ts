type Axes = 'x' | 'y' | 'z'
type Coor3D = { [key in Axes]: number }
type CoorType = 'pos' | 'vel'
type Moon = { [key in CoorType]: Coor3D }
type Tracker = { [key in Axes]: number[] }

const axes = [ 'x', 'y', 'z' ] as Axes[];

function timeStep(moons: Moon[]) {
  moons.forEach((moon, i) => {
    moons.toSpliced(i, 1).forEach(otherMoon => {
      if (otherMoon.pos.x > moon.pos.x) moon.vel.x += 1;
      if (otherMoon.pos.x < moon.pos.x) moon.vel.x -= 1;
      if (otherMoon.pos.y > moon.pos.y) moon.vel.y += 1;
      if (otherMoon.pos.y < moon.pos.y) moon.vel.y -= 1;
      if (otherMoon.pos.z > moon.pos.z) moon.vel.z += 1;
      if (otherMoon.pos.z < moon.pos.z) moon.vel.z -= 1;
    });
  });

  moons.forEach(moon => {
    moon.pos.x += moon.vel.x;
    moon.pos.y += moon.vel.y;
    moon.pos.z += moon.vel.z;
  });

  moons.forEach((moon, i) => {
    trackers[i].x.push(moon.vel.x);
    trackers[i].y.push(moon.vel.y);
    trackers[i].z.push(moon.vel.z);
  });
}

function passTime(moons: Moon[], maxCount: number, count = 0) {
  if (count >= maxCount) return moons;
  timeStep(moons);
  return passTime(moons, maxCount, count + 1);
}

function calcEnergy(moons: Moon[]) {
  const types: CoorType[] = [ 'pos', 'vel' ];
  return moons.reduce((total, moon) => {
    return total + types.reduce((energy, key) => {
      return energy * axes.reduce((total, axis) => {
        return total + Math.abs(moon[key][axis]);
      }, 0);
    }, 1);
  }, 0);
}

function matchLength(arr: number[], length: number, i = 0) {
  if (i === length) return true;
  if (arr[i] !== arr[length + i]) return false;
  return matchLength(arr, length, i + 1);
}

function findCycle(vels: number[], length = 1): number | undefined {
  if (length > Math.floor(vels.length / 2)) return;
  const foundCycle = matchLength(vels, length);
  if (foundCycle) return length;
  return findCycle(vels, length + 1);
}

function gcf(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  return b === 0 ? a : gcf(b, a % b);
}

function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcf(a, b);
}

function lcmMultiple(arr: number[]) {
  return arr.reduce((currGcf, num) => lcm(currGcf, num));
}

function getCycleLengths(tracker: Tracker, i = 0, cycles: number[] = []) {
  if (i === axes.length) return cycles;
  const cycle = findCycle(tracker[axes[i]]);
  if (!cycle) return;
  return getCycleLengths(tracker, i + 1, cycles.concat(cycle));
}

function superDuperLcmV2(trackers: Tracker[], i = 0, lcms: number[] = []) {
  if (i === trackers.length) return lcmMultiple(lcms);
  const hasCycle = getCycleLengths(trackers[i]);
  if (!hasCycle) return;
  return superDuperLcmV2(trackers, i + 1, lcms.concat(hasCycle));
}

function solvePart2(moons: Moon[], trackers: Tracker[]) {
  const answer = superDuperLcmV2(trackers);
  if (answer) return answer;
  passTime(moons, trackers[0].x.length);
  return solvePart2(moons, trackers);
}

const startTime = Bun.nanoseconds();
const moons = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ x, y, z ] = line.match(/(-?\d+)/g)!.map(Number);
    return {
      pos: { x, y, z },
      vel: { x: 0, y: 0, z: 0 }
    }
  })
);

const trackers: Tracker[] = moons.map(moon => {
  return {
    x: [ moon.vel.x ],
    y: [ moon.vel.y ],
    z: [ moon.vel.z ]
  }
});

const step = {
  'example.txt': 10,
  'example2.txt': 100,
  'inputs.txt': 1000,
}[process.argv[2]];
if (!step) throw Error('could not determine step size for given file');

passTime(moons, step);
const part1 = calcEnergy(moons);
console.log(part1, [ 179, 1940, 7471 ].includes(part1));

const part2 = solvePart2(moons, trackers)!;
console.log(part2, [ 2772, 4686774924, 376243355967784 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);

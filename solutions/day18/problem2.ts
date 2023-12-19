function getArea(coors: number[][]) {
  const length = coors.length;
  let area = 0;

  for (let i = 0; i < length; i++) {
    const j = (i + 1) % length;
    area += coors[i][0] * coors[j][1]
    area -= coors[j][0] * coors[i][1]
  }

  area = Math.abs(area) / 2;
  return area
}

const dirs: { [key: string]: number[] } = {
  U: [-1, 0],
  D: [1, 0],
  R: [0, 1],
  L: [0, -1]
}

const newDirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const lines = fileContent.split(/\n/).filter(line => line)

let perimeter = 0;
const positions: number[][] = [
  [0, 0]
];

lines.forEach(line => {
  const [dir, count, color] = line.split(/\s+/)
  const match = color.match(/\(#([\dabcdef]{5})([\dabcdef])\)/)
  console.log(match)
  if (!match) throw Error('FAILED TO FIND COLOR CODE')
  const stepCountV2 = parseInt(match[1], 16)
  console.log(stepCountV2)
  // const stepCount = Number(count)
  // const [dy, dx] = dirs[dir];
  const [dy, dx] = newDirs[Number(match[2])];
  const [prevY, prevX] = positions[positions.length - 1]
  // perimeter += stepCount
  perimeter += stepCountV2
  // positions.push([prevY + dy * stepCount, prevX + dx * stepCount])
  positions.push([prevY + dy * stepCountV2, prevX + dx * stepCountV2])
})

// Last position is a duplicate of start
positions.splice(positions.length - 1)

const answer = (getArea(positions) - (perimeter / 2) + 1) + perimeter;
console.log(answer);
// console.log(answer === 56923 || answer === 62)
console.log(answer === 952408144115 || answer === 66296566363189)

// ANSWER PART 1: 56923
// ANSWER PART 2: 66296566363189

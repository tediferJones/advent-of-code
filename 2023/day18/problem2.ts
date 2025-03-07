function getArea(coors: number[][]) {
  return Math.abs([...Array(coors.length).keys()].reduce((area, i) => {
    const j = (i + 1) % coors.length;
    return area + coors[i][0] * coors[j][1] - coors[j][0] * coors[i][1]
  }, 0)) / 2
}

const dirs: { [key: string]: number[] } = {
  R: [0, 1],
  D: [1, 0],
  L: [0, -1],
  U: [-1, 0],
}

// const { positions, perimeter } = (await Bun.file('example.txt').text())
const { positions, perimeter } = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((obj, line) => {
    const { positions, perimeter } = obj;
    const [dir, count, color] = line.split(/\s+/)
    const match = color.match(/\(#([\dabcdef]{5})([\dabcdef])\)/)
    if (!match) throw Error('FAILED TO FIND COLOR CODE')

    // Part 1
    // const stepCountV2 = Number(count);
    // const [dy, dx] = dirs[dir]

    // Part 2
    const stepCountV2 = parseInt(match[1], 16)
    const [dy, dx] = Object.values(dirs)[Number(match[2])];

    const [prevY, prevX] = positions[positions.length - 1]
    return {
      positions: [...positions, [prevY + dy * stepCountV2, prevX + dx * stepCountV2]],
      perimeter: perimeter + stepCountV2,
    }
  }, { positions: [[0, 0]], perimeter: 0 })

const answer = (getArea(positions.toSpliced(positions.length - 1)) - (perimeter / 2) + 1) + perimeter;
console.log(answer);
console.log([62, 56923, 952408144115, 66296566363189].includes(answer))

// ANSWER PART 1: 56923
// ANSWER PART 2: 66296566363189

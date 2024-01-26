interface PartNum {
  partNum: number,
  indices: string,
}

const surrounding = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function getWholeNum(data: string[][], row: number, col: number): PartNum {
  const startOffSet = data[row].slice(0, col).toReversed().join('').search(/[^\d]/);
  const endOffSet = data[row].slice(col).join('').search(/[^\d]/);
  const start = (startOffSet === -1 ? 0 : col - startOffSet);
  const end = (endOffSet === -1 ? data[row].length : col + endOffSet);
  return {
    partNum: Number(data[row].join('').slice(start, end)),
    indices: `${row},${start},${end}`,
  }
}

function getPartNums(data: string[][], row: number, col: number) {
  return surrounding.reduce((arr, [dy, dx]) => {
    const [newY, newX] = [row + dy, col + dx];
    if (data[newY][newX].match(/\d/)) {
      const partNum = getWholeNum(data, newY, newX)
      const used = arr.map(partNum => partNum.indices).includes(partNum.indices)
      if (!used) {
        return arr.concat(partNum);
      }
    }
    return arr
  }, [] as PartNum[])
}

const answer = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))
  .reduce((total, line, row, data) => {
    return total + line.reduce((lineTotal, char, col) => {
      // Part 1
      // return lineTotal + (
      //   char.match(/[\.\d]/) ? 0 :
      //     getPartNums(data, row, col)
      //     .reduce((total, partNum) => total + partNum.partNum, 0)
      // )

      // Part 2
      if (!char.match(/[\.\d]/)) {
        const partNums = getPartNums(data, row, col);
        if (partNums.length === 2) {
          return lineTotal + partNums.reduce((total, num) => total * num.partNum, 1)
        }
      }
      return lineTotal
    }, 0)
  }, 0)
)

console.log(answer)
console.log([4361, 544664, 467835, 84495585].includes(answer))

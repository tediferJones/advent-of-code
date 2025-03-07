function rotateArray(lines: string[]) {
  return [...Array(lines[0].length).keys()].map(i => {
    return lines.map(line => line[i]).join('')
  })
}

function validOnAllLines(lines: string[], start: number, mid: number, end: number, smudgeCounter: number = 0) {
  // const res = lines.every(line => {
  //   const left = line.slice(start, mid)
  //   const right = line.slice(mid, end)
  //   if (left === right.split('').toReversed().join('')) {
  //     return true
  //   }
  //   return ++smudgeCounter < 2
  //   // PART 1
  //   // return false
  // })
  // return {
  //   status: res,
  //   isSmudge: res && smudgeCounter === 1
  // }

  return {
    status: lines.every(line => {
      const left = line.slice(start, mid)
      const right = line.slice(mid, end)
      if (left === right.split('').toReversed().join('')) {
        return true
      }
      return ++smudgeCounter < 2
      // PART 1
      // return false
    }),
    isSmudge: smudgeCounter === 1
  }
}

function scanForSym(lines: string[]) {
  const lineLength = lines[0].length
  const maxSize = Math.floor(lineLength / 2)
  let isOdd = lineLength % 2 !== 0
  let tickDown = false;
  let size = 0;
  let counter = 0;
  return [...Array(lineLength - 1).keys()]
    .map(i => i + 1)
    .find(i => {
      if (tickDown) {
        size--
        counter+=2
      } else {
        size++
      }
      if (size === maxSize) {
        tickDown = true
      }
      const start = (maxSize === size && isOdd) ? counter-- : counter 
      const mid = i;
      const end = !(maxSize === size && isOdd) && tickDown ? lineLength : size*2
      // PART 1
      // const left = lines[0].slice(start, mid)
      // const right = lines[0].slice(mid, end)
      // if (left === right.split('').toReversed().join('')) {
        const { status, isSmudge } = validOnAllLines(lines, start, mid, end)
      //   if (status) {
        if (status && isSmudge) {
           return true
        }
      // } 
      if (isOdd && size === maxSize) {
        isOdd = false
      }
    }) || 0
}

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const tables = fileContent.split(/\n\n/)
const total = tables.reduce((total, table) => {
  const map = table.split(/\n/).filter(line => line)
  return total + scanForSym(map) + scanForSym(rotateArray(map)) * 100
}, 0)

console.log('answer', total)
console.log(total === 29130 || total === 33438)

// ANSWER PART 1: 29130
// ANSWER PART 2: 33438

// WRONG ANSWERS PART 2: 
// 39185
// 32795
// 38789


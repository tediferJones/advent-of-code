function getNextLine(line: number[]) {
  const result: number[] = [];
  let nonZeroCounter = 0;
  line.forEach((num, i) => {
    if (num !== 0) nonZeroCounter++
    if (line[i + 1] || line[i + 1] === 0) {
      result.push(line[i + 1] - num)
    }
  })
  if (result.length === 0) {
    console.log('IN FUNCTION')
    console.log('input line', line)
  }
  // if (nonZeroCounter === 1) {
  //   // console.log(line.filter(num => num !== 0))
  //   // return line.filter(num => num !== 0)
  //   return [0]
  // }
  return result;
};

function allValuesMatch(line: number[]) {
  for (let i = 0; i < line.length - 1; i++) {
    if (line[i] !== line[i + 1]) {
      return false
    }
  }
  return true
}

// const fileContent = await Bun.file('./example.txt').text()
const fileContent = await Bun.file('./inputs.txt').text()

const lines = fileContent
  .split('\n')
  .filter(line => line)
  .map(line => line.split(/\s+/)
  // .map(str => Number(str)))
  .map(str => {
    const test = Number(str)
    if (isNaN(test)) console.log('FUCKED')
    return test
  }))
// console.log(lines)

console.log(

lines.map((line, i) => {
  const partsThatMatter = [line[line.length - 1]];
  let currentLine = line;
  while (!allValuesMatch(currentLine)) {
    const nextLine = getNextLine(currentLine)
    // console.log(nextLine)
    if (isNaN(nextLine[nextLine.length - 1])) {
      console.log(nextLine)
      console.log('FOUND NAN')
    }
    if (nextLine.length === 1) {
        console.log('HELLO')
        console.log(nextLine)
      }
    partsThatMatter.push(nextLine[nextLine.length - 1])
    currentLine = nextLine;
    // console.log(currentLine)
  }
  const test = partsThatMatter.reduce((total, num) => total + num)
     // console.log(test)
  if (isNaN(test)) {
      console.log('fuckered')
    }
  return partsThatMatter.reduce((total, num) => total + num)
}).reduce((total, num) => total + num)

)

// ANSWER:
// 1743490457

// TOO LOW:
// 1743484865

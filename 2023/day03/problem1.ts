const fileContent = await Bun.file('./inputs.txt').text()
// Split into an array of lines, and remove blank lines
const testData = fileContent.split('\n').filter((line: string) => line)
// console.log(lines)

const testDataExample = [
  '467..114..',
  '...*......',
  '..35..633.',
  '......#...',
  '617*......',
  '.....+.58.',
  '..592.....',
  '......755.',
  '...$.*....',
  '.664.598..',
]

// for (const line of testData) {
//   // console.log(line)
//   for (const char of line) {
//     // console.log(char, char.charCodeAt(0))
//     if (char !== '.' && char < '0' || char > '9') {
//       console.log(char)
//     }
//   }
// }

const findSurrounding: { [key: string]: number[] } = {
  topLeft: [-1, 1],
  top: [0, 1],
  topRight: [1, 1],
  left: [-1, 0],
  right: [1, 0],
  bottomLeft: [-1, -1],
  bottom: [0, -1],
  bottomRight: [1, -1],
}

const usedDigitLocations: number[][] = [];
let total = 0;

// WE NEED TO KEEP TRACK OF ALL INDEXES THAT HAD NUMBERS IN THEM
for (let lineNum = 0; lineNum < testData.length; lineNum++) {
  for (let charNum = 0; charNum < testData[lineNum].length; charNum++) {
    const char = testData[lineNum][charNum];
    if (char !== '.' && char < '0' || char > '9') {
      console.log(char)

      for (const key in findSurrounding) {
        const [changeInX, changeInY] = findSurrounding[key];
        const yLocation = lineNum + changeInY
        const xLocation = charNum + changeInX
        const checkChar = testData[yLocation][xLocation];
        let positionUsed = false;

        // console.log('WHEN DO WE NEED TO EXIT')
        // console.log(usedDigitLocations)
        // console.log([yLocation, xLocation])
        if (usedDigitLocations.includes([yLocation, xLocation])) {
          console.log('ALREADY USED THIS LOCATION')
        }
        // ITERATE THROUGH ALL ARRAYS MANUALLY CHECK EACH
        for (const usedLocation of usedDigitLocations) {
          if (usedLocation[0] === yLocation && usedLocation[1] === xLocation) {
            console.log('ALREADY USED THIS POSITION')
            positionUsed = true
            break;
          }
        }

        if (checkChar >= '0' && checkChar <= '9' && !positionUsed) {
          // SCROLL TO THE RIGHT UNTIL NEXT CHAR IS NOT A NUMBER
          console.log('FOUND A NUMBER', checkChar, ' on line ', yLocation, ' at position ', xLocation)
          console.log(testData[yLocation][xLocation - 1])
          let num = '';
          let startPos = 1;
          // for (let i = 1; testData[yLocation][xLocation - i] >= '0' && testData[yLocation][xLocation - i] <= '9'; i++) {
          //   console.log(testData[yLocation][xLocation - i])
          //   console.log('FOUND ANOTHER NUMBER')
          // }
          while (testData[yLocation][xLocation - startPos] >= '0' && testData[yLocation][xLocation - startPos] <= '9') {
            startPos++
          }
          startPos--

          console.log('STARTING INDEX', xLocation - startPos)
          for (let currentPos = xLocation - startPos; testData[yLocation][currentPos] >= '0' && testData[yLocation][currentPos] <= '9'; currentPos++) {
            console.log('adding number')
            usedDigitLocations.push([yLocation, currentPos])
            num += testData[yLocation][currentPos];
          }
          console.log('THIS IS THE WHOLE NUMBER: ', num)
          total += Number(num)
          // console.log(usedDigitLocations)
        }
      }

      // FOUND SPECIAL CHAR, NOW CHECK SURROUNDINGS
      // If we find a number, scroll to left until we hit a period
      // Capture the number and do something with it
    }
  }
}
console.log(total)

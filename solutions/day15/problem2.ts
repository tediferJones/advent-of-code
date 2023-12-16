// we need to track 256 boxes
// Respresented as an array of 256 other arrays
//
// Each step of input can be seperated into
// LABEL(chars) OPERATION(= or -) LENS-NUMBER(0-9, only if operation is '=')
// THE RESULT OF HASING THE LABEL = boxNumber for this step
// if operation is '-' 
//    - go to that boxNumber and remove the lens with matching label
//    - push all other lens to the 'front' of the box (WITHOUT CHANGING THE ORDER)
//    - if label does not exist in the given box, DO NOTHING
// if operation is '='
//    - if label already exists in box, replace it
//    - otherwise, add this lens to the end of the box

interface BoxItem {
  label: string,
  lensNum: number
}

function getHash(str: string) {
  return str.split('').reduce((total, char) => {
    const val = char.charCodeAt(0)
    return ((total + val) * 17) % 256
  }, 0)
}

function lensExists(box: BoxItem[], label: string) {
  for (let i = 0; i < box.length; i++) {
    if (box[i].label === label) {
      return i
    }
  }
  // LABEL NOT FOUND
  return -1
}

function insertLens(boxes: BoxItem[][], str: string) {
  const splitter = str.includes('=') ? '=' : '-'
  const [label, lensNum] = str.split(splitter)
  const box = boxes[getHash(label)]
  const existingIndex = lensExists(box, label);
  if (splitter === '=') {
    if (existingIndex > -1) {
      box[existingIndex] = {
        label,
        lensNum: Number(lensNum)
      }
    } else {
      box.push({
        label,
        lensNum: Number(lensNum),
      })
    }
  }
  if (splitter === '-') {
    if (existingIndex > -1) {
      box.splice(existingIndex, 1)
    }
  }
}

const boxes: BoxItem[][] = [...Array(256)].map(i => [])
// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
fileContent
  .split(/\n/)
  .filter(line => line)
  .reduce((old, current) => current, fileContent)
  .split(',')
  .forEach(str => insertLens(boxes, str))  

const answer = boxes.reduce((total, box, boxNum) => {
  return total + box.reduce((boxTotal, boxItem, boxItemNum) => {
    return boxTotal + (boxNum + 1) * (boxItemNum + 1) * boxItem.lensNum
  }, 0)
}, 0)

console.log(answer)
console.log(answer === 210906 || answer === 145)

// PART 2 ANSWER: 210906
// PART 1 ANSWER: 516657

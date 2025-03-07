function getHash(str: string) {
  return str.split('').reduce((total, char) => {
    const val = char.charCodeAt(0)
    return ((total + val) * 17) % 256
  }, 0)
}

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const data = fileContent
  .split(/\n/)
  .filter(line => line)
  .reduce((old, current) => current, fileContent)
  .split(',')
  .reduce((total, str) => {
    return total + getHash(str)
  }, 0)
console.log(data)
console.log(data === 516657 || data === 1320)

// PART 1 ANSWER: 516657

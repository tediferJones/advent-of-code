const testDataV2 = (await Bun.file('inputs.txt').text())
// const testDataV2 = (await Bun.file('example.txt').text())
// const testDataV2 = (await Bun.file('example2.txt').text())
.split(/\n/)
.filter(line => line)

const answer = testDataV2.reduce((total, chars) => {
  let firstDigit, lastDigit;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] >= '0' && chars[i] <= '9') {
      firstDigit = chars[i]
      break;
    }
  }
  for (let i = 1; i <= chars.length; i++) {
    if (chars[chars.length - i] >= '0' && chars[chars.length - i] <= '9') {
      lastDigit = chars[chars.length - i]
      break;
    }
  }
  if (!firstDigit || !lastDigit) throw Error('cant find digit')
  return total += Number(firstDigit + lastDigit);
}, 0)

console.log(answer)
console.log([54708].includes(answer))

const fileContent = await Bun.file('./example.txt').text()
// const fileContent = await Bun.file('./inputs.txt').text()
console.log(fileContent)

const lines = fileContent.split(/\n/).filter(line => line)
console.log(lines)

const obj: { [key: string]: number[] } = {}
for (const line of lines) {
  const [name, data] = line.split(/:\s+/)
  console.log(data);
  const dataArr = data.split(/\s+/);
  const realArr: number[] = []
  let bigNum = '';
  dataArr.forEach((e, i) => {
    // realArr[i] = Number(dataArr[i])
    console.log(dataArr[i])
    bigNum += dataArr[i]
  })
  console.log(bigNum)
  // obj[name] = realArr
  obj[name] = [Number(bigNum)]
}
console.log(obj)

// NOW DO THE MATH
// HOW MANY WAYS WE CAN WE WIN EACH RACE

// If we wait 2 seconds, the boat travels at 2m/s
// If we wait 3 seconds, the boat travels at 3m/s

let total = 1;
for (let i = 0; i < obj.Time.length; i++) {
  const [time, distance] = [obj.Time[i], obj.Distance[i]]
  console.log(time, distance)
  let holdTime = 0;
  let winCounter = 0;
  // holdTime only needs to be checked between 1 and time - 1
  // How do we figure out which hold times correspond to winners
  // holdTime = speed
  // 
  //
  // WE ONLY NEED TO DETERMINE THE NUMBER OF POSSIBLE WINS
  while (holdTime < time) {
    if (holdTime * (time - holdTime) > distance) {
      // console.log('WINNING HOLD TIME = ' + holdTime)
      winCounter++
    }
    holdTime++
  }
  console.log('Win Counter: ' + winCounter)
  total *= winCounter
}
console.log('THE ANSWER ' + total)

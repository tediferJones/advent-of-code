// This is an absolute cluster
// Had to individually test each range of numbers so the program wouldn't crash
// Even had to split the 8th range in half just to get past array creation

const fileContent = await Bun.file('./inputs.txt').text()
// const fileContent = await Bun.file('./example.txt').text()
const groups = fileContent.split('\n\n')
const firstLine = groups.shift();
if (!firstLine) throw Error('FUCK IDK')
const oldSeeds = firstLine.slice(firstLine?.indexOf(":") + 1)
  .trim().split(/\s/).map(str => Number(str))

const allMapData: { destination: number, source: number, range: number }[][] = [];
for (const group of groups) {
  // Seperate text groups into objects
  const [title, maps] = group.split(/:\n/);
  const transfers = maps.split('\n').filter(line => line);
  const realMap: { destination: number, source: number, range: number }[] = []
  transfers.forEach(map => {
    const [destination, source, range] = map.split(/\s/).map(str => Number(str));
    realMap.push({ destination, source, range })
  })
  allMapData.push(realMap);
}

let absoluteMin = Infinity;
for (let i = 0; i < oldSeeds.length - 1; i += 2) {
  let [start, step] = oldSeeds.slice(i, i + 2)
  // console.log('GENERATE SEED RANGE', i)
  console.log(`GENERATE SEED RANGE ${i / 2}/${oldSeeds.length / 2}`)
  // const seeds = Array.from(Array(step).keys()).map(num => num + start)
  // let counter = start;
  // for (let j = 0; start + j < start + step; j++) {
  // let ratio = 1000;

  // LOW MEMORY VERSION
  // const seeds: number[] = []
  // for (let j = 0; j < step; j++) {
  //   seeds.push(start + j)
  //   // getLocations([start + j])
  //   // console.log('checking', j)
  //   // const minFromSet = getLocations([start + j])
  //   // const minFromSet = getLocationsV2([start + j])
  //   // if (minFromSet < absoluteMin) {
  //   //   absoluteMin = minFromSet
  //   //   console.log('NEW MIN', absoluteMin)
  //   // }
  // }

  // console.log(seeds)
  // const minFromSet = getLocationsV2(seeds)
  // if (minFromSet < absoluteMin) {
  //   absoluteMin = minFromSet
  //   console.log('NEW MIN', absoluteMin)
  // }

  // NOT BAD, but uses lots of memory
  // It would be better if we didnt have to generate the entire array
  // Try to only generate fractions of the array at a time
  // and try not to use map, it will double the size of the array because it's a shallow copy
  // ANSWER 0-4:        298690884
  // ANSWER 4-7:        72612023 (SMALLEST so far)
  // ANSWER 8-11:       UNKNOWN
  // ANSWER FOR 10-11:  162091157
  // ANSWER 12-17:      136887475
  // ANSWER 18-20:      577039234
  // THE ANSWER MUST BE CONTAINED IN CASE 8
  // ANSWER FIRST HALF: 26714516 (THE REAL ANSWER)
  // ANSWER SECOND HALF: 808405461

  // THIS IS SETUP TO ONLY RUN CASE 8
  // SPLIT THE ARRAY IN HALF, run the code, then run the other half and compare

  // if (i < 7 || i > 8) continue
  // if (i < 17) continue
  // if (i > 16) continue
  // console.log(typeof start, start, typeof step, step)
  // console.log(step / 2)
  // if (i < 2) continue
  const splitFactor = 8*4;
  for (let doubler = 0; doubler < splitFactor; doubler++) {
    // console.log(step / splitFactor)
    const customStep = Math.ceil(step / splitFactor)
    let arrLength = customStep
    // let arrLength = Math.ceil(step / splitFactor)
    if (arrLength * (doubler + 1) > step) {
      arrLength = step - arrLength * doubler;
    }
  const seeds = Array.from(Array(arrLength).keys())// .map(num => num + start)

  // WORKING
  // seeds.forEach((num, i) => seeds[i] = num + start)
  // TESTING
  seeds.forEach((num, i) => seeds[i] = num + start + (doubler > 0 ? customStep*doubler : 0))

  console.log(`PROCESSING ${doubler + 1}/${splitFactor}`)


    const minFromSet = getLocationsV2(seeds)
    if (minFromSet < absoluteMin) {
      absoluteMin = minFromSet
      console.log('NEW MIN', absoluteMin)
    }

    // WORKING
  // const denom = 1000;
  // for (let d = 0; d < denom; d++) {
  //   if (d % 50 == 0) console.log((d*100/denom) + '%')
  //   // console.log(`CHECKING ${d}/${denom}`)
  //   // seeds.slice(d/denom, (d+1)/denom)
  //   const startIndex = Math.floor(seeds.length * d/denom)
  //   const endIndex = Math.floor(seeds.length * (d+1)/denom)

  //   // OLD BUT WORKING
  //   // const minFromSet = getLocations(seeds.slice(startIndex, endIndex))
  //   const minFromSet = getLocationsV2(seeds.slice(startIndex, endIndex))

  //   // TESTING
  //   // const startNum = start + d/denom*step
  //   // const seeds = Array.from(Array(step).keys()).map(num => num + start)

  //   if (minFromSet < absoluteMin) {
  //     absoluteMin = minFromSet
  //     console.log('NEW MIN', absoluteMin)
  //   }
  // }
  }

  // console.log(start, step)
  // console.log(step < 4294967295)
  //
  // const minFromSet = getLocations(seeds)
  // if (minFromSet < absoluteMin) {
  //   absoluteMin = minFromSet
  // }
  // console.log('FINSIHED SEED RANGE', absoluteMin, minFromSet)
  console.log('FINSIHED SEED RANGE')
}
// console.log(seeds)
// console.log(seeds.length)
// console.log(groups)
console.log('BIG ANSWER: ', absoluteMin)

function getLocationsV2(seeds: number[]) {
  const newSeeds = [];
  // console.log(allMapData)
  for (const mapSet of allMapData) {
    for (const mapObj of mapSet) {
      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i]
        if (seed >= mapObj.source && seed < mapObj.source + mapObj.range) {
          // console.log('INCREMENT')
          const step = seed - mapObj.source;
          // newSeeds[i] = seeds[i] + step
          newSeeds[i] = mapObj.destination + step
        }
      }
    }
    for (let i = 0; i < seeds.length; i++) {
      if (newSeeds[i]) {
        seeds[i] = newSeeds[i]
      }
    }
  }

  let min = Infinity;
  for (let i = 0; i < seeds.length; i++) {
    if (seeds[i] < min) min = seeds[i]
  }
  // console.log('ANSWER?: ', min)
  return min
}

// We're running O^3 code an absurd number of times
function getLocations(seeds: number[]) {
  for (const group of groups) {
    // Seperate text groups into objects
    const [title, maps] = group.split(/:\n/)
    const transfers = maps.split('\n').filter(line => line)
    const obj = transfers.map(map => {
      const [destination, source, range] = map.split(/\s/).map(str => Number(str))
      return {
        destination, source, range
      }
    })
    // console.log(obj)
    const newSeeds = [];
    for (const mapObj of obj) {
      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i]
        if (seed >= mapObj.source && seed < mapObj.source + mapObj.range) {
          // console.log('INCREMENT')
          const step = seed - mapObj.source;
          // newSeeds[i] = seeds[i] + step
          newSeeds[i] = mapObj.destination + step
        }
      }
    }
    // console.log(newSeeds)
    for (let i = 0; i < seeds.length; i++) {
      if (newSeeds[i]) {
        seeds[i] = newSeeds[i]
      }
    }
    // console.log(seeds)
    // break;
  }

  let min = Infinity;
  for (let i = 0; i < seeds.length; i++) {
    if (seeds[i] < min) min = seeds[i]
  }
  // console.log('ANSWER?: ', min)
  return min
}

// Split into an array of lines, and remove blank lines
// const data = fileContent.split('\n').filter((line: string) => line)
// console.log(fileContent)

// const result = [...fileContent.matchAll(/(.+)\n\n/g)].map(match => {
//   console.log(match)
// })
// console.log('RESULT: ', result)

// console.log(data)
// for (const line of data) {
//   let seeds = [];
//   if (line.includes('seeds:')) {
//     let [idk, temp] = line.split(': ')
//     const arr = temp.split(/\s/).map(num => Number(num))
//     console.log(arr)
//     seeds = arr
//     continue;
//   }
// 
//   if (line.includes(':')) {
//     // console.log('BAD LINE')
//     continue;
//   }
//   console.log(line)
// }

// console.log(data)
// Do we want to use regex for this? Probably

// Each line a map indicates [destination, source, range]
// lets say we are going from seed to soil
// if the soil map doesnt have a range for a seed, then the soil number is the same as the seed number
//
// We want to find the lowest location number that correspond to a given seed
// We essentially only have to track the initial seeds
// and modify each seed depending on the map rules

// EXAMPLE DATA
// seeds: 79 14 55 13
// 
// seed-to-soil map:
// 50 98 2
// 52 50 48
// 
// soil-to-fertilizer map:
// 0 15 37
// 37 52 2
// 39 0 15
// 
// fertilizer-to-water map:
// 49 53 8
// 0 11 42
// 42 0 7
// 57 7 4
// 
// water-to-light map:
// 88 18 7
// 18 25 70
// 
// light-to-temperature map:
// 45 77 23
// 81 45 19
// 68 64 13
// 
// temperature-to-humidity map:
// 0 69 1
// 1 0 69
// 
// humidity-to-location map:
// 60 56 37
// 56 93 4

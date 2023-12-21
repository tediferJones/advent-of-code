class FlipFlop {
  // name: string
  nextName: string
  isOn: boolean
  constructor(nextName: string) {
    // this.name = name
    this.isOn = false;
    this.nextName = nextName;
  }
  recievePulse(type: string) {
    if (type === 'lo') {
      this.isOn = !this.isOn
    }
    return this.isOn ? 'hi' : 'lo'
  }
}

class Conjunction {
  mostRecentPulse: string
  nextName: string
  constructor(nextName: string) {
    this.mostRecentPulse = 'lo'
    this.nextName = nextName
  }
  recievePulse(type: string) {
    this.mostRecentPulse = type;
  }
}

class Broadcaster {
  nextName: string
  constructor(nextName: string) {
    this.nextName = nextName
  }
  recievePulse(type: string) {
    return type;
  }
}

const fileContent = await Bun.file('example.txt').text()
// const answer =
const obj: {
  [key: string]: (FlipFlop | Conjunction | Broadcaster)[]
} = {};
fileContent
  .split(/\n/)
  .filter(line => line)
  .forEach(line => {
    console.log(line);
    // const match = line.match(/([%&]?)(\w|broadcaster) -> (.+)/)
    // console.log(match);
    [...line.matchAll(/([%&]?)(\w+|broadcaster) -> (.+)/g)].map(match => {
      const [fullMatch, symbol, name, nextNames] = match;
      if (!obj[name]) obj[name] = []
      nextNames.split(', ').forEach(nextName => {
        if (symbol === '%') {
          return obj[name].push(new FlipFlop(nextName));
        }
        if (symbol === '&') {
          return obj[name].push(new Conjunction(nextName))
        }
        return obj[name].push(new Broadcaster(nextName))
      })
    })
  })

console.log(obj)
// answer.forEach(line => console.log(line))

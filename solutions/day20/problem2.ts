type Pulse = 'hi' | 'lo'
type Modules = { [key: string]: (FlipFlop | Conjunction | Broadcaster) }

class FlipFlop {
  recipients: string[];
  sendersAll: string[];
  name: string;
  isOn: boolean;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
    this.isOn = false;
    this.sendersAll = [];
  }

  receivePulse(modules: AllModules, type: Pulse) {
    if (type === 'hi') return;
    this.isOn = !this.isOn;
    const sendPulse = this.isOn ? 'hi' : 'lo'
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
    })
  }
}

class Conjunction {
  recipients: string[];
  senders: { [key: string]: Pulse };
  sendersAll: string[]
  name: string;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.senders = {};
    this.name = name;
    this.sendersAll = [];
  }

  allHigh() {
    return Object.keys(this.senders).every(name => this.senders[name] === 'hi');
  }

  allLow() {
    return Object.keys(this.senders).every(name => this.senders[name] === 'lo');
  }

  receivePulse(modules: AllModules, type: Pulse, sender: string) {
    this.senders[sender] = type;
    const allHigh = Object.keys(this.senders).every(name => this.senders[name] === 'hi');
    const sendPulse = allHigh ? 'lo' : 'hi'
    // console.log('all High:', allHigh, this.senders)
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
    })
  }
}

class Broadcaster {
  recipients: string[];
  name: string;
  sendersAll: string[];
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
    this.sendersAll = [];
  }

  receivePulse(modules: AllModules, type: Pulse) {
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type, to: recipient })
    })
  }
}

class AllModules {
  modules: Modules;
  count: { hi: number, lo: number };
  pulseQueue: { from: string, to: string, type: Pulse }[];

  constructor() {
    this.modules = {};
    this.count = { hi: 0, lo: 0 };
    this.pulseQueue = [];
  }

  linkConjunctions() {
    // We want to get all the nodes that are connected to each conjunction
    // This function can almost certainly be improved and/or merged into building of the initial this.modules object
    const conjunctions = Object.keys(this.modules).filter(key => {
      return this.modules[key].constructor.name === 'Conjunction'
    })
    console.log(conjunctions)

    Object.keys(this.modules).forEach(key => {
      conjunctions.forEach(conj => {
        if (this.modules[key].recipients.includes(conj)) {
          (this.modules[conj] as Conjunction).senders[key] = 'lo'
        }
      })
    })
  }

  pushBtn(pushCount = Infinity) {
    let count = 0
    while (count < pushCount) {
      // if ((this.modules['cs'] as Conjunction).allLow()) {
      // if ((this.modules['dx'] as Conjunction).allLow()) {
      //   console.log('ALL LOW AT', count)
      //   diffChecker.push(count)
      // }
      this.pulseQueue = [ { from: 'button', type: 'lo', to: 'broadcaster' } ]

      // this.pulseQueue = [ { from: 'broadcaster', type: 'lo', to: 'ns' } ] // ANSWER: 4006
      // this.pulseQueue = [ { from: 'broadcaster', type: 'lo', to: 'pj' } ] // ANSWER: 4026
      // this.pulseQueue = [ { from: 'broadcaster', type: 'lo', to: 'xz' } ] // ANSWER: 3916
      // this.pulseQueue = [ { from: 'broadcaster', type: 'lo', to: 'sg' } ] // ANSWER: 3918
      // count++
      while (this.pulseQueue.length) {
        const item = this.pulseQueue.shift();
        if (!item) return console.log('queue is empty');
        // console.log(`${item.from} -${item.type}-> ${item.to}`);
        if (item.to === 'rx' && item.type === 'lo') return count
        // if (item.from === 'ck' && item.type === 'lo' && item.to === 'qt') return console.log('RESULT', count) || count
        // if (item.from === 'cs' && item.type === 'lo' && item.to === 'qb') return console.log('RESULT', count) || count
        // if (item.from === 'dx' && item.type === 'lo' && item.to === 'mp') return console.log('RESULT', count) || count
        // if (item.from === 'jh' && item.type === 'lo' && item.to === 'ng') return console.log('RESULT', count) || count
        this.count[item.type]++;
        this.modules[item.to]?.receivePulse(this, item.type, item.from);
      }
      count++
      if (count % 100000 === 0) console.log(count.toLocaleString())
      // console.log(this.modules['dr'])
      // console.log('FINAL', this.modules['xr'])
      // console.log('LEVEL 1', this.modules['dr'])
      // console.log('LEVEL 2', [ 'qb', 'mp', 'ng', 'qt' ].map(nodeName => this.modules[nodeName]))
      // console.log('LEVEL 3', [ 'cs', 'dx', 'ck', 'jh' ].map(nodeName => this.modules[nodeName]))

      // console.log('DONE WITH BUTTON PUSH:', count)
      // console.log('LEVEL 2', [ 'qb', 'mp', 'ng', 'qt' ].map(nodeName => `${this.modules[nodeName].name}, senders: ${this.modules[nodeName].senders}`))

      // console.log(
      //   // @ts-ignore
      //   Object.keys(this.modules['cs'].senders).map(key => this.modules['cs'].senders[key]),
      //   count.toLocaleString(),
      //   'CS',
      //   (this.modules['cs'] as Conjunction).allLow(),
      // )
      // printConjState('cs', count)
      // printConjState('dx', count)

      // if ((this.modules['cs'] as Conjunction).allHigh()) {
      // if ((this.modules['dx'] as Conjunction).allHigh()) {
      //   return console.log('CS ALL HIGH AT', count)
      //   // Theory: cs will be all true at (8 * 16 * 32 * 64 * 128 * 256 * 512 * 1024) + 4
      // }
    }
  }
}

// Get GCD using Euclidean algorithm
function gcd(a: number, b: number) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Get LCM of two numbers
function lcm(a: number, b: number) {
    return (a * b) / gcd(a, b);
}

// Get LCM of an array of numbers
function lcmOfArray(arr: number[]) {
    return arr.reduce((acc, num) => lcm(acc, num), 1);
}


const startTime = Bun.nanoseconds();
// const fileContent = await Bun.file('example.txt').text();
// const fileContent = await Bun.file('example2.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
const allMods = new AllModules();

fileContent
  .split(/\n/)
  .filter(line => line)
  .forEach(line => {
    const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
    const recipients = recipientStr.split(', ')
    if (type === '%') {
      allMods.modules[name] = new FlipFlop(recipients, name);
    } else if (type === '&') {
      allMods.modules[name] = new Conjunction(recipients, name);
    } else if (name === 'broadcaster') {
      allMods.modules[name] = new Broadcaster(recipients, name);
    }
  });

// const visData = fileContent
//   .split(/\n/)
//   .filter(line => line)
//   .map(line => {
//     // const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
//     // const recipients = recipientStr.split(', ')
//     // if (type === '%') {
//     //   allMods.modules[name] = new FlipFlop(recipients, name);
//     // } else if (type === '&') {
//     //   allMods.modules[name] = new Conjunction(recipients, name);
//     // } else if (name === 'broadcaster') {
//     //   allMods.modules[name] = new Broadcaster(recipients, name);
//     // }
// 
//     const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
//     const recipients = recipientStr.split(', ')
//     return recipients.map(recipient => `${name} ${recipient}`)
//   });
// console.log(visData.flat().join('\n'))

// rx is only connected to dr
// dr is a conjunction module so it must remember hi pulses for all its senders
// dr is a recipient for qb, mp, ng and qt
// all of the above recipients are also conjunction modules, so each of them must also remember hi pulses for all potentional senders

// rx wants lo
// dr wants all hi
// qb, mp, ng, qt want all hi

console.log(lcmOfArray([ 4007, 4027, 3917, 3919 ]))
// FIND LCM OF 4007, 4027, 3917, and 3919
// How did we get here?
//  1.) visualize graph of your input and determine the start and end of each cluster of the graph
//      - In our case, all nodes that are immediate descendants of the broadcaster, are the starts of all our clusters
//      - The end of each cluster is the first conjunction module we can find (within each cluster)
//      - also need to determine number of conjunctions between end and xr (this determines the type of pulse end needs to send)
//  2.) once the start and end of each cluster has been determined we must find the number of button presses that will result in a lo pulse being sent to the end node
//  3.) the result for each cluster should result in the numbers listed above, from there just find the LCM and hope that it is the right answer

// console.log(allMods)
// allMods.linkAll();

allMods.linkConjunctions()
// allMods.pushBtn(100000000);

// diffChecker.reduce((_, count, i) => {
//   console.log(count - diffChecker[i - 1])
//   return 0
// })
// const answer= allMods.pushBtn(1);
// console.log(allMods)
// console.log('trace from:', allMods.traceFrom('c', 'lo'))
// const answer = allMods.count.hi * allMods.count.lo;
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`);
// console.log(`ANSWER: ${answer}`)
// console.log(answer === 919383692)

// Time to brute force
// (() => {
//   const sampleCount = 1000000
//   const start = Bun.nanoseconds();
//   allMods.pushBtn(sampleCount);
//   const end = Bun.nanoseconds();
//   const time = (end - start) / 10**9
//   const totalSeconds = (247702167614647 / sampleCount) * time 
//   console.log(`${totalSeconds / 60 / 60 / 24 / 365.25} years`)
// })()

// WRONG ANSWERS PART 2:
// 937320042252 TOO LOW

// ANSWER PART 1: 919383692
// ANSWER PART 2: 247702167614647

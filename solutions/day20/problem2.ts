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
      // const state = Object.keys(this.modules).toSorted().map(key => {
      //   const mod = this.modules[key]
      //   if (mod.constructor.name === 'Conjunction') {
      //     return (mod as Conjunction).allHigh();
      //   } else if (mod.constructor.name === 'FlipFlop') {
      //     return (mod as FlipFlop).isOn;
      //   }
      //   return null
      // })
      // const strState = JSON.stringify(state)
      // if (history[strState]) {
      //   console.log(history)
      //   throw Error('CYCLE DETECTED AT:' + count)
      // } else {
      //   history[strState] = count
      // }

      // if ((this.modules['cs'] as Conjunction).allLow()) {
      //   console.log('CS ALL LOW AT', count)
      //   diffChecker.push(count)
      // }
      this.pulseQueue = [ { from: 'button', type: 'lo', to: 'broadcaster' } ]
      while (this.pulseQueue.length) {
        const item = this.pulseQueue.shift();
        if (!item) return console.log('queue is empty');
        // console.log(`${item.from} -${item.type}-> ${item.to}`);
        if (item.to === 'rx' && item.type === 'lo') return count
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
      if ((this.modules['dx'] as Conjunction).allHigh()) {
        return console.log('CS ALL HIGH AT', count)
        // Theory: cs will be all true at (8 * 16 * 32 * 64 * 128 * 256 * 512 * 1024) + 4
      }

      // if (printNext) {
      //   console.log(
      //     // @ts-ignore
      //     Object.keys(this.modules['cs'].senders).map(key => this.modules['cs'].senders[key]),
      //     count.toLocaleString(),
      //     'CS',
      //     (this.modules['cs'] as Conjunction).allLow(),
      //   )
      //   printNext = false
      // }
      // if ((this.modules['cs'] as Conjunction).allLow()) {
      //   console.log('CS ALL LOW AT', count)
      //   printNext = true
      // }
    }
  }

  linkAll() {
    Object.keys(this.modules).forEach(senderName => {
      this.modules[senderName].recipients.forEach(recipient => {
        this.modules[recipient].sendersAll.push(senderName);
      })
    })
  }

  traceFrom(modName: string, type: Pulse) {
    type TracedPath = { [key: string]: TracedPath }
    const result: TracedPath = { [modName]: {} }
    this.modules[modName].sendersAll.forEach(sender => {
      // We need to trace backwards, so we need to:
      //  - infer pulse type based on where it is being sent to
      //  - track all paths, because there are other paths that could affect whatever path we rely on
      //  - But will this actually be any faster?
      //    - At best we will still have to track all nodes that affect our desired path (path from broadcaster to rx)
      //    - which it seems like will still be most of our paths
      const modType = this.modules[sender].constructor.name
      // result[modName][sender] = this.traceFrom(sender, type)
    })
    return result;
  }
}

// It would probably be faster to process the tree in reverse, starting from rx with a lo pulse, and tracing until we reach a button call

const startTime = Bun.nanoseconds();
// const fileContent = await Bun.file('example.txt').text();
// const fileContent = await Bun.file('example2.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
const allMods = new AllModules();

// { stateString: btnCount }
const history: { [key: string]: number } = {}
let printNext = false;
const diffChecker: number[] = []

function printConjState(modName: string, count: number) {
  console.log(
    // @ts-ignore
    Object.keys(allMods.modules[modName].senders).map(key => allMods.modules[modName].senders[key]),
    count.toLocaleString(),
    modName,
    (allMods.modules[modName] as Conjunction).allLow(),
  )
}

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
//

// console.log(allMods)
// allMods.linkAll();
allMods.linkConjunctions()
allMods.pushBtn();
// diffChecker.reduce((_, count, i) => {
//   console.log(count - diffChecker[i - 1])
//   return 0
// })
// const answer= allMods.pushBtn(1);
// console.log(allMods)
// console.log('trace from:', allMods.traceFrom('c', 'lo'))
// const answer = allMods.count.hi * allMods.count.lo;
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`)
// console.log(`ANSWER: ${answer}`)
// console.log(answer === 919383692)

// ANSWER PART 1: 919383692

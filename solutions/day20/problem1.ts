// We need to count the number of hi pulses and lo pulses separately
// the final answer is the product of hi pulse count times lo pulse count

type Pulse = 'hi' | 'lo'
type Modules = { [key: string]: (FlipFlop | Conjunction | Broadcaster) }

class FlipFlop {
  recipients: string[];
  name: string;
  isOn: boolean;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
    this.isOn = false;
  }
  // receive
  receivePulse(type: Pulse, sender: string) {
    if (type === 'hi') return;
    this.isOn = !this.isOn;
    sendPulse(
      this.isOn ? 'hi' : 'lo',
      this.recipients,
      sender,
    )
  }
}

class Conjunction {
  recipients: { [key: string]: Pulse }
  name: string;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients.reduce((obj, recipient) => {
      obj[recipient] = 'lo'
      return obj
    }, {} as { [key: string]: Pulse })
    this.name = name;
  }
  receivePulse(type: Pulse, sender: string) {
    this.recipients[sender] = type;
    const names = Object.keys(this.recipients);
    const allHigh = names.every(name => this.recipients[name] === 'hi');
    sendPulse(
      allHigh ? 'lo' : 'hi',
      names,
      sender,
    );
  }
}

class Broadcaster {
  recipients: string[];
  name: string;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
  }
  receivePulse(type: Pulse, sender: string) {
    // return type;
    sendPulse(type, this.recipients, sender)
  }
}

class AllModules {
  modules: Modules;
  count: { hi: number, lo: number };

  constructor() {
    this.modules = {};
    this.count = { hi: 0, lo: 0 }
  }

  pushBtn() {
    sendPulse('lo', (this.modules['broadcaster'] as Broadcaster).recipients, 'broadcaster')
  }

  // sendPulse(pulse: Pulse, recipients: string[], sender: string) {
  //   recipients.forEach(recipient => this.modules[recipient].recievePulse(pulse, sender))
  // }
}

function sendPulse(pulse: Pulse, recipients: string[], sender: string) {
  recipients.forEach(recipient => {
    console.log('FROM', sender, 'SENDING', recipients, allMods.modules[recipient])
    allMods.modules[recipient].receivePulse(pulse, sender)
  })
}

const fileContent = await Bun.file('example.txt').text();
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
    } else {
      allMods.modules[name] = new Broadcaster(recipients, name);
    }
  });

console.log(allMods)
allMods.pushBtn();
console.log(allMods)

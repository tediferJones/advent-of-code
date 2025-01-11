type Chemical = { name: string, quantity: number, children?: Chemical[] }

function buildTree(chemicals: Chemical[], name: string): Chemical | undefined {
  const found = chemicals.find(chem => chem.name === name)
  if (!found?.children) return

  const children = found.children.map(child => {
    // if (child.name === 'ORE') return child
    const result = buildTree(chemicals, child.name)!
    if (result) {
      result.quantity = child.quantity
    }
    return result
  }).filter(child => child !== undefined) as Chemical[]

  return {
    name: found.name,
    quantity: found.quantity,
    children,
  }
}

function calculateOre(tree: Chemical): Chemical[] | undefined {
  // console.log(tree.name, tree.quantity)
  if (!tree.children) return
  return tree.children.reduce((total, child) => {
    const ore = calculateOre(child)
    // console.log(ore)
    // if (tree.name === 'FUEL') console.log(ore)
    // console.log(`FOR ${tree.name} ${tree.quantity}, ${ore}`)
    // const quantity = tree.quantity * child.quantity 
    // if (quantity === 308) {
    //   console.log(tree, child)
    //   console.log('FOUND', data.find(chem => chem.name === tree.name))
    //   console.log('~~~~~~~~')
    // }
    const innerFound = data.find(chem => chem.name === tree.name)
    if (!innerFound) throw Error(`couldnt find ${tree.name}`)
    const quantity = Math.ceil(tree.quantity / innerFound?.quantity) * child.quantity
    return total.concat(
      ore?.length ? ore : { name: child.name, quantity }
      // ore?.length ? ore : { name: child.name, quantity: tree.quantity * child.quantity }
      // ore?.length ? ore : { name: child.name, quantity: tree.quantity }
      // ore?.length ? ore : { name: child.name, quantity: child.quantity }
    )
    // return total + (ore || child.quantity)
  }, [] as Chemical[])
}

function sumOre(ores: Chemical[], chemicals: Chemical[]) {
  // console.log(JSON.stringify(chemicals, undefined, 2))
  const init = (
    chemicals
    .filter(chem => chem.children?.find(child => child.name === 'ORE'))
    .map(chem => ({ name: chem.name, quantity: chem.children![0].quantity, outQuantity: chem.quantity }))
    .flat()
    .reduce((obj, ore) => {
      // obj[ore.name] = ore.quantity
      obj[ore.name] = {
        inQuantity: ore.quantity,
        outQuantity: ore.outQuantity
      }
      return obj
    }, {} as Record<string, { inQuantity: number, outQuantity: number }>)
  )

  const finalCounts = ores.reduce((total, ore) => {
    if (!total[ore.name]) {
      total[ore.name] = ore.quantity
    } else {
      total[ore.name] += ore.quantity
    }
    return total
  }, {} as Record<string, number>)
  console.log('ORES', ores)
  console.log('inputs', init)
  console.log('wanted outputs', finalCounts)

  return Object.keys(finalCounts).reduce((total, key) => {
    const { inQuantity, outQuantity } = init[key]
    // const groups = Math.ceil(finalCounts[key] / inQuantity)
    // console.log('REDUCING', key, groups, finalCounts[key], init[key])
    // console.log(`NEED ${finalCounts[key]} OF ${key}`, inQuantity)
    console.log({
      finalCount: finalCounts[key],
      inQuantity,
      outQuantity,
    })
    // console.log(Math.ceil(finalCounts[key] / outQuantity) * inQuantity)
    // Math.ceil(finalCounts[key] / outQuantity) * inQuantity
    // return total + inQuantity * groups
    return total + Math.ceil(finalCounts[key] / outQuantity) * inQuantity
  }, 0)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((result, line) => {
    const [ inputs, output ] = line.split(/\s+=>\s+/)
    const [ quantity, name ] = output.split(/\s+/)
    return result.concat({
      name,
      quantity: Number(quantity),
      children: inputs.split(/,\s+/).map(input => {
        const [ quantity, name ] = input.split(/\s+/)
        return { name, quantity: Number(quantity) }
      })
    })
  }, [] as Chemical[])
)

// console.log(JSON.stringify(data, undefined, 2))
// console.log('~~~~~~~~')
const chemTree = buildTree(data, 'FUEL')!
// console.log(JSON.stringify(chemTree, undefined, 2))
const oresNeeded = calculateOre(chemTree)!
// console.log(oresNeeded)
const part1 = sumOre(oresNeeded, data)
console.log(part1, [ 31, 165, 13312 ].includes(part1))

// EXAMPLE 3:
// 157 ORE => 5 NZVS
// 165 ORE => 6 DCFZ
// 179 ORE => 7 PSHF
// 177 ORE => 5 HKGWZ
// 165 ORE => 2 GPVTF
// 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
// 7 DCFZ, 7 PSHF => 2 XJWVT
// 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT
// 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
//
//
// 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
//
// 44 XJWVT
// 7 DCFZ, 7 PSHF => 2 XJWVT
// 154 DCFZ, 154 PSHF => 44 XJWVT
//
// 5 KHKGT
// 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT
//
// 1 QDVJ
// 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
//
// 29 NZVS
// 9 GPVTF
// 48 HKGWZ 
//
// DCFZ = 154 + 3 = 157
// PSHF = 154 + 10 + 8 = 172
// NZVS = 7 + 29 = 36
// HKGWZ = 5 + 12 + 48 = 65
// GPVTF = 1 + 9 = 10
//
// 165 ORE => 6 DCFZ = (157 / 6 = 27) * 165 = 4455
// 179 ORE => 7 PSHF = (172 / 7 = 25) * 179 = 4475
// 157 ORE => 5 NZVS = (36 / 5 = 8) * 157 = 1256
// 177 ORE => 5 HKGWZ = (65 / 5 = 13) * 177 = 2301
// 165 ORE => 2 GPVTF = (10 / 2 = 5) * 165 = 825
// TOTAL = 13312 (RIGHT ANSWER)



// EXAMPLE 4:
// 139 ORE => 4 NVRVD
// 144 ORE => 7 JNWZP
// 145 ORE => 6 MNCFX
// 176 ORE => 6 VJHF
// 2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
// 17 NVRVD, 3 JNWZP => 8 VPVL
// 22 VJHF, 37 MNCFX => 5 FWMGM
// 5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
// 5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
// 1 NVRVD => 8 CXFTF
// 1 VJHF, 6 MNCFX => 4 RFSQX
// 53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
//
// 53 STKFG
// 2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
// 106 VPVL, 371 FWMGM, 106 CXFTF, 583 MNCFX => 55 STKFG
//    106 VPVL
//    17 NVRVD, 3 JNWZP => 8 VPVL
//    (17 NVRVD, 3 JNWZP) * 14 => 112 VPL
//    238 NVRVD, 42 JNWZP => 112VPL
//
//    371 FWMGM
//    22 VJHF, 37 MNCFX => 5 FWMGM
//    (22 VJHF, 37 MNCFX) * 75 = 375 FWMGM
//    1650 VJHF, 2775 MNCFX
//
//    106 CXFTF
//    1 NVRVD => 8 CXFTF
//    14 NVRVD => 112 CXFTF
//
//    583 MNCFX
//
// 6 MNCFX
//
// 46 VJHF
//
// 81 HVMC
// (5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF) * 27 => 81 HVMC
// 135 MNCFX, 189 RFSQX, 54 FWMGM, 54 VPVL, 513 CXFTF => 81 HVMC
//    (1 VJHF, 6 MNCFX) * 48 => 192 RFSQX
//    48 VJHF, 288 MNCFX => 192 RFSQX
//
//    (22 VJHF, 37 MNCFX) * 11 => 55 FWMGM
//    242 VJHF, 407 MNCFX => 55 FWMGM
//
//    (17 NVRVD, 3 JNWZP) * 7 => 56 VPVL
//    119 NVRVD, 21 JNWZP => 56 VPVL
//  
//    (1 NVRVD) * 65 => 520 CXFTF
//    65 NVRVD => 520 CXFTF
//
// 68 CXFTF
// (1 NVRVD) * 9 => 72 CXFTF
// 9 NVRVD => 72 CXFTF
//
// 25 GNMV
// (5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF) * 5 => 30 GNMV
// 25 VJHF, 35 MNCFX, 45 VPVL, 185 CXFTF => 30 GNMV
//    (17 NVRVD, 3 JNWZP) * 6 => 48 VPVL
//    102 NVRVD, 18 JNWZP => 48 VPVL
//
//    1 NVRVD * 24 => 192 CXFTF
//    24 NVRVD => 192 CXFTF
//
// TOTALS:
// NVRVD: 238 + 14 + 119 + 65 + 9 + 102 + 24 = 571
// JNWZP: 42 + 21 + 18 = 81
// VJHF: 1650 + 46 + 48 + 242 + 25 = 2011
// MNCFX: 2775 + 583 + 6 + 135 + 288 + 407 + 35 = 4229
//
// 139 ORE => 4 NVRVD
// 144 ORE => 7 JNWZP
// 176 ORE => 6 VJHF
// 145 ORE => 6 MNCFX
//
// (571 / 4 = 143) * 139 = 19877
// (81 / 7 = 12) * 144 = 1728
// (2011 / 6 = 336) * 176 = 59136
// (4229 / 6 = 705) * 145 = 102225
//
// GRAND TOTAL = 182966 (WRONG probably need to carry left overs between intermediate chemicals)

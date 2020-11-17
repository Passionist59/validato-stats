const { ApiPromise, WsProvider } = require('@polkadot/api')
const { isHex } = require('@polkadot/util')

let DOT_DECIMAL_PLACES = 10000000000;
let lowest = "no one";
let highest = "no one";
let highestAmount = NaN;
let lowestAmount = NaN;
let highestCommission = "no one";
let lowestCommission = "no one";
let highestCommissionAmount = NaN;
let lowestCommissionAmount = NaN;
let network = 'polkadot'; // default to polkadot network (can be changed to kusama using command line arg)
let highestMinAmount = NaN;
let highestMinNominator = "no one";
let lowestMinAmount = NaN;
let lowestMinNominator = "no one";

(async () => {
  args = process.argv
  let provider = null;
  if (args.length > 2 && args[2] === 'kusama') { // if there is a command line arg for kusama, use kusama network
    console.log('Connecting to Kusama')
    network = 'kusama'
    provider = new WsProvider('wss://kusama-rpc.polkadot.io')
    DOT_DECIMAL_PLACES *= 100
  }
  else { // default to polkadot
    console.log('Connecting to Polkadot')
    provider = new WsProvider('wss://rpc.polkadot.io')
  }
  const api = await ApiPromise.create({ provider })
  const [currentValidators, totalIssuance, currentEra] = await Promise.all([
    api.query.session.validators(),
    api.query.balances.totalIssuance(),
    api.query.staking.currentEra(),
  ]);

  const totalKSM = parseInt(totalIssuance.toString())
  const totalBondingStake = await api.query.staking.erasTotalStake(currentEra.toString())

  let averageTotalStake = 0;
<<<<<<< Updated upstream
  let averageTotalCommission = 0;
=======
  let averageCommission = 0;
  let averageStakeNon100 = 0; // Average stake for validators not taking 100% commission
  let averageCommissionNon100 = 0; // Average commission % for validators not taking 100%
  let totalNominators = 0;
  let uniqueNominators = new Set();



  // first count the number of validators that aren't taking 100% commission (used for finding average commission)
  for (let i=0; i<currentValidators.length; i++){
    const validatorCommissionRate = await api.query.staking.erasValidatorPrefs(currentEra.toString(), currentValidators[i])
    const commissionPercent = parseInt(validatorCommissionRate['commission'].toString()) / 10000000;
    if(commissionPercent < 100){
      countNon100++;
    }
    totalNominators++;
  }
>>>>>>> Stashed changes


  for (let i = 0; i < currentValidators.length; i++) {
    const validatorStake = await api.query.staking.erasStakers(currentEra.toString(), currentValidators[i])
    const validatorCommissionRate = await api.query.staking.erasValidatorPrefs(currentEra.toString(), currentValidators[i])
    const validatorTotalStake = validatorStake['total'].toString() / DOT_DECIMAL_PLACES
    const validatorOwnStake = validatorStake['own'].toString() / DOT_DECIMAL_PLACES
    const validatorNominators = validatorStake['others'].toJSON()

    check(currentValidators[i].toString(), parseInt(validatorTotalStake), parseInt(validatorCommissionRate['commission'].toString()))

    console.log(`Stash Address: ${currentValidators[i].toString()}.\n\tTotal stake: ${validatorTotalStake}\n\tSelf stake: ${validatorOwnStake} ${getSuffix()}`)
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    averageTotalStake += validatorTotalStake / currentValidators.length;
    averageTotalCommission += parseInt(validatorCommissionRate['commission'].toString()) / currentValidators.length;
    let max = NaN;
    let min = NaN;
    let minNominator = "no one";
    let maxNominator = "no one";
    let avg = 0;
    for (let j = 0; j < validatorNominators.length; j++) {
      console.log(`\tAddress: ${validatorNominators[j].who}, Stake: ${validatorNominators[j].value / DOT_DECIMAL_PLACES} ${getSuffix()}`)
      if(isNaN(max)) {
        min = max = validatorNominators[j].value;
        minNominator = maxNominator = validatorNominators[j].who
      }
      else{
        if(validatorNominators[j].value >= max) {
          max = validatorNominators[j].value;
          maxNominator = validatorNominators[j].who
        }
        if(validatorNominators[j].value <= min) {
          min = validatorNominators[j].value;
          minNominator = validatorNominators[j].who;
        }
      }
      uniqueNominators.add(validatorNominators[j].who);
      avg += (validatorNominators[j].value / validatorNominators.length);
    }



    if(isNaN(averageMinNomination)){
      averageMinNomination = min / totalNominators;
    }
    else{
      averageMinNomination += min/totalNominators;
    }
    checkMinStake(min, minNominator)
<<<<<<< Updated upstream
=======
    if(thisCommission < 100) {
      checkNon100(min, minNominator)
      if(isNaN(averageMinNominationNon100)){
        averageMinNominationNon100 = min / countNon100;
      }
      else{
        averageMinNominationNon100 += min/countNon100;
      }
    }
>>>>>>> Stashed changes

    console.log(`\tCommission: ${validatorCommissionRate['commission'].toString() / 10000000}%`)
    console.log('\tNominators:', validatorNominators.length)
    console.log(`\tMin Nominator: ${minNominator} : ${min / DOT_DECIMAL_PLACES} ${getSuffix()}`)
    console.log(`\tMax Nominator: ${maxNominator} : ${max / DOT_DECIMAL_PLACES} ${getSuffix()}`)
    // console.log('\tMaximum Stake:', max / DOT_DECIMAL_PLACES, getSuffix())
    // console.log('\tMinimum Stake:', min / DOT_DECIMAL_PLACES, getSuffix())
    console.log('\tAverage Stake:', avg / DOT_DECIMAL_PLACES, getSuffix())
  }

  console.log()
  console.log("\nSummary Data:")
  console.log(`Total DOT: ${totalKSM / DOT_DECIMAL_PLACES}`)
  console.log(`Bonding Stake: ${totalBondingStake.toString() / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  console.log(`Staking Rate: ${totalBondingStake.toString() / totalKSM * 100} %`)
  console.log(`Total Number of Unique Nominators: ${uniqueNominators.size}`)

  console.log(`Highest-staked validator: ${highest} : ${highestAmount} ${getSuffix()}`)
  console.log(`Lowest-staked validator: ${lowest} : ${lowestAmount} ${getSuffix()}`)
  console.log(`Highest commission validator: ${highestCommission} : ${highestCommissionAmount / 10000000}%`)
  console.log(`Lowest commission validator: ${lowestCommission} : ${lowestCommissionAmount / 10000000}%`)

  // part 3
<<<<<<< Updated upstream
  console.log(`Lowest Minimal Nominator: ${lowestMinNominator} : ${lowestMinAmount / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  console.log(`Highest Minimal Nominator: ${highestMinNominator} : ${highestMinAmount / DOT_DECIMAL_PLACES} ${getSuffix()}`)  
=======
  console.log(`Lowest Minimal Nominator: ${lowestMinNominator} : ${lowestMinStake / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  // console.log(`Lowest Non-Zero Minimal Nominator: ${lowestNonZeroMinNominator} : ${lowestNonZeroMinStake / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  console.log(`Highest Minimal Nominator: ${highestMinNominator} : ${highestMinAmount / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  console.log(`Highest Minimal Nominator(non 100% commission validators): ${highestMinNominatorNon100} : ${highestMinAmountNon100 / DOT_DECIMAL_PLACES} ${getSuffix()}`)
  console.log(`Average Minimal Nomination: ${averageMinNomination / DOT_DECIMAL_PLACES} ${getSuffix()}`);
  console.log(`Average Minimal Nomination (Among Non 100% Commission Validators): ${averageMinNominationNon100 / DOT_DECIMAL_PLACES} ${getSuffix()}`);
>>>>>>> Stashed changes

  // part 4
  console.log(`Average Total Stake: ${averageTotalStake} ${getSuffix()}`)
  console.log(`Average Total Commission: ${averageTotalCommission / 10000000}%`)


  process.exit()
})()

const checkMinStake = (stake, currentValidator) => {
  if(isNaN(stake)){
    return;
  }
  if (isNaN(lowestMinAmount)) {
    lowestMinAmount = highestMinAmount = stake;
    lowestMinNominator = currentValidator;
    highestMinNominator = currentValidator;
  }
  else {
<<<<<<< Updated upstream
    if (stake < lowestMinAmount) {
      lowestMinAmount = stake;
      lowestMinNominator = currentValidator;
    } 
=======
    if (stake < lowestMinStake) {
      lowestMinStake = stake;
      lowestMinNominator = currentNominator;
    }
>>>>>>> Stashed changes
    else if (stake > highestMinAmount) {
      highestMinAmount = stake;
      highestMinNominator = currentValidator;
    }
  }
}


const check = (currentValidator, stake, commission) => {
  if (isNaN(highestAmount)) {
    // If highest_amount is NaN, this must be the
    // first.  Set this validator to highest and lowest everything.
    lowest = highest = currentValidator
    lowestAmount = highestAmount = stake
    lowestCommission = highestCommission = currentValidator
    lowestCommissionAmount = highestCommissionAmount = commission
  } else {
    // Check total stake

    if (stake > highestAmount) {
      highest = currentValidator
      highestAmount = stake
    } else if (stake < lowestAmount) {
      lowest = currentValidator
      lowestAmount = stake
    }

    // Check commissions

    if (commission > highestCommissionAmount) {
      highestCommission = currentValidator
      highestCommissionAmount = commission
    } else if (commission < lowestCommissionAmount) {
      lowestCommission = currentValidator
      lowestCommissionAmount = commission
    }
  }
}

function getSuffix() {
  if (network == 'kusama') return 'KSM';
  else return 'DOT';
}

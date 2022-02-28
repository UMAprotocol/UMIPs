## Headers

| UMIP-TBD           |                                                                                 |
| ------------------- | ------------------------------------------------------------------------------- |
| UMIP Title          | Add Ondo_ILP as supported price identifier                                  |
| Authors             | Alex (againes@umaproject.org)                   |
| Status              | DRAFT                                                                       |
| Created             | Feb. 28, 2022                                                                  |
| Discourse Link      | TBD |


# Summary

The DVM should support price requests for Ondo_ILP. The Ondo_ILP price identifier will allow [Ondo](https://ondo.finance/) to use the price identifier to track the impermanent loss protection metric for its vault product offering. This identifier will use ancillary data to guide voters to reach the impermanent loss calculation result correctly.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier to resolve the contract at expiry.

# Motivation

This identifier sets a general standard for calculating Ondo IL and removes the need to create individual proposals for each vault. The objective of this identifier is to provide impermanent loss protection to liquidity providers of Ondo vaults.

The user of the Ondo_ILP price identifier is intended to have the necessary ancillary data before deploying a contract.

# Data Specifications

All relevant price data is computed using information that can be found directly on the blockchain.

-----------------------------------------

- Price identifier name: `Ondo_ILP`
- Base Currency: Determined by the `VaultId`
- Quote Currency: NA
- Rounding: Round to 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- Example price providers: Infura and Alchemy include information on Ondo vault contract events. The Ondo_ILP price identifier depends on values drawn from the `Invested` and `Redeemed` events of the Ondo vault.
- Cost to use: [Infura](https://infura.io/) supports up to 100,000 requests per day for free and [Alchemy](https://www.alchemy.com/) allows 300,000,000 compute units/month for free along with archive data. You will need an archive node to perform the calculation using the script from the Price Feed Implementation below.
- Real-time price update frequency: Updated every block
- Historical price update frequency: Updated every block

# Price Feed Implementation

```
// Step 1: Copy the allPairVault contract abi and paste it in a json file named 'abi.json'
// Step 2: Prepare the deployment script and arguments. A sample script is: node ondo_ilp.js --fromBlock 11937674 --vaultContractAddress 0x2bb8de958134afd7543d4063cafad0b7c6de08bc --vaultId 0x02b9d144d64e12baa6b8f0ce82763fcef25c5b403c24eb299958bc077b7d9573 --url wss://eth-mainnet.alchemyapi.io/v2/{project_id}

const Web3 = require('web3')
const abi = require("./abi");

const argv = require("minimist")(process.argv.slice(), {
    string: [
      "url",
      "vaultContractAddress",
      "vaultId",
      "fromBlock"
    ]
  });

const fromBlock = argv.fromBlock;
const vaultContractAddress = argv.vaultContractAddress;
const vaultId = argv.vaultId;
const url = argv.url;
const web3 = new Web3(url);

async function calcIL() {
    const investArray = [];
    const redeemArray = [];

    var myContract = new web3.eth.Contract(abi, vaultContractAddress);
    
    // Pulls all of the Invested events. Make sure your fromBlock is before the event.
    const investEvents = await myContract.getPastEvents('Invested', {
        fromBlock: fromBlock,
        toBlock: 'latest'
    }, function(error, events){ (events) })
    .then(function(events){
        for (i = 0; i < events.length; i++) {
            if (events[i].raw.topics[1] === vaultId) {
                const seniorValue = events[i].returnValues.seniorAmount
                const juniorValue = events[i].returnValues.juniorAmount
                investArray.push({
                    seniorValue,
                    juniorValue
                })
                return investArray
            }
        }
    });

    // Pulls all of the Redeemed events. Make sure your vaultId has a Redeemed event and your fromBlock is before the event.
    const redeemEvents = await myContract.getPastEvents('Redeemed', {
        fromBlock: fromBlock,
        toBlock: 'latest'
    }, function(error, events){ (events) })
    .then(function(events){
        for (i = 0; i < events.length; i++) {
            if (events[i].raw.topics[1] === vaultId) {
                const seniorRedeem = events[i].returnValues.seniorReceived
                const juniorRedeem = events[i].returnValues.juniorReceived
                redeemArray.push({
                    seniorRedeem,
                    juniorRedeem
                })
                return redeemArray
            }
        }
    });

    // Pulls the junior and senior quantities from the Invested event
    const juniorInvest = parseFloat(Web3.utils.fromWei(investArray[0].juniorValue))
    const seniorInvest = parseFloat(Web3.utils.fromWei(investArray[0].seniorValue))

    // Pulls the junior and senior quantities from the Redeemed event
    const juniorRedeem = parseFloat(Web3.utils.fromWei(redeemArray[0].juniorRedeem))
    const seniorRedeem = parseFloat(Web3.utils.fromWei(redeemArray[0].seniorRedeem))

    // Calculates the price ratio at the Redeemed event and the product constant
    const redeemPriceRatio = juniorRedeem / seniorRedeem
    const productConstant = juniorInvest * seniorInvest;

    // Calculates the stragety to compare providing liquidity vs holding the assets
    const nonLpStrategy = ((seniorInvest * redeemPriceRatio) + juniorInvest);

    const lpStrategy = ((Math.sqrt(productConstant / redeemPriceRatio)) * redeemPriceRatio) + (Math.sqrt(productConstant * redeemPriceRatio));

    // Calculates IL
    const impermanentLoss = (nonLpStrategy - lpStrategy) / nonLpStrategy * 100;

    console.log("IL = " + impermanentLoss.toFixed(6) + "%")
}

// Runs the script
calcIL()

```

# Ancillary Data Specifications

`VaultID`: Each Ondo Vault has a unique id number created by hashing the metadata on the Vault: asset pair, strategy contract, start time, investment time, and duration of the product. The `VaultID` is used to get event data for the vault to perform the IL calculation.

`VaultContractAddress`: Including the `VaultContractAddress` in the ancillary data lets Voters know which `VaultID` contract to check events for.

```
VaultID:0x02b9d144d64e12baa6b8f0ce82763fcef25c5b403c24eb299958bc077b7d9573,
VaultContractAddress:0x2bb8de958134afd7543d4063cafad0b7c6de08bc
```

Key-value pairs above are separated by newlines just for readability, but no newlines should be used in real application. When this ancillary data dictionary (without newlines) is stored as bytes, the result would be:

```
5661756c7449443a3078303262396431343464363465313262616136623866306365383237363366636566323563356234303363323465623239393935386263303737623764393537332c5661756c74436f6e7472616374416464726573733a307832626238646539353831333461666437353433643430363363616661643062376336646530386263
```

A resource for finding the `VaultID` and `VaultContractAddress` is using the Ondo API. The API should only be used as a helpful resource with all data should be confirmed on the blockchain:
- [Tranche data](https://data.ondo.finance/v1/tranches): the `VaultId` corresponds with `vaultId` and `VaultContractAddress` with `contract` in the vault object.
- [Vault data](https://data.ondo.finance/v1/vaults): the `VaultId` corresponds with `id` and the `VaultContractAddress` corresponds with `contract`.

When designing ancillary data, the deployer should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon contract deployment.

# Rationale

The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can resolve the price request to zero (unless other non-zero unresolvable state value was provided in the ancillary data). The payout to long Ondo_ILP token recipients in unresolvable state would depend on the actual financial product library (FPL) used, but for the most common [Linear LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) or [Binary LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/BinaryOptionLongShortPairFinancialProductLibrary.sol) FPLs that would expire the long Ondo_ILP tokens in a worthless state.

# Implementation

When a price request is made, the following process should be followed:

1. Identify the `VaultId` and `VaultContractAddress` from the contracts ancillary data which will be used used to identify the Ondo vault impermanent loss is being calculated for. See the Ancillary Data Specifications section for more information on retrieving this data.
2. Scan the `Invested` events from the `VaultContractAddress` and retrieve the event that matches the Vault ID for the second element of the topics array.
    - In the `returnValues` response, note the `seniorAmount` and `juniorAmount` and confirm the values are associated with your `VaultId` from the contracts ancillary data. Scale both values 18 decimals.
3. Scan the `Redeemed` events from the `VaultContractAddress` and retrieve the event that matches the Vault ID for the second element of the topics array.
    - In the `returnValues` response, note the `seniorReceived` and `juniorReceived` and confirm the values are associated with your `VaultId` from the contracts ancillary data. Scale both values 18 decimals.
4. Calculate the price ratio at the `Redeemed` event using values from step 3:
```
redeemPriceRatio = juniorReceived / seniorReceived
```
5. Calculate the product constant at the `Invested` event using values from step 2: 
```
productConstant = juniorAmount * seniorAmount
```
6. Calculate the performance if the holder had exposure to the assets and did not provide liquidity. The `seniorAmount` and `juniorAmount` values are from step 2 and the redeemPriceRatio is the returned value from step 4: 
```
nonLpStrategy = ((seniorAmount * redeemPriceRatio) + juniorAmount);
```
7. Calculate the performance if the holder provided liquidity to the Ondo vault. ProductConstant is from step 5 and redeemPriceRatio is from step 4:
```
The square root of ((productConstant / redeemPriceRatio) * redeemPriceRatio) plus the square root of (productConstant * redeemPriceRatio)
```
8. Calculate the IL value. The nonLpStrategy is from step 6 and the lpStrategy is the returned value from step 7:
```
IL = (nonLpStrategy - lpStrategy) / nonLpStrategy
```
9. Multiply the returned value from step 8 by 100, and then round to 6 decimals to arrive at the final value.

Please note, the `Invested` and `Redeemed` events must have occurred before the Ondo_ILP price identifier can be expired.

**Example**

If the `VaultID` requested was `0x02b9d144d64e12baa6b8f0ce82763fcef25c5b403c24eb299958bc077b7d9573` and the `VaultContractAddress` was `0x2bb8de958134afd7543d4063cafad0b7c6de08bc` then:

We would need to identify the `Invested` events from the `vaultContractAddress` and retrieve the event that matches the Vault ID for the second element of the topics array. Scaling both values 18 decimals would give us:
-  seniorAmount: `3091789.318519653533374476` 
-  juniorAmount: `1406.163726066937016719`

We would need to identify the `Redeemed` events from the `vaultContractAddress` and retrieve the event that matches the Vault ID for the second element of the topics array. Scaling both values 18 decimals would give us:
-  seniorReceived: `3159190.325663381980402039` 
-  juniorReceived: `1556.948663245455287184`

The redeemPriceRatio would be calculated as: 
```
1556.948663245455287184 / 3159190.325663381980402039 = 0.0004928315494630794
```
The productConstant would be calculated as: 
```
1406.163726066937016719 / 3091789.318519653533374476 = 0.0004928315494630794 = 4347561988.343553
```
The strategy that did not provide liquidity would be calculated as: 
```
((3091789.3185196538 * 0.0004928315494630794) + 1406.163726066937) = 2929.895046526376
```
The strategy that did provide liquidity would be calculated as: 
```
((square root of (4347561988.343553 / 0.0004928315494630794)) * 0.0004928315494630794) + (square root of (4347561988.343553 * 0.0004928315494630794)) = 2927.5352849126443
```
IL would be calculated as (rounded to 6 decimals): 
```
(2929.895046526376 - 2927.5352849126443) / 2929.895046526376 * 100 = 0.080541
```

# Security Considerations

One of the main concerns is that someone with sufficient tokens for a pool chooses to manipulate the price. If a pool has little liquidity, a liquidity provider could potentially influence the price before the Redeemed event which would impact the impermanent loss calculation.

Another concern is if the ancillary data is constructed incorrectly or the data is not available. In the event this were to occur, UMA token holders are instructed to resolve the price request to zero.

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users. However, anyone using these price identifiers should take care to parameterize their price requests appropriately for their use case.
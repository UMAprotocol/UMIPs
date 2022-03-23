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
- Example price providers: Infura and Alchemy include information on Ondo vault contract events.
- Cost to use: [Infura](https://infura.io/) supports up to 100,000 requests per day for free and [Alchemy](https://www.alchemy.com/) allows 300,000,000 compute units/month for free along with archive data. You will need an archive node to perform the calculation using the script from the Price Feed Implementation below.
- Real-time price update frequency: Updated every block
- Historical price update frequency: Updated every block


# Ancillary Data Specifications

`VaultID`: Each Ondo Vault has a unique id number created by hashing the metadata on the Vault: asset pair, strategy contract, start time, investment time, and duration of the product. The `VaultID` is used to get event data for the vault to perform the IL calculation.

`VaultContractAddress`: Including the `VaultContractAddress` in the ancillary data lets Voters know which `VaultID` contract to check events for.

```
VaultID:0xb04fcee7a4a116c9b2a021d424a3896a4e36484d3616b307827cbeb3f98d2db4,
VaultContractAddress:0x2bb8de958134afd7543d4063cafad0b7c6de08bc,
StartTimestamp:1645581288,
EndTimestamp:1647737313
```

Key-value pairs above are separated by newlines just for readability, but no newlines should be used in real application. When this ancillary data dictionary (without newlines) is stored as bytes, the result would be:

```
5661756c7449443a3078623034666365653761346131313663396232613032316434323461333839366134653336343834643336313662333037383237636265623366393864326462342c5661756c74436f6e7472616374416464726573733a3078326262386465393538313334616664373534336434303633636166616430623763366465303862632c537461727454696d657374616d703a313634353538313238382c456e6454696d657374616d703a31363437373337333133
```

A resource for finding the `VaultID` and `VaultContractAddress` is using the Ondo API. The API should only be used as a helpful resource with all data should be confirmed on the blockchain:
- [Tranche data](https://data.ondo.finance/v1/tranches): the `VaultId` corresponds with `vaultId` and `VaultContractAddress` with `contract` in the vault object.
- [Vault data](https://data.ondo.finance/v1/vaults): the `VaultId` corresponds with `id` and the `VaultContractAddress` corresponds with `contract`.

When designing ancillary data, the deployer should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon contract deployment.

# Rationale

The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can resolve the price request to zero (unless other non-zero unresolvable state value was provided in the ancillary data). The payout to long Ondo_ILP token recipients in unresolvable state would depend on the actual financial product library (FPL) used, but for the most common [Linear LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) or [Binary LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/BinaryOptionLongShortPairFinancialProductLibrary.sol) FPLs that would expire the long Ondo_ILP tokens in a worthless state.

# Price Feed Implementation

```
// Step 1: Copy the allPairVault contract abi and paste it in a json file named 'abi.json', copy the strategy contract abi and paste it in a json file named 'strategy-abi.json', and the lp pool in a json file named 'pool-abi.json'. The abi for contacts can be found on Etherscan in the Contract tab => Code section => Contract ABI.
// Step 2: Prepare the deployment script and arguments. A sample script is: 
// node ondo_ilp.js --startTimestamp 1644858900 --endTimestamp 1647450900 --vaultContractAddress 0x2bb8de958134afd7543d4063cafad0b7c6de08bc --vaultId 0x02b9d144d64e12baa6b8f0ce82763fcef25c5b403c24eb299958bc077b7d9573 --url wss://eth-mainnet.alchemyapi.io/{project_id}

const Web3 = require("web3");
const abi = require("./abi");
const strategyAbi = require("./strategy-abi");
const poolAbi = require("./pool-abi");
const EthDater = require("ethereum-block-by-date");
const CoinGecko = require("coingecko-api");
const { getAbi } = require("@uma/contracts-node");

const argv = require("minimist")(process.argv.slice(), {
  string: [
    "url",
    "vaultContractAddress",
    "vaultId",
    "startTimestamp",
    "endTimestamp",
  ],
});

// These should all be included in the contracts ancillary data
const startTimestamp = argv.startTimestamp;
const endTimestamp = argv.endTimestamp;
const vaultContractAddress = argv.vaultContractAddress;
const vaultId = argv.vaultId;

const CoinGeckoClient = new CoinGecko();
const url = argv.url;
const web3 = new Web3(url);

async function calcIL() {
  // gets block based on timestamps from ancillary data
  const earlyBlock = await getBlock(startTimestamp);
  const endBlock = await getBlock(endTimestamp);

  // get strategy contract and tranche tokens
  const vaultContract = new web3.eth.Contract(abi, vaultContractAddress);
  const vaultData = await vaultContract.methods
    .getVaultById(vaultId)
    .call()
    .then((vault) => {
      return {
        strategy: vault.strategy,
        token0: vault.assets[0].token,
        token1: vault.assets[1].token,
      };
    });

  // get pool reserves at starting timestamp
  const startingReserves = await getPoolReserves(
    vaultData.strategy,
    vaultId,
    earlyBlock.block
  );

  // get pool reserves at ending timestamp
  const endingReserves = await getPoolReserves(
    vaultData.strategy,
    vaultId,
    endBlock.block
  );

  // get token0 starting and end price
  const token0Prices = await getGeckoPrices(
    vaultData.token0,
    startTimestamp,
    endTimestamp
  );

  // get token1 starting and end price
  const token1Prices = await getGeckoPrices(
    vaultData.token1,
    startTimestamp,
    endTimestamp
  );

  // scale tokens based on token decimals
  const startingToken0 =
    startingReserves.reserves[0] / 10 ** endingReserves.token0Decimals;
  const startingToken1 =
    startingReserves.reserves[1] / 10 ** endingReserves.token1Decimals;
  const endingToken0 =
    endingReserves.reserves[0] / 10 ** endingReserves.token0Decimals;
  const endingToken1 =
    endingReserves.reserves[1] / 10 ** endingReserves.token1Decimals;

  // get liquidity pool value at end timestamp
  const token0EndValue = endingToken0 * token0Prices.endPrice;
  const token1EndValue = endingToken1 * token1Prices.endPrice;
  const totalPoolEndValue = token0EndValue + token1EndValue;

  // calc Ondo's percentage of the total pool based on the total supply
  const ondoPoolPercentage =
    Number(endingReserves.ondoBalance) / Number(endingReserves.totalSupply);
  const lpStrategy = ondoPoolPercentage * totalPoolEndValue;

  // Hold Strategy
  const token0Hold = startingToken0 * token0Prices.endPrice;
  const token1Hold = startingToken1 * token1Prices.startPrice;
  const nonLpStrategy = token0Hold + token1Hold;

  // Calculates IL
  const impermanentLoss = ((nonLpStrategy - lpStrategy) / nonLpStrategy) * 100;

  console.log("IL = " + impermanentLoss.toFixed(6) + "%");
}

async function getGeckoPrices(token, startTimestamp, endTimestamp) {
  try {
    let data = await CoinGeckoClient.coins.fetchCoinContractMarketChartRange(
      token,
      "ethereum",
      {
        from: startTimestamp,
        to: endTimestamp,
      }
    );
    let startPrice = data.data.prices[0][1];
    let endPrice = data.data.prices.slice(-1)[0][1];
    return { startPrice, endPrice };
  } catch {
    console.error("Coingecko not returning price data for a token.");
  }
}

async function getPoolReserves(strategy, vaultId, blockNumber) {
  const strategyContract = new web3.eth.Contract(strategyAbi, strategy);

  // get pool Address associated with vaultId
  const poolAddress = await strategyContract.methods
    .getVaultInfo(vaultId)
    .call()
    .then((data) => {
      const address = data[0];
      return address;
    });

  let poolContract = new web3.eth.Contract(poolAbi, poolAddress);
  let pair = new web3.eth.Contract(poolAbi, poolAddress);

  // get tokens to get decimals
  let token0 = await poolContract.methods.token0().call();
  let token1 = await poolContract.methods.token1().call();

  let token0Contract = new web3.eth.Contract(getAbi("ERC20"), token0);
  let token1Contract = new web3.eth.Contract(getAbi("ERC20"), token1);

  // get decimals to scale values
  let token0Decimals = await token0Contract.methods.decimals().call();
  let token1Decimals = await token1Contract.methods.decimals().call();

  // get reserves, supply, and pool balance based on the blockNumber
  let reserves = await pair.methods.getReserves().call({}, blockNumber);
  let ondoBalance = await poolContract.methods
    .balanceOf(strategy)
    .call({}, blockNumber);
  let totalSupply = await poolContract.methods
    .totalSupply()
    .call({}, blockNumber);

  return {
    reserves: reserves,
    ondoBalance: ondoBalance,
    totalSupply: totalSupply,
    token0: token0,
    token1: token1,
    token0Decimals: token0Decimals,
    token1Decimals: token1Decimals,
  };
}

async function getBlock(timestamp) {
  const dater = new EthDater(web3);
  const utcVersion = new Date(timestamp * 1000).toUTCString();
  let block = await dater.getDate(
    utcVersion,
    true // to search for block before request
  );
  return block;
}

// Runs the script
calcIL();
```

# Implementation

When a price request is made, the following process should be followed:

1. Identify the `VaultId`, `VaultContractAddress`, `StartTimestamp` and `EndTimestamp` from the contracts ancillary data which will be used used to identify which Ondo vault impermanent loss is being calculated for. See the Ancillary Data Specifications section for more information on retrieving this data.
2. Use the `VaultContractAddress` from step 1 to call the `getVaultById` method with the `VaultId` as the argument and retrieve the `vaultStrategy` contract address and the `token` address for each tranche.
3. Identify the `poolAddress` by calling the `getVaultInfo` method on the `vaultStrategy` contract from step 2 using the `VaultId` as the argument.
4. Get total LP reserves by calling `getReserves()` method on the LP contract from Step 3 at the latest available block at or before each of the evaluation timestamps. This should return `token0` and `token1` balances as index 0 `_reserve0` and index 1 `_reserve1` respectively for each evaluation timestamp. Confirm these addresses match the `token` address for each tranche from step 2.
5. For both LP reserve tokens from Step 4 use the latest available pricing for each reserve currency before each of the evaluation timestamps from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - Ondo vaults currently only use "ethereum";
      * `contract_address`: reserve token address from Step 4;
      * `vs_currency`: TVL measurement currency based on the passed `TVLCurrency` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp (`StartTimestamp` parameter from the ancillary data);
      * `to`: end timestamp (`EndTimestamp` parameter from the ancillary data);
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id`  and `contract_address` for the same reserve token.
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. For each evaluation period (Step 1) choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
6. Scale down LP reserve balances from Step 4 with their respective decimals (call `decimals()` method on the token contracts from Step 2).
7. Multiply the LP reserve token balances at the `EndTimestamp` from Step 6 with the `EndTimestamp` price value from Step 5.
8. Sum the LP reserve balances returned from Step 7 to get the total value of the pool at the `EndTimestamp`.
9. Get the total LP token supply by calling `totalSupply()` method on the LP contract from Step 3 at the latest available block at or before the `EndTimestamp`. Get the portion of the pool balance owned by the vault at the same timestamp by calling the `balanceOf()` method on the `poolAddress` using the `vaultStrategy` from Step 2 as the argument. 
10. Divide the balance of the vault strategy by the total supply of the pool from Step 9 to get the percentage of the pool owned by the vault.
11. Multiply the total reserve balances from step 8 by the percentage of the pool owned by the vault from step 10 to get the value of the vault for the `EndTimestamp`.
12. Identify the value of the two reserve currencies from step 2 if liquidity had not been provided to the pool by using the `StartTimestamp` reserve balances from step 4 multiplied by the CoinGecko `EndTimestamp` prices from step 5. Sum these values together to get the total value of the pool for the `EndTimestamp` based on the quantities from the `StartTimestamp`.
13. Calculate impermanent loss by subtracting the returned value from step 11 from the returned value from step 12 and then dividing the returned value by the returned value from step 11. Multiply by 100 and round the returned value to 6 decimals to arrive at the final value as a percentage.

**Example**

For the example, we can use the ancillary data from the example above:
```
VaultID:0xb04fcee7a4a116c9b2a021d424a3896a4e36484d3616b307827cbeb3f98d2db4,
VaultContractAddress:0x2bb8de958134afd7543d4063cafad0b7c6de08bc,
StartTimestamp:1645581288,
EndTimestamp:1647737313
```
* Use the `VaultContractAddress` (0x2bb8de958134afd7543d4063cafad0b7c6de08bc) to call the `getVaultById` method with the `VaultId` (0xb04fcee7a4a116c9b2a021d424a3896a4e36484d3616b307827cbeb3f98d2db4) as the argument and retrieve the `vaultStrategy` contract address (0x9D9BA567dD13a6eC56f116bEDc3fff68Eea30FE3).
* We can identify the `poolAddress` by calling the `getVaultInfo` method on the `vaultStrategy` contract using the `VaultId` as the argument which would provide 0xBEdDB932490e776301c776526615965fAE2440de.
* Next, we can get the LP reserves by calling `getReserves()` method on the LP contract at the `StartTimestamp` and the `decimals()` method on each token contract to scale the reserve balance. After scaling, `getReserves()` returns the following (scaled to 18 decimals):
```
    _reserve0: '2298119.854045930466195991',
    _reserve1: '8272937.680889700131523915',
```
* The same step can be taken for the `EndTimestamp` (scaled to 18 decimals):
```
    _reserve0: '2289684.551488588283735145',
    _reserve1: '8325468.083574290172986904',
```
* Next, prices can be retrieved for each token at the `StartTimestamp` and `EndTimestamp` using the latest available pricing for each reserve currency before each of the evaluation timestamps from CoinGecko. For our example, the following prices were retrieved:
```
Token0:
    startPrice: '1.0011933867591472',
    endPrice: '0.9995187942574203',

Token1:
    startPrice: '0.2795408290403121',
    endPrice: '0.2783130205973281',
```
* Multiply the scaled LP reserves for the `EndTimestamp` by their respective Coingecko token prices:
```
Token0 Value: 0.9995187942574203 * 2289684.551488588283735145 = 2288582.7421337157
Token1 Value: 0.2783130205973281 * 8325468.083574290172986904 = 2317086.1702262093
```
* Get the total LP token supply by calling `totalSupply()` method on the LP contract and the portion of the pool balance owned by the vault by calling the `balanceOf()` method for the vault strategy at the `EndTimestamp`. Scale the values based on the `decimals()` method on the token contracts and then divide the balance of the vault by the total pool and multiply the returned value by the total value of the pool:
```
(4326814.937110206473452784 / 4326814.937110206473453784) * 4605668.912359925 = 4605668.912359925
```
* Find the value of the pool tokens if you were to just hold them without providing liquidity to the pool by multiplying the reserves at the `StartTimestamp` by the asset prices at the `EndTimestamp`. Token0 would have been worth 2298119.8540459303 * 0.9995187942574203 = 2297013.985575027 and Token1 would have been worth 8272937.680889701 * 0.2783130205973281 = 2312623.8579147435. The sum of the two values is equal to 4609637.84348977.

* The impermanent loss calculation then takes the difference of providing liquidity to the pool and only holding the assets. For our example, the following calculation would be used and the result would be rounded to 6 decimals:
```
(( 4609637.84348977 - 4605668.912359925 ) / 4609637.84348977 ) * 100 = 0.086101
```

# Security Considerations

One of the main concerns is that someone with sufficient tokens for a pool chooses to manipulate the price. If a pool has little liquidity, a liquidity provider could potentially influence the price before the Redeemed event which would impact the impermanent loss calculation.

Another concern is if the ancillary data is constructed incorrectly or the data is not available. In the event this were to occur, UMA token holders are instructed to resolve the price request to zero.

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users. However, anyone using these price identifiers should take care to parameterize their price requests appropriately for their use case.
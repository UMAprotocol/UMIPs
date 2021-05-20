
## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add BNT, vBNT as supported price identifiers|
| Authors             |**StevenFox**         |
| Status              | Draft                                                         |
| Created             | **19 May 2021**                                              |
| Discourse Link      |       |

# Summary 

USDC/BNT 0x23d1b2755d6C243DFa9Dd06624f1686b9c9E13EB
vBNT/BNT 0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8


# Motivation

The DVM currently does not yet support these price identifiers. vBNT (the Bancor Governance Token) is being proposed as a supported collateral type along with the BNT token.  The inclusion of the two pools above will form part of the price oracle The initial use case for these price identifiers is to create a call options.


# Data Specifications

Contract Addresses for Bancor Pools:
USDC/BNT 0x23d1b2755d6C243DFa9Dd06624f1686b9c9E13EB
vBNT/BNT 0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8
 
# Price Feed Implementation

To get the price of of both USDC/BNT and vBNT/BNT, the following script can be used. The script has 2 dependencies along with requiring an archive node URL.

Install the dependencies by running ` npm install web3` and `npm install decimal.js`.  

Once you have done this place your archive node URL in the `NODE_ADDRESS` field and set the time stamp in the `DATE_AND_TIME`. 

```
const Web3 = require("web3");
const Decimal = require("decimal.js");

Decimal.set({precision: 100, rounding: Decimal.ROUND_DOWN});

const DECIMAL_PLACES = process.argv.length > 2 ? Number(process.argv[2]) : 2;

const NODE_ADDRESS = "YOUR ARCHIVE NODE";
const DATE_AND_TIME = "April-15-2021 10:00:00 AM";

const BNT_TOKEN = {address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C", decimals: "18"};

const POOL_TOKENS = [
    {address: "0x874d8dE5b26c9D9f6aA8d7bab283F9A9c6f777f4", symbol: "USDC/BNT"},
    {address: "0x3D9E2dA44Af9386484d0D35C29eB62122e4F4742", symbol: "vBNT/BNT"},
];

const ERC20_ABI = [
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

const TOKEN_ABI = [
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

const CONVERTER_ABI = [
    {"inputs":[],"name":"reserveTokens","outputs":[{"internalType":"contract IReserveToken[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"contract IReserveToken","name":"token","type":"address"}],"name":"recentAverageRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const blocks = {};

async function getBlock(web3, number) {
    if (blocks[number])
        return blocks[number];
    const block = await rpc(web3.eth.getBlock(number));
    return blocks[block.number] = {number: block.number, timestamp: block.timestamp};
}

async function searchBlock(web3, lo, hi, timestamp) {
    while (true) {
        const midNumber = Math.round((timestamp - lo.timestamp) / (hi.timestamp - lo.timestamp) * (hi.number - lo.number) + lo.number);
        if (midNumber == lo.number)
            return await searchBetterBlock(web3, lo, timestamp, +1);
        if (midNumber == hi.number)
            return await searchBetterBlock(web3, hi, timestamp, -1);
        const mid = await getBlock(web3, midNumber);
        if (mid.timestamp < timestamp)
            lo = mid;
        else if (mid.timestamp > timestamp)
            hi = mid;
        else
            return mid;
    }
}

async function searchBetterBlock(web3, block, timestamp, sign) {
    while (block.timestamp * sign < timestamp * sign) {
        const nextBlock = await getBlock(web3, block.number + sign);
        if (nextBlock.timestamp * sign >= timestamp * sign)
            return (nextBlock.timestamp - timestamp) * sign < (timestamp - block.timestamp) * sign ? nextBlock : block;
        block = nextBlock;
    }
    return block;
}

async function timestampToBlockNumber(web3, timestamp) {
    const lo = await getBlock(web3, 1);
    const hi = await getBlock(web3, "latest");
    const block = await searchBlock(web3, lo, hi, timestamp);
    return block.number;
}

async function rpc(promise) {
    while (true) {
        try {
            return await promise;
        }
        catch (error) {
            if (!error.message.startsWith("Invalid JSON RPC response"))
                throw error;
        }
    }
}

async function call(method, blockNumber) {
    return await rpc(method.call(null, blockNumber));
}

async function run() {
    const web3 = new Web3(NODE_ADDRESS);
    const timestamp = new Date(DATE_AND_TIME).valueOf() / 1000;
    const blockNumber = await timestampToBlockNumber(web3, timestamp);
    const tokens = POOL_TOKENS.map(token => new web3.eth.Contract(TOKEN_ABI, token.address));
    const owners = await Promise.all(tokens.map(token => call(token.methods.owner())));
    const converters = owners.map(owner => new web3.eth.Contract(CONVERTER_ABI, owner));
    const tuples = await Promise.all(converters.map(converter => call(converter.methods.reserveTokens())));
    const addresses = tuples.map(tuple => tuple.find(address => address != BNT_TOKEN.address));
    const reserves = addresses.map(address => new web3.eth.Contract(ERC20_ABI, address));
    const decimals = await Promise.all(reserves.map(reserve => call(reserve.methods.decimals())));
    const rates = await Promise.all(converters.map(converter => call(converter.methods.recentAverageRate(BNT_TOKEN.address), blockNumber)));
    for (let i = 0; i < POOL_TOKENS.length; i++) {
        const n = rates[i][0] + `e-${decimals[i]}`;
        const d = rates[i][1] + `e-${BNT_TOKEN.decimals}`;
        console.log(POOL_TOKENS[i].symbol + " average rate: " + Decimal(n).div(d).toFixed(DECIMAL_PLACES));
    }
    web3.currentProvider.disconnect();
}

run();
```


# Technical Specifications

Price Identifier Name: BNTUSD

Base Currency: BNT

Quote currency: USD

Scaling Decimals: 18 (1e18)

Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

Price Identifier Name: vBNTBNT

Base Currency: BNT

Quote currency: vBNT

Scaling Decimals: 18 (1e18)

Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)


# Rationale

The price for vBNT can be taken using the USDC/BNT liquidity pool for the BNT price and the BNT/vBNT to derive the vBNT price.
Our pool contacts maintain an SMA (slowly-moving average) price, which offers protections from flash loans.
The choice in using Bancors own pools is due to it being the highest liquidity pools for both tokens themselves.

The script is designed to give a price at a given time instead of a constant price feed. This is due to call options only requiring a price at the time of settlement. 

# Implementation

1. Get the SMA price of USDC/BNT from the USDC/BNT pool and BNT/vBNT from the BNT/vBNT pool, which can be done via the script above.
2. Divide the BNT/USDC price by the BNT/vBNT to get the USDC/vBNT price

# Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. 

Added to this, there will be no need to run liquidation bots since this price feed will be used for the the call options. 


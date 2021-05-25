
## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add vBNTBNT as a supported price identifier|
| Authors             | StevenFox        |
| Status              | Draft                                                         |
| Created             | 19 May 2021                                              |
| Discourse Link      |[Link](https://discourse.umaproject.org/t/bnt-and-vbnt-price-identifiers/1127)   |

# Summary
The DVM should support the addition of vBNTBNT as a supported price ID. The use of this price identifier will primarily be for call options. This UMIP will also outline how to calculate the price of vBNT in BNT using a custom script that will be used for the call option price calculation.

This UMIP can also be extended to creating a price feed for vBNTBNT.

# Motivation
The DVM currently does not yet support the required price identifiers. vBNT (the Bancor Governance Token) is being proposed as a supported collateral type along with the BNT token in a separate proposal.

The primary focus of this UMIP is to arrive at an expiry price for the vBNT call options. Below, we will outline how to calculate the price of the options. It should be noted that the method to calculate the price is specifically a price at a given time.

# Markets and Data sources

- Price identifier name: vBNTBNT
- Markets & Pairs: vBNT/BNT from Bancor. This is the vBNT/BNT pool address: [0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8](https://etherscan.io/address/0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8).
- Example data providers: Provider to use: On-chain information
- Cost to use: NA
- Real-time data update frequency: Every block
- Historical data update frequency: Every block
 
# Price Feed Implementation

The following script can be used to get the 10 minute SMA price of BNT/vBNT. The script has 2 dependencies along with requiring an archive node URL.

Install the dependencies by running ` npm install web3` and `npm install decimal.js`.  

Once you have done this place your archive node URL in the `NODE_ADDRESS` field and set the time stamp in the `DATE_AND_TIME`. 

```
const Web3 = require("web3");
const Decimal = require("decimal.js");

Decimal.set({precision: 100, rounding: Decimal.ROUND_DOWN});

const DECIMAL_PLACES = process.argv.length > 2 ? Number(process.argv[6]) : 6;

const NODE_ADDRESS = "YourArchiveNodeAddress";
//UNIX Timestamp
const TIMESTAMP = 1621846582;

const BNT_TOKEN = {address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C", decimals: "18"};

const POOL_TOKENS = [
    {address: "0x3D9E2dA44Af9386484d0D35C29eB62122e4F4742", symbol: "BNT/vBNT"},
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
    const blockNumber = await timestampToBlockNumber(web3, TIMESTAMP);
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

**vBNTBNT**
Price Identifier Name: vBNTBNT

Base Currency: vBNT

Quote currency: BNT

Scaling Decimals: 18 (1e18)

Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

# Rationale

Our pool contracts maintain an SMA (slowly-moving average) price, which offers protections from flash loans.
The choice in using Bancor's own pools is due to them being the highest liquidity pools for both tokens. 

SMA (slowly-moving average) Rate:
Updated upon every conversion, to reflect the average rate between the two reserve tokens of the pool during the last 10 minutes. If no conversion has occurred for over 10 minutes, then the SMA will look at the 10 minute interval that had the last transaction. If the there is a new conversion, the SMA is updated.

Rate = the value of 1 A in units of B, where A is the pool's 1st reserve token, and B is the pool's 2nd reserve token

The script is designed to give a price at a given time instead of a constant price feed. This is due to call options only requiring a price at the time of settlement. This choice is due to the vBNT token not being widely traded.

# Implementation

At a given time. The price of vBNTBNT can be calculated as follows. 
1. Get the 10 minute SMA price of vBNTBNT from the vBNTBNT pool by running the script above. Be sure to follow the details and ensure the timestamp matches the price request timestamp.
2. The script will output the BNT/vBNT price.
3. The inverse of the results of the script should be taken to get the vBNT/BNT price.
4. Round the vBNTBNT result to 6 decimal places. 


# Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. 

Added to this, there will be no need to run liquidation bots since this price feed will be used for the the call options. 

This UMIP should be updated when the ability to create a price feed from Bancor pools is available.

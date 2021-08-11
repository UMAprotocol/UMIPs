# Headers:

| UMIP-123            |                                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| UMIP Title          | Add `XSUSHI_APY` as a price identifier                                 |
| Authors             | Jono (thevdm100@gmail.com)                                                |
| Status              | Draft                                                                     |
| Created             | August 5th, 2021                                                          |
| Discourse Link      | https://discourse.umaproject.org/t/XXXXXXXXXXXXXXXXXXXXX                  |

# Summary:

The DVM should support price requests for the xSushi APY derived from an arbitrary number of days of sushi yield data.

# Motivation:

Across Defi there exists no product in which traders can express views on the rate of change of market making yields in AMM’s in a non capital intensive way. As swap fees are a direct proxy for volume/volatility, there are many parties that would benefit if such a product existed. Two groups who would likely balance short and long interest, namely:

**Potential short party**: Market makers, miners, MEV searchers, Sushiswap and xSushi holders (assuming sufficient liquidity) could hedge revenues by shorting this synthetic if they believe that volume is likely to decline as all parties have revenues correlated to volume.

**Potential long party**: Speculators can take leveraged bets on the direction of swap fees/volume/volatility. The leverage is implicit as taking bets on the xSushi yield through this synthetic does not require the capital intensive depositing of Sushi in return for xSushi.

# Data Specifications:

All relevant price data is computed using information that can be found directly on the blockchain using an archive node.
* Price identifier name: `XSUSHI_APY`
* Example price providers: The relevant data can be obtained on-chain using an archive node:
  * Alchemy (node) offers a free 25,000,000 compute units / month with archive node capability
* This information is also available on The Graph with the exact timestamps needed (UTC 00:00:00)
* Real-time price update frequency: Updated every day
* Historical price update frequency: Updated every day

# Technical Specifications:

* Price identifier name: `XSUSHI_APY` (5% expressed as 5 i.e not decimal format)
* Base Currency: XSUSHI APY
* Quote Currency: N/A
* Rounding: Round to 4 decimal places (fifth decimal place digit >= 5 rounds up and < 5 rounds down)

# Rationale:

xSushi yield was specifically chosen as it is much easier/cheaper to distort volume/swap fees in a single pool than across an entire AMM (current TVL of sushiswap is >$3bn at the time of writing). 

Another core consideration that led to using xSushi APY is that 0.05% of every swap fee of 0.3% is redirected to xSushi stakers. Meaning to generate $1 of fees for xSushi holders through trading, a trader will have to pay $6 in swap fees ($6 x 0.05%/0.3% = $1) significantly raising the cost of manipulation.

Both methods above significantly reduce potential price identifier manipulation.

# Price Feed Implementation

The accounting methodology for xSushi is fortunately very simple. The Sushi generated from protocol revenue is deposited into a smart contract which all xSushi holders have a proportional share in. The ratio in which xSushi can be redeemed for Sushi is calculated by dividing the ever increasing Sushi balance in the xSushi smart contract by the number of xSushi tokens in circulation. 

The `XSUSHI_APY` price would require the creation of a new price feed. The pythonic pseudo-code for such an identifier is below:

```python
from web3 import Web3
#connect to archive node - note that infura doesn't offer free archive node services
w3 = some_archive_node_connection

#set ancilliary data (default is 7)
if period == None:
 period = 7
else:
 period = ancillaryData.period.value

#create the contract objects, using relevant addresses and abi's easily found on etherscan
xsushi_contract = w3.eth.contract(address='0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272', abi=xsushi_abi)
sushi_contract = w3.eth.contract(address= '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', abi= sushi_abi)
#list of blocks that are just before 00:00:00 UTC for the last period days, with block_t0 referencing the latest blocktime in the list
blocks = [block_t-1, block_t0]

for block in blocks: 
  #retrieve the total supply of xsushi
  xsushi_supply = xsushi_contract.functions.totalSupply().call(block_identifier = block)
  #retrieve the amount of sushi staked in the xsushi contract (aka sushi-bar)
  sushi_staked = sushi_contract.functions.balanceOf('0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272').call(block_identifier = block)
  #calculate how much Sushi can be redeemed for each xSushi token (Sushi:xSushi ratio)
  ratio = sushi_staked/xsushi_supply
  ratios.append(ratio)
#note that as we multiply by 100 in the final step the final result is calculated to 10 decimal places

xsushi_apy = (((ratios[-1]/ratios[0])**(365/period))-1)*100
```
## Ancillary Data Specifications:

This price identifiers can optionally include ancillary data to specify the period over which data for the APY is calculated. When converted from bytes to UTF-8, the ancillary data should be a dictionary containing a period key:value pair like so:

```period:7```

`period` should be specified in days. If a `period` key value pair is not present, then the ancilliary data should default to a period:7

When the ancillary data dictionary "period:7" is stored as bytes, the result would be: 0x706572696f643a37

## Implementation in natural language:

Formally the `XSUSHI_APY` pricing identifier calculation is defined as:

<img src="https://render.githubusercontent.com/render/math?math={( [\frac{r_1}{r_0}]^p - 1 )\times 100}">

where:

<img src="https://render.githubusercontent.com/render/math?math={r_1}"> = Sushi:xSushi latest ratio

<img src="https://render.githubusercontent.com/render/math?math={r_0}"> = Sushi:xSushi ratio`period` days ago

<img src="https://render.githubusercontent.com/render/math?math={p}"> = 365/period

To further clarify the identifier, below is an example of the calculation. Please note for illustrative purposes there has been rounding to 13 decimal places (in the actual price identifier please retain all decimals until final rounding) and a `period` of 7 days from ancilliary data is assumed.

| Date  (00:00:00 UTC)  | Sushi:xSushi ratio|
| ------------- | ------------- |
| 16 July 2021  | 1.1679843569031  |
| 17 July 2021  | 1.1682364571499  |
| 18 July 2021  | 1.1682364571499  |
| 19 July 2021  | 1.1685253008337  |
| 20 July 2021  | 1.1685253008337  |
| 21 July 2021  | 1.1687617823123  |
| 22 July 2021  | 1.1689649745808  |

We can back out the xSushi yield between 16 July 2021 and 22 July 2021 as follows: 

Firstly, get the 7 day yield:

(1.1689649745808/1.1679843569031) - 1 = 0.00083958117

Secondly, as we assume weekly compounding the above value is annualized as follows:

(((1 + 0.00083958117) ^ (365/7)) - 1) = 0.044731373612

And to make trading more intuitive (e.g. if synth trades for $4.4731 it implies 4.4731% APY) we multiply by 100 and round to 4 decimals:

0.044731373612 * 100 = 4.4731

# Security Considerations:

First and foremost, manipulating any volume based synthetic asset can be achieved relatively cheaply if a relevant pricing identifier is constructed naively. In the rationale section two strong cases are made for why this price identifier is resistant against common volume manipulation techniques such as wash trading. Employing these safeguards in the construction of this price identifier significantly raises the cost of manipulation, to such a degree that the price identifier should be secure enough to safely underpin financial contracts.

It is also recommended that this price identifier is to be used in combination with the LSP financial contract that has a native upper bound. This limited upside is a further security measure on the price identifier as it lowers potential profitability of any attempted manipulation.

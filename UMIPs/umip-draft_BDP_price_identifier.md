# Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BDPUSD, USDBDP as price identifiers              |
| Authors    | Logan (logan@opendao.io) |
| Status     | Draft                                                                                                                                   |
| Created    | March 31, 2021                                                                                                                           |
| Link to Discourse|    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                       |

## Summary
The DVM should support price requests for the BDPUSD and USDBDP price index. These price identifiers will serve to support BDP token as collateral.

## Motivation
Supporting the BDPUSD price identifier would enable the creation of the BDP backed stablecoin Big Data Protocol token holders can utilize this as a hedging tool, and could go long, or use the new stablecoin for other purposes. It also lays the groundwork for other future projects that may need to query the same price identifier.

A platform could use this price identifier to properly determine the quantity of BDP required to mint a dollar-pegged BDP-backed stable coin.

BDP has a total supply of 32-million, with 24-million already in circulation. At the time of writing, the Big Data Protocol token market cap is $83,872,700 with a 24-hour trading volume of $10,790,928.

More information on the Big Data Protocol can be found on the website:  https://bigdataprotocol.com/ 

## Markets and Data Sources
Gate.io and HitBTC should be used to construct the price.These 2 exchanges comprise a significant amount of BDP trade volume and/or have available pricefeeds on Cryptowatch. A third suggestion, Poloniex, has insufficient volume to include, however, additional sources should be added in the future as they become reliably available.

Which specific pairs should be queried from each market?

- Gate.io: BDP/USDT
- HitBTC: BDP/USDT

Provide recommended endpoints to query for real-time prices from each market listed.

- Gate.io: BDP/USDT: https://api.cryptowat.ch/markets/binancebdpusdt/price

- HitBTC: BDP/USDT: https://api.cryptowat.ch/markets/hitbtc/bdpusdt/price


How often is the provided price updated?

- The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

- Gate.io: https://api.cryptowat.ch/markets/binance/oceanusdt/ohlc?after=1612880040&before=1612880040&periods=60

- HitBTC: https://api.cryptowat.ch/markets/hitbtc/bdpusdt/ohlc?after=1612880040&before=1612880040
 

Do these sources allow for querying up to 74 hours of historical data?

- Yes

How often is the provided price updated?

- The lower bound on the price update frequency is a minute

Is an API key required to query these sources?

- No

Is there a cost associated with usage?

- Yes

If there is a free tier available, how many queries does it allow for?

- The lower bound on the number of queries allowed per hour is >> 1000.

What would be the cost of sending 15,000 queries?

- Approximately $5

## Price Feed Implementation
Associated BDP price feeds are available via Cryptowatch. No other further feeds required.

## Technical Specifications
- Price Identifier Name: BPDUSD

- Base Currency: BPD

- Quote Currency: USD

- Intended Collateral Currency: USDC

- Collateral Decimals: 6

- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Does the value of this collateral currency match the standalone value of the listed quote currency?: YES

- Is your collateral currency already approved to be used by UMA financial contracts?: YES

---

- Price Identifier Name: USDBDP

- Base Currency: USD

- Quote Currency: BDP

- Intended Collateral Currency: BDP

- Collateral Decimals: 18

- Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)

- Does the value of this collateral currency match the standalone value of the listed quote currency?: YES

- Is your collateral currency already approved to be used by UMA financial contracts?: In progress 

## Rationale
The addition of BDPUSD and USDBDP fits into a larger goal of advancing the adoption of the UMA protocol by allowing BDP to be used as collateral for minting a stable coin among a suite of OpenDAO stable coins. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Currently the most liquid exchange with USD or stablecoin markets for BDP on CryptoWatch is gate.io. Despite being quite new, it is built on top of Ocean Protocol and is operated in tandem with the core team. Ocean, being the core protocol, is currently being traded on more than two dozen exchanges, including what are widely considered to be several top tier platforms - it is expected that BDP will be following suit rapidly and will be insulated from market forces via their association.

In the current setting, there will need to be a significant event that erodes confidence in Big Data Protocol or Ocean and the token for it to be a security or PR concern.

## Implementation
Voters should query for the price of BDPUSDT at the price request timestamp on Gate.io and HitBTC. Recommended endpoints are provided in the markets and data sources section.

When using the recommended endpoints, voters should:

1) Use the open price of the OHLC period that the timestamp falls in.


2) Take the mean of the results

3) The mean from step 2 should be rounded to six decimals to determine the BDPUSD price.

4) The value of USDBDP will follow the exact same process but undergo one additional step: it will be the result of dividing 1/BDPUSD.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

Opportunities for manipulation seem slim, in relation to other projects in the decentralized finance ecosystem. However, it should be noted that additional price data should be added as soon as available to improve price accuracy. 

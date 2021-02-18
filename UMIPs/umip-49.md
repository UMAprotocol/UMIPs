## HEADERS

| UMIP-49          |                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------- |
| UMIP Title        | Add DAIPHP and PHPDAI as a price identifier                                         |
| Authors           | Chris Verceles (chris.verceles@halodao.com), James Orola (james.orola@halodao.com)  |
| Status            | Final                                                                               |
| Created           | Feb 3, 2021                                                                         |
| Link to Discourse | [Discourse](https://discourse.umaproject.org/t/adding-dai-php-price-identifier/135) |

# SUMMARY

The DVM should support price requests for the DAIPHP and PHPDAI price index.

# MOTIVATION

The DVM currently does not support the DAIPHP or PHPDAI price index. Supporting the DAIPHP and PHPDAI price identifiers would enable the creation of a synthetic DAIPHP and PHPDAI stablecoin, backed by DAI as collateral. Token minters could go short on DAI/PHP index, while token holders could go long or use synthetic PHP for functional purposes.

Examples of a person interacting with a contract that uses this price identifier would be;

    - In trading pairs on Philippine cryptocurrency exchanges
    - Basis for on chain, on demand liquidity in cross border remittance (our team is starting with the Singapore Philippine corridor with [ZkSync](https://zksync.io/faq/intro.html), [Argent](http://argent.xyz/), [SG stablecoin on ramp](https://www.xfers.com/sg/) and [PH off ramp](https://www.bloom.solutions/) who would use the synthetic Philippine Peso )

More information on what we aim to achieve can be found here: [website](https://halodao.com)

# MARKETS & DATA SOURCES

**Required questions**

1. What markets should the price be queried from?

   - CoinMarketCap
   - CoinGecko

2. Which specific pairs should be queried from each market?

   - DAI:PHP

3. Provide recommended endpoints to query for real-time prices from each market listed.

   - CMC: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=DAI&convert=PHP&CMC_PRO_API_KEY=<free tier api key>`
   - CG: `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x6b175474e89094c44da98b954eedeac495271d0f&vs_currencies=php`

4. How often is the provided price updated?

   - CMC: every 60 seconds
   - CG: according to CG, price updated every 1 to 10 minutes [FAQ #6](https://www.coingecko.com/id/faq)

5. Provide recommended endpoints to query for historical prices from each market listed.

   - CMC: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=DAI&convert=PHP&&time_start=<unix timestamp>&time_end=<unix timestamp>&CMC_PRO_API_KEY=<standard plan api key>`

     - _Note: Only available for Standard & higher tier plans_. For the historical price, we found it useful to store the time-price value pair every time update() is called, which is a different approach from CryptoWatchPriceFeed since it uses another API call to fetch the history. This is because of our CoinMarketCap API key plan limitation. initial implementation here https://github.com/UMAprotocol/protocol/pull/2480

   - CG: `https://api.coingecko.com/api/v3/coins/dai/history?date=<dd-mm-yyyy>`

6. Do these sources allow for querying up to 74 hours of historical data?

   - CMC: Yes
   - CG: Yes

7. How often is the provided price updated?

   - CMC: every 5 minutes
   - CG: not directly answered by CG FAQ page, but if price, trading volume, market capitalization updated every 1 to 10 minutes perhaps historical data (not sure if this question is a duplicate) is appended on every price update as well

8. Is an API key required to query these sources?

   - CMC: Yes
   - CG: No

9. Is there a cost associated with usage?

   - CMC: Yes, if historical prices endpoint is used, otherwise no
   - CG: No

10. If there is a free tier available, how many queries does it allow for?

    - CMC: Yes, 10K call credits /mo
    - CG: Yes, 100 requests/minute

11. What would be the cost of sending 15,000 queries?

    - CMC: $29/ mo for Hobbyist plan which bumps call credits to 40K /mo
    - CG: Free!


# PRICE FEED IMPLEMENTATION

Link to the UMA protocol PR:

- https://github.com/UMAprotocol/protocol/pull/2480

Link to the price feed pull issue:

- https://github.com/UMAprotocol/protocol/issues/2474


# TECHNICAL SPECIFICATIONS

## DAIPHP

**1. Price Identifier Name** - DAIPHP

**2. Base Currency** - DAI

**3. Quote currency** - PHP

**4. Intended Collateral Currency** - DAI

- Does the value of this collateral currency match the standalone value of the listed quote currency?

  - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.

  - Yes, we use DAI

**5. Collateral Decimals** - 18

- DAI has 18 Decimals (obtained [here](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)).

**6. Rounding** - 18 decimal places.

## PHPDAI

**1. Price Identifier Name** - PHPDAI

**2. Base Currency** - PHP

**3. Quote currency** - DAI

**4. Intended Collateral Currency** - DAI

- Does the value of this collateral currency match the standalone value of the listed quote currency?

  - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.

  - Yes, we use DAI

**5. Collateral Decimals** - 18

- DAI has 18 Decimals (obtained [here](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)).

**6. Rounding** - 18 decimal places.

# RATIONALE

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

DAI:PHP endpoints are available from CoinGecko (CG) and CoinMarketCap (CMC) for price information. These initial price sources were chosen as

- CG and CMC provide a readily available methodology for consolidating and validating price data between a particular crypto asset and fiat quote across exchanges worldwide (see https://www.coingecko.com/en/methodology and https://coinmarketcap.com/api/faq/ )

Our initial approach in lieu of not having access to a "raw" exchange based DAI:PHP or PHP:DAI pair was to source and consolidate component price feeds of DAI:USD and USD:PHP, but it seems CG already does this with their [OpenExchangeRates](https://openexchangerates.org/) integration. In the future, the [HaloDAO](https://halodao.com/) team (or any other team making use of this) will add more price feed sources as the DAI - PHP market builds volume and listings (which we are pushing them to do).

Additionally, both CG and CMC sources offer free and publicly accessible DAI:PHP endpoints, which we would then invert in the price feed implementation to arrive at the PHP:DAI rate.

# IMPLEMENTATION

1. Voters should query for the DAIPHP rate from CoinMarketCap and CoinGecko at the nearest timestamp that is earlier than the price request timestmap.
2. Voters should then calculate the mean of the CMC and CG results.
3. This result should be rounded to 18 decimal places to return the DAIPHP price.
4. To get the PHPDAI price, the inverse of DAIPHP should be calculated. (1/(DAIPHP)). This should be rounded to 18 decimal places.


**What prices should be queried for and from which markets?**

   - DAI:PHP from CoinMarketCap
   - DAI:PHP from CoinGecko

**Pricing interval**

   - 300 seconds

**Input processing**

   - Human intervention in extreme circumstances where the result differs from broad market consensus

**Result processing**

   - Mean between the DAI:PHP feeds of CG, CMC
   - Invert the resulting DAI:PHP rate (for example, if DAI:PHP returns 48, then PHP:DAI rate = 1/48) to get the PHP:DAI rate


# Security considerations

**Example questions**

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. Regarding price certainty, the combination of querying from consolidated DAI:USD and USD:PHP price feeds from Coingecko and Coinmarketcap should provide reasonable certainty in liue of exchanges listing DAI in the Philippines (which we are working on).

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified

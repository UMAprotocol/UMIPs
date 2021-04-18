# Add PUNK-BASICUSD and USDPUNK-BASIC as price identifiers

## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [Add PUNK-BASICUSD and USDPUNK-BASIC as price identifiers]                                                                                                  |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                  |
| Created    | April 18, 2021
| Link to Discourse    | [Link](https://discourse.umaproject.org/t/add-punk-baiscusd-and-usdpunk-basic-as-price-identifiers/913)

# SUMMARY
The DVM should support price requests for the below price indices:
- PUNK-BASIC/USD
- USD/PUNK-BASIC

The canonical form should be `PUNK-BASICUSD` and `USDPUNK-BASIC`

# MOTIVATION

1. What are the financial positions enabled by adding these price identifiers that do not already exist?

- These price identifiers allow the use of the base currency as collateral for minting synthetics or call options. See also
[the related collateral UMIP](https://github.com/UMAprotocol/UMIPs/pull/250).

2. Please provide an example of a person interacting with a contract that uses these price identifiers.
- Base currency could be used to mint yield dollars or other synthetics, and liquidators could identify undercollateralized positions by comparing the USD value of the synthetic to the value of the locked collateral.
- Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.

# RATIONALE

Punk-Basic has all the liquidity on Sushiswap in Punk-Basic/ETH pair. It is best to take TWAP so that irregular price action or attempted manipulation can be invalidated on DEX.
# PUNK-BASIC

## MARKETS & DATA SOURCES
**Required questions**

Markets: SushiSwap

SushiSwap: [PUNK-BASIC/ETH](https://app.sushi.com/pair/0x0267bd35789a5ce247fff6cb1d597597e003cc43)

Data: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### PUNK-BASIC/USD

**Price Identifier Name:** PUNK-BASICUSD

**Base Currency:** PUNK-BASIC

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/PUNK-BASIC

**Price Identifier Name:** USDPUNK-BASIC

**Base Currency:** USD

**Quote currency:** PUNK-BASIC

**Intended Collateral Currency:** PUNK-BASIC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query PUNK-BASIC/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the PUNK-BASIC/ETH price by the ETH/USD price and round to 6 decimals to get the PUNK-BASIC/USD price.
4. (for USD/PUNK-BASIC) Take the inverse of the result of step 3 (1/ PUNK-BASIC/USD), before rounding, to get the USD/PUNK-BASIC price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from SushiSwap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.

## Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

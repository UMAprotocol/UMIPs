# Headers

UMIP 85

* UMIP title: Add price identifier for $DEXTF
* Author : Nicola Lanteri
* Status: Draft
* Created: 29/04/2021
* Discourse Link: n/a

## Summary (2-5 sentences)
DEXTF is an asset management protocol that allows anyone to create, mint, and redeem XTF funds. At present, DEXTF supports 76 different assets and allows fund managers to create funds as well as more sophisticated products, like structure tokens.
The request is to create a new price identifier that will be used to support future development like options, collateral bonds etc using the price of the $DEXTF token.

## Motivation

The DVM currently does not support the DEXTF/USD or DEXTF/ETH price index. Supporting these price identifiers would enable UMA partners and the DEXTF ecosystem to provide access to the asset via the UMA architecture.
The addition of this price identifier would enable DeFi users to deploy $DEXTF as collateral for minting bonds, options, or for other purposes
At the time of writing, $DEXTF is trading at $1.10 with an average  24-hour trading volume of $500,000. There is a circulating supply of 17,000,000 DEXTF coins with a max supply of 100,000,000. Uniswap is currently the most active market trading it. More information on the DEXTF token can be found on the website: `https://docs.dextf.com/documentation/introduction/dextf-token`


## Technical Specification

DEXTFUSD

* Base Currency: DEXTF
* Quote Currency: USD
* Intended Collateral Currency: DEXTF
* Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
* Is your collateral currency already approved to be used by UMA financial contracts?: NO
* Scaling Decimals: 18 (1e18)
* Rounding: Round to 6 decimals.

## Rationale

The addition of this price identifier will be used to create bonds and options on the UMA protocol using $DEXTF as collateral. The source used to feed the price is based on the largest pool listed on Uniswap and where most trades are executed. The price on Sushiswap is very much aligned with the one on Uniswap. 

## Implementation

Voters should use the following process to determine the DEXTFUSD price.

1. The Sushiswap and Uniswap DEXTF/ETH prices should be queried for the block that is closest but earlier than the price request timestamp. This block should be used as the end bound for a one minute TWAP on both the Sushiswap and Uniswap prices.
1. Using the implementation defined in UMIP-6, voters should query for the ETHUSD rate at the price request timestamp.
1. The Sushiswap DEXTF/ETH rate should be multiplied by ETHUSD to return the Sushiswap DEXTF/USD price.
1. The Uniswap DEXTF/ETH rate should be multiplied by ETHUSD to return the Uniswap DEXTF/USD price.
1. The price from CoinGecko should be queried using `https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CoinGeckoPriceFeed.js`
1. The average results of steps 3, 4, and 5 should be taken and rounded to 6 decimals to return the DEXTFUSD price.
1. The DEXTFUSD price can be fetched from the Uniswap price feeds, using the public endpoint with the following config:

```
{
  tokenDayDatas(
    first: 1,
    orderBy: date,
    orderDirection: desc,
    where: {
      token: "0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0"
   }
  ) {
    priceUSD
  }
}
```

In the event that the price feed from point 7 is unavailable the following endpoint from Coingeko can also be used: `https://min-api.cryptocompare.com/data/price?fsym=DEXTF&tsyms=USD`

## Security considerations

In this price feed there are three sub-feed considered: uniswap and sushiswap, that represent the Decentralized world, and CoinGecko that represents a mix of centralized and decentralized.  Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.


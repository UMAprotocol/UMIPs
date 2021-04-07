## HEADERS
| UMIP-xyz     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add bBadger/USD, [bwBTC/ETH SLP]/USD, bDigg/USD and USD/bDigg as supported price identifiers                                                                                                   |
| Authors    | Sean Brown (smb2796) 
| Status     | Approved                                                                                                                           |
| Created    | April 7th, 2021                                                                              


# SUMMARY 

The DVM should support price requests for the below price indexes:
- bBadger/USD
- [bwBTC/ETH SLP]/USD
- bDigg/USD
- USD/bDigg

# MOTIVATION

The DVM currently does not support requests for these price identifiers.  

Most of the motivation behind this proposal is the same as what was proposed in [UMIP-39](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md). UMIP-39 only the USD/bBadger and USD-[bwBTC/ETH SLP] price identifiers were proposed. These were intended to be used to create Badger dollars, yield dollars that are backed by Badger vault tokens. The intention behind proposing USD/bDigg remains the same - this will provide an alternative collateralization option for Badger Dollars.

An additional use case that is being considered is creating call options on the value of Badger Vault tokens. For this reason, the USD denominated price identifiers for these vault tokens also need to be proposed. 

Most methodologies required to calculate these price identifiers have already been defined in previous UMIPs. To avoid unnecessary redundancy, this UMIP will mostly reference that which has already been defined. 

# MARKETS & DATA SOURCES

- The markets and data sources for bBadger/USD and [bwBTC/ETH SLP]/USD remain the same as the ones listed in [UMIP-39](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md) for USD/bBadger and USD-[bwBTC/ETH SLP] respectively.
- To determine the underlying amount of DIGG for one bDIGG, the `pricePerFullShare` method needs to be queried on the bDIGG [contract](https://etherscan.io/address/0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a). This information is on-chain and can be queried with any method that a voter wishes to use, since there should not be variation in the returned values.
- The DIGG/USD price is determined based off of the markets and data sources listed for DIGGUSD in [UMIP-61](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-61.md).

# PRICE FEED IMPLEMENTATION 

The price feeds for bBadger/USD and [bwBTC/ETH SLP]/USD will be exactly the same as the ones defined for USD/bBadger and USD-[bwBTC/ETH SLP]. The one change will be to not invert the price in the last step of the expression price feeds. These are the [USD/bBadger](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js#L530) and [USD-[bwBTC/ETH SLP]](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js#L561) price feed configurations. 

The bBadger/USD and USD/bBadger price feeds will be defined in a similar manner. As an example, the bBadger/USD price feed configuration will look something like:

```
"USD/bBadger": {
    type: "expression",
    // Note: lower-case variables are intermediate, upper-case are configured feeds.
    expression: `
      wbtc_usd = mean(WBTC_ETH_SUSHI, WBTC_ETH_UNI) / USDETH;
      badger_usd_sushi = wbtc_usd * BADGER_WBTC_SUSHI;
      badger_usd_uni = wbtc_usd * BADGER_WBTC_UNI;
      badger_usd = median(badger_usd_sushi, badger_usd_uni, BADGER_USD_HUOBI);
      1 / (badger_usd * BBADGER_BADGER)
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    twapLength: 300,
    priceFeedDecimals: 18,
    customFeeds: {
      WBTC_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58" },
      WBTC_ETH_UNI: { type: "uniswap", uniswapAddress: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940" },
      BADGER_WBTC_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0x110492b31c59716ac47337e616804e3e3adc0b4a",
        invertPrice: true
      },
      BADGER_WBTC_UNI: {
        type: "uniswap",
        uniswapAddress: "0xcd7989894bc033581532d2cd88da5db0a4b12859",
        invertPrice: true
      },
      BADGER_USD_HUOBI: { type: "cryptowatch", exchange: "huobi", pair: "badgerusdt", twapLength: 0 },
      BBADGER_BADGER: { type: "vault", address: "0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28" }
    }
}
```


# TECHNICAL SPECIFICATIONS

## bBadger/USD

**1. Price Identifier Name** - bBadger/USD

**2. Base Currency** - bBadger

**3. Quote currency** - USD

**4. Scaling Decimals** - 18 (1e18)

**5. Rounding** - Round to 18 decimal places


## [bwBTC/ETH SLP]/USD

**1. Price Identifier Name** - [bwBTC/ETH SLP]/USD

**2. Base Currency** - bwBTC/ETH SLP

**3. Quote currency** - USD

**4. Scaling Decimals** - 18 (1e18)

**5. Rounding** - Round to 18 decimal places

## bDigg/USD

**1. Price Identifier Name** - bDigg/USD

**2. Base Currency** - bDigg

**3. Quote currency** - USD

**4. Scaling Decimals** - 18 (1e18)

**5. Rounding** - Round to 18 decimal places


## USD/bDigg

**1. Price Identifier Name** - USD/bDigg

**2. Base Currency** - USD

**3. Quote currency** - bDigg

**4. Scaling Decimals** - 18 (1e18)

**5. Rounding** - Round to 18 decimal places


# RATIONALE


# IMPLEMENTATION

B wrapped tokens have 2 components to finding the underlying value of the tokens associated with them.  Each wrapped token has a pricePerFullShare, which is the amount of underlying tokens that 1 b token could be redeemed for through the withdraw function.  This underlying token can have different ways to determine its value depending on what type of token it is.

The price per full share can be found by querying the contract of the token with `getPricePerFullShare` as seen in method 9 on this [contract](https://etherscan.io/address/0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28#readProxyContract).

getPricePerFullShare is a pure view logic function in which no one has any authority to manipulate:

``` 
if (totalSupply() == 0) 
{ 
    return 1e18;
}
return balance().mul(1e18).div(totalSupply());
```

This returns the value of the balance of the vault divided by the number of shares to give the user the value of 1 share of the vault token. balance() represents the total balance of the underlying token in the vault. For example, if a user has 1 bDigg, this could be worth 1.2 Digg (which would be the ratio of balance / totalSupply).

For bDigg you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount, and then the underlying values can be queried to give the price of one bDigg token in USD.

## bBadger/USD

The bBadger/USD pricing implementation will follow the same method that is laid out in [UMIP-39](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md#usdbbadger-1) for USD/bBadger. The one difference will be to not take the inverse of USD/bBadger in step 8 and instead the result of step 7 should be rounded to 18 decimals to get the price of bBadger/USD.

## [bwBTC/ETH SLP]/USD

The bBadger/USD pricing implementation will follow the same method that is laid out in [UMIP-39](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md#usd-bwbtceth-slp-1) for USD-[bwBTC/ETH SLP]. The one difference will be to not take the inverse of step 8 [bwBTC/ETH SLP]/USD in step 10 and instead round the result of step 9 to 18 decimals to get the [bwBTC/ETH SLP]/USD price.

## bDigg/USD & USD/bDigg


# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Although these are "wrapped" tokens, an objective value of the underlying collateral can be accurately determined to adequately inform both participating liquidators and disputers.

The value of collateral can be objective in terms of price per full share * underlying asset value. 

If the vault was hacked in a way that drained funds, the price per full share would decrease in a way that makes the collateral "proportionally recoverable" for all users. There is also insurance from Nexus mutual to consider in terms of valuing the asset in the event of a covered vulnerability

For context, the wrapping mechanism mints a token that represents a % share of a liquidity pool or vault. This is common practice when providing liquidity to an AMM or depositing into a yield optimizer. Using identifiers like price per full share, an oracle can deterministically calculate the value of what the unwrapped ERC20 tokens would be worth at any given time.

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.
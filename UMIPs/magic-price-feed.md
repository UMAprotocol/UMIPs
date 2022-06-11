## Headers

| UMIP-XXX; Magic Price Feed            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add MAGICETH and MAGICUSDC as supported price identifiers |
| Authors             | Mr. Bahama                                             |
| Status              | In-progress                                            |
| Created             | 11 June 2022    |



# Summary

The DVM should support price requests for MAGIC/ETH and MAGIC/USDC pairs.

The canonical identifier should be `MAGICETH` and `MAGICUSDC`.

# Motivation

At the moment, DVM, does not support the requested price identifiers.

MAGIC is the currency and base economic infrastructure for play-to-own games in TreasureDAO

There is currently no way to have a 2 week TWAP for MAGIC/ETH and MAGIC/USDC which would enable games to create in-game assets embedded with option payouts. For example, players could acquire an in-game asset (ERC721 or ERC-1155) embedded with an option to purchase MAGIC token(s) at a discount. 


# Data Specifications

- Price identifier name: MAGICETH and MAGICUSDC

- Market and pairs:
    - MAGIC/WETH: [Sushiswap](https://app.sushi.com/analytics/pools/0xb7e50106a5bd3cf21af210a755f9c8740890a8c9?chainId=42161)
    - MAGIC/USDC: [Sushiswap](https://app.sushi.com/analytics/pools/0x6478931004cd7b995957a4e1a5d06f9a8db0fa04?chainId=42161)

     - MAGIC/WETH: [Uniswap-v3](https://info.uniswap.org/#/arbitrum/pools/0x59d72ddb29da32847a4665d08ffc8464a7185fae)
    - MAGIC/USDC: [Uniswap-v3](https://info.uniswap.org/#/arbitrum/pools/0x37516211fe11d49b84cb959631526e1f4e3fb86f)
 

- Example data providers:
    - MAGIC/USDT: Sushiswap
    - MAGIC/USDT: OKX

    https://www.coingecko.com/en/coins/magic#markets

- Real-time data update frequency:
    - AMM pools: updated every block mined

# Price feed implementation

This price identifier uses the XXXXX

Awaiting support from DevX

  # Technical Specifications

- Price identifier name: MAGICETH
- Base Currency: MAGIC
- Quote Currency: ETH
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: .00025 ETH (26 MAy 2022 16:24:00 UTC)
-----------------------------------------
- Price identifier name: MAGICUSDC
- Base Currency: MAGIC
- Quote Currency: USDC
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.45 (26 MAy 2022 16:24:00 UTC)

# Rationale

MAGIC token has predominant volume in Sushiswap at the time of writing the UMIP with average volume of 1.3M, folowed by the OKX  pool with average volume of 94K. For this price identifier it is also assumed that 1 USDT = 1 USD holds at all times.

MAGIC has predominant liquidity and volume activity in the AMMs paired with WETH. In order to mitigate attempted price manipulation 5 minute TWAP would be applied.


# Implementation

Awaiting help from DevX

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM.

Liquidity is ample specially in the Sushiswap pool, currently over 150M, it should allow the usage of its price feed, even for liquidatable contracts.


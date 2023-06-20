## Status

Draft

## Summary

This UPP proposes to update the final fees for various registered stablecoin collateral types in the UMA system. This has been restricted to WETH and stables that are actually used today or have a higher likelihood of usage. These include: WETH, DAI, USDC and USDT.

## Rationale

UMA's final fees serve as a mechanism to prevent spam within the system. The primary objective is to discourage unnecessary or malicious escalation to the DVM (Data Verification Mechanism) without any significant cost. Previously, the final fees were set at $500 when the DVM2.0 was not yet implemented.

With the introduction of DVM 2.0, new anti-spam measures have been implemented, ensuring robust protection against spam and misuse. These improved mechanisms have made it possible to lower the final fees to $250, independent of any changes in the value of $UMA.

The decision to reduce the final fees to $250 is driven by the effectiveness of the new anti-spam mechanisms within DVM 2.0. By reducing the fees, the integration experience for users of the UMA oracle system is greatly improved. It allows for more accessible and cost-effective utilization of the system, while still maintaining the necessary deterrent against spam and malicious behavior.

## Specifics

In order to implement this upgrade, the final fees for all the mentioned currencies should be adjusted to an equivalent of $250 USD worth of tokens each.

**WETH**
- WETH Mainnet: [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)
- WETH Polygon: [0x7ceb23fd6bc0add59e62ac25578270cff1b9f619](https://etherscan.io/token/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619)
- WETH Optimism: [0x4200000000000000000000000000000000000006](https://etherscan.io/token/0x4200000000000000000000000000000000000006)
- WETH Arbitrum: [0x82af49447d8a07e3bd95bd0d56f35241523fbab1](https://etherscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1)

**DAI**
- DAI Mainnet: [0x6b175474e89094c44da98b954eedeac495271d0f](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)
- DAI Polygon: [0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063](https://polygonscan.com/address/0x8f3cf7ad23cd3cadbd9735aff958023239c6a063)
- DAI Optimism:[0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1](https://optimistic.etherscan.io/address/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1)
- DAI Arbitrum:[0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1](https://arbiscan.io/address/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1)

**USDT**
- USDT Mainnet: [0xdac17f958d2ee523a2206206994597c13d831ec7](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)
- USDT Polygon: [0xc2132d05d31c914a87c6611c10748aeb04b58e8f](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f)
- USDT Optimism: [0x94b008aA00579c1307B0EF2c499aD98a8ce58e58](https://optimistic.etherscan.io/address/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58)
- USDT Arbitrum: [0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9](https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9)

**USDC**
- USDC Mainnet: [0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- USDC Polygon: [0x2791bca1f2de4661ed88a30c99a7a9449aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174)
- USDC Optimism: [0x7F5c764cBc14f9669B88837ca1490cCa17c31607](https://optimistic.etherscan.io/address/0x7f5c764cbc14f9669b88837ca1490cca17c31607)
- USDC Arbitrum: [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbiscan.io/address/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8)
## Status

Draft

## Summary

This UPP proposes to update the final fees for various registered stablecoin collateral types in the UMA system. This has been restricted to stables that are actually used today or have a higher likelihood of usage. These include: DAI, USDC, USDT and FRAX.

## Rationale

UMA's final fees are a spam prevention mechanism. The idea is that it needs to be relatively expensive to trigger a DVM vote, so that votes are not needlessly or malicously escalated to the DVM without a cost. The ballpark cost has always been a function of how much a voter could earn in $UMA inflation rewards by triggering needless votes.

Final fees had previously been targeted at $1500. This was voted in at a time when the dollar value of $UMA was much higher. Now with a lower UMA price, the value that a voter could get from spamming the system is much lower - so final fees can be adjusted accordingly and should be, since lower final fees make for a much better integrating experience for users of the UMA oracle system.

## Specifics

To accomplish this upgrade, all the following currencies should have their final fee be updated to X tokens.

- FRAX Mainnet: [0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a](https://etherscan.io/token/0x853d955acef822db058eb8505911ed77f175b99e)

- DAI Mainnet: [0x6b175474e89094c44da98b954eedeac495271d0f](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)
- DAI Polygon: [0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063](https://polygonscan.com/address/0x8f3cf7ad23cd3cadbd9735aff958023239c6a063)
- DAI Optimism:[0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1](https://optimistic.etherscan.io/address/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1)
- DAI Arbitrum:[0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1](https://arbiscan.io/address/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1)
- DAI Boba: [0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35](https://bobascan.com/address/0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35)

- USDT Mainnet: [0xdac17f958d2ee523a2206206994597c13d831ec7](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)
- USDT Polygon: [0xc2132d05d31c914a87c6611c10748aeb04b58e8f](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f)
- USDT Optimism: [0x94b008aA00579c1307B0EF2c499aD98a8ce58e58](https://optimistic.etherscan.io/address/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58)
- USDT Arbitrum: [0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9](https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9)
- USDT Boba: [0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d](https://bobascan.com/address/0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d)

- USDC Mainnet: [0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- USDC Polygon: [0x2791bca1f2de4661ed88a30c99a7a9449aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174)
- USDC Optimism: [0x7F5c764cBc14f9669B88837ca1490cCa17c31607](https://optimistic.etherscan.io/address/0x7f5c764cbc14f9669b88837ca1490cca17c31607)
- USDC Arbitrum: [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbiscan.io/address/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8)
- USDC Boba: [0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc](https://bobascan.com/token/0x66a2a913e447d6b4bf33efbec43aaef87890fbbc)
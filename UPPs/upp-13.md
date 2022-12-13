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

- USDT Mainnet: [0xdac17f958d2ee523a2206206994597c13d831ec7](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)
- USDT Polygon: [0xc2132d05d31c914a87c6611c10748aeb04b58e8f](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f)

- USDC Mainnet: [0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- USDC Polygon: [0x2791bca1f2de4661ed88a30c99a7a9449aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174)
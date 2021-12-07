## Status

Last Call

## Summary

This UPP will adjust the final fees for all approved collateral types to around $1500.

## Rationale

So far final fees in UMA protocol had been targeted around $400, but this was set as the precedent before contracts could resolve price through Optimistic Oracle. This was a good balance between cost to users and preventing DVM spam at the time. After registering the Optimistic Oracle final fees are payable only when proposed prices are disputed, thus allowing to increase cost per DVM request.

As there are more projects building on top of UMA potential amount of DVM requests is increasing. In order to reduce burden on DVM and incentivize price resolvement through Optimistic Oracle this UPP proposes increasing final fees to around $1500.

Another factor considered was the minimum value of UMA holdings that would make spamming DVM profitable through inflationary voting rewards. During last couple of months median ratio of correct votes over snapshotted UMA supply was around 20%, hence each vote yielding 0.05% / 20% = 0.0025 or 0.25%. So in order to profit from spamming DVM at $1500 final fee value one should hold at least 1500 / 0.25% = $600'000 worth of UMA. It is assumed that larger UMA holders would keep a longer term view and resist to spam DVM for short term gains.

## Specifics

On Ethereum mainnet final fees in the Store contract should be set to:
* DAI: [0x6b175474e89094c44da98b954eedeac495271d0f](https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f): 1500
* WETH: [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2): 0.35
* renBTC: [0xeb4c2781e4eba804ce9a9803c67d0893436bb27d](https://etherscan.io/address/0xeb4c2781e4eba804ce9a9803c67d0893436bb27d): 0.025
* PERL: [0xeca82185adce47f39c684352b0439f030f860318](https://etherscan.io/address/0xeca82185adce47f39c684352b0439f030f860318): 20000
* rDAI: [0x261b45d85ccfeabb11f022eba346ee8d1cd488c0](https://etherscan.io/address/0x261b45d85ccfeabb11f022eba346ee8d1cd488c0): 1500
* USDC: [0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48](https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48): 1500
* USDT: [0xdac17f958d2ee523a2206206994597c13d831ec7](https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7): 1500
* bwBTC/ETH SLP: [0x758a43ee2bff8230eeb784879cdcff4828f2544d](https://etherscan.io/address/0x758a43ee2bff8230eeb784879cdcff4828f2544d): 0.00000002
* bBADGER: [0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28](https://etherscan.io/address/0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28): 45
* DSD: [0xbd2f0cd039e0bfcf88901c98c0bfac5ab27566e3](https://etherscan.io/address/0xbd2f0cd039e0bfcf88901c98c0bfac5ab27566e3): 135000
* renDOGE: [0x3832d2f059e55934220881f831be501d180671a7](https://etherscan.io/address/0x3832d2f059e55934220881f831be501d180671a7): 6400
* OCEAN: [0x967da4048cd07ab37855c090aaf366e4ce1b9f48](https://etherscan.io/address/0x967da4048cd07ab37855c090aaf366e4ce1b9f48): 1800
* WBTC: [0x2260fac5e5542a773aa44fbcfedf7c193bc2c599](https://etherscan.io/address/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599): 0.025
* YAM: [0x0aacfbec6a24756c20d41914f2caba817c0d8521](https://etherscan.io/address/0x0aacfbec6a24756c20d41914f2caba817c0d8521): 2400
* AAVE: [0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9](https://etherscan.io/address/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9): 6
* LINK: [0x514910771af9ca656af840dff83e8264ecf986ca](https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca): 55
* SNX: [0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f](https://etherscan.io/address/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f): 180
* UMA: [0x04fa0d235c4abf4bcf4787af4cf447de572ef828](https://etherscan.io/address/0x04fa0d235c4abf4bcf4787af4cf447de572ef828): 90
* UNI: [0x1f9840a85d5af5bf1d1762f925bdaddc4201f984](https://etherscan.io/address/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984): 75
* WBTC-ETH: [0xbb2b8038a1640196fbe3e38816f3e67cba72d940](https://etherscan.io/address/0xbb2b8038a1640196fbe3e38816f3e67cba72d940): 0.0000004
* USDC-ETH: [0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc](https://etherscan.io/address/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc): 0.000007
* UNI-ETH: [0xd3d2e2692501a5c9ca623199d38826e513033a17](https://etherscan.io/address/0xd3d2e2692501a5c9ca623199d38826e513033a17): 1.2
* UMA-ETH: [0x88d97d199b9ed37c29d846d00d443de980832a22](https://etherscan.io/address/0x88d97d199b9ed37c29d846d00d443de980832a22): 2.25
* ANT: [0xa117000000f279d81a1d3cc75430faa017fa5a2e](https://etherscan.io/address/0xa117000000f279d81a1d3cc75430faa017fa5a2e): 330
* INDEX: [0x0954906da0bf32d5479e25f46056d22f08464cab](https://etherscan.io/address/0x0954906da0bf32d5479e25f46056d22f08464cab): 70
* DPI: [0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b](https://etherscan.io/address/0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b): 4.5
* SUSHI: [0x6b3595068778dd592e39a122f4f5a5cf09c90fe2](https://etherscan.io/address/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2): 170
* xSUSHI: [0x8798249c2e607446efb7ad49ec89dd1865ff4272](https://etherscan.io/address/0x8798249c2e607446efb7ad49ec89dd1865ff4272): 140

On Polygon mainnet final fees in the Store contract should be set to:

* renBTC: [0xdbf31df14b66535af65aac99c32e9ea844e14501](https://polygonscan.com/address/0xdbf31df14b66535af65aac99c32e9ea844e14501): 0.025
* SUSHI: [0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a](https://polygonscan.com/address/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a): 170
* WBTC: [0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6](https://polygonscan.com/address/0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6): 0.025
* USDC: [0x2791bca1f2de4661ed88a30c99a7a9449aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174): 1500
* SNX: [0x50b728d8d964fd00c2d0aad81718b71311fef68a](https://polygonscan.com/address/0x50b728d8d964fd00c2d0aad81718b71311fef68a): 180
* WETH: [0x7ceb23fd6bc0add59e62ac25578270cff1b9f619](https://polygonscan.com/address/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619): 0.35
* DAI: [0x8f3cf7ad23cd3cadbd9735aff958023239c6a063](https://polygonscan.com/address/0x8f3cf7ad23cd3cadbd9735aff958023239c6a063): 1500
* UNI: [0xb33eaad8d922b1083446dc23f610c2567fb5180f](https://polygonscan.com/address/0xb33eaad8d922b1083446dc23f610c2567fb5180f): 75
* USDT: [0xc2132d05d31c914a87c6611c10748aeb04b58e8f](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f): 1500
* AAVE: [0xd6df932a45c0f255f85145f286ea0b292b21c90b](https://polygonscan.com/address/0xd6df932a45c0f255f85145f286ea0b292b21c90b): 6

Note that final fees fore RAI, DFX, APW and BADGER remain the same as they already are close to $1500 target. Also, even though the current final fee of 0.015 for PUNK-BASIC can be valued above $3000 the liquidity on SushiSwap is almost non-existent, hence the fee is left unchanged due to security considerations.

Since the proposal transaction for updating final fees for all approved collateral tokens would reach the transaction gas limit the final fees for remaining collateral tokens are about to be updated in [UPP-9](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-9.md) and [UPP-10](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-10.md).

As a convenience for the proposal transaction the specifics on updating final fees is formatted as a CSV file below (with rows representing Ethereum mainnet addresses, Polygon addresses and final fees):

```
0x6b175474e89094c44da98b954eedeac495271d0f,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2,0xeb4c2781e4eba804ce9a9803c67d0893436bb27d,0xeca82185adce47f39c684352b0439f030f860318,0x261b45d85ccfeabb11f022eba346ee8d1cd488c0,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,0xdac17f958d2ee523a2206206994597c13d831ec7,0x758a43ee2bff8230eeb784879cdcff4828f2544d,0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28,0xbd2f0cd039e0bfcf88901c98c0bfac5ab27566e3,0x3832d2f059e55934220881f831be501d180671a7,0x967da4048cd07ab37855c090aaf366e4ce1b9f48,0x2260fac5e5542a773aa44fbcfedf7c193bc2c599,0x0aacfbec6a24756c20d41914f2caba817c0d8521,0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9,0x514910771af9ca656af840dff83e8264ecf986ca,0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f,0x04fa0d235c4abf4bcf4787af4cf447de572ef828,0x1f9840a85d5af5bf1d1762f925bdaddc4201f984,0xbb2b8038a1640196fbe3e38816f3e67cba72d940,0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc,0xd3d2e2692501a5c9ca623199d38826e513033a17,0x88d97d199b9ed37c29d846d00d443de980832a22,0xa117000000f279d81a1d3cc75430faa017fa5a2e,0x0954906da0bf32d5479e25f46056d22f08464cab,0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b,0x6b3595068778dd592e39a122f4f5a5cf09c90fe2,0x8798249c2e607446efb7ad49ec89dd1865ff4272
0x8f3cf7ad23cd3cadbd9735aff958023239c6a063,0x7ceb23fd6bc0add59e62ac25578270cff1b9f619,0xdbf31df14b66535af65aac99c32e9ea844e14501,,,0x2791bca1f2de4661ed88a30c99a7a9449aa84174,0xc2132d05d31c914a87c6611c10748aeb04b58e8f,,,,,,0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6,,0xd6df932a45c0f255f85145f286ea0b292b21c90b,,0x50b728d8d964fd00c2d0aad81718b71311fef68a,,0xb33eaad8d922b1083446dc23f610c2567fb5180f,,,,,,,,0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a,
1500,0.35,0.025,20000,1500,1500,1500,0.00000002,45,135000,6400,1800,0.025,2400,6,55,180,90,75,0.0000004,0.000007,1.2,2.25,330,70,4.5,170,140
```

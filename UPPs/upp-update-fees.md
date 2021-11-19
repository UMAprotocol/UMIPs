## Status

Draft

## Summary

This UPP will adjust the final fees for all approved collateral types to around $1500.

## Rationale

So far final fees in UMA protocol had been targeted around $400, but this was set as the precedent before contracts could resolve price through Optimistic Oracle. This was a good balance between cost to users and preventing DVM spam at the time. After registering the Optimistic Oracle final fees are payable only when proposed prices are disputed, thus allowing to increase cost per DVM request.

As there are more projects building on top of UMA potential amount of DVM requests is increasing. In order to reduce burden on DVM and incentivize price resolvement through Optimistic Oracle this UPP proposes increasing final fees to around $1500.

Another factor considered was the minimum value of UMA holdings that would make spamming DVM profitable through inflationary voting rewards. During last couple of months median ratio of correct votes over snapshotted UMA supply was around 20%, hence each vote yielding 0.05 / 0.2 = 0.25%. So in order to profit from spamming DVM at $1500 final fee value one should hold at least 1500 / 0.25% = $600'000 worth of UMA. It is assumed that larger UMA holders would keep a longer term view and resist to spam DVM for short term gains.

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
* XIO: [0x0f7f961648ae6db43c75663ac7e5414eb79b5704](https://etherscan.io/address/0x0f7f961648ae6db43c75663ac7e5414eb79b5704): 8400
* BAL: [0xba100000625a3754423978a60c9317c58a424e3d](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3d): 75
* bDIGG: [0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a](https://etherscan.io/address/0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a): 0.15
* yUSD: [0x5dbcf33d8c2e976c6b560249878e6f1491bca25c](https://etherscan.io/address/0x5dbcf33d8c2e976c6b560249878e6f1491bca25c): 1130
* COMP: [0xc00e94cb662c3520282e6f5717214004a7f26888](https://etherscan.io/address/0xc00e94cb662c3520282e6f5717214004a7f26888): 5
* YFI: [0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e](https://etherscan.io/address/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e): 0.05
* ALCX: [0xdbdb4d16eda451d0503b854cf79d55697f90c8df](https://etherscan.io/address/0xdbdb4d16eda451d0503b854cf79d55697f90c8df): 4
* ALPHA: [0xa1faa113cbe53436df28ff0aee54275c13b40975](https://etherscan.io/address/0xa1faa113cbe53436df28ff0aee54275c13b40975): 1600
* MKR: [0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2](https://etherscan.io/address/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2): 0.5
* REN: [0x408e41876cccdc0f92210600ef50372656052a38](https://etherscan.io/address/0x408e41876cccdc0f92210600ef50372656052a38): 2000
* CRV: [0xd533a949740bb3306d119cc777fa900ba034cd52](https://etherscan.io/address/0xd533a949740bb3306d119cc777fa900ba034cd52): 360
* RGT: [0xd291e7a03283640fdc51b121ac401383a46cc623](https://etherscan.io/address/0xd291e7a03283640fdc51b121ac401383a46cc623): 50
* NFTX: [0x87d73e916d7057945c9bcd8cdd94e42a6f47f776](https://etherscan.io/address/0x87d73e916d7057945c9bcd8cdd94e42a6f47f776): 14
* LON: [0x0000000000095413afc295d19edeb1ad7b71c952](https://etherscan.io/address/0x0000000000095413afc295d19edeb1ad7b71c952): 850
* MASK: [0x69af81e73a73b40adf4f3d4223cd9b1ece623074](https://etherscan.io/address/0x69af81e73a73b40adf4f3d4223cd9b1ece623074): 140
* BANK: [0x24a6a37576377f63f194caa5f518a60f45b42921](https://etherscan.io/address/0x24a6a37576377f63f194caa5f518a60f45b42921): 15
* SFI: [0xb753428af26e81097e7fd17f40c88aaa3e04902c](https://etherscan.io/address/0xb753428af26e81097e7fd17f40c88aaa3e04902c): 3.3
* VSP: [0x1b40183efb4dd766f11bda7a7c3ad8982e998421](https://etherscan.io/address/0x1b40183efb4dd766f11bda7a7c3ad8982e998421): 260
* FRAX: [0x853d955acef822db058eb8505911ed77f175b99e](https://etherscan.io/address/0x853d955acef822db058eb8505911ed77f175b99e): 1500
* DEXTF: [0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0](https://etherscan.io/address/0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0): 5000
* ORN: [0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a](https://etherscan.io/address/0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a): 210
* BOND: [0x0391d2021f89dc339f60fff84546ea23e337750f](https://etherscan.io/address/0x0391d2021f89dc339f60fff84546ea23e337750f): 55
* PUNK-BASIC: [0x69bbe2fa02b4d90a944ff328663667dc32786385](https://etherscan.io/address/0x69bbe2fa02b4d90a944ff328663667dc32786385): [TBD]
* LUSD: [0x5f98805a4e8be255a32880fdec7f6728c6568ba0](https://etherscan.io/address/0x5f98805a4e8be255a32880fdec7f6728c6568ba0): 1500
* iFARM: [0x1571ed0bed4d987fe2b498ddbae7dfa19519f651](https://etherscan.io/address/0x1571ed0bed4d987fe2b498ddbae7dfa19519f651): 9
* yvUSDC: [0x5f18c75abdae578b483e5f43f12a39cf75b973a9](https://etherscan.io/address/0x5f18c75abdae578b483e5f43f12a39cf75b973a9): 1400
* UST: [0xa47c8bf37f92abed4a126bda807a7b7498661acd](https://etherscan.io/address/0xa47c8bf37f92abed4a126bda807a7b7498661acd): 1500
* BNT: [0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c](https://etherscan.io/address/0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c): 380
* vBNT: [0x48fb253446873234f2febbf9bdeaa72d9d387f94](https://etherscan.io/address/0x48fb253446873234f2febbf9bdeaa72d9d387f94): 1200
* BAND: [0xba11d00c5f74255f56a5e366f4f77f5a186d7f55](https://etherscan.io/address/0xba11d00c5f74255f56a5e366f4f77f5a186d7f55): 200
* SDT: [0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f](https://etherscan.io/address/0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f): 740
* KP3R: [0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44](https://etherscan.io/address/0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44): 1.2
* CREAM: [0x2ba592f78db6436527729929aaf6c908497cb200](https://etherscan.io/address/0x2ba592f78db6436527729929aaf6c908497cb200): 35
* CHAIN: [0xc4c2614e694cf534d407ee49f8e44d125e4681c4](https://etherscan.io/address/0xc4c2614e694cf534d407ee49f8e44d125e4681c4): 9400
* ERN: [0xbbc2ae13b23d715c30720f079fcd9b4a74093505](https://etherscan.io/address/0xbbc2ae13b23d715c30720f079fcd9b4a74093505): 110
* OPEN: [0x69e8b9528cabda89fe846c67675b5d73d463a916](https://etherscan.io/address/0x69e8b9528cabda89fe846c67675b5d73d463a916): 8700
* BASK: [0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb](https://etherscan.io/address/0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb): 300
* GYSR: [0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab](https://etherscan.io/address/0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab): 6100
* MPH: [0x8888801af4d980682e47f1a9036e589479e835c5](https://etherscan.io/address/0x8888801af4d980682e47f1a9036e589479e835c5): 32
* SNOW: [0xfe9a29ab92522d14fc65880d817214261d8479ae](https://etherscan.io/address/0xfe9a29ab92522d14fc65880d817214261d8479ae): 175
* NDX: [0x86772b1409b61c639eaac9ba0acfbb6e238e5f83](https://etherscan.io/address/0x86772b1409b61c639eaac9ba0acfbb6e238e5f83): 1000
* BPRO: [0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61](https://etherscan.io/address/0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61): 270
* OHM: [0x383518188c0c6d7730d91b2c03a03c837814a899](https://etherscan.io/address/0x383518188c0c6d7730d91b2c03a03c837814a899): 2
* IDLE: [0x875773784af8135ea0ef43b5a374aad105c5d39e](https://etherscan.io/address/0x875773784af8135ea0ef43b5a374aad105c5d39e): 370
* GNO: [0x6810e776880c02933d47db1b9fc05908e5386b96](https://etherscan.io/address/0x6810e776880c02933d47db1b9fc05908e5386b96): 4
* POOL: [0x0cec1a9154ff802e7934fc916ed7ca50bde6844e](https://etherscan.io/address/0x0cec1a9154ff802e7934fc916ed7ca50bde6844e): 170
* DOUGH: [0xad32a8e6220741182940c5abf610bde99e737b2d](https://etherscan.io/address/0xad32a8e6220741182940c5abf610bde99e737b2d): 2200
* FEI: [0x956f47f50a910163d8bf957cf5846d573e7f87ca](https://etherscan.io/address/0x956f47f50a910163d8bf957cf5846d573e7f87ca): 1500
* TRIBE: [0xc7283b66eb1eb5fb86327f08e1b5816b0720212b](https://etherscan.io/address/0xc7283b66eb1eb5fb86327f08e1b5816b0720212b): 1500
* FOX: [0xc770eefad204b5180df6a14ee197d99d808ee52d](https://etherscan.io/address/0xc770eefad204b5180df6a14ee197d99d808ee52d): 2000
* RBN: [0x6123b0049f904d730db3c36a31167d9d4121fa6b](https://etherscan.io/address/0x6123b0049f904d730db3c36a31167d9d4121fa6b): 900
* BANK: [0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198](https://etherscan.io/address/0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198): 20000
* MATIC: [0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0](https://etherscan.io/address/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0): 1000
* INST: [0x6f40d4a6237c257fff2db00fa0510deeecd303eb](https://etherscan.io/address/0x6f40d4a6237c257fff2db00fa0510deeecd303eb): 380
* JRT: [0x8a9c67fee641579deba04928c4bc45f66e26343a](https://etherscan.io/address/0x8a9c67fee641579deba04928c4bc45f66e26343a): 22000
* YEL: [0x7815bda662050d84718b988735218cffd32f75ea](https://etherscan.io/address/0x7815bda662050d84718b988735218cffd32f75ea): 20500
* VOL: [0x5166e09628b696285e3a151e84fb977736a83575](https://etherscan.io/address/0x5166e09628b696285e3a151e84fb977736a83575): 3200
* IF: [0xb0e1fc65c1a741b4662b813eb787d369b8614af1](https://etherscan.io/address/0xb0e1fc65c1a741b4662b813eb787d369b8614af1): 980
* PERP: [0xbc396689893d065f41bc2c6ecbee5e0085233447](https://etherscan.io/address/0xbc396689893d065f41bc2c6ecbee5e0085233447): 105
* GRO: [0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7](https://etherscan.io/address/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7): 210
* AQUA: [0xd34a24006b862f4e9936c506691539d6433ad297](https://etherscan.io/address/0xd34a24006b862f4e9936c506691539d6433ad297): 3650000
* IDIA: [0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89](https://etherscan.io/address/0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89): 700
* QUARTZ: [0xba8a621b4a54e61c442f5ec623687e2a942225ef](https://etherscan.io/address/0xba8a621b4a54e61c442f5ec623687e2a942225ef): 220
* ibBTC: [0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f](https://etherscan.io/address/0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f): 0.025

On Polygon mainnet final fees in the Store contract should be set to:

* QI: [0x580a84c73811e1839f75d86d75d88cca0c241ff4](https://polygonscan.com/address/0x580a84c73811e1839f75d86d75d88cca0c241ff4): 3400
* renBTC: [0xdbf31df14b66535af65aac99c32e9ea844e14501](https://polygonscan.com/address/0xdbf31df14b66535af65aac99c32e9ea844e14501): 0.025
* SUSHI: [0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a](https://polygonscan.com/address/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a): 170
* CRV: [0x172370d5cd63279efa6d502dab29171933a610af](https://polygonscan.com/address/0x172370d5cd63279efa6d502dab29171933a610af): 360
* WBTC: [0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6](https://polygonscan.com/address/0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6): 0.025
* USDC: [0x2791bca1f2de4661ed88a30c99a7a9449aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174): 1500
* SNX: [0x50b728d8d964fd00c2d0aad81718b71311fef68a](https://polygonscan.com/address/0x50b728d8d964fd00c2d0aad81718b71311fef68a): 180
* WETH: [0x7ceb23fd6bc0add59e62ac25578270cff1b9f619](https://polygonscan.com/address/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619): 0.35
* COMP: [0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c](https://polygonscan.com/address/0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c): 5
* DAI: [0x8f3cf7ad23cd3cadbd9735aff958023239c6a063](https://polygonscan.com/address/0x8f3cf7ad23cd3cadbd9735aff958023239c6a063): 1500
* BAL: [0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3](https://polygonscan.com/address/0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3): 75
* UNI: [0xb33eaad8d922b1083446dc23f610c2567fb5180f](https://polygonscan.com/address/0xb33eaad8d922b1083446dc23f610c2567fb5180f): 75
* USDT: [0xc2132d05d31c914a87c6611c10748aeb04b58e8f](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f): 1500
* AAVE: [0xd6df932a45c0f255f85145f286ea0b292b21c90b](https://polygonscan.com/address/0xd6df932a45c0f255f85145f286ea0b292b21c90b): 6
* YFI: [0xda537104d6a5edd53c6fbba9a898708e465260b6](https://polygonscan.com/address/0xda537104d6a5edd53c6fbba9a898708e465260b6): 0.05
* WMATIC: [0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270](https://polygonscan.com/address/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270): 1000
* INST: [0xf50d05a1402d0adafa880d36050736f9f6ee7dee](https://polygonscan.com/address/0xf50d05a1402d0adafa880d36050736f9f6ee7dee): 380
* YEL: [0xd3b71117e6c1558c1553305b44988cd944e97300](https://polygonscan.com/address/0xd3b71117e6c1558c1553305b44988cd944e97300): 20500
* miMATIC: [0xa3fa99a148fa48d14ed51d610c367c61876997f1](https://polygonscan.com/address/0xa3fa99a148fa48d14ed51d610c367c61876997f1): 1500
* BIFI: [0xfbdd194376de19a88118e84e279b977f165d01b8](https://polygonscan.com/address/0xfbdd194376de19a88118e84e279b977f165d01b8): 1.3
* ICE: [0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef](https://polygonscan.com/address/0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef): 520000
* IRON: [0xd86b5923f3ad7b585ed81b448170ae026c65ae9a](https://polygonscan.com/address/0xd86b5923f3ad7b585ed81b448170ae026c65ae9a): 1500
* POOL: [0x25788a1a171ec66da6502f9975a15b609ff54cf6](https://polygonscan.com/address/0x25788a1a171ec66da6502f9975a15b609ff54cf6): 170

Note that final fees fore RAI, DFX, APW and BADGER remain the same as they already are close to $1500 target.

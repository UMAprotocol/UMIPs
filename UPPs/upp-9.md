## Status

Last Call

## Summary

This UPP will adjust the final fees for all approved collateral types to around $1500.

## Rationale

So far final fees in UMA protocol had been targeted around $400, but this was set as the precedent before contracts could resolve price through Optimistic Oracle. This was a good balance between cost to users and preventing DVM spam at the time. After registering the Optimistic Oracle final fees are payable only when proposed prices are disputed, thus allowing to increase cost per DVM request.

As there are more projects building on top of UMA potential amount of DVM requests is increasing. In order to reduce burden on DVM and incentivize price resolvement through Optimistic Oracle this UPP proposes increasing final fees to around $1500.

Another factor considered was the minimum value of UMA holdings that would make spamming DVM profitable through inflationary voting rewards. During last couple of months median ratio of correct votes over snapshotted UMA supply was around 20%, hence each vote yielding 0.05 / 0.2 = 0.25%. So in order to profit from spamming DVM at $1500 final fee value one should hold at least 1500 / 0.25% = $600'000 worth of UMA. It is assumed that larger UMA holders would keep a longer term view and resist to spam DVM for short term gains.

## Specifics

On Ethereum mainnet final fees in the Store contract should be set to:
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

On Polygon mainnet final fees in the Store contract should be set to:

* CRV: [0x172370d5cd63279efa6d502dab29171933a610af](https://polygonscan.com/address/0x172370d5cd63279efa6d502dab29171933a610af): 360
* COMP: [0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c](https://polygonscan.com/address/0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c): 5
* BAL: [0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3](https://polygonscan.com/address/0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3): 75
* YFI: [0xda537104d6a5edd53c6fbba9a898708e465260b6](https://polygonscan.com/address/0xda537104d6a5edd53c6fbba9a898708e465260b6): 0.05

Note that final fees fore RAI, DFX, APW and BADGER remain the same as they already are close to $1500 target. Also, even though the current final fee of 0.015 for PUNK-BASIC can be valued above $3000 the liquidity on SushiSwap is almost non-existent, hence the fee is left unchanged due to security considerations.

Since the proposal transaction for updating final fees for all approved collateral tokens would reach the transaction gas limit the final fees for remaining collateral tokens are about to be updated in [UPP-8](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-8.md) and [UPP-10](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-10.md).

As a convenience for the proposal transaction the specifics on updating final fees is formatted as a CSV file below (with rows representing Ethereum mainnet addresses, Polygon addresses and final fees):

```
0x0f7f961648ae6db43c75663ac7e5414eb79b5704,0xba100000625a3754423978a60c9317c58a424e3d,0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a,0x5dbcf33d8c2e976c6b560249878e6f1491bca25c,0xc00e94cb662c3520282e6f5717214004a7f26888,0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e,0xdbdb4d16eda451d0503b854cf79d55697f90c8df,0xa1faa113cbe53436df28ff0aee54275c13b40975,0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2,0x408e41876cccdc0f92210600ef50372656052a38,0xd533a949740bb3306d119cc777fa900ba034cd52,0xd291e7a03283640fdc51b121ac401383a46cc623,0x87d73e916d7057945c9bcd8cdd94e42a6f47f776,0x0000000000095413afc295d19edeb1ad7b71c952,0x69af81e73a73b40adf4f3d4223cd9b1ece623074,0x24a6a37576377f63f194caa5f518a60f45b42921,0xb753428af26e81097e7fd17f40c88aaa3e04902c,0x1b40183efb4dd766f11bda7a7c3ad8982e998421,0x853d955acef822db058eb8505911ed77f175b99e,0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0,0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a,0x0391d2021f89dc339f60fff84546ea23e337750f,0x5f98805a4e8be255a32880fdec7f6728c6568ba0,0x1571ed0bed4d987fe2b498ddbae7dfa19519f651,0x5f18c75abdae578b483e5f43f12a39cf75b973a9,0xa47c8bf37f92abed4a126bda807a7b7498661acd,0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c,0x48fb253446873234f2febbf9bdeaa72d9d387f94,0xba11d00c5f74255f56a5e366f4f77f5a186d7f55,0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f,0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44,0x2ba592f78db6436527729929aaf6c908497cb200,0xc4c2614e694cf534d407ee49f8e44d125e4681c4,0xbbc2ae13b23d715c30720f079fcd9b4a74093505
,0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3,,,0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c,0xda537104d6a5edd53c6fbba9a898708e465260b6,,,,,0x172370d5cd63279efa6d502dab29171933a610af,,,,,,,,,,,,,,,,,,,,,,,
8400,75,0.15,1130,5,0.05,4,1600,0.5,2000,360,50,14,850,140,15,3.3,260,1500,5000,210,55,1500,9,1400,1500,380,1200,200,740,1.2,35,9400,110
```

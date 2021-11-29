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
* OPEN: [0x69e8b9528cabda89fe846c67675b5d73d463a916](https://etherscan.io/address/0x69e8b9528cabda89fe846c67675b5d73d463a916): 8700
* BASK: [0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb](https://etherscan.io/address/0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb): 300
* GYSR: [0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab](https://etherscan.io/address/0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab): 6100
* MPH: [0x8888801af4d980682e47f1a9036e589479e835c5](https://etherscan.io/address/0x8888801af4d980682e47f1a9036e589479e835c5): 32
* SNOW: [0xfe9a29ab92522d14fc65880d817214261d8479ae](https://etherscan.io/address/0xfe9a29ab92522d14fc65880d817214261d8479ae): 175
* NDX: [0x86772b1409b61c639eaac9ba0acfbb6e238e5f83](https://etherscan.io/address/0x86772b1409b61c639eaac9ba0acfbb6e238e5f83): 1000
* BPRO: [0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61](https://etherscan.io/address/0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61): 270
* OHM: [0x383518188c0c6d7730d91b2c03a03c837814a899](https://etherscan.io/address/0x383518188c0c6d7730d91b2c03a03c837814a899): 2
* IDLE: [0x875773784af8135ea0ef43b5a374aad105c5d39e](https://etherscan.io/address/0x875773784af8135ea0ef43b5a374aad105c5d39e): 530
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
* AQUA: [0xd34a24006b862f4e9936c506691539d6433ad297](https://etherscan.io/address/0xd34a24006b862f4e9936c506691539d6433ad297): 6600000
* IDIA: [0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89](https://etherscan.io/address/0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89): 700
* QUARTZ: [0xba8a621b4a54e61c442f5ec623687e2a942225ef](https://etherscan.io/address/0xba8a621b4a54e61c442f5ec623687e2a942225ef): 220
* ibBTC: [0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f](https://etherscan.io/address/0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f): 0.025

On Polygon mainnet final fees in the Store contract should be set to:

* QI: [0x580a84c73811e1839f75d86d75d88cca0c241ff4](https://polygonscan.com/address/0x580a84c73811e1839f75d86d75d88cca0c241ff4): 3400
* WMATIC: [0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270](https://polygonscan.com/address/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270): 1000
* INST: [0xf50d05a1402d0adafa880d36050736f9f6ee7dee](https://polygonscan.com/address/0xf50d05a1402d0adafa880d36050736f9f6ee7dee): 380
* YEL: [0xd3b71117e6c1558c1553305b44988cd944e97300](https://polygonscan.com/address/0xd3b71117e6c1558c1553305b44988cd944e97300): 20500
* miMATIC: [0xa3fa99a148fa48d14ed51d610c367c61876997f1](https://polygonscan.com/address/0xa3fa99a148fa48d14ed51d610c367c61876997f1): 1500
* BIFI: [0xfbdd194376de19a88118e84e279b977f165d01b8](https://polygonscan.com/address/0xfbdd194376de19a88118e84e279b977f165d01b8): 1.3
* ICE: [0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef](https://polygonscan.com/address/0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef): 520000
* IRON: [0xd86b5923f3ad7b585ed81b448170ae026c65ae9a](https://polygonscan.com/address/0xd86b5923f3ad7b585ed81b448170ae026c65ae9a): 1500
* POOL: [0x25788a1a171ec66da6502f9975a15b609ff54cf6](https://polygonscan.com/address/0x25788a1a171ec66da6502f9975a15b609ff54cf6): 170

Note that final fees fore RAI, DFX, APW and BADGER remain the same as they already are close to $1500 target. Also, even though the current final fee of 0.015 for PUNK-BASIC can be valued above $3000 the liquidity on SushiSwap is almost non-existent, hence the fee is left unchanged due to security considerations.

Since the proposal transaction for updating final fees for all approved collateral tokens would reach the transaction gas limit the final fees for remaining collateral tokens are about to be updated in [UPP-8](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-8.md) and [UPP-9](https://github.com/UMAprotocol/UMIPs/blob/master/UPPs/upp-9.md).

As a convenience for the proposal transaction the specifics on updating final fees is formatted as a CSV file below (with rows representing Ethereum mainnet addresses, Polygon addresses and final fees):

```
0x69e8b9528cabda89fe846c67675b5d73d463a916,0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb,0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab,0x8888801af4d980682e47f1a9036e589479e835c5,0xfe9a29ab92522d14fc65880d817214261d8479ae,0x86772b1409b61c639eaac9ba0acfbb6e238e5f83,0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61,0x383518188c0c6d7730d91b2c03a03c837814a899,0x875773784af8135ea0ef43b5a374aad105c5d39e,0x6810e776880c02933d47db1b9fc05908e5386b96,0x0cec1a9154ff802e7934fc916ed7ca50bde6844e,0xad32a8e6220741182940c5abf610bde99e737b2d,0x956f47f50a910163d8bf957cf5846d573e7f87ca,0xc7283b66eb1eb5fb86327f08e1b5816b0720212b,0xc770eefad204b5180df6a14ee197d99d808ee52d,0x6123b0049f904d730db3c36a31167d9d4121fa6b,0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198,0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0,0x6f40d4a6237c257fff2db00fa0510deeecd303eb,0x8a9c67fee641579deba04928c4bc45f66e26343a,0x7815bda662050d84718b988735218cffd32f75ea,0x5166e09628b696285e3a151e84fb977736a83575,0xb0e1fc65c1a741b4662b813eb787d369b8614af1,0xbc396689893d065f41bc2c6ecbee5e0085233447,0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7,0xd34a24006b862f4e9936c506691539d6433ad297,0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89,0xba8a621b4a54e61c442f5ec623687e2a942225ef,0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f,,,,,
,,,,,,,,,,0x25788a1a171ec66da6502f9975a15b609ff54cf6,,,,,,,0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270,0xf50d05a1402d0adafa880d36050736f9f6ee7dee,,0xd3b71117e6c1558c1553305b44988cd944e97300,,,,,,,,,0x580a84c73811e1839f75d86d75d88cca0c241ff4,0xa3fa99a148fa48d14ed51d610c367c61876997f1,0xfbdd194376de19a88118e84e279b977f165d01b8,0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef,0xd86b5923f3ad7b585ed81b448170ae026c65ae9a
8700,300,6100,32,175,1000,270,2,530,4,170,2200,1500,1500,2000,900,20000,1000,380,22000,20500,3200,980,105,210,6600000,700,220,0.025,3400,1500,1.3,520000,1500
```

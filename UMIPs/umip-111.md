## Headers

**UMIP-111**

-   UMIP title: Add GYSR, MPH, APW, SNOW, NDX as collateral currencies
-   Author:  Brittany Madruga (brittany.madruga@gmail.com), Shawn C. Hagenah (www.shawnhagenah99@yahoo.com)
-   Status: Approved
-   Created:  06/16/2021
-   Discourse Link:  https://discourse.umaproject.org/t/add-gysr-mph-apw-snow-and-ndx-as-approved-collateral-currencies/1215

# Summary

This UMIP proposes adding GYSR, MPH, APW, SNOW, and NDX for use as collateral in UMA contracts. This will involve adding these to the whitelist and adding flat final fees to charge per-request.

# Motivation

The addition of these collateral currencies offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

These could be used with *token*/USD price identifiers that are also being proposed to create yield dollars or covered calls collateralized by each of these tokens, among many other use cases.

Proactively approving these collateral types and price feeds will make it easier for development teams and protocol treasuries to create new products using these tokens.

# Proposed Collateral Currencies
Note : The final fee for all ERC20 tokens will be ~$400 at time of writing




## GYSR

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The  GSYR token  address  [0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb](https://etherscan.io/token/0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of  2000 needs to be added for  GSYR  in the Store contract.

## Motivation
The Geyser protocol has expressed an interest in using KPI options.  Proactively approving their token as a collateral type removes a barrier in development.

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by  querying CoinGecko on 23rd June 2021

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Token Summary 

Geyser offers developers a configurable toolkit to support liquidity mining campaigns.  Developers can launch Geysers to reward investors who undertake certain blockchain-based activities like providing liquidity in a pool on a decentralized exchange.  The GYSR core contracts were audited for functionality, safety, and security by [Pessimistic (formerly SmartDec)](https://resources.gysr.io/gysr_v1_audit_pessimistic.pdf). The v2 audits were performed by [CertiK](https://resources.gysr.io/gysr_v2_audit_certik.pdf)

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem. This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral should note that liquidity is only currenly available on one exchange, and the depth is low.  Consequently it should not be used in any liquidatable contract.

## MPH

### Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The MPH  address  [0x8888801af4d980682e47f1a9036e589479e835c5](https://etherscan.io/address/0x8888801af4d980682e47f1a9036e589479e835c5)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 15 MPH  needs to be added for MPH in the Store contract.

### Implementation

This change has no implementations other than the aforementioned governor transactions

### Rationale

Adding MPH as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The 88mph community has a particularly strong interest in kpi options and is pursuing MPH price identifiers in a related UMIP.

### Token Summary

MPH is the Governance Token of 88MPH. 88MPH is an Ethereum protocol, allowing you to lend your crypto assets at a fixed rate. By doing so, you earn $MPH rewards and protocol revenues. With Fixed Interest Rate Bonds, Floating Rate Bonds, Zero Coupon Bonds, MPH Vesting, Liquidity Mining and Governance.

### Security considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

88mph has a circulating supply of 366,424.11 MPH and a max supply of 395,550. The top exchanges for MPH at time of writing are Uniswap, Bilaxy, Gate io, and Sushiswap. 

## APW

### Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The APW address  [0x4104b135dbc9609fc1a9490e61369036497660c8](https://etherscan.io/address/0x4104b135dbc9609fc1a9490e61369036497660c8)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 400 APW needs to be added for APW in the Store contract.

### Implementation

This change has no implementations other than the afore mentioned governor transactions

### Rationale

Adding APW as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The APWine community has a particularly strong interest in kpi options and is pursuing APW price identifiers in a related UMIP.

### Token Summary

APW is the governance token of APWine. APWine is a protocol to trade future yield. DeFi users can deposit their interest bearing tokens of other protocols during defined future periods and trade in advance the future yield that their funds will generate.APWine tokenises the future yield leveraging two types of tokens in that process:
* Future Yield Tokens (FYT) (ERC20): They represent the future yield generated by an asset on one platform for a defined period. For example, one 30D-AAVE-ADAI-0 represents the yield generated by 1 ADAI (a.k.a. one DAI deposited on AAVE) during the first 30 days period. APWine features a dedicated exchange for users to sell and buy FYTs.

* APWINE IBT (ERC20): The APWine interest bearing token. At any moment its holder can withdraw the corresponding depositing funds from the APWine protocol. APWINE IBT holders will receive an amount of FYT proportional of to the amount they hold (for the future the ibt corresponds to). One 30D-AAVE-ADAI represents one ADAI deposited to the ""30D-AAVE-DAI"" future.

### Security considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

APWine has a circulating supply of 2,603,248 APW and a max supply of 50,000,000. The only available exchange for APW at time of writing is Sushiswap. 

## SNOW

### Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The SNOW address [0xfe9A29aB92522D14Fc65880d817214261D8479AE](https://etherscan.io/address/0xfe9A29aB92522D14Fc65880d817214261D8479AE)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 60 SNOW needs to be added for SNOW in the Store contract.

### Implementation

This change has no implementations other than the afore mentioned governor transactions

### Rationale

Adding SNOW as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The SnowSwap community has a particularly strong interest in kpi options and is pursuing SNOW price identifiers in a related UMIP.

### Token Summary

SNOW is the governance token for SnowSwap. SnowSwap is a decentralized exchange for swapping wrapped, yield-bearing tokens with minimal slippage. SnowSwap supports wrapped token swaps for numerous Defi projects including Harvest finance, Yearn, ANKR, and CREAM. Initially, the focus was stablecoins but has since expanded to include wrapped bitcoin and ethereum 2.0 staking tokens as well.

### Security considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

SnowSwap has a circulating supply of 311,036.71 SNOW and a max supply of 500,000. The top exchange for SNOW at time of writing is Gate io.

## NDX

### Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The NDX address  [0x86772b1409b61c639eaac9ba0acfbb6e238e5f83](https://etherscan.io/address/0x86772b1409b61c639eaac9ba0acfbb6e238e5f83)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 100 NDX needs to be added for NDX in the Store contract.

### Implementation

This change has no implementations other than the afore mentioned governor transactions

### Rationale

Adding NDX as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The Indexed Finance community has a particularly strong interest in kpi options and is pursuing NDX price identifiers in a related UMIP.

### Token Summary

NDX is the governance token for Indexed Finance, a project focused on the development of passive portfolio management strategies for the Ethereum network. Indexed Finance is managed by the holders of NDX, which is used to vote on proposals for protocol updates and high level index management such as the definition of market sectors and the creation of new management strategies.

### Security considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

Indexed Finance has a circulating supply of 854,801.00 NDX and a max supply of 10,000,000. The top exchange for NDX at time of writing is Uniswap.

# General Security Considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  These collateral types should be monitored to ensure that the proposed currencies continue to have value.**

Contract deployers considering using these collateral currencies in an UMA contract should refer to the guidelines on collateral type usage available here** (insert link!) o ensure appropriate use.

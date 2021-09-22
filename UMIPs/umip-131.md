## Headers
UMIP-131

-   UMIP title: Add miMATIC, VOL, BIFI, ICE, IRON and IF as supported collateral currencies 
-   Author: Chandler (chandler@umaproject.org)
-   Status: Last Call
-   Created: 13 September 2021


## Summary (2-5 sentences)

This UMIP proposes adding **miMATIC**, **VOL**, **BIFI**, **ICE**, **IRON** and **IF** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

miMATIC also known as MAI is a soft pegged stablecoin that is backed by other assets in the Polygon network.

## Technical Specification

To accomplish this upgrade, the following changes needs to be added to the collateral currency whitelist introduced in UMIP-8.

## Ethereum
### VOL token
-   The **VOL** Ethereum [token address](https://etherscan.io/token/0x5166e09628b696285e3a151e84fb977736a83575): 0x5166e09628b696285e3a151e84fb977736a83575
- A final fee of **1200 VOL** needs to be added in the Store contract.

### IF (Impossible Finance)
 - The **IF** Ethereum [token address](https://etherscan.io/token/0xb0e1fc65c1a741b4662b813eb787d369b8614af1): 0xb0e1fc65c1a741b4662b813eb787d369b8614af1
 - A final fee of **250 IF** needs to be added in the Store contract.

## Polygon 
### miMATIC token
-   The **miMATIC** Polygon [token address](https://polygonscan.com/token/0xa3fa99a148fa48d14ed51d610c367c61876997f1): 0xa3fa99a148fa48d14ed51d610c367c61876997f1 
-   A final fee of **400 MAI** needs to be added in the Store contract.

### BIFI token
- The **BIFI** Polygon [token address](https://polygonscan.com/token/0xfbdd194376de19a88118e84e279b977f165d01b8): 0xfbdd194376de19a88118e84e279b977f165d01b8 
- A final fee of **0.5 BIFI** needs to be added in the Store contract.

### ICE token (Iron Finance)
- The **ICE** Polygon [token address](https://polygonscan.com/token/0x4A81f8796e0c6Ad4877A51C86693B0dE8093F2ef): 0x4A81f8796e0c6Ad4877A51C86693B0dE8093F2ef
-   A final fee of **23 000 ICE** needs to be added in the Store contract.

### IRON stablecoin
 - The **IRON** Polygon [token address](https://polygonscan.com/token/0xD86b5923F3AD7b585eD81B448170ae026c65ae9a): 0xD86b5923F3AD7b585eD81B448170ae026c65ae9a
 - A final fee of **400 IRON** needs to be added in the Store contract.

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by assuming that the MIA and IRON tokens will hold its peg to $1 per token or by using CoinMarketCap and CoinGecko prices. 

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

It is noted that the ICE token is a redeployment of the TITAN token from the Iron Finance team.

IF also has very low liquidity on Ethereum mainnet, because its home-chain is BSC. Because of this, it should likely only be used for non-liquidatable contracts.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.



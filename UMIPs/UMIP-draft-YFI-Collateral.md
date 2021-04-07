## Headers
| UMIP-xx   |   |
|------------|---|
| UMIP Title | Add YFI as collateral |
| Authors    | Ross (ross@yam.finance)
| Status     | Draft |
| Created    | 2021-04-06 |
| Discourse Link | add when posted                               |
<br>

# Summary

This UMIP will add YFI to the supported collateral currencies on the global whitelist contract, allowing the usage of this assets as collateral currencies.


# Proposed Collateral Currencies

## YFI (yearn.finance Token)
### Motivation / Rationale

YFI is a best in class yield aggregator on Ethereum and is already a top 100 cryptocurrency by market capitalization. There is plenty of potential to utilize YFI as collateral within the UMA ecosystem.  

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The AAVE address, [0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e][yfi], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.01 YFI needs to be added for the YFI in the Store contract. (~$400 at time of writing)

 [yfi]: https://etherscan.io/token/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e

<br>

# Security Considerations
YFI has shown to be a persistently valuable ERC20 token given its liquidity and top market capitalization, including it as collateral currencies should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with YFI as the collateral currency. They should recognize that, relative to most fiat currencies, cryptocurrencies are much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

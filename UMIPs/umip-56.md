## Headers
| UMIP-56   |   |
|------------|---|
| UMIP Title | Add AAVE, LINK, SNX, UMA & UNI as collateral |
| Authors    | Josh Bowden (josh@ferrosync.io)
| Status     | Approved |
| Created    | 2020-02-17 |
| Discourse Link | https://discourse.umaproject.org/t/add-aave-link-snx-uma-uni-as-collateral/246
<br>

# Summary

This UMIP will add AAVE, LINK, SNX, UMA & UNI to the supported collateral currencies on the global whitelist contract, allowing the usage of these 5 assets as collateral currencies.


# Proposed Collateral Currencies

## AAVE (Aave Token)
### Motivation / Rationale

AAVE is a robust lending and borrowing platform on Ethereum and is already a top 20 cryptocurrency by market capitalization. There is plenty of potential to utilize AAVE as collateral within the UMA ecosystem.  

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The AAVE address, [0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9][aave], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 1 AAVE needs to be added for the AAVE in the Store contract. (~$460 at time of writing)

 [aave]: https://etherscan.io/token/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9

---

## LINK (Chainlink Token)
### Motivation / Rationale

LINK is already a top 10 cryptocurrency by market capitalization. As one the most liquid ERC20 tokens on Ethereum, there is plenty of potential to utilize LINK as collateral within the UMA ecosystem. 

### Technical Specification

To accomplish this upgrade, two changes need to be made:

 * The LINK address, [0x514910771af9ca656af840dff83e8264ecf986ca][link], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 12.5 LINK needs to be added for the LINK in the Store contract. (~$430 at time of writing)

 [link]: https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca

---

## SNX (Synthetix Network Token)
### Motivation / Rationale

SNX is a top 30 cryptocurrency by market capitalization. As one the most liquid ERC20 tokens on Ethereum, there is plenty of potential to utilize SNX as collateral within the UMA ecosystem. 

### Technical Specification

To accomplish this upgrade, two changes need to be made:
 * The SNX address, [0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f][snx], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 20 SNX needs to be added for the SNX in the Store contract. (~$450 at time of writing)

 [snx]: https://etherscan.io/token/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f

---

## UMA (UMA Governance Token)
### Motivation / Rationale

UMA is the governance token of the underlying protocol. It only fundamentally makes sense to introduce UMA as collateral within the UMA ecosystem. 

### Technical Specification

To accomplish this upgrade, two changes need to be made:
 * The UMA address, [0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828][uma], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 15 UMA needs to be added for the UMA in the Store contract. (~$405 at time of writing)

 [uma]: https://etherscan.io/token/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828


### Security Considerations

Using UMA as collateral for synthetic tokens should not pose a risk to the
protocol. Any UMA that is "locked" as collateral will be effectively taken off the market. Hence, it will decrease the circulating supply thereby likely increasing the Cost of Corruption (CoC).

The other consideration to be made is the token's usage for voting.
Synthetic tokens that use UMA as collateral may see significant decreases in
locked $UMA during governance voting. In general, this may cause potential synthetic token collateral amounts to significantly fluctuate. Though, all else
equal, any improper collateralization caused would be handled the same as any other EMP contract:  
 - (i) a position sponsor can only immediately remove the amount of collateral that would keep their position above the GCR,
 - (ii) if any sponsor attempts to perform a withdraw of their $UMA, they won't be able to use that $UMA to be able to influence any disputes regarding that position. 

Using UMA as collateral may also serve as a way to temporarily take $UMA tokens off the market without the effects of otherwise burning or selling the tokens. Storing UMA as collateral may also as another line of defense before performing a "buy-and-burn" operation to decrease circulating supply to thereby increase the Cost of Corruption.

> For additional discussion, see also ["Should UMA be added on lending protocols" on Discourse][discourse-uma].

 [discourse-uma]: https://discourse.umaproject.org/t/should-uma-be-added-on-lending-protocols/87/3

---

## UNI (Uniswap Token)

### Motivation / Rationale

Uniswap is one of the most popular and liquid decentralized exchanges on Ethereum. UNI is already ranked top 20 by cryptocurrency market capitalization. As one the most liquid ERC20 tokens on Ethereum, there is plenty of potential to utilize UNI as collateral within the UMA ecosystem. 

### Technical Specification

To accomplish this upgrade, two changes need to be made:
 * The UNI address, [0x1f9840a85d5af5bf1d1762f925bdaddc4201f984][uni], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 20 UNI needs to be added for the UNI in the Store contract. (~$415 at time of writing)

 [uni]: https://etherscan.io/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984

### Implementation

These changes have no implementation other than adding the collateral types to the whitelist.

<br>

# Security Considerations
AAVE, LINK, SNX, UMA, and UNI have shown to be persistently valuable ERC20 tokens given their liquidity and top market capitalization, including them as collateral currencies should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with AAVE, LINK, SNX, UMA, or UNI as the collateral currency. They should recognize that, relative to most fiat currencies, these assets are much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

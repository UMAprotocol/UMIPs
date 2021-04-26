# Headers

| UMIP-TBD    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add LUSD as whitelisted collateral currencies              |
| Authors    | Ramy Melo (Ramysmelo@gmail.com) |
| Status     | Draft                                                                                                                        |
| Created    | April 22, 2021                                                                                                                           |
| Discourse Link    | https://discourse.umaproject.org/t/add-lusd-collateral-support-to-dvm/929                                                                                                                           |

## Summary (2-5 sentences)

This UMIP will add LUSD as approved collateral currencies. This will involve adding the currencies to the whitelist and
adding a flat final fee to charge per-request. The proposed final fee is 400 LUSD per request.

## Motivation

LUSD is a fully redeemable USD-pegged stablecoin issued by the Liquity Protocol. Liquity is a decentralized borrowing
protocol that allows you to draw 0% interest loans against Ether used as collateral. Loans are paid out in LUSD and need
to maintain a minimum collateral ratio of only 110%.

In addition to the collateral, the loans are secured by a Stability Pool containing LUSD and by fellow borrowers
collectively acting as guarantors of last resort.

Liquity as a protocol is non-custodial, immutable, and governance-free.

## Technical Specification

To accomplish this upgrade, two changes need to be made:

- The LUSD address, 0x5f98805A4E8be255a32880FDeC7F6728C6568bA0, needs to be added to the collateral currency whitelist
  introduced in UMIP-8.
- A final fee of 400 LUSD needs to be added for LUSD in the Store contract.

## Rationale

The rationale behind this change is giving deployers more useful collateral currency options. LUSD introduces an
incentivized on-chain mechanism to maintain stability through a processed referred to as "redemption".

A redemption is the process of exchanging LUSD for ETH at face value, as if 1 LUSD is exactly worth $1. That is, for x
LUSD you get x Dollars worth of ETH in return. Users can redeem their LUSD for ETH at any time without limitations.
However, a redemption fee might be charged on the redeemed amount.

For example, if the current redemption fee is 1%, the price of ETH is $500 and you redeem 100 LUSD, you would get 0.198
ETH (0.2 ETH minus a redemption fee of 0.002 ETH). Note that the redeemed amount is taken into account for calculating
the base rate and might have an impact on the redemption fee, especially if the amount is large.

Redemption fees are based on the baseRate state variable in Liquity, which is dynamically updated. The baseRate
increases with each redemption, and decays according to time passed since the last fee event - i.e. the last redemption
or issuance of LUSD.

Under normal operation, the redemption fee is given by the formula:

```
redemption_fee = baseRate * ETHDrawn
```

400 LUSD was chosen as the final fee for LUSD because this is the practical equivalent to the final fee of already
approved stablecoins.

|Other Stable coins | UMIP| Current Fee| 
|------------|-----| ---------|
|DAI  | [UMIP-8](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-8.md) | 400
|rDAI  | [UMIP-17](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-17.md) | 400
|USDC; USDT  | [UMIP-18](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-18.md) | 400

## Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be
proposed.

## Security considerations

Since LUSD is a persistently valuable ERC20 token through liquidity and inherently through on-chain redemptions,
including it as supported collateral currencies should impose no additional risk to the protocol.

The main implication is for contract deployers and users who are considering using contracts with LUSD as the collateral
currency. LUSD is backed and redeemable for ETH, however the ETH/USD rate of Liquity utilizes a Chainlink Oracle ( ETH /
USD feed) 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419. LUSD does have a fallback mechanism for the price feed that allows
for the feed to change to Tellor(ETH:USD). The conditions for the fallback are as follows:

- Chainlink price has not been updated for more than 4 hours
- Chainlink response call reverts, returns an invalid price, or an invalid timestamp
- The price change between two consecutive Chainlink price updates is >50%.

New price identifiers, that are intended to be used with these collateral currencies, will need to be specified to 18
decimals of precision.
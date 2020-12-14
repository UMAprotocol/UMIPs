# Headers
| UMIP-18     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USDC and USDT as whitelisted collateral currencies              |
| Authors    | Sean Brown (sean@umaproject.org) |
| Status     | Approved                                                                                                                       |
| Created    | October 26, 2020                                                                                                                           |
 
## Summary (2-5 sentences)
This UMIP will add USDC and USDT as approved collateral currencies. This will involve adding the currencies to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 400 USDC per request for USDC and 400 USDT per request for USDT. 

## Motivation
USDT and USDC are the world’s two largest stablecoins by market capitalization as well as traded volume. Both are widely used across the cryptocurrency space, especially on exchanges, where USDC and USDT based crypto-pairs account for a large share of trading volume.

In comparison to DAI, which is already favored by many in the DeFi community because of its high level of decentralization, USDC and USDT are both fiat-backed stablecoins run by centralized organizations. With centralization comes risk, but the proven success of USDT and USDC, in terms of longevity and size, provide assurance about their ability to maintain value.
 
USDC and USDT as collateral types are expected to have a variety of deployments. They will allow for the creation of USD based synthetic assets and will increase the general accessibilty of these assets, as the cryptocurrency market is accustomed to transacting in these currencies.

## Technical Specification
To accomplish this upgrade, four changes need to be made:

- The USDC address, 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 400 needs to be added for USDC in the Store contract.
- The USDT address, 0xdac17f958d2ee523a2206206994597c13d831ec7, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 400 needs to be added for USDT in the Store contract.

## Rationale
The rationale behind this change is giving deployers more useful collateral currency options. USDC and USDT are necessary, in addition to the already approved DAI, because of the size of the stablecoin market-share that they own.

400 was chosen as the final fee for both USDC and USDT because this is practically equivalent to the final fee of already approved stablecoins.

## Implementation

This change has no implementation other than proposing the four aforementioned governor transactions that will be proposed.

## Security considerations
Since USDC and USDT are persistently valuable ERC20 tokens, including both as supported collateral currencies should impose no additional risk to the protocol.

The main implication is for contract deployers and users who are considering using contracts with USDC or USDT as the collateral currency. They should recognize and accept the centralization risk of using USDC or USDT, as both are fiat-backed or cash-equivalent backed stablecoins run by centralized organizations. USDC is issued and backed by Coinbase and Circle Invest, while USDT is issued and backed by Tether Limited.

USDT is a non-standard ERC20 as the USDT approve function does not comply with the ERC20 standard. This should not have any immediate security implications, as UMA Protocol contracts use OpenZeppelin's [SafeERC20 wrapper](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol), but should be noted as it *could* have implementation consequences for some financial contracts.

New price identifiers, that are intended to be used with these collateral currencies, will need to be specified to 6 decimals of precision in order to comply with USDC and USDT.
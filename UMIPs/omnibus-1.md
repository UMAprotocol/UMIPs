## Headers
| UMIP-tbd   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USDT, yUSD, UST, sUSD, COMP, YFI, ALCX, RUNE, ALPHA, MKR, CRV, REN, RGT, NFTX, and RULER as approved collateral currencies              |
| Authors    | John Shutt (john@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | April 7, 2021                                                                                                                           |
| [Discourse Link](TBD)    |                                                                                                                     |

# Summary (2-5 sentences)
This UMIP will add USDT, yUSD, UST, sUSD, COMP, YFI, ALCX, RUNE, ALPHA, MKR, CRV, REN, RGT, NFTX, and RULER as approved collateral currencies. This will involve adding each of these tokens to the whitelist and adding flat final fees to charge per-request.

# Motivation

Adding a collection of popular and liquid ERC20 tokens as collateral types will allow for a variety of contract deployments. These could be used with ERC20/USD price identifiers that are also being proposed to create yield dollars or covered calls collateralized by each of these tokens, among many other use cases.

Proactively approving these collateral types and price feeds will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens.

# Proposed Collateral Currencies
Note : The final fee for all ERC20 tokens will be ~$400 at time of writing


## USDT (Tether)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The USDT address, [0xdac17f958d2ee523a2206206994597c13d831ec7][USDT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 400.95869700000003 USDT needs to be added for USDT in the Store contract.

[USDT]: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7

---

## UST (TerraUSD)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The UST address,[0xa47c8bf37f92abed4a126bda807a7b7498661acd][ust], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 400 UST needs to be added for UST in the Store contract.

 [UST]: https://etherscan.io/token/0xa47c8bf37f92abed4a126bda807a7b7498661acd

---

## sUSD (Synthetix USD)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The sUSD address, [0x57ab1ec28d129707052df4df418d58a2d46d5f51][sUSD], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 400 sUSD needs to be added for sUSD in the Store contract.

 [sUSD]: https://etherscan.io/token/0x57ab1ec28d129707052df4df418d58a2d46d5f51

---

## yUSD (YVAULT-LP-YCURVE)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The yUSD address, [0x5dbcf33d8c2e976c6b560249878e6f1491bca25c][yUSD], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 313 yUSD needs to be added for yUSD in the Store contract.

 [yUSD]: https://etherscan.io/token/0x5dbcf33d8c2e976c6b560249878e6f1491bca25c

---

## COMP (Compound)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The COMP address, [0xc00e94cb662c3520282e6f5717214004a7f26888][COMP], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.845 COMP needs to be added for COMP in the Store contract.

 [COMP]: https://etherscan.io/token/0xc00e94cb662c3520282e6f5717214004a7f26888

---

## YFI (yearn.finance)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The YFI address, [0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e][YFI], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.01 YFI needs to be added for YFI in the Store contract.

 [YFI]: https://etherscan.io/token/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e

---

## ALCX (Alchemix)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The ALCX address, [0xdbdb4d16eda451d0503b854cf79d55697f90c8df][ALCX], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.25 ALCX needs to be added for ALCX in the Store contract.

 [ALCX]: https://etherscan.io/token/0xdbdb4d16eda451d0503b854cf79d55697f90c8df

---

## ALPHA (Alpha Finance)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The ALPHA address, [0xa1faa113cbe53436df28ff0aee54275c13b40975][ALPHA], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 200 ALPHA needs to be added for APLHA in the Store contract.

 [ALPHA]: https://etherscan.io/token/0xa1faa113cbe53436df28ff0aee54275c13b40975

---

## MKR (Maker)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The MKR address, [0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2][MKR], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.2 MKR needs to be added for MKR in the Store contract.

 [MKR]: https://etherscan.io/token/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2

---

## REN (REN)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The REN address, [0x408e41876cccdc0f92210600ef50372656052a38][REN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 400 REN needs to be added for REN in the Store contract.

[REN]: https://etherscan.io/token/0x408e41876cccdc0f92210600ef50372656052a38

---

## CRV (Curve DAO Token)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The CRV address, [0xd533a949740bb3306d119cc777fa900ba034cd52][CRV], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 137 CRV needs to be added for CRV in the Store contract.

[CRV]: https://etherscan.io/token/0xd533a949740bb3306d119cc777fa900ba034cd52

---

## RGT (Rari Governance Token)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The RGT address, [0xd291e7a03283640fdc51b121ac401383a46cc623][RGT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 30 RGT needs to be added for RGT in the Store contract.

[RGT]: https://etherscan.io/token/0xd291e7a03283640fdc51b121ac401383a46cc623

---

## NFTX (NFTX)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The NFTX address, [0x87d73e916d7057945c9bcd8cdd94e42a6f47f776][NFTX], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 2.25 NFTX needs to be added for NFTX in the Store contract.

[NFTX]: https://etherscan.io/token/0x87d73e916d7057945c9bcd8cdd94e42a6f47f776

---

## RULER (Ruler Protocol)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The RULER address, [0x2aeccb42482cc64e087b6d2e5da39f5a7a7001f8][RULER], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 1.2 RULER needs to be added for RULER in the Store contract.

[RULER]: https://etherscan.io/token/0x2aeccb42482cc64e087b6d2e5da39f5a7a7001f8


# Security considerations

These ERC20 tokens have shown to be persistently valuable given their liquidity and market capitalization, so including them as collateral currencies should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with these tokens as the collateral currency. They should recognize that, relative to most fiat currencies, these assets are much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

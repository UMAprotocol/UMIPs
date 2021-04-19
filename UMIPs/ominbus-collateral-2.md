## Headers
| UMIP-tbd   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add  OHM, LON, BANK, MASK, VSP, SFI, FRAX, MIR, ORN and BOND as approved collateral currencies              |
| Authors    | John Shutt (john@umaproject.org) , Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                    |
| Created    | April 19, 2021                                                                                                                           |
| [Discourse Link](https://discourse.umaproject.org/t/add-ohm-lon-bank-mask-vsp-sfi-frax-mir-orn-and-bond-as-approved-collateral-currencies/919)    |                                                                                                                     |

# Summary (2-5 sentences)
This UMIP will add OHM, LON, BANK, MASK, VSP, SFI, FRAX, MIR, ORN and BOND as approved collateral currencies.
This will involve adding each of these tokens to the whitelist and adding flat final fees to charge per-request.

# Motivation

Adding a collection of popular and liquid ERC20 tokens as collateral types will allow for a variety of contract deployments. These could be used with ERC20/USD price identifiers that are also being proposed to create yield dollars or covered calls collateralized by each of these tokens, among many other use cases.

Proactively approving these collateral types and price feeds will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens.

# Proposed Collateral Currencies
Note : The final fee for all ERC20 tokens will be ~$400 at time of writing



## OHM (Olympus)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The OHM address, [0x383518188c0c6d7730d91b2c03a03c837814a899][OHM], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.533 OHM needs to be added for OHM in the Store contract. 

 [OHM]: https://etherscan.io/token/0x383518188c0c6d7730d91b2c03a03c837814a899


---	
## LON (Tokenlon)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The LON address, [0x0000000000095413afc295d19edeb1ad7b71c952][LON], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 70.14 LON needs to be added for LON in the Store contract. 

 [LON]: https://etherscan.io/token/0x0000000000095413afc295d19edeb1ad7b71c952



---

## MASK (Mask Network)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The MASK address, [0x69af81e73a73b40adf4f3d4223cd9b1ece623074][MASK], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 22.8 MASK needs to be added for MASK in the Store contract. 

 [MASK]: https://etherscan.io/token/0x69af81e73a73b40adf4f3d4223cd9b1ece623074

---



## BANK (Float Protocol)

### Technical Specification
  To accomplish this upgrade, two changes need to be made:

  * The BANK address, [0x24a6a37576377f63f194caa5f518a60f45b42921][BANK], needs to be added to the collateral currency whitelist introduced in UMIP-8.
  * A final fee of 1.1 BANK needs to be added for BANK in the Store contract.

     [BANK]: https://etherscan.io/token/0x24a6a37576377f63f194caa5f518a60f45b42921 
---

## SFI (saffron.finance)

### Technical Specification
 To accomplish this upgrade, two changes need to be made:
  * The SFI address, [0xb753428af26e81097e7fd17f40c88aaa3e04902c][SFI], needs to be added to the collateral currency whitelist introduced in UMIP-8.
  * A final fee of 0.2583679649495828 SFI needs to be added for SFI in the Store contract.

     [SFI]: https://etherscan.io/token/0xb753428af26e81097e7fd17f40c88aaa3e04902c 
     
  ---
## VSP (Vesper Finance)

   ### Technical Specification
   To accomplish this upgrade, two changes need to be made:

   * The VSP address, [0x1b40183efb4dd766f11bda7a7c3ad8982e998421][VSP], needs to be added to the collateral currency whitelist introduced in UMIP-8.
   * A final fee of 10.481343283582089 VSP needs to be added for VSP in the Store contract.

     [VSP]: https://etherscan.io/token/0x1b40183efb4dd766f11bda7a7c3ad8982e998421 
     
 ---

## FRAX (Frax)

   ### Technical Specification
   To accomplish this upgrade, two changes need to be made:

   * The FRAX address, [0x853d955acef822db058eb8505911ed77f175b99e][FRAX], needs to be added to the collateral currency whitelist introduced in UMIP-8.
   * A final fee of 400 FRAX needs to be added for FRAX in the Store contract.

   [FRAX]: https://etherscan.io/token/0x853d955acef822db058eb8505911ed77f175b99e 
     
  ---


## MIR (Mirror Protocol)

   ### Technical Specification
   To accomplish this upgrade, two changes need to be made:

   * The MIR address, [0x09a3ecafa817268f77be1283176b946c4ff2e608][MIR], needs to be added to the collateral currency whitelist introduced in UMIP-8.
   * A final fee of 50.144994246260076 MIR needs to be added for MIR in the Store contract.

   [MIR]: https://etherscan.io/token/0x09a3ecafa817268f77be1283176b946c4ff2e608 
   
  ---
    
## BOND (BarnBridge)

   ### Technical Specification
   To accomplish this upgrade, two changes need to be made:

   * The BOND address, [0x0391d2021f89dc339f60fff84546ea23e337750f][BOND], needs to be added to the collateral currency whitelist introduced in UMIP-8.
   * A final fee of 9.084730403262347 BOND needs to be added for BOND in the Store contract.

   [BOND]: https://etherscan.io/token/0x0391d2021f89dc339f60fff84546ea23e337750f 
     
  ---
## ORN (Orion Protocol)

  ### Technical Specification
   To accomplish this upgrade, two changes need to be made:

   * The ORN address, [0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a][ORN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
   * A final fee of 29.826500297088533 ORN needs to be added for ORN in the Store contract.

   [ORN]: https://etherscan.io/token/0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a 
   

 ---

# Security considerations

These ERC20 tokens have shown to be persistently valuable given their liquidity and market capitalization, so including them as collateral currencies should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with these tokens as the collateral currency. They should recognize that, relative to most fiat currencies, these assets are much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

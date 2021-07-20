
## Headers
- UMIP <#> 
- UMIP title: <Collateral Omnibus 4>
- Author Chandler De Kock (chandler@umaproject.org)
- Status: <Draft> 
- Created: <15 July 2021>
- Discourse Link: <Link>

## Summary (2-5 sentences)

This UMIP proposes adding **BADGER**, **OHM**, **IDLE**, **GNO**, **Qi**, **POOL**, **DOUGH V2**, **FEI**, **TRIBE** and **FOX** for use as collateral in UMA contracts.

## Motivation

These tokens are being added as part of an Omnibus to allow for more projects to launch contracts using their native treasury token. 

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- Each token needs to be added to the collateral currency whitelist introduced in UMIP-8.

### BADGER
-   The BadgerDAO 
    [Ethereum token address:](https://etherscan.io/token/0x3472a5a71965499acd81997a54bba8d852c6e53d) 0x3472a5a71965499acd81997a54bba8d852c6e53d
    [Polygon token address:](https://polygonscan.com/token/0x1fcbe5937b0cc2adf69772d228fa4205acf4d9b2) 0x1fcbe5937b0cc2adf69772d228fa4205acf4d9b2
-   A final fee of **60 BADGER**

### OHM
  The OlympusDAO [Ethereum token address:](https://etherscan.io/address/0x383518188c0c6d7730d91b2c03a03c837814a899) 0x383518188c0c6d7730d91b2c03a03c837814a899
-   A final fee of **0.8 OHM** 

### IDLE 
  The IDLE Finance [Ethereum token address:](https://etherscan.io/token/0x875773784af8135ea0ef43b5a374aad105c5d39e) 0x875773784af8135ea0ef43b5a374aad105c5d39e
-   A final fee of **100 IDLE**

### GNO
  The Gnosis [Ethereum token address:](https://etherscan.io/token/0x6810e776880c02933d47db1b9fc05908e5386b96) 0x6810e776880c02933d47db1b9fc05908e5386b96
-   A final fee of **3 GNO**

### Qi -note this is a Polygon token
  The QiDAO [Polygon token address:](https://polygonscan.com/token/0x580a84c73811e1839f75d86d75d88cca0c241ff4) 0x580a84c73811e1839f75d86d75d88cca0c241ff4
-   A final fee of **400 Qi**

### POOL
  The PoolTogether [Ethereum token address:](https://etherscan.io/token/0x0cec1a9154ff802e7934fc916ed7ca50bde6844e) 0x0cec1a9154ff802e7934fc916ed7ca50bde6844e
-   A final fee of **45 POOL**

### PieDAO DOUGH V2 
   The PieDAO [Ethereum token address:](https://etherscan.io/token/0xad32A8e6220741182940c5aBF610bDE99E737b2D) 0xad32A8e6220741182940c5aBF610bDE99E737b2D
-   A final fee of **1100 DOUGH V2**

### FEI
   The FEI Protocol [Ethereum token address:](https://etherscan.io/address/0x956F47F50A910163D8BF957Cf5846D573E7f87CA) 0x956F47F50A910163D8BF957Cf5846D573E7f87CA
- A final fee of **400 FEI**
Due to FEI being an algorithmic stablecoin, it is at risk of losing the peg. However this is countered through the reweighting system, coupled with the $0.95c price floor, allowing any user to always redeem their FEI for $0.95c.

### TRIBE
 The TRIBE [Ethereum token address:](https://etherscan.io/token/0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B) 0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B
 - A final fee of **800 TRIBE**

### FOX
  The ShapeShift 
  [Ethereum token address:](https://etherscan.io/token/0xc770eefad204b5180df6a14ee197d99d808ee52d) 0xc770eefad204b5180df6a14ee197d99d808ee52d
  - A final fee of **670 FOX**

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by reference the median price over the past 7 days as reported by Crypto Watch, CoinGecko or CoinMarket Cap 

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


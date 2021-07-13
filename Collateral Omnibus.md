This is the suggested template for new UMIPs.

Note that an UMIP number will be assigned by an editor. 
When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md.

The title should be 44 characters or less.

## Headers
- UMIP <#> 
- UMIP title: <Collateral Omnibus 4>
- Author Chandler De Kock (chandler@umaproject.org)
- Status: <Draft> 
- Created: <15 July 2021>
- Discourse Link: <Link>

## Summary (2-5 sentences)

This UMIP proposes adding **BADGER**, **OHM**, **IDLE**, **GNO**, **GYSR**, **Qi**, **POOL** for use as collateral in UMA contracts.

## Motivation

These tokens are being added as part of an Omnibus to allow for more projects to launch contracts using their native treasury token. 

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- Each token needs to be added to the collateral currency whitelist introduced in UMIP-8.

### BadgerDAO
-   The **BADGER** [token address](https://etherscan.io/token/0x3472a5a71965499acd81997a54bba8d852c6e53d)
-   A final fee of **50 BADGER**

### OlympusDAO
  The **OHM** [token address](https://etherscan.io/address/0x383518188c0c6d7730d91b2c03a03c837814a899)
-   A final fee of **1 OHM** 

### IDLE Finance
  The **IDLE** [token address](https://etherscan.io/token/0x875773784af8135ea0ef43b5a374aad105c5d39e) 
-   A final fee of **100 IDLE**

### Gnosis
  The **GNO** [token address](https://etherscan.io/token/0x6810e776880c02933d47db1b9fc05908e5386b96) 
-   A final fee of **2.4 GNO**

### GYSR
  The **GYSR** [token address](ttps://etherscan.io/token/0xbea98c05eeae2f3bc8c3565db7551eb738c8cc)
-   A final fee of **2000 GYSR** 

### QiDAO - note this is a Polygon token
  The **Qi** [token address](https://polygonscan.com/token/0x580a84c73811e1839f75d86d75d88cca0c241ff4) 
-   A final fee of **230 Qi**

### PoolTogether
  The **POOL**  [token address](https://etherscan.io/token/0x0cec1a9154ff802e7934fc916ed7ca50bde6844e) 
-   A final fee of **40 POOL**
    

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by reference the median price over the past 7 days as reported by Crypto Watch, CoinGecko or CoinMarket Cap 

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


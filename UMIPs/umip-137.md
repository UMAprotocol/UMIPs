## Headers
| UMIP-137   |                                             |
|------------|---------------------------------------------|
| UMIP Title | Add QUARTZ and ibBTC as collateral currency |
| Authors    | Mhairi McAlpine (mhairi@umaproject.org)     |
| Status     | Approved                                   |
| Created    | November 2, 2021                            |

  
  

## Summary (2-5 sentences)  
  

This UMIP proposes adding  QUARTZ and ibBTC for use as collateral in UMA contracts.  


## Motivation  
  

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.  
  

## Technical Specification  
  

To accomplish this upgrade, the following changes need to be made:  
  

- The  QUARTZ token  address 0xba8a621b4a54e61c442f5ec623687e2a942225ef([https://etherscan.io/address/0xba8a621b4a54e61c442f5ec623687e2a942225ef](https://etherscan.io/address/0xba8a621b4a54e61c442f5ec623687e2a942225ef) needs to be added to the collateral currency whitelist introduced in UMIP-8.  

-  A final fee of 60 QUARTZ needs to be added for QUARTZ  in the Store contract. 

- The ibBTC token address 0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f ([https://etherscan.io/token/0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f](https://etherscan.io/token/0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f) needs to be added to the collateral currency whitelist introduced in UMIP-8.  

-  A final fee of 0.0067 ibBTC needs to be added for ibBTC in the store contract
  

## Rationale  
  

This store fee for each token was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by  querying CoinGecko. 
  

## Implementation  
  

This change has no implementations other than the aforementioned governor transactions  
  

## Security considerations  
  

Adding a collateral currency introduces a level of risk into the UMA Ecosystem. These collateral type should be monitored to ensure that the proposed collateral continues to have value.  
  
It should be noted that there is limited liquidity for QUARTZ on the Ethereum mainnet, consequently the final fee was determined using the liquidity available on the BSC sidechain

Contract deployers considering using these collateral in an UMA contract should refer to the guidelines on collateral type usage available here **https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition** to ensure appropriate use.  



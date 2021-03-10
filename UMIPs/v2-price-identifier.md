## Headers
| UMIP-xx    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USDBTC_V2, BCHNBTC_V2, ELASTIC_STABLESPREAD/USDC_V2, STABLESPREAD/USDC_V2, STABLESPREAD/BTC_V2, AMPLUSD_V2 as supported price identifiers            |
| Authors    | Sean Brown (@smb2796)                               |
| Status     | Draft                                                                                                                                 |
| Created    | March 10, 2021                                                                                                                           |
| Discourse Link   |                                              |


## Summary (2-5 sentences)

This UMIP proposes adding USDBTC_V2, BCHNBTC_V2, ELASTIC_STABLESPREAD/USDC_V2, STABLESPREAD/USDC_V2, STABLESPREAD/BTC_V2, AMPLUSD_V2 as supported price identifiers.

## Motivation

With the introduction of the new EMP template proposed in UMIP-52, all price identifiers are required to be scaled by 10^18 when submitted on-chain. This is in contrast to the pattern in old EMP contracts, where the price identifier needed to be scaled to match the scaling factor of the collateral currency that the identifier was being used with. This means that price identifiers that were used in an old EMP contract that had a non-18 decimal collateral currency cannot be used with the new contracts.

Because of this, many price identifiers have been deprecated. This UMIP simply reproposes those price identifiers with slightly altered price identifier names and a scaling specification of 18 decimals. Everything else about these identifiers remains the same.

## Technical Specifications

Voters should refer to the rationale, technical specifications, implementations and security considerations in each corresponding UMIP. The only change to the implemenentations of these price identifiers are that these should all be scaled 10^18. Voters currently do not have to adjust results for any sort of scaling when voting through the UMA voter dapp, so the result that a voter would input for one of these price ids would be exactly the same as for the deprecated identifiers.

The price identifier pairings are as follows.

| New Identifier | Old Identifier | UMIP |
|------------|------------------------------------------------------------------------------------------------------------------------------------------| --------------|
| USDBTC_V2 | USDBTC | [UMIP-7](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-7.md) |
| BCHNBTC_V2 | BCHNBTC | [UMIP-23](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-23.md) |
| ELASTIC_STABLESPREAD/USDC_V2 | ELASTIC_STABLESPREAD/USDC | [UMIP-30](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-30.md) |
| STABLESPREAD/USDC_V2 | STABLESPREAD/USDC | [UMIP-31](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-31.md) |
| STABLESPREAD/BTC_V2 | STABLESPREAD/BTC | [UMIP-31](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-31.md) |
| AMPLUSD_V2 | AMPLUSD | [UMIP-33](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-33.md) |


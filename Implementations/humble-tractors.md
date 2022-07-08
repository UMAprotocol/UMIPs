# Title
Humble Tractors NFT KPI

# Summary

Humble tractors’ KPI options is to promote sales of its NFTs on the OpenSea marketplace. The KPI options will track the number of sales at the price request timestamp (contract expiration) through a query to the given humble tractors activity page on OpenSea and convert it to a corresponding share from the maximum KPI options payout.

# Ancillary Data Specifications

Metric: Total number of sales before expiry,
Endpoint: “discord link", 
Method: "https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/HumbleTractorNFT-KPI.md", 
Key: Total sales,
Interval: Lookup the total number of sales achieved at or before request timestamp,
Rounding: 0.

# Implementation

1. Proposers/Voters should check the number of sales at "discord link" and https://api.opensea.io/api/v1/collection/humble-tractors/stats
2. Humble Tractors does not have a collection id which makes it difficult to ascertain the number of sales by a certain timestamp.
3. For this reason, the source used as a reference to determine the number of sales will be the median for the first 3 screenshots provided by pre-designated SuperUMAns posted after the request timestamp in "discord link" channel of the SuperUMAn discord. The specific SuperUMAns taking the expiry screenshots will be  @deadcoin#0901, @PVmilihache#8517, @PennyPanda#4443 and @Neondaemon#7190
4. No rounding. Whole numbers only.



## Intended Application

It is intended to deploy the documented KPI Options on Polygon network using [LSP Contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with 'General_KPI' price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). This contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the 'lowerBound' set to 10 and the 'upperBound' set to 31. 

'collateralPerPair' parameter for the LSP contract would be set to 1 so that the maximum payout per KPI option would reach 1 USDC if the number of sales reach a minimum of 31 by the request timestamp. 

500 USDC is set as the collateral, with the KPI linked to NFT sales. The payout will be as follows:

0 to 10 NFTs sold = 0
11 to 30 NFTs sold = 0.5 USDC
31 to 50 NFTs sold = 1 USDC


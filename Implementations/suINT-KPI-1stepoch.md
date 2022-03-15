## Title:
SuperUMAn DAO Epoch One KPI

## Summary:
The SuperUMAn DAO wishes to use KPI Options to incentivize the community to continue the pursuit of cross-DAO integrations with UMA financial products. This implementation doc is intended to be used with the General_KPI price identifier, and its return value will be determined by UMA proposer/voters assessment of the SuperUMAn DAO's completion of its objectives. These objectives and corresponding payouts are detailed in the Implementation section.

## Intended Ancillary Data:
Metric:Completion of cross-DAO integrations,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/suINT-KPI-1stepoch.md", startTimeStamp: 1640995200, Rounding: 0

## Implementation:
At the time of voting, Voters should add up all values for each integration that have been met by the SuperUMAn DAO at the price request timestamp. The value returned will be between 0 and 12 and should be informed by the completion of cross-DAO integrations listed in this document.

A value of 1 should be added to the total for each cross-DAO integration that has been completed. A maximum value of 10 integrations should be added to the total.
If 10 or more integrations have been completed, a bonus value of 2 should be added to the total value to equal 12.

Based on the above calculation, the following should be used to determine the final returned value:
If less than 3 integrations are completed, a minimum value of 3 would be returned. 
If between 3 and 9 integrations are completed, the returned value would be equal to the number of integrations.
If 10 or more integrations have been completed, the maximum value returned would be equal to 12 as a bonus value of 2 will be applied to the total.

**Additional information for UMA DVM participants:**

Within the SuperUMAn Discord is a channel called [#greenlight-list](https://discord.com/channels/909933079181799524/953049246603571210). This channel will be used to post and keep track of the above metric. Users will be able to verify integrations here.
Approved integrations can be observed in the [Green Light List Doc](https://docs.google.com/spreadsheets/d/1cEvNGCGlzRzxNMwHsIk2Cq3MsEWM583JJQhxKSdzQUY/edit?usp=drivesdk) for qualified suINT integrations. The "green light" list will include details that voters need to assess the validity of the integration (e.g. launch and funding date of the contract so that voters can verify it is within the specified timeframe of the current KPI option). Anyone can propose adding an integration to the list. Each integration will be added one at a time, after it has been discussed in the #greenlight-list channel in SuperUMAn Discord. UMA token holders are encouraged to participate in these discussions in preparation for the formal proposed settlement.
An integration will have been achieved when a DAO or other organisation funds an LSP contract which includes but is not limited to:

- KPI options
- Call/Put options
- Range Bonds
- Success Tokens
- Protected Tokens
      
## Intended Application:
It is intended to deploy the documented KPI Options on Polygon network using [LSP Contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with 'General_KPI' price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). This contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the 'lowerBound' set to 0 and the 'upperBound' set to 12. 

'collateralPerPair' parameter for the LSP contract would be set to 0.60 so that the maximum payout per KPI option would reach 0.60 UMA if the max integrations of ten + the max integration bonus of 2 is reached by the request timestamp. 

'startTimeStamp' exists within the Ancillary data that corresponds to January 1st, 2022, 12:00:00 AM GMT. This historical unix startTimeStamp represents the desired beginning of the next SuperUMAn KPI option epoch, in sequence with the end of the [uINT](https://projects.umaproject.org/ethereum/0x57C891D01605d456bBEa535c8E56EaAc4E2DFE11) epoch. This will allow the SU DAO the opportunity to include integrations that occured after the end of the previous epoch.

Example 1: The SuperUMAn DAO achieves 2 integrations before expiry. This is a result below the lower bound so a value of 3 Integrations (or 0.15 UMA per long token) should be returned. 

Example 2: The SuperUMAn DAO achieves 6 integrations. This is a result that falls between the lower and upper bounds. Voters should return a value of 6 (or 0.30 UMA per long token). 

Example 3: The SuperUMAn DAO achieves ten integrations. This result reaches the max integrations on the shifted linear scale and is the only result that can trigger the bonus. It should return a value of 12 integrations (10 integrations at 0.05 = 0.5 UMA) + bonus (2 integrations at 0.05 = 0.1 UMA) = (0.6 UMA).

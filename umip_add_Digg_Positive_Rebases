
| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add DIGG DIGG_Positive_Rebases as a supported price identifier|
| Authors             | Jon (BadgerDAO)                                               |
| Status              | Draft                                                         |
| Created             | 4/27/2021                                                     |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

# Summary 

The DVM should support price requests for total DIGG_Positive_Rebases for 30 days after the launch of the options. A DIGG Positive Rebase can be determined if the total supply of DIGG (https://etherscan.io/token/0x798d1be841a82a273720ce31c822c61a67a601c3) increased from one day to the next.


# Motivation

We would like this identifier added so that we can distriute positive rebase options as a mechanism to help support the stability of DIGG.  More details on the campaign can be found in this post:
https://medium.com/badgerdao/badgerdao-x-uma-introducing-rebase-mining-3c663a5abdce

# Data Specifications

-----------------------------------------
- Price identifier name: **DIGG_Positive_Rebases** 
- Markets & Pairs: **N/A**
- Example data providers: **Available on-chain** 
- Cost to use: **None**
- Real-time data update frequency: **Daily** 
- Historical data update frequency: **Daily** 

# Price Feed Implementation

At 12:00 UTC every day compare the total supply of DIGG (https://etherscan.io/token/0x798d1be841a82a273720ce31c822c61a67a601c3) to its supply from the previous day.  If it is greater than the previous day then the price feed should iterate by 1.  The exact amount of DIGG in the redemption pool has not been settled yet.  the below formula and accompanying spreadsheet illustrates how to calculate the percentage of the redemption pool that each option will be redeemable for.  Once the size of the pool is known (in bDIGG) then the formula can be updated by multiplying by the total redemption pool size.

r = total rebases (using iterative calculation above)
5 = minmum rebases
30 = max rebases
min(if(r<5,0,((r-5)/(30-5))^1.5),1)
https://docs.google.com/spreadsheets/d/1Kb58KUiaCFClfL9hkf0OCXJzXHC-9lDwnrxQ3eEobg4/edit?usp=sharing




# Technical Specifications

Price identifier name: DIGG_Positive_Rebases
Base Currency: NA
Quote Currency: NA
Rounding: Round to 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)
Estimated current value of price identifier: 0

# Implementation

I think comparing total supply one day to the other is the easiest but am open to other ways to implement this.

1. Using the timestamp that falls on 12:00 UTC but is closest and earlier than the price request timestamp (D2), read totalSupply from the DIGG token contract (D2_Supply).
2. Query for totalSupply at 12:00 UTC on the day proceeding the day's (D1_Supply).
3. If D2_Supply > D1_Supply  (if supply is equal do not iterate), increment DIGG_Positive_Rebases by 1. If D2_Supply <= D1_Supply, the DIGG_Positive_Rebases value should remain constant.
4. Steps 2 and 3 should be repeated until the D1_Supply timestamp is earlier than the block timestamp that the contract using this price identifier was launched in OR the days since the deployment = to 30.
5. Voters should return the value of DIGG_Positive_Rebases once one of the conditions of step 4 is met. This value should be returned as is with no rounding.

# Rationale

This price feed is very specific to these options and needs to align to start at the date they are issued and stop running at maturity (30 days post launch).  We may look ot use this mechanism in the future and are open to suggestions on how to restructure the price feed to make it more flexible for future use.

# Security Considerations

All Data is verifiable on chain so no major security concerns.

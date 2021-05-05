
| UMIP-87               |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add DIGG_Positive_Rebases as a supported price identifier|
| Authors             | Jon (BadgerDAO)                                               |
| Status              | Last Call                                                         |
| Created             | 4/27/2021                                                     |
| Discourse Link      | https://discourse.umaproject.org/t/umip-81-add-digg-positive-rebases-price-identifier/1026           |

# Summary 

The DVM should support price requests for total DIGG_Positive_Rebases for 30 days after the launch of the options. A DIGG Positive Rebase can be determined if the total supply of DIGG (https://etherscan.io/token/0x798d1be841a82a273720ce31c822c61a67a601c3) increased from one day to the next.


# Motivation

We would like this identifier added so that we can distriute positive rebase options as a mechanism to help support the stability of DIGG.  More details on the campaign can be found in this post:
https://medium.com/badgerdao/badgerdao-x-uma-introducing-rebase-mining-3c663a5abdce

# Data Specifications

-----------------------------------------
- Price identifier name: **DIGG_Positive_Rebases** 
- Markets & Pairs: **N/A**
- Example data providers: **Total supply of https://etherscan.io/token/0x798d1be841a82a273720ce31c822c61a67a601c3** 
- Cost to use: **None**
- Real-time data update frequency: **Daily** 
- Historical data update frequency: **Daily** 

# Price Feed Implementation

At 12:00 UTC every day compare the total supply of DIGG (https://etherscan.io/token/0x798d1be841a82a273720ce31c822c61a67a601c3) to its supply from the previous day.  If it is greater than the previous day then Positive_rebases should iterate by 1.  The exact amount of DIGG in the redemption pool has not been settled yet but there will be 1000 options tokens minted for every 1 bDIGG in the pool, the maximum value for this implementation is .001.  the below formula and accompanying spreadsheet illustrates how to calculate the percentage of the redemption pool that each option will be redeemable for.  

r = Positive_Rebases (using iterative calculation above)
5 = minmum rebases
30 = max rebases
min(if(r<5,0,((r-5)/(30-5))^1.5),1)
https://docs.google.com/spreadsheets/d/1Kb58KUiaCFClfL9hkf0OCXJzXHC-9lDwnrxQ3eEobg4/edit?usp=sharing

**Example Outputs**
Positive Rebases  % of the Pool
3                 0%
8                 4.16%
22                56.07%
30                100%


# Technical Specifications

Price identifier name: DIGG_Positive_Rebases
Base Currency: NA
Quote Currency: NA
Rounding: Round to 8 decimal places (9th decimal place digit >= 5 rounds up and < 5 rounds down)
Estimated current value of price identifier: 0

# Implementation

There will be a redemption pool that holds some amount of bDIGG.  Based on the number of positive rebases during the life of the options some portion of that pool will be available for options settlement.  The percentage of the pool that is available for settlement can be calculated using the below formula and then multiplied by the ratio of options tokens to bDIGG in the pool which will be .001.  The exact amount of bDIGG int he pool is being determined through badger governance right now.

r = Positive_Rebases (using iterative calculation above)
5 = minimum rebases
30 = max rebases
Digg_Positive_Rebases = min(if(r<5,0,((r-5)/(30-5))^1.5),1) * .001
https://docs.google.com/spreadsheets/d/1Kb58KUiaCFClfL9hkf0OCXJzXHC-9lDwnrxQ3eEobg4/edit?usp=sharing

The main input needed is the number for Positive_Rebases that has occured during the life of the options (30 days)

1. Using the timestamp that falls on 12:00 UTC but is closest and earlier than the price request timestamp (D2), read totalSupply from the DIGG token contract (D2_Supply).
2. Query for totalSupply at 12:00 UTC on the day preceeding the day's (D1_Supply).
3. If D2_Supply > D1_Supply  (if supply is equal do not iterate), increment Positive_Rebases by 1. If D2_Supply <= D1_Supply, the Positive_Rebases value should remain constant.
4. Steps 2 and 3 should be repeated until the D1_Supply timestamp is earlier than the block timestamp that the contract using this price identifier was launched in OR the days since the deployment = to 30.

Voters should return the value of DIGG_Positive_Rebases (using Positive_Rebases as an input in the above formula) once one of the conditions of step 4 is met. This value should be rounded to 8 decimal places.


# Rationale

This price feed is very specific to these options and needs to align to start at the date they are issued and stop running at maturity (30 days post launch).  We may look ot use this mechanism in the future and are open to suggestions on how to restructure the price feed to make it more flexible for future use.

# Security Considerations

All Data is verifiable on chain so no major security concerns.

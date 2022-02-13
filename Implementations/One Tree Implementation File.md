# Title
Plant One Tree Per Tweet KPI 

# Summary
This KPI Option is designed to pay off based on the number of retweets that a single, specific tweet gets on Twitter before an expiry date.

# Ancillary Data Specifications
Metric: Total number of Retweets the original One Tree Tweet can attain before expiry, Endpoint: "https://discord.com/channels/718590743446290492/719352532354465833/941823902575910963", Method: "Insert quotation wrapped link to Implementation file here", Key: Total retweets, Rounding: two decimals, Interval: Daily taking the final count of the retweets at midnight UTC upon expiry

# Rationale
This design is not intended to avoid “gaming” in any sense. Rather, it is just to demonstrate the effectiveness of KPI options, as well as to create a game whereby people are excited to participate for good. This design should not be used for something highly sensitive or critical, as it relies on a social measure on a gameable social network. It is possible to “buy RTs” for quite cheap through different sources online, so an interested party could trick this measure pretty easily. 

# Implementation
1.	Proposers/voters should check the tweet at the time of expiry for the number of RTs the tweet has.
2.	There is some ambiguity about how to do this, because a tweet could receive more RTs after expiry. An increase in the value is not the problem, but rather, a lack of clarity for voters on what is the correct value.
3.	For this reason, the authors would suggest that the source used as a reference for the calculation is a screenshot posted after the expiry time in the voting channel of the UMA discord but could be changed to use another data source in the future.
4.	Possible disputers would only dispute if the value of RTs proposed actually exceeded the value shown during the liveness period.

# Intended Use Case 
This is intended to be used as a way to incentivize RTs. In its first iteration, this is for a charitable benefit. One could design it merely for marketing purposes, and even make the recipient be one of the RTers - Which while distributing the tokens to them would not be trustless, the value of the tokens themselves would be based on the number of RTs.
Intended Application

This calculation is intended to be used with a KPI option that has FPL bounds of 0 and 10,000, and a collateralPerPair of 1. As an example, 5000 retweets would result in a KPI option value of 0.5 USDC. 3,000 retweets would result in a KPI Option value of 0.3 USDC by the same equation. 


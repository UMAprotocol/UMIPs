# Title
Plant One Tree Per Tweet KPI

# Summary
This KPI Option is designed to pay off based on the number of retweets that a single, specific tweet gets on Twitter before an expiry date.

# Ancillary Data Specifications
Metric: Total number of Retweets the original One Tree Tweet can attain before expiry, Endpoint: "https://discord.com/channels/909933079181799524/953369451573690428", Method: "https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/OneTree-KPI.md", Key: Total retweets, Rounding: 2 decimals, Interval: Daily resolving to data supplied directly following the request timestamp, Fallback: If fewer than three screenshots are provided within the first three hours following the request timestamp anyone can post a screenshot of the tweet, Aggregation: Median of the first three screenshots provided by pre-designated SuperUMAns posted after the request timestamp, Unresolved: 10000, Tweet: "https://twitter.com/UMAprotocol/status/1503828527099088904" 

# Rationale
This design is not intended to avoid “gaming” in any sense. Rather, it is just to demonstrate the effectiveness of KPI options, as well as to create a game whereby people are excited to participate for good. This design should not be used for something highly sensitive or critical, as it relies on a social measure on a gameable social network. It is possible to “buy RTs” for quite cheap through different sources online, so an interested party could trick this measure pretty easily.

# Implementation
1. Proposers/voters should check the tweet provided as Ancillary data at the expirationTimestamp for the number of RTs the tweet has.
2. There is some ambiguity about how to do this, because a tweet could receive more RTs after expiry. An increase in the value is not the problem, but rather, a lack of clarity for voters on what is the correct value.
3. For this reason, the authors would suggest that the source used as a reference for the calculation is the median of the first three screenshots provided by pre-designated SuperUMAns posted after the request timestamp in the [onetree-screencapture](https://discord.com/channels/909933079181799524/953369451573690428) channel of the SuperUMAn discord, but could be changed to use another data source in the future. The specific SuperUMAns taking the expiry screenshots will be @inalittlewhile#4712, @deadcoin#0901, @PVmilihache#8517, @Heruvim78#6876, and @PennyPanda#4443.
4. Round to 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down).

# Intended Application
This is intended to be used as a way to incentivize RTs. In its first iteration, this is for a charitable benefit. One could design it merely for marketing purposes, and even make the recipient be one of the RTers - Which while distributing the tokens to them would not be trustless, the value of the tokens themselves would be based on the number of RTs.

This calculation is intended to be used with a KPI option that has FPL bounds of 0 and 10,000, and a collateralPerPair of 1. As an example, 5000 retweets would result in a KPI option value of 0.5 USDC. 3,000 retweets would result in a KPI Option value of 0.3 USDC by the same equation. 

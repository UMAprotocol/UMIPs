*An UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename. The file name should follow this format - "umip_add_priceidentifiername.md". Please remove this and all italicized instructions before submitting your pr. All bolded fields should be filled in before submission.*

## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add **APT** as a supported price identifier |
| Authors             | **AthleteX DAO**                                                      |
| Status              | Draft                                                         |
| Created             | **9/28/2021**                                              |
| Discourse Link      | **https://discourse.umaproject.org/t/add-athlete-performance-token-apt-price-identifier/1327**            |

# Summary 

The DVM should support price requests for **APT**. **APT** reflects the **price of an Athlete Performance Tokens (APT)**.


# Motivation

Athlete Performance Tokens provide exposure to an athlete’s statistical performance.
This has a range of advantages, including player specific hedging, long term athlete
growth exposure, and less friction when adjusting positions (e.g. from Bitcoin and other
cryptocurrencies to LBJ).

APTs also unlock nascent markets in sports not currently available with traditional
sportsbooks. Some examples include, umpire tokens that track correct balls and strikes
percentage, and 1-game expiration tokens with high in-game volatility for live trading.

Athlete Performance Tokens are cryptocurrencies that track the statistical performance
of athletes. APTs are Long-Short Pairs collateralized by deposits in the Staking Contract.
Each athlete has a Long token reflecting positive performance and Short token
reflecting negative athlete performance. APTs can be bought and sold on the Trading
Block or redeemed for $AX at expiration. Redemption prices are an aggregate of
in-game performance statistics provided by SportsData.io.

# Data Specifications

*How should voters access the data necessary to calculate the value of this price identifier? What specific markets or data sources should be referenced?*

**1. go to this link: http://146.59.10.118:9000/
**2. run " select name, value, timestamp from nfl where name=‘T.Brady_4314’ ";**

What specific markets or data sources should be referenced?*
**T.Brady_4314**

*If proposing multiple price identifiers, please add markets or other data sources for each.*

-----------------------------------------
- Price identifier name: **sLBJ** 
- Base Currency: **AX** 
- Quote Currency: **sLBJ** 
- Markets & Pairs: **N/A** 
- Example data providers: **Sportsdata.io** 
- Cost to use: **Free Trial, Case-by-Case Pricing**
- Real-time data update frequency: **3 seconds** 
- Historical data update frequency: **2 minutes**

# Price Feed Implementation
To allow for the creation of bots that can programmatically calculate prices off-chain to liquidate and dispute transactions, you must create a price feed following the UMA Protocol format (outlined below). This price feed is also necessary to calculate developer mining rewards.

If using existing price feeds from the UMA protocol repo, please list the price feeds used and write a price feed configuration following the examples here.

## Ancillary Data Specifications

**1. go to this link: http://146.59.10.118:9000/**
**2. run " select name, value, timestamp from nfl where name=‘T.Brady_4314’ ";**

This command returns the APT, price, and timestamp

# Rationale

This method was chosen as a balance between efficiency and scale of athletic data. Capturing data in a Quest DB allows the system to consume several billion lines of data at once, which is necessary to accommodate several athletes across different sports. Other considerations included Chainlink integration to compute price calculations on-chain. This method was proved redundant as UMA’s DVM with appropriate ancillary data provides the necessary oracle solution.

# Implementation

See ancillary data above for price requests

To calculate prices from raw Sportsdata.io statistics; follow the Pricing Formula for each sport:
NFL

# Security Considerations

How could pricing data manipulation occur?
**Quest DB security breach, LSP contract bug**

How could this price ID be exploited?
**Sportsdata.io fault API response generating false or stale statistics**

Do the instructions for determining the price provide people with enough certainty?
**Yes, the Pricing Formulas are indisputable**

What are current or future concern possibilities with the way the price identifier is defined?
**Current considerations include further decentralization of Pricing Formulas to generate community support of pricing mechanisms. This is moreso an optimization than a security concern. Future concerns include exceeding Quest DB request limit which would create a gap in APT pricing if statistics are not timely received from Sportsdata.io. This concern is mitigated by creating a new QuestDB for each sport, or migrating to DB server with higher request limit.**

Are there any concerns around if the price identifier implementation is deterministic?
**No, the Price ID returns a polynomial computation of values generated from Sportsdata.io**

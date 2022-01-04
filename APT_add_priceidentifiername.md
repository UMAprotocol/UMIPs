## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add **APT** as a supported price identifier |
| Authors             | **AthleteX DAO**                                                      |
| Status              | Draft                                                         |
| Created             | **12/18/2021**                                              |
| Discourse Link      | **https://discourse.umaproject.org/t/add-athlete-performance-token-apt-price-identifier/1327**            |

# Summary 

The DVM should support price requests for **Athlete Performance Tokens (APT)**. **APT** reflects the **price of an Athlete Performance Token (APT)**.


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

-----------------------------------------
- Price identifier name: **First Price ID Name** 
- Base Currency: **BASE** - *ETH - May not apply if this is not a typical Base/Quote price*
- Quote Currency: **QUOTE** - *USD - May not apply if this is not a typical Base/Quote price*
- Markets & Pairs: **Markets & Pairs** - *Example: Binance ETH/USDT, Coinbase Pro ETH/USD. This might not apply to all price identifiers*
- Example data providers: **Provider to use** - *Cryptowatch, TraderMade, Quandl, the Graph*
- Cost to use: **Explanation or link to provider pricing plan**
- Real-time data update frequency: **Frequency** - *60 seconds*
- Historical data update frequency: **Frequency** - *5 minutes*

# Price Feed Implementation



## Ancillary Data Specifications

**The key-value fields are:**
_athlete Name, token id, and timestamp_

**For NFL athletes, the following statistics make up price:**
_passingYards, passingTouchdowns, reception, receiveYards, receiveTouch, rushingYards_


**Key-Value Descriptions:**

_passingYards_ - this is how many passing yards a player has since the start of the season
_passingTouchdowns_ - this is how many passing touchdowns a player has since the start of the season
_reception_ - this is how many receptions a player has since the start of the season
_receiveYards_ - this is how many receiving yards a player has since the start of the season
_receiveTouch_ - this is how many receiving touchdowns a player has since the start of the season
_rushingYards_ - this is how many rushing yards a player has since the start of the season
_snaps played_ - this is how many snaps a player has been on the field for over the course of a season
_price_ - this is computation of the key-values in this formula 

Ex.
At timestamp =2021-11-10T21:43:34.537465Z
with athlete = T.Brady
select , 2021-11-10 from nfl where name = 'T.Brady';
passingYards - 2650.0
passingTouchdowns - 25.0
reception - 0
receiveYards - 0
receiveTouch - 0
rushingYards - 39.0
snaps played - sp
price = [ (2650/25) + (425) + (39/10) ] / sp = 

# Rationale

This method was chosen as a balance between efficiency and scale of athletic data. Capturing data in a Quest DB allows the system to consume several billion lines of data at once, which is necessary to accommodate several athletes across different sports. Other considerations included Chainlink integration to compute price calculations on-chain. This method was proved redundant as UMA’s DVM with appropriate ancillary data provides the necessary oracle solution.

# Implementation

1. Generate values for each of the key-value fields by running the command to fetch player statistics for a given athlete & timestamp
:: select *, (input timestamp) from (input sport) where name = '(input athlete)
2. Combine key-values into price formula [https://docs.google.com/document/d/17mSmFaglf5EMm6vd6zmBigIRE_f3tMb2ngohIa0U_y0/edit] 

# Security Considerations

Some optional questions to consider: (*Please remove before submission*)
- How could pricing data manipulation occur?
**QuestDB is secured by a server with ssh key login. QuestDB can only be edited by admins of AthleteX who hold ssh credentials. Alternative to QuestDB is manual computation until Chainlink releases their Sports Data Oracles.**
- How could this price ID be exploited?
**Sportsdata.io fault API response generating false or stale statistics**

- Do the instructions for determining the price provide people with enough certainty?
**Yes, the Pricing Formulas are indisputable**

- What are current or future concern possibilities with the way the price identifier is defined?
**Current considerations include further decentralization of Pricing Formulas to generate community support of pricing mechanisms. This is moreso an optimization than a security concern. Future concerns include exceeding Quest DB request limit which would create a gap in APT pricing if statistics are not timely received from Sportsdata.io. This concern is mitigated by creating a new QuestDB for each sport, or migrating to DB server with higher request limit.**

- Are there any concerns around if the price identifier implementation is deterministic?
**No, the Price ID returns a polynomial computation of values generated from Sportsdata.io**

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
- Price identifier name: **APT** 
- Base Currency: **APT**
- Quote Currency: **N/A**
- Markets & Pairs: **AthleteX DEX: APT/AX, AthleteX DEX: APT/MATIC**
- Example data providers: **SportsData**
- Cost to use: **https://sportsdata.io/developers/faq#free-trial**

- Real-time data update frequency: **1min**
- Historical data update frequency: **1min**

# Price Feed Implementation

We are only starting with 5 APT EMP contracts so we likely do not need bots for price feed implementation

## Ancillary Data Specifications
customancillarydata:
athlete name:T.Brady,length:season,requester:0xabc

**The key-value fields are:**
_athlete Name - represents the name (First_Initial.Last_Name) of the player whose statistics are reflected by the APT's price

# Rationale

This method was chosen as a balance between efficiency and scale of athletic data. Capturing data in a Quest DB allows the system to consume several billion lines of data at once, which is necessary to accommodate several athletes across different sports. Other considerations included Chainlink integration to compute price calculations on-chain. This method was proved redundant as UMA’s DVM with appropriate ancillary data provides the necessary oracle solution.

# Implementation

Generate values for each of the key-value fields by doing the following:
1. Go to http://139.99.74.201:9000/
2. Run the command to fetch player statistics for a given athlete & timestamp: 
select * from nfl WHERE name = 'F.Last' AND TIMESTAMP = 'timestamp';
where F.Last = First_Initial.Last_Name
and timestamp = contract expiration timestamp in the following syntax: YYYY-MM-DD HH:MM:SS
example - select * from nfl WHERE name = 'T.Brady' AND TIMESTAMP = '2022-01-03 00:37:44.245391'; 

3. Combine key-values into price with the following formula:

rushing touchdown = 6pts
receiving touchdown = 6pts
passing touchdown = 6pts

reception = .5pts

10 receiving yards = 1pt
10 rushing yards = 1pt
25 passing yards = 1pt

interception = -2pts
fumble = -2pts

sum(pts) / offensive snaps played = price

Round price computations to 8 decimal places

# Security Considerations

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

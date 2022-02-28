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
- Markets & Pairs: **N/A**
- Example data providers: **SportsData**
- Cost to use: **https://sportsdata.io/developers/faq#free-trial**

- Real-time data update frequency: **1min**
- Historical data update frequency: **1min**

# Price Feed Implementation

Linear LSP contracts

Initially manual settlement is expected and UMIP could be updated to include price feed implementation once it is developed

## Ancillary Data Specifications
customancillarydata:
athlete name:T.Brady,sport:nfl, id:,length:season,timestamp:YYYY-MM-DD

_athlete Name - represents the name (First_Initial.Last_Name) of the player whose statistics are reflected by the APT's price
sport: the sport the athlete plays
id: 5-digit unique identifier given to athletes by SportsData and used to query our API
length: the length of the token contract until expiration (game, season, or career)
timestamp: returns last record of target day (YYYY-MM-DD)

# Rationale

This method was chosen as a balance between efficiency and scale of athletic data. Capturing data in a Quest DB allows the system to consume several billion lines of data at once, which is necessary to accommodate several athletes across different sports. Other considerations included Chainlink integration to compute price calculations on-chain. This method was proved redundant as UMA’s DVM with appropriate ancillary data provides the necessary oracle solution.

# Implementation

Generate values for each of the key-value fields by doing the following:

1. Collect the sport, id, and timestamp parameters from the ancillary data

2. http://139.99.74.201:8080/[sport]/players/[id]?at_day=[YYY-MM-DD]
Fill in the athlete details and go to the above URL
example - http://139.99.74.201:8080/nfl/players/22575?at_day=2022-02-26

Note the following key-variables:
"passingYards"
"passingTouchDowns"
"reception"
"receiveYards"
"receiveTouch"
"rushingYards"
"OffensiveSnapsPlayed"
"DefensiveSnapsPlayed"
"price"
"PassingInterceptions"
"FumblesLost"
"RushingTouchdowns"
"timestamp"

3. Combine key-values into price with the following formula:

  "RushingTouchdowns": each rushing touchdown = 6pts
  "receiveTouch": each receiving touchdown = 6pts
  "passingTouchDowns": each passing touchdown = 6pts

  "reception": reception = .5pts

  "receiveYards": every 10 receiving yards = 1pt
  "rushingYards": every 10 rushing yards = 1pt
  "passingYards": every 25 passing yards = 1pt

  "PassingInterceptions": each interception = -2pts
  "FumblesLost": each fumble = -2pts

  sum(pts) / offensive snaps played = "price"

  pts = the sum based on metrics indicated in the pricing formula

  Round price computations to 8 decimal places

# Security Considerations

- How could pricing data manipulation occur?
**The Database is secured by a server with ssh key login. The Database can only be edited by admins of AthleteX who hold ssh credentials. Data in the database is secured via API through https://www.postman.com/. Read more about Postman API security here: https://www.postman.com/trust/security/**
- How could this price ID be exploited?
**Sportsdata.io fault API response generating false or stale statistics**

- Do the instructions for determining the price provide people with enough certainty?
**Yes, the Pricing Formulas are indisputable**

- What are current or future concern possibilities with the way the price identifier is defined?
**Current considerations include further decentralization of Pricing Formulas to generate community support of pricing mechanisms. This is moreso an optimization than a security concern. Future concerns include exceeding Quest DB request limit which would create a gap in APT pricing if statistics are not timely received from Sportsdata.io. This concern is mitigated by creating a new QuestDB for each sport, or migrating to DB server with higher request limit.**

- Are there any concerns around if the price identifier implementation is deterministic?
**No, the Price ID returns a polynomial computation of values generated from Sportsdata.io**

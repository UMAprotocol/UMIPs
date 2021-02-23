 **Headers**
| UMIP [#]   |      |
|------------|------|
| UMIP Title | Add price identifiers for AAVEUSD, USDAAVE; LINKUSD, USDLINK; SNXUSD, USDSNX; UMAUSD, USDUMA; UNIUSD, USDUNI |
| Authors    | Josh Bowden (josh@ferrosync.io) |
| Status     | Draft |
| Created    | February 17th, 2021 |
| Discourse Link| <https://discourse.umaproject.org/t/add-price-identifiers-for-aave-link-snx-uma-uni-against-usd/247>
<br>

# Overview
This proposal is for adding the following price identifiers to be supported:

 * AAVEUSD, USDAAVE
 * LINKUSD, USDLINK
 * SNXUSD, USDSNX
 * UMAUSD, USDUMA
 * UNIUSD, USDUNI

# Motivation

The purpose of adding these price identifiers is to be able to mint synthetic tokens priced at the defi protocol's token valued against USD. By doing so, users who mint synthetic tokens and sell them to the market are able to short the protocol. Similarly, users who buy the synthetic token are able to long the protocol.

If the inverse price identifier is used (e.g. USD/UMA) and the same altcoin token is employed as collateral, then the value of the synthetic token can be traded in place of the underlying collateral without having to sell the underlying asset.

# AAVE (Aave Token)

## Summary
The DVM should support price requests for the AAVE/USD, USD/AAVE price index.

## Motivation
The DVM currently does not support the AAVE/USD or USD/AAVE index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and cross-exchange price discrepancies are typically negligible.

## Markets & Data Sources
Coinbase Pro, Binance, and OKEx should be used to construct the price. These 3 exchanges comprise a significant amount of AAVE trade volume and have available pricefeeds on Cryptowatch.

 1. Which specific pairs should be queried from each market?

    - Coinbase Pro: AAVE/USD
    - Binance: AAVE/USDT
    - OKEx: AAVE/USDT

 2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Coinbase Pro AAVE/USD: <https://api.cryptowat.ch/markets/coinbase-pro/aaveusd/price>
    - Binance AAVE/USDT: <https://api.cryptowat.ch/markets/binance/aaveusdt/price>
    - OKEx AAVE/USDT: <https://api.cryptowat.ch/markets/okex/aaveusdt/price>

 3. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 4. Provide recommended endpoints to query for historical prices from each market listed.

    - Coinbase Pro: <https://api.cryptowat.ch/markets/coinbase-pro/aaveusd/ohlc?after=1613450520&before=1613450520&periods=60>
    - Binance: <https://api.cryptowat.ch/markets/binance/aaveusdt/ohlc?after=1613450520&before=1613450520&periods=60>
    - OKEx: <https://api.cryptowat.ch/markets/okex/aaveusdt/ohlc?after=1613450520&before=1613450520&periods=60>

 5. Do these sources allow for querying up to 74 hours of historical data?

    - Yes

 6. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 7. Is an API key required to query these sources?

    - No

 8. Is there a cost associated with usage?

    - Yes

 9. If there is a free tier available, how many queries does it allow for?

    - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits). 
    - Therefore, querying all three exchanges can be performed 665 times per day.  
    - In other words, all three exchanges can be queried at most every 130 seconds.

 10. What would be the cost of sending 15,000 queries?

     - Approximately $5

### Price Feed Implementation

Associated AAVE price feeds are available via Cryptowatch. No other further feeds required.

### Technical Specifications

#### AAVE/USD:
  -  Price Identifier Name: `AAVEUSD`
  -  Base Currency: AAVE
  -  Quote Currency: USD
  -  Intended Collateral Currency: USDC
  -  Collateral Decimals: 6
  -  Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
  -  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
  -  Is your collateral currency already approved to be used by UMA financial contracts?: YES

#### USD/AAVE:

  -  Price Identifier Name: `USDAAVE`
  -  Base Currency: USD
  -  Quote Currency: AAVE
  -  Intended Collateral Currency: AAVE
  -  Collateral Decimals: 18
  -  Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
  -  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
  -  Is your collateral currency already approved to be used by UMA financial contracts?: In progress

### Implementation

Voters should query for the price of AAVE/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1.  When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2.  The median of these results should be taken
3.  The median from step 2 should be rounded to six decimals to determine the AAVEUSD price.
4.  The value of USDAAVE will follow the exact same process but undergo one additional step: it will be the result of dividing 1/AAVEUSD rounded to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down).  
For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

<br>

# LINK (Chainlink Token)

## Summary

The DVM should support price requests for the LINK/USD, USD/LINK price index.

## Motivation

The DVM currently does not support the LINK/USD or USD/LINK index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and cross-exchange price discrepancies are typically negligible.

## Markets & Data Sources

Coinbase Pro, Binance, and OKEx should be used to construct the price. These 3 exchanges comprise a significant amount of LINK trade volume and have available pricefeeds on Cryptowatch.

 1. Which specific pairs should be queried from each market?

    - Coinbase Pro: LINK/USD
    - Binance: LINK/USDT
    - OKEx: LINK/USDT

 2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Coinbase Pro LINK/USD: <https://api.cryptowat.ch/markets/coinbase-pro/linkusd/price>
    - Binance LINK/USDT: <https://api.cryptowat.ch/markets/binance/linkusdt/price>
    - OKEx LINK/USDT: <https://api.cryptowat.ch/markets/okex/linkusdt/price>

 3. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 4. Provide recommended endpoints to query for historical prices from each market listed.

    - Coinbase Pro: <https://api.cryptowat.ch/markets/coinbase-pro/linkusd/ohlc?after=1613450520&before=1613450520&periods=60>
    - Binance: <https://api.cryptowat.ch/markets/binance/linkusdt/ohlc?after=1613450520&before=1613450520&periods=60>
    - OKEx: <https://api.cryptowat.ch/markets/okex/linkusdt/ohlc?after=1613450520&before=1613450520&periods=60>

 5. Do these sources allow for querying up to 74 hours of historical data?

    - Yes

 6. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 7. Is an API key required to query these sources?

    - No

 8. Is there a cost associated with usage?

    - Yes

 9.  If there is a free tier available, how many queries does it allow for?

        - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits). 
        - Therefore, querying all three exchanges can be performed 665 times per day.  
        - In other words, all three exchanges can be queried at most every 130 seconds.

 10. What would be the cost of sending 15,000 queries?

      - Approximately $5

## Price Feed Implementation

Associated LINK price feeds are available via Cryptowatch. No other further feeds required.

### Technical Specifications

#### LINK/USD:
-  Price Identifier Name: `LINKUSD`
-  Base Currency: LINK
-  Quote Currency: USD
-  Intended Collateral Currency: USDC
-  Collateral Decimals: 6
-  Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: YES

#### USD/LINK

-  Price Identifier Name: `USDLINK`
-  Base Currency: USD
-  Quote Currency: LINK
-  Intended Collateral Currency: LINK
-  Collateral Decimals: 18
-  Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: In progress 

### Implementation

Voters should query for the price of LINK/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

 1.  When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
 2.  The median of these results should be taken
 3.  The median from step 2 should be rounded to six decimals to determine the LINKUSD price.
 4.  The value of USDLINK will follow the exact same process but undergo one additional step: it will be the result of dividing 1/LINKUSD and rounding to the nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down).  
 For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

<br>

# SNX (Synthetix Network Token)

## Summary
The DVM should support price requests for the SNX/USD, USD/SNX price index.

## Motivation
The DVM currently does not support the SNX/USD or USD/SNX index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and cross-exchange price discrepancies are typically negligible.

## Markets & Data Sources
Coinbase Pro, Binance, and OKEx should be used to construct the price. These 3 exchanges comprise a significant amount of SNX trade volume and have available pricefeeds on Cryptowatch.

  1. Which specific pairs should be queried from each market?

       - Coinbase Pro: SNX/USD
       - Binance: SNX/USDT
       - OKEx: SNX/USDT

 2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Coinbase Pro SNX/USD: <https://api.cryptowat.ch/markets/coinbase-pro/snxusd/price>
    - Binance SNX/USDT: <https://api.cryptowat.ch/markets/binance/snxusdt/price>
    - OKEx SNX/USDT: <https://api.cryptowat.ch/markets/okex/snxusdt/price> 

 3. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 4. Provide recommended endpoints to query for historical prices from each market listed.

    - Coinbase Pro: <https://api.cryptowat.ch/markets/coinbase-pro/snxusd/ohlc?after=1613450520&before=1613450520&periods=60>
    - Binance: <https://api.cryptowat.ch/markets/binance/snxusd/ohlc?after=1613450520&before=1613450520&periods=60>
    - OKEx: <https://api.cryptowat.ch/markets/okex/snxusd/ohlc?after=1613450520&before=1613450520&periods=60>

 5. Do these sources allow for querying up to 74 hours of historical data?

    - Yes

 6. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 7. Is an API key required to query these sources?

    - No

 8. Is there a cost associated with usage?

    - Yes

 9. If there is a free tier available, how many queries does it allow for?

    - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits). 
    - Therefore, querying all three exchanges can be performed 665 times per day.  
    - In other words, all three exchanges can be queried at most every 130 seconds.

  10. What would be the cost of sending 15,000 queries?

      - Approximately $5
 
## Price Feed Implementation

Associated SNX price feeds are available via Cryptowatch. No other further feeds required.

### Technical Specifications

#### SNX/USD

-  Price Identifier Name: `SNXUSD`
-  Base Currency: SNX
-  Quote Currency: USD
-  Intended Collateral Currency: USDC
-  Collateral Decimals: 6
-  Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: YES

#### USD/SNX

-  Price Identifier Name: `USDSNX`
-  Base Currency: USD
-  Quote Currency: SNX
-  Intended Collateral Currency: SNX
-  Collateral Decimals: 18
-  Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: In progress 

### Implementation

Voters should query for the price of SNX/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1.  When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2.  The median of these results should be taken
3.  The median from step 2 should be rounded to six decimals to determine the SNXUSD price.
4.  The value of USDSNX will follow the exact same process but undergo one additional step: it will be the result of dividing 1/SNXUSD and rounding to the nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down).  
For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

<br>

# UMA (UMA Governance Token)

## Summary

The DVM should support price requests for the UMA/USD, USD/UMA price index.

## Motivation

The DVM currently does not support the UMA/USD or USD/UMA index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and cross-exchange price discrepancies are typically negligible.


## Markets & Data Sources

Coinbase Pro, Binance, and OKEx should be used to construct the price. These 3 exchanges comprise a significant amount of UMA trade volume and have available pricefeeds on Cryptowatch.

 1. Which specific pairs should be queried from each market?

    - Coinbase Pro: UMA/USD
    - Binance: UMA/USDT
    - OKEx: UMA/USDT

 2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Coinbase Pro UMA/USD: <https://api.cryptowat.ch/markets/coinbase-pro/umausd/price>
    - Binance UMA/USDT: <https://api.cryptowat.ch/markets/binance/umausdt/price>
    - OKEx UMA/USDT: <https://api.cryptowat.ch/markets/okex/umausdt/price>

 3. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 4. Provide recommended endpoints to query for historical prices from each market listed.

    - Coinbase Pro: <https://api.cryptowat.ch/markets/coinbase-pro/umausd/ohlc?after=1613450520&before=1613450520&periods=60>
    - Binance: <https://api.cryptowat.ch/markets/binance/umausdt/ohlc?after=1613450520&before=1613450520&periods=60>
    - OKEx: <https://api.cryptowat.ch/markets/okex/umausdt/ohlc?after=1613450520&before=1613450520&periods=60>

 5. Do these sources allow for querying up to 74 hours of historical data?

    - Yes

 6. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 7. Is an API key required to query these sources?

    - No

 8. Is there a cost associated with usage?

    - Yes

 9. If there is a free tier available, how many queries does it allow for?

    - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits). 
    - Therefore, querying all three exchanges can be performed 665 times per day.
    - In other words, all three exchanges can be queried at most every 130 seconds.

  10. What would be the cost of sending 15,000 queries?

        - Approximately $5


## Price Feed Implementation

Associated UMA price feeds are available via Cryptowatch. No other further feeds required.


### Technical Specifications

#### UMA/USD

-  Price Identifier Name: `UMAUSD`
-  Base Currency: UMA
-  Quote Currency: USD
-  Intended Collateral Currency: USDC
-  Collateral Decimals: 6
-  Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: YES

#### USD/UMA

-  Price Identifier Name: `USDUMA`
-  Base Currency: USD
-  Quote Currency: UMA
-  Intended Collateral Currency: UMA
-  Collateral Decimals: 18
-  Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: In progress 

### Implementation

Voters should query for the price of UMA/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1.  When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2.  The median of these results should be taken
3.  The median from step 2 should be rounded to six decimals to determine the UMAUSD price.
4.  The value of USDUMA will follow the exact same process but undergo one additional step: it will be the result of dividing 1/UMAUSD and rounding to the nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down).  
For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

<br>

# UNI (Uniswap Token)
## Summary
The DVM should support price requests for the UNI/USD, USD/UNI price index.

## Motivation
The DVM currently does not support the UNI/USD or USD/UNI index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and cross-exchange price discrepancies are typically negligible.

## Markets & Data Sources

Coinbase Pro, Binance, and OKEx should be used to construct the price. These 3 exchanges comprise a significant amount of UNI trade volume and have available pricefeeds on Cryptowatch.

 1. Which specific pairs should be queried from each market?

     - Coinbase Pro: UNI/USD
     - Binance: UNI/USDT
     - OKEx: UNI/USDT

 2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Coinbase Pro UNI/USD: <https://api.cryptowat.ch/markets/coinbase-pro/uniusd/price>
    - Binance UNI/USDT: <https://api.cryptowat.ch/markets/binance/uniusdt/price>
    - OKEx UNI/USDT: <https://api.cryptowat.ch/markets/okex/uniusdt/price>

 3. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 4. Provide recommended endpoints to query for historical prices from each market listed.

    - Coinbase Pro: <https://api.cryptowat.ch/markets/coinbase-pro/uniusd/ohlc?after=1613450520&before=1613450520&periods=60>
    - Binance: <https://api.cryptowat.ch/markets/binance/uniusdt/ohlc?after=1613450520&before=1613450520&periods=60>
    - OKEx: <https://api.cryptowat.ch/markets/okex/uniusdt/ohlc?after=1613450520&before=1613450520&periods=60>

 5. Do these sources allow for querying up to 74 hours of historical data?

    - Yes

 6. How often is the provided price updated?

    - The lower bound on the price update frequency is a minute.

 7. Is an API key required to query these sources?

    - No

 8. Is there a cost associated with usage?

    - Yes

 9.  If there is a free tier available, how many queries does it allow for?

        - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits). 
        - Therefore, querying all three exchanges can be performed 665 times per day.  
        - In other words, all three exchanges can be queried at most every 130 seconds.

 10. What would be the cost of sending 15,000 queries?

     - Approximately $5

## Price Feed Implementation

Associated UNI price feeds are available via Cryptowatch. No other further feeds required.

### Technical Specifications

#### UNI/USD

-  Price Identifier Name: `UNIUSD`
-  Base Currency: UNI
-  Quote Currency: USD
-  Intended Collateral Currency: USDC
-  Collateral Decimals: 6
-  Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: YES

#### USD/UNI

-  Price Identifier Name: `USDUNI`
-  Base Currency: USD
-  Quote Currency: UNI
-  Intended Collateral Currency: UNI
-  Collateral Decimals: 18
-  Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
-  Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
-  Is your collateral currency already approved to be used by UMA financial contracts?: In progress

### Implementation

Voters should query for the price of UNI/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1.  When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2.  The median of these results should be taken
3.  The median from step 2 should be rounded to six decimals to determine the UNIUSD price.
4.  The value of USDUNI will follow the exact same process but undergo one additional step: it will be the result of dividing 1/UNIUSD and rounding to the nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down).  
For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

<br>

# Security Considerations
Adding these new identifiers by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing these identifiers should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for these identifiers and also contemplate de-registering these identifiers if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness is necessary to prevent market manipulation.

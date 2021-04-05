## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | 1 Price Identifier                                                                                                |
| Authors    | Ross - Ross@yam.finance
| Status     | Draft                                                                                                                                   |
| Created    | March 31st 2021
| Link to Discourse   | https://discourse.umaproject.org/t/add-a-1-price-identifier-to-the-dmv/600                                                                             |

<br>

# SUMMARY 

The DMV should support price requests for assets that are priced against themselves and always return a value of 1.


# MOTIVATION

1. What are the financial positions enabled by creating this synthetic that do not already exist?

    - This price identifier allows for the creation of synthetic assets that are created and trade against their underlying based on the amount of time left until expiry, the opportunity cost for owning them. While these assets expire to the value of the underlying, the prices at which they are traded can be set specifically upon creation of the contract to allow a yield to be generated on the synth that is paid for by liquidity providers. These synths are unliquidatable.

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

   - At expiry the price id returns 1 and each synth would be worth 1 unit of the collateral.

3. Consider adding market data  (e.g., if we add a “Dai alternative,” the author could show the market size of Dai)

<br> 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - There should be no market required to return the price as each synth is always worth 1 unit of collateral. 

2.  Which specific pairs should be queried from each market?

    - None

2. Provide recommended endpoints to query for real-time prices from each market listed. 

    - None
    
4. How often is the provided price updated?

    - The price is always up to date.

5. Provide recommended endpoints to query for historical prices from each market listed. 

    - None.

6.  Do these sources allow for querying up to 74 hours of historical data? 

    - N/A

7.  How often is the provided price updated?

    - N/A

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No

10. If there is a free tier available, how many queries does it allow for?

    - N/A

11.  What would be the cost of sending 15,000 queries?

     - N/A

<br>

# PRICE FEED IMPLEMENTATION

There is no Price Feed Implementation as this price is always return "1" The price of one is found by dividing the price of the collateral currency at expiry by the price of the collateral currency.

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - 1

**2. Base Currency** - N/A - This is the price of the collateral

**3. Quote currency** - N/A - This is the price of the collateral

**4. Intended Collateral Currency** - Any Approved Collateral Currency

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - View [here](https://docs.umaproject.org/uma-tokenholders/approved-collateral-currencies) to see a list of approved collateral currencies. 

    - By Definition it must be.

**5. Collateral Decimals** - To Match Collateral Currency

- Price identifiers need to be automatically scaled to reflect the units of collateral that a price represents. Because of this, the amount of decimals that a price is scaled to needs to match the used collateral currency. 


**6. Rounding** - 1 decimal place is sufficient


<br>

# RATIONALE

- This price identifier is intended to be used in situations where the financial product library is not needed but the price will always return a value of 1 collateral unit.

- This price identifier allows for non-liquidatable synths where the expiring nature of the EMP is used to create finance instruments that are bound by outside factors. It also allows for rudimentary hedging of volatile assets as the synthetic asset can be sold to create a close to neutal market position.

- There is no potential for the price to be manipulated

- No TWAP is needed

<br>

# IMPLEMENTATION

This price feed always returns one and the collateral is able to be redeemed 1:1 for any outstanding synths.

1. **What prices should be queried for and from which markets?**

    - None

2. **Pricing interval**

    - None

3. **Input processing**

    - None

4. **Result processing** 

    - None

<br>

# Security considerations

- There should be no security risk to the DMV posed by this UMIP.

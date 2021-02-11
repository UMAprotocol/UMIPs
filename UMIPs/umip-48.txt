# Headers
| UMIP-48     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH_JUN21 as a supported price identifier                                                                                             |
| Authors    | nonstopTheo (nonstoptheo@yam.finance)
| Status     | Draft                                                                                                                                   |
| Created    | February 10th, 2021                                                                                                                              |
| Link to Discourse| https://discourse.umaproject.org/t/umip-48-add-gaseth-jun21-as-a-supported-price-identifier/217

## SUMMARY
This UMIP will reference a synthetic token to be created with this price identifier. This token will be referred to as 'uGAS' and will represent the token that tracks this identifier with the most ETH volume on Uniswap unless a different contract is determined by voters to be more legitimate.

The DVM should support requests for a price that resolves to either the median monthly Ethereum gas price or a 2-hour Time-Weighted Average Price (TWAP) on the highest volume Uniswap ETH/uGAS pool. The price resolution method to use will depend on the the timestamp the price request was made at.

## MOTIVATION
The motivation for these price identifiers is explained in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

1. What are the financial positions enabled by creating this synthetic that do not already exist?

    uGAS started with monthly contracts. This synth will be a longer-dated uGAS token for 3 months, to focus liquidity on one token.

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

    Alice wants to buy a longer-dated gas future to speculate on rising median gas prices.

3. Consider adding market data  

    uGAS-FEB21 has liquidity of ~$600,000 in the Uniswap pool.


# MARKETS & DATA SOURCES

Please refer to [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

2.  Which specific pairs should be queried from each market?

3. Provide recommended endpoints to query for real-time prices from each market listed. 
 
4. How often is the provided price updated?

5. Provide recommended endpoints to query for historical prices from each market listed. 

6.  Do these sources allow for querying up to 74 hours of historical data? 

7.  How often is the provided price updated?

8. Is an API key required to query these sources? 

9. Is there a cost associated with usage? 

10. If there is a free tier available, how many queries does it allow for?

11.  What would be the cost of sending 15,000 queries?

<br>

# PRICE FEED IMPLEMENTATION

Technical specifications are the same as in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) except: 
- Identifier name: GASETH_JUN21

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** 

**2. Base Currency** 

**3. Quote currency** 

**4. Intended Collateral Currency** 

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

**5. Collateral Decimals** 

**6. Rounding** 

- **Note** - this should always be less than or equal to the `Intended Collateral Currency` field.

<br>

# RATIONALE
Please reference the Rationale section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) for a full walkthrough of the rationale behind calculating aggregatory gas prices.

- Why this implementation of the identifier as opposed to other implementation designs?

- What is the reasoning for min + max bounds on the px identifier?

- What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)

- What is the potential for the price to be manipulated on the chosen exchanges?

- Should the prices have any processing (e.g., TWAP)? 

<br>

# IMPLEMENTATION
Technical specifications are the same as in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) except: 
- Identifier name: GASETH_JUN21

1. **What prices should be queried for and from which markets?**

2. **Pricing interval**

3. **Input processing**

4. **Result processing** 

<br>

# Security considerations

Please reference the security considerations section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md)

**Example questions**

1. Where could manipulation occur?

2. How could this price ID be exploited?

3. Do the instructions for determining the price provide people with enough certainty?

4. What are current or future concern possibilities with the way the price identifier is defined?

5. Are there any concerns around if the price identifier implementation is deterministic?

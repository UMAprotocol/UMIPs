# Headers
| UMIP-79     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | V2migration_KPI_Aragon                                                                                         |
| Authors    | Joel and Sam (sam@aragon.one) |
| Status     | Draft                                                                                                                                    |
| Created    | April 14, 2021                                                                                                                           |

Note that an UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md. The title should be 44 characters or less.

# **SUMMARY**

The purpose of this UMIP is to add support for the KPI option price feed for the Aragon KPI option airdrop. The purpose of this UMIP is to support the KPI option price feed for the eventual payout of the options to the recipients of the airdrop.

# **MOTIVATION**

Nearly all DAOs created with Aragon are currently on Aragon v1. With the launch of Aragon v2, we would like to incentivise Aragon DAOs to transition from Aragon v1 to Aragon v2. To incentivise this upgrade, we’re proposing to use KPI options as a mechanism to accelerate the transition to Aragon v2.

The options would be distributed to all Aragon v1 DAOs immediately after the option creation. At the option expiry, Aragon v1 DAOs would then be able to redeem their options for the ANT collateral in the KPI option contract. The amount of collateral they can redeem will be dependent upon:

- The DAO’s proportional share of AUM (USD denominated) relative to all Aragon V2 DAOs at 30th June 2021.
- How quickly the DAO upgrades to Aragon v2 DAO relative to other v2 DAOs

# **MARKETS & DATA SOURCES**

No definition of markets & data sources required because this is a UMA KPI option with the ANT token.

# **PRICE FEED IMPLEMENTATION**

As there is no requirement for ongoing monitoring through liquidation or dispute bots, a price feed is not required. The only requirement is a query of the UMA TVL statistic at the timestamp 00.00(UTC) on 30th June according to the data and markets as defined above.

# **TECHNICAL SPECIFICATIONS**

**1. Price Identifier Name** - V2migration_KPI_Aragon

**2. Base Currency** - V2migration_Aragon

**3. Quote currency** - NA

- There is no quote currency, the denominator is fixed
- This price identifier does not have a quote currency as it is designed not to be tied to a currency price metric

**4. Intended Collateral Currency** - ANT

- Does the value of this collateral currency match the standalone value of the listed quote currency?
    - ANT
- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.
    - Yes

**5. Collateral Decimals** - 18 decimels

**6. Rounding** - 2 decimal places

# **RATIONALE**

This synthetic is designed as an incentivisation mechanism to push the Aragon DAO's to V2. Since this is percentage and based there will be a natural floor and ceiling for the adoption. 

This contract will only be called once at expiry, there will be no need to run bots, thus this price feed is only applicable at the expiry timestamp.  

# **IMPLEMENTATION**

- The value of an option can get determined simply by the subgraph Aragon will provide at: [https://thegraph.com/explorer/subgraph/aragon/aragon-migration](https://thegraph.com/explorer/subgraph/aragon/aragon-migration)
- The total value locked is the value within the EMP contract of UMA.
1. **What prices should be queried for and from which markets?**
    - **Note** - This should match the markets and pairs listed in the `Markets and Data Sources` section.
    - The current price of the option is based on all funds migrated from V1 DAOs to V2 DAOs and can get requested from our subgraph at: [https://thegraph.com/explorer/subgraph/aragon/aragon-migration](https://thegraph.com/explorer/subgraph/aragon/aragon-migration)
2. **Pricing interval**
    - The pricing interval can be done each day at 00:00.
3. **Input processing**
    - To get the latest price of the KPI options is a simple GraphQL query required. Closer details can be seen on the referenced TheGraph Explorer URL.
4. **Result processing**
    - The result doesn't need any further processing because our subgraph will directly provide the correctly calculated value of each option.

# **Security considerations**

**Example questions**

1. Where could manipulation occur?
    - There is little possibly of the DAO's manipulate the system since the metric is specifically for the migration from V1 to V2. Meaning the current state of the Aragon DAO system is finite
2. How could this price ID be exploited?
    - Little chance of an exploitation on the priceID
3. Do the instructions for determining the price provide people with enough certainty?
    - YES
4. What are current or future concern possibilities with the way the price identifier is defined?
    - This price ID is only useable in this specific once-off event. It's reusability is limited at best
5. Are there any concerns around if the price identifier implementation is deterministic?
    - No
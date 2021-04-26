# Headers
| UMIP-79     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add V2migration_KPI_Aragon as a Price Identifier                                                                                      |
| Authors    | Joel and Sam (sam@aragon.one) |
| Status     | Draft                                                                                                                                    |
| Created    | April 14, 2021                                                                                                                           |
| Forum      | https://forum.aragon.org/t/kpi-options-using-uma-protocol/2633                                                                           |

Note that an UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md. The title should be 44 characters or less.

# **SUMMARY**

The purpose of this UMIP is to add support for the KPI option price feed for the Aragon KPI option airdrop. The purpose of this UMIP is to support the KPI option price feed for the eventual payout of the options to the recipients of the airdrop.

# **MOTIVATION**

Nearly all DAOs created with Aragon are currently on Aragon v1. With the launch of Aragon v2, we would like to incentivise Aragon DAOs to transition from Aragon v1 to Aragon v2. To incentivise this upgrade, we’re proposing to use KPI options as a mechanism to accelerate the transition to Aragon v2.

The options will be distributed to all Aragon v1 DAOs that go through the migration (the amount of options will be proportional to their assets). At the option expiry, DAOs that hold the option will be able to claim/exchange them for the ANT reward. The price for each option will be dependant on the total AUM on v2 DAOs (meaning that if more DAOs migrate, the more the options will be worth it), respecting a top threshold of 0,1 ANT per option. 

# **MARKETS & DATA SOURCES**

No definition of markets & data sources required because this is a Aragon KPI option with the ANT token.

# **PRICE FEED IMPLEMENTATION**

As there is no requirement for ongoing monitoring through liquidation or dispute bots, a price feed is not required. The only requirement is a query of the Aragon AUM statistic at the timestamp 00.00(UTC) on 30th June according to the data and markets as defined above.

# **TECHNICAL SPECIFICATIONS**

**1. Price Identifier Name** - V2migration_KPI_Aragon

**2. Base Currency** - V2migration_Aragon

**3. Quote currency** - NA

- There is no quote currency, the denominator is fixed to the ANT token.
- This price identifier does not have a quote currency as it is designed not to be tied to a currency price metric.

**4. Intended Collateral Currency** - ANT

- Does the value of this collateral currency match the standalone value of the listed quote currency?
    - ANT
- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.
    - Yes

**5. Collateral Decimals** - 18 decimels

**6. Rounding** - 2 decimal places

# **RATIONALE**

This synthetic is designed as an incentivisation mechanism to push the Aragon DAO's to V2. Since it is an incentivisation program Aragon defined a top threshold that we aim to achieve of migrated assets (100MM USD in converted value of all tokens), and this threshold correspondents to maximium payout of the options for the available reward

This contract will only be called once at expiry, there will be no need to run bots, thus this price feed is only applicable at the expiry timestamp.  

# **IMPLEMENTATION**

- The value of an option can get determined simply requesting it at the following end-point provided by the Aragon Association: [datafeed.aragon.org](https://datafeed.aragon.org)
- The total value locked is the Aragon AUM within the EMP contract of UMA.

To request our data end-point for the Aragon KPI options value can you send a simple GET request to ``datafeed.aragon.org``.
This request will return you the following response body:
```
{
    value: <Value of a option in ANT>
    timestamp: <Timestamp to know the exact time of the calculation in our backend>
} 
```

1. **What prices should be queried for and from which markets?**
    - The value of an option is calculated based on all funds migrated from V1 DAOs to V2 DAOs and can get requested from our end-point at: [datafeed.aragon.org](https://datafeed.aragon.org)
    - The value of those founds are calculated based on the prices provided by [https://www.coingecko.com/](https://www.coingecko.com/) 
2. **Pricing interval**
    - The pricing interval can be done each day at 00:00.
3. **Input processing**
    - To get the latest price of the KPI options is a simple GET request required to [datafeed.aragon.org](https://datafeed.aragon.org).
4. **Result processing**
    - The result doesn't need any further processing because our end-point will directly provide the correctly calculated value of an option.
    - The following calculation is done: Option price (in ANT) = 100k*(total migrated asset/100MM) / 1MM 

For the migration of funds of a V1 DAO to a V2 DAO does the user create a proposal to vote about the migration. If the proposal for the migration got accepted will it: 
1. Call GovernBaseFactory and create a Govern + Queue pair registered by a name in the GovernRegistry.
3. Optionally register the DAO governance token in the L2 voting system (Aragon Voice).
4. Transfer the funds from the V1 Vault contract to the V2 Govern contract.

Involved contracts:
- V2:
    - GovernBaseFactory (``0xc03710063b0e4435f997A0B1bbdf2680A2f07E13``): https://github.com/aragon/govern/blob/develop/packages/govern-create/contracts/GovernBaseFactory.sol
    - GovernRegistry (``0x7714e0a2A2DA090C2bbba9199A54B903bB83A73d``): https://github.com/aragon/govern/blob/develop/packages/govern-core/contracts/GovernRegistry.sol 
    - Govern: https://github.com/aragon/govern/blob/develop/packages/govern-core/contracts/Govern.sol 
    - Queue: https://github.com/aragon/govern/blob/develop/packages/govern-core/contracts/pipelines/GovernQueue.sol 
- V1:
    - Vault (``0xfcc089230e47d9376fcbd7177164c095ce8e9f23``): https://github.com/aragon/aragon-apps/blob/master/apps/vault/contracts/Vault.sol
    - Voting (``0xfcc089230e47d9376fcbd7177164c095ce8e9f23``): https://github.com/aragon/aragon-apps/blob/master/apps/voting/contracts/Voting.sol 

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
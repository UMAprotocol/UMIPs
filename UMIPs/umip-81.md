# Headers
| UMIP-81     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add V2migration_KPI_Aragon as a Price Identifier                                                                                      |
| Authors    | Ramon (ramon@aragon.org), Sam (sam@aragon.one) |
| Status     | Approved                                                                                                                                   |
| Created    | April 14, 2021                                                                                                                           |
| Forum      | https://forum.aragon.org/t/kpi-options-using-uma-protocol/2633                                                                           |

# **SUMMARY**

The purpose of this UMIP is to add support for the KPI option price feed for the Aragon KPI option airdrop. The purpose of this UMIP is to support the KPI option price feed for the eventual payout of the options to the recipients of the airdrop.

# **MOTIVATION**

Nearly all DAOs created with Aragon are currently on Aragon v1. With the launch of Aragon v2, we would like to incentivise Aragon DAOs to transition from Aragon v1 to Aragon v2. To incentivise this upgrade, we’re proposing to use KPI options as a mechanism to accelerate the transition to Aragon v2.

The options will be distributed to Aragon v1 DAOs that go through the migration. At the option expiry, DAOs that hold the option will be able to claim/exchange them for the ANT reward.

**IMPORTANT**: Only DAOs created before the publish of the reward program are elligible to receive the options. The publish happened on Mar 30, 2021, 0:00 PM UTC, through this Snapshot proposal - https://snapshot.org/#/aragon/proposal/QmXDBG7ZdCfg4fSRDhSwNSsdXggjsLapP9q3ijArysS56C

# **MARKETS & DATA SOURCES**

Aragon govern contracts will be used to measure qualifying criteria.

Added to that, a script to be able to value the options at any point in time is listed below. This script is usable for for expiry purposes as well. 

# **TECHNICAL SPECIFICATIONS**

**1. Price Identifier Name** - V2migration_KPI_Aragon

**2. Base Currency** - V2migration_KPI_Aragon

**3. Quote currency** - NA

- There is no quote currency, the denominator is fixed to the ANT token.
- This price identifier does not have a quote currency as it is designed not to be tied to a currency price metric.

**4. Intended Collateral Currency** - ANT

- Does the value of this collateral currency match the standalone value of the listed quote currency?
    - ANT
- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.
    - Yes

**5. Collateral Decimals** - 18 decimels

**6. Rounding** - 2 decimal places

# **RATIONALE**

This synthetic is designed as an incentivisation mechanism to push the Aragon DAO's to V2.

This contract will only be called once at expiry, there will be no need to run bots, thus this price feed is only applicable at the expiry timestamp.

More information about the program can be found on these two proposals on snapshot: [Proposal 1 - The reward program and ANT collateral](https://snapshot.org/#/aragon/proposal/QmXDBG7ZdCfg4fSRDhSwNSsdXggjsLapP9q3ijArysS56C) and [Proposal 2 - Upper AUM threshold for the program](https://snapshot.org/#/aragon/proposal/QmXq7KzLPQUeqxQ9cceoHwFR3oxoq7oTHHeNLfhrXNehJ9)

# **IMPLEMENTATION**

The value of an option is determined by performing a GET request at the following endpoint provided by the Aragon Association: [datafeed.aragon.org](https://datafeed.aragon.org)

To request our data end-point for the Aragon KPI options value can you send a `GET /organizations` request to ``datafeed.aragon.org``.
This request will return you the following response body:
```
{
    "count": <Number of DAOs migrated>,
    "total": <Total USD value of migrated assets>,
    "option": <Expected value of a option in ANT>,
    "last": <Timestamp of the last DAO migration>
} 
```
The range of `option` will be between 0 and 0.1
The `total`is the total value of assets migrated from V1 to V2. The option has a migration cap of $100 million so this number can go higher.
The `last` indicated the timestamp when the last DAO was moved over

1. **Pricing interval**
    - The pricing interval are updated each day at 00:00.

2. **Input processing**
    - To get the latest price of the KPI options perform a `GET /organizations` request to [datafeed.aragon.org](https://datafeed.aragon.org).
                                                                                                                                                                                                 
3. **Range bounds**
- 100 000 ANT tokens will be used to mint 1 000 000 Option tokens
- The KPI target will be between $0 and $100 000 000 migrated assets
- The payout function will be a linear scale between 0 and 100 000 000 meaning each option will payout 0 to 0.1. 

4. **Migration mechanics**
- The migration of funds of a V1 DAO to a V2 DAO will be done in the following way:
1. User create a proposal on v1 DAO to vote about the migration. If the proposal for the migration is accepted it will: 
2. Call GovernBaseFactory and create a Govern + Queue pair registered by a name in the GovernRegistry.
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

7. **Calculation rules**

The calculation is done by Aragon backend (code available here [https://github.com/aragon/v2-datafeed](https://github.com/aragon/v2-datafeed))

- v1 DAO creates a target v1 DAO
- v1 DAO submits a voting proposal to migrate to the previously created v2 DAO
- When the migration is approved and executed, v1 DAO's assets are transferred to the v2 DAO
- Information about migrated assets are stored in a subgraph that will be tracking these migrations
- A background service will be scrapping the subgraph to compute the price of the migrated value in USD using the Coingecko API
- These prices are stored in our service and can be accessed through a REST API
- Total migrated value is updated every time a new v2 DAO is detected by the service
- DAO is entitled to receive - ((DAO migrated assets) USD/100M USD) * 1M options
- Option price (in ANT) is calculated with formula - ((Total migrated assets) USD/100M USD) * (100k ANT / 1M options)
- If upper threshold is reached, option price is then fixed at 0.1 ANT

# **Security considerations**

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

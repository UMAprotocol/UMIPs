## Headers

| UMIP-38    |                                                                                    |
| ---------- | ---------------------------------------------------------------------------------- |
| UMIP Title | Add DAIPHP as a price identifier                                                   |
| Authors    | Chris Verceles (chris.verceles@halodao.com), James Orola (james.orola@halodao.com) |
| Status     | Approved                                                                           |
| Created    | Feb 3, 2021                                                                        |

## Summary (2-5 sentences)

The DVM should support price requests for the DAI/PHP price index.

## Motivation

The DVM currently does not support the DAI/PHP price index.

Supporting the DAIPHP price identifier would enable the creation of a Philippine Peso stablecoin, backed by DAI. Token minters could go short on the DAI/PHP index, while token holders could go long or use synthetic PHP for functional purposes.

Some practical uses for synthetic PHP are;

- in trading pairs on Philippine cryptocurrency exchanges
- basis for on chain, on demand liquidity in cross border remittance (our team is starting with the Singapore - Philippine corridor with ZKSync, Argent and various on/off ramps)

There is little to no cost associated with adding this price identifier, as CoinGecko and CoinMarketCap provide free (or free tier) API access to existing DAI:PHP quotes.

## Technical Specification

The definition of this identifier should be:

- Identifier name: DAIPHP
- Base Currency: DAI
- Quote Currency: PHP
- Data Sources: CoinGecko, CoinMarketCap
- Result Processing: Mean between the DAI:PHP feeds of CG and CMC defined in the implementation section.
- Input Processing: Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 300 seconds
- Dispute timestamp rounding: down

## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

DAIPHP uses CoinGecko (CG) and CoinMarketCap (CMC) for price information. These initial price sources were chosen as CG and CMC provide a readily available methodology for consolidating and validating price data for a particular crypto asset and fiat quote across exchanges worldwide (see https://www.coingecko.com/en/methodology and https://coinmarketcap.com/api/faq/ ). Our initial approach was to source and consolidate component price feeds of DAI:USD and USD:PHP, but it seems CG already does this with their [OpenExchangeRates](https://openexchangerates.org/) integration. In future implementations, the [HaloDAO](https://halodao.com/) team (or any other team making use of this price feed implementation) will add more price feed sources as the DAI - PHP market builds volume, especially in partnership with PH exchanges that don't yet offer a publicly available DAI:PHP endpoint.

Additionally, both CG and CMC sources offer free and publicly accessible historical DAI:PHP endpoints.

## Implementation

The value of this identifier for a given timestamp should be determined by querying for the price of DAI:PHP from CoinMarketCap and CoinGecko for that timestamp, taking the median, and determining whether that median differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.

Below are reference implementation for an offchain price feed based on the ConMarketCap and CoinGecko API. These feeds should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.


| Price Feed Source    | Implementation      |
| -------------------- | ------------------- |
| CoinMarketCap        | https://github.com/UMAprotocol/protocol/blob/f079a8e03fb6acdc6daebfb07e346317ed73ae05/packages/financial-templates-lib/src/price-feed/CoinMarketCapPriceFeed.js |
| CoinGecko            | https://github.com/UMAprotocol/protocol/blob/f079a8e03fb6acdc6daebfb07e346317ed73ae05/packages/financial-templates-lib/src/price-feed/CoinGeckoPriceFeed.js |

## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

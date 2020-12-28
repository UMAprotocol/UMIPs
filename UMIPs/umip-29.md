## Headers
| UMIP-29     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USDCCNY as price identifiers              |
| Authors    | Shankai Ji, jishankai@quarkchain.org |
| Status     | Draft                                                                                                                                  |
| Created    | December 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the USDC/CNY price index. 


## Motivation
The DVM currently does not support the USDC/CNY index.

Supporting the USDCCNY price identifier would enable the creation of a Chinese Yuan FX derivative, backed by USDC. Token minters could go short on the USDC/CNY index, while token holders could go long or use synthetic fxCNY for functional purposes.

## Technical Specification
The definition of these identifiers should be:

-----------------------------------------
- Identifier names: **USDCCNY**
- Base Currency: USDC
- Quote Currency: CNY
- Result Processing: Average
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Sources: Coinbase, Coingecko.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus. Live data will be cached from Coinbase and CoinGecko on the 1 minute interval in order to backlog 30 days of historical data to allow for the successful deployment of liquidation and dispute bots.
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

Coinbase is a top exchange of the world. It is used by most of the price identifieres of UMA. Luckily, we can get USDC/CNY price by its api and it will be easy to add this price identifier.

Coingecko is not an exchange but provides free apis to check crypto prices and widely used. We can get USDC/CNY by its api easily.

We tried exchanges such as Binance, Gate and KuCoin. All of their apis don't support USDCNY.

We also tried CoinMarketCap which standard plan above support historical search. It's not a good choice because it needs be paid.

We researched TraderMade which is used by PR#102. It supports 1000 requests every day for basic free plan so it doesn't satisfy our requests.

People can exchange USDC to USD 1:1 at Coinbase. So Coinbase can get USDC/CNY price by combining USDC/USD and USD/CNY price which is from Tier One or Two Banks or other Data Providers. There is no documents about who is their Data Providers.

Both Coinbase and Coingecko's historical data are daily data which are impractical for liquidators or disputers. To fix this issue, we refer to UMIP-21 and construct a separate caching service is necessary to track and record the historical data from polling the Coinbase and CoinGecko live API to be able to compute shitorical USDCNY price at a given point in time.


## Implementation

The value of USDCCNY for a given timestamp should be determined by querying for the price from Coinbase and Coingecko for that timestamp, taking the average, and determining whether that average differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the average is accurate enough.

### Coinbase Live API

The Coinbase live USDC price API is available at the following URL:

```
https://api.coinbase.com/v2/exchange-rates?currency=USDC
```

The response data uses the following JSON format:
```
{
  "data": {
    "currency": "USDC",
    "rates": {
      ...
      "CNH": "6.537747",
      "CNY": "6.5507",
      "COMP": "0.006490977541217707",
      "COP": "3433.494963",
      ...
    }
  }
}

```
You can get CNY price in rates.

### Coingecko Live API

The Coingecko live USDC price API is available at the following URL:

```
https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=cny
```

The response data uses the following JSON format:
```
{
    "usd-coin":{
        "cny": 6.56 
    }
}

```

### Historical Data API
Dispute bots and voters will need to query the cached historical data, dating back 30 days. Coinbase and CoinGecko provide live data in 1-3 minutes intervals, hence a custom solution was needed to ensure accurate historical data for a sufficient enough time frame.

A reference implementation for a historical data caching solution is open-source and any stakeholder to host their own copy as well as provide a reference for any stakeholder who wishes to implement their own.

The repository is able at: https://github.com/jishankai/usdccny-api

The historical data custom solution is available at the following URL:

```
https://blockchaininsight.net/api/usdccny/{timestamp(seconds)}
```

The response data:
```
{
    "price": "6.543400"
}
```

If you leave the timestamp to blank, you can get the latest average price of USDC/CNY prices from Coinbase and Coingecko.

## Security Considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

## Headers
| UMIP-29     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add CNYUSD, USDCNY as price identifiers              |
| Authors    | Shankai Ji, jishankai@quarkchain.org |
| Status     | Draft                                                                                                                                  |
| Created    | December 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the CNY/USD and USD/CNY price indexes. 


## Motivation
The DVM currently does not support the CNY/USD or USD/CNY indexes.

Supporting the CNYUSD price identifier would enable the creation of a Chinese Yuan FX derivative, backed by USD. Token minters could go short on the CNY/USD index, while token holders could go long or use synthetic fxCNY for functional purposes.

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Technical Specification
The definition of these identifiers should be:

-----------------------------------------
- Identifier names: **CNYUSD**
- Base Currency: CNY
- Quote Currency: USD(C)
- Result Processing: 1 / Average USDCNY
- Price Steps: 0.000001 (6 decimals in more general trading format)
-----------------------------------------
- Identifier names: **USDCNY**
- Base Currency: USD(C)
- Quote Currency: CNY 
- Result Processing: Average
- Price Steps: 0.01 (2 decimals in more general trading format)
-----------------------------------------

- Exchanges: Coinbase, Coingecko.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

Coinbase is a top exchange of the world. It is used by most of the price identifieres of UMA. Luckily, we can get USD(C)/CNY price by its api and it will be easy to add this price identifier.

Coingecko is not an exchange but provides free apis to check crypto prices and widely used. We can get USD(C)/CNY by its api easily.

We tried exchanges such as Binance, Gate and KuCoin. All of their apis don't support USDCNY.

We also tried CoinMarketCap which standard plan above support historical search. It's not a good choice because it needs be paid.

## Implementation

The value of USDCNY for a given timestamp should be determined by querying for the price from Coinbase and Coingecko for that timestamp, taking the average, and determining whether that average differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

The value of CNYUSD will follow the exact same process but undergo one additional step: it will be the result of dividing 1/USDCNY.  

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

### Coinbase Historical Data API

The Coinbase historical USDC price API is available at the following URL:

```
https://api.coinbase.com/v2/prices/USD-CNY/spot?date=YYYY-MM-DD(UTC)
```

The response data uses the following JSON format:
```
{
    "data":{
        "base":"USDC",
        "currency":"CNY",
        "amount":"6.5487"
    }
}

```
You can get CNY price in amount.

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

### Coingecko Historical Data API

The Coingecko historical USDC price API is available at the following URL:

```
https://api.coingecko.com/api/v3/coins/usd-coin/history?date=DD-MM-YYYY&localization=false
```

The response data uses the following JSON format:
```
{
    "id": "usd-coin",
    "symbol": "usdc",
    "name": "USD Coin",
    "image":{
        "thumb": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
        "small": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
    },
    "market_data":{
    "current_price":{
        ...
        "btc": 5.5020031343227464e-05,
        "cad": 1.2978351390869964,
        "chf": 0.9040784209465407,
        "clp": 768.4682223345884,
        "cny": 6.575024906911519,
        "czk": 21.88940756975985,
        "dkk": 6.2159327757631555,
        ...
    },
    "market_cap":{"aed": 10907588972.299986, "ars": 240387519879.3717, "aud": 4010628455.7113576, "bch": 10439842.92641315, "bdt": 251805598421.96375,…},
    "total_volume":{"aed": 1856397013.5757165, "ars": 40915220830.352394, "aud": 682956540.3765129, "bch": 1773303.8281109377, "bdt": 42855590002.45406,…}
},
    ...
}

```
You can get CNY price in `current_price.cny`.


## Security considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

## Title

Meter KPI options

## Summary

[Meter](https://meter.io) is a native blockchain that would like to deploy a KPI option contract that pays users back for their lost funds due to a [hack](https://www.coindesk.com/business/2022/02/07/44m-stolen-in-hack-of-blockchain-infrastructure-firm-meter/). The options will have the following features:

 - If the Meter network repays users back in stablecoins the options will expire to zero. 
 - If the Meter network does not repay users back in stablecoins the options will expire based on the price of the MTRG token.

 The intention of this program is to instill confidence for the users of the chain and make an assured commitment by the Meter network to repay users in some capacity. The KPI options will be collateralised by the MTRG token.

## Rationale

There are 2 layers to this implementation: i) the definition of the repaying using stables and ii) getting the price of the MTRG price. This implementation will use two price identifiers currently available to price the KPI options. The price identifiers will be the `YES_OR_NO_QUERY` and the `TOKEN_PRICE`.

The set up will work as follows: 

- The KPI options will be minted using the `General_KPI` identifier. 
- An early expiry condition will be set up such that if the Meter Network publicly publishes an announcement that mentions the repaying of the loan, the KPI options will expire to a value of zero. The identification of such announcement is any public account (such as Twitter, Medium, etc.) that publishes the repaying using stablecoins will be considered. The earlyb exiry request will be passed through the `YES_OR_NO_QUERY`, If yes, the KPI options will expire. If no, the options will remain unchanged.
- If no such announcement is made, the KPI options will expire based on the price of the MTRG token, using the `TOKEN_PRICE` identifier.

## Intended Ancillary Data

### `YES_OR_NO_QUERY`
```
Q: Did the Meter network repay back the hacked funds? The answer is valid if any public medium publishes the repaying using stablecoins from the Meter network. P1: No, P2: Yes.
```
### `TOKEN_PRICE`

```
base:MTRG,baseAddress:0xbd2949f67dcdc549c6ebe98696449fa79d988a9f,quote:USD,quoteDetails:United States Dollar,rounding:6,fallback:"https://www.coingecko.com/en/coins/meter-governance-mapped-by-meter-io",configuration:{
    "type": "medianizer",
    "minTimeBetweenUpdates": 60,
    "twapLength": 86400,
    "medianizedFeeds": [
      { NEED TO DO},
    ]
  }
```

## Implementation




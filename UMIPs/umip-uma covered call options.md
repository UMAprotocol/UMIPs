## Headers
- UMIP <#> 
- UMIP title: Sell UMA options with Optix protocol on Polygon
- Author Danny (danny@optixprotocol.com)
- Status: Draft
- Created: 10/08/2022
- Discourse Link: <Link>

## Summary (2-5 sentences)

This UMIT proposes to use a small portion of the protocol treasury to sell weekly covered call options on the Optix Protocol. (https://optixprotocol.com)

## Motivation

- Option sellers can earn a yield. This is a good fit for protocol treasuries or large holders UMA who want to trade some of the potential upside of their token for some consistent & sustainable yield. 
- Option buyers get long exposure to UMA with “safe leverage” where they can’t get stopped out. Option buyers could also buy puts to get some downside protection. 
- In tradfi options have been historically useful to help increase trading volume. 

## Technical Specification

A vault would be created on the Optix protocol on Polygon with the UMA token and the Chainlink oracle. The vault would sell 20% out of the money weekly options with a price that is reflective of the volatility and demand. 

The UMA treasury and UMA holders can deposit their tokens into the vault and receive the premium from selling options. 

A more detailed explanation can be found here: https://docsend.com/view/ajk9jhkrydb6htma

## Rationale

Options provide a mechanism to transfer risk. As a holder of a large allocation of UMA tokens you can take a small potion of those tokens and trade the upside potential in return for consistent income without significant risk. 

Optix is a multi-chain permissionless option protocol so UMA options could be setup on any Eth compatible chain(except the Ethereum main chain due to gas fees).

## Implementation

This change has no implementations. 

## Security considerations

- Smart contract risk: The Optix contracts are currently being audited by Paladin, Certik and Solidity Finance. These can be reviewed and confirmed prior to proceeding. The amount at risk in a vault could also start very low and be capped, increasing slowly over time. 
- Option pricing risk: Option pricing is based on forumalas that take into consideration the implied volatility and time. If the options are priced incorrectly there may be either no demand or not earning enough to compensate. The Optix team can assit with setting this up and operating this correctly.

# Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add OPEN as a collateral currency              |
| Authors    | Logan (logan@opendao.io) |
| Status     | Draft                                                                                                                                   |
| Created    | March 31st, 2021                                     
|Discourse Link|  https://discourse.umaproject.org/t/adding-open-as-collateral-umip/517   |

## Summary
This UMIP will add OPEN to the supported collateral currencies on the global whitelist contract, allowing the usage of OPEN as collateral currency. This serves as an important step to allow for the creation of call options for OPEN tokens.

​
## Motivation
The motivation of adding OPEN as a supported collateral in the global whitelist contract is so that OPEN governance token holders can interact with a call option primitive for OPEN tokens, creating a new opportunity for the OPEN token holders who would be able to write said options and be an LP against it.

The Open Governance Token (OPEN) is native to the Ethereum Network, and is also bridged to BSC in the form of bOPEN. It is a governance token intended to represent ownership of the DAO and is required to engage in DAO related activities or gain DAO-related financial incentives. 


OPEN has a circulating supply of 7.9 Million OPEN coins and a max supply of 100 Million. Uniswap is the current most active market trading it, and at the time of writing has a market cap of $12,951,898 with a 24 hour trading volume of $1.7 million. More information on OpenDAO can be found on the website: https://opendao.io/



## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The OPEN address, [0x69e8b9528cabda89fe846c67675b5d73d463a916]
(https://etherscan.io/token/0x69e8b9528cabda89fe846c67675b5d73d463a916), 
needs to be added to the collateral currency whitelist introduced in UMIP-8. 

- A final fee of 300 OPEN needs to be added for the OPEN in the Store contract.

​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing OPEN tokens to be used as collateral and to take advantage of the new options.

In practice, we can imagine that OPEN token holder, “Bob,” wants to lock up his OPEN in UMA EMP contracts and mint a synthetic that works like a CALL option (redeemable only on expiry).

Let’s imagine that Bob has a target price of $3 by June 30, 2021. If the target price is hit, Bob can redeem his options to claim the OPEN tokens and will have effectively purchased them at a low price (the option price.) However, if the price is not reached, the option is worth nothing.

Why would Bob write the option? He writes the option and provides LP against it, which means he makes fees from the trading of the option which can be quite healthy. Then again, Bob does have a risk in that he loses his collateral if the strike price is reached. However, Bob, being a wise investor, would probably not lock all of his tokens in the option contract (unless he does not believe the price is likely to be reached at all). If the price is reached then the appreciation in the token price for the rest of Bob’s holdings would more than cover any losses.
​

## Implementation
​
This change has no implementation other than adding the OPEN token address to the collateral currency whitelist.


## Security Considerations
​
In the current setting, there will need to be a significant event that erodes confidence in OpenDAO and the OPEN token for it to be a security or PR concern. Due to the nature of the intended product, we don’t expect low liquidity or volume to be a factor in the success of this endeavor and these factors should not impact UMA negatively.



 

## Headers
- **UMIP #** -  
- **UMIP title:**  - Add OPEN as collateral 
- **Author**   - Logan F [logan@opendao.io]
- **Status:** Draft
- **Created:** Created on May 23rd, 2021
- **Discourse Link:** https://discourse.umaproject.org/t/add-open-as-approved-collateral-currency/1128

## Summary (2-5 sentences)
This UMIP will add OPEN to the supported collateral currencies on the global whitelist contract, allowing the usage of OPEN as collateral currency. This serves as an important step to allow for the creation of call options for OPEN tokens.

## Motivation
The motivation of adding OPEN as a supported collateral in the global whitelist contract is so that OPEN governance token holders can interact with a call option primitive for OPEN tokens, creating a new opportunity for the OPEN token holders who would be able to write said options and be an LP against it.

The Open Governance Token (OPEN) is native to the Ethereum Network, and is also bridged to BSC in the form of bOPEN. It is a governance token intended to represent ownership of the DAO and is required to engage in DAO related activities or gain DAO-related financial incentives. 


OPEN has a circulating supply of 7.9 Million OPEN coins and a max supply of 100 Million. Uniswap is the current most active market trading it, and at the time of writing has a market cap of $6,539,113 with a 24 hour trading volume of $816,694. More information on OpenDAO can be found on the website: https://opendao.io/

In practice, we can imagine that OPEN token holder, “Bob,” wants to lock up his OPEN in UMA EMP contracts and mint a synthetic that works like a CALL option (redeemable only on expiry).

Let’s imagine that Bob has a target price of $3 by June 30, 2021. If the target price is hit, Bob can redeem his options to claim the OPEN tokens and will have effectively purchased them at a low price (the option price.) However, if the price is not reached, the option is worth nothing.

Why would Bob write the option? He writes the option and provides LP against it, which means he makes fees from the trading of the option which can be quite healthy. Then again, Bob does have a risk in that he loses his collateral if the strike price is reached. However, Bob, being a wise investor, would probably not lock all of his tokens in the option contract (unless he does not believe the price is likely to be reached at all). If the price is reached then the appreciation in the token price for the rest of Bob’s holdings would more than cover any losses.


## Technical Specification

**To accomplish this upgrade, the following changes need to be made:**

* The OPEN address 0x69e8b9528cabda89fe846c67675b5d73d463a916 (https://etherscan.io/token/0x69e8b9528cabda89fe846c67675b5d73d463a916) needs to be added to the collateral currency whitelist introduced in UMIP-8.

* A final fee of 500 OPEN needs to be added for OPEN in the Store contract.

## Rationale

The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing OPEN tokens to be used as collateral and to take advantage of the new options.

A final fee of 500 OPEN was chosen, slightly higher than recommended, to account for price volatility of the token.

## Implementation

**This UMIP requires proposing the two governor transactions detailed in the above Technical Specification section.**

This change has no implementation other than adding the OPEN token address to the collateral currency whitelist.

## Security considerations

In the current setting, there will need to be a significant event that erodes confidence in OpenDAO and the OPEN token for it to be a security or PR concern. Due to the nature of the intended product, we don’t expect low liquidity or volume to be a factor in the success of this endeavor and should not impact UMA negatively.

Issues regarding the number of unlocked tokens on the market have been addressed, as 67.7 million OPEN tokens (67.7% of total supply) have been locked with Team Finance for 1 year. Details can be found on Medium via this link:

https://medium.com/opendao/open-token-lock-191e8c3bc9e7

**The address where the tokens are locked is here:**

https://etherscan.io/token/0x69e8b9528cabda89fe846c67675b5d73d463a916?a=0xc77aab3c6d7dab46248f3cc3033c856171878bd5
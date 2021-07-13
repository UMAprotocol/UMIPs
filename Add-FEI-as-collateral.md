UMIP Title: Add Fei as a whitelisted collateral currency
Author: GrantG
Status: In Discussion
Created: 07/08/2021


Summary (2-5 sentences)
This UMIP will add FEI to the supported collateral currencies on the global whitelist contract, allowing the usage of FEI as collateral currency. FEI is a scalable and decentralized stablecoin that leverages protocol controlled value (PCV) for peg maintenance while maintaining highly liquid secondary markets. The PCV controlled by  the FEI DAO, gives FEI an unprecedented ability to positively affect the DeFi landscape, and currently holds roughly $500m in value.
Motivation
Adding FEI as collateral will allow the creation of new synthetic assets backed by FEI and users more collateral options. The FEI community is also considering using KPI options to align token holders with protocol objectives, and incentivize people to adopt and utilize FEI.
Fei supplies most of the liquidity on the largest pool on Uniswap, with a total liquidity of $343,523,824. Recently FEI has also been integrated with several other platforms, including; Rari, and Saddle.

Technical Specification
To accomplish this upgrade, two changes need to be made:

1. The FEI contract must be added to the collateral currency whitelist introduced in UMIP-8 (0x956F47F50A910163D8BF957Cf5846D573E7f87CA)
2. A fee of 400 FEI needs to be added for FEI in the Store contract.

Rationale
The rationale behind this change is giving deployers additional useful collateral currency options. FEI’s current position on Uniswap as the largest pool, the level of deep liquidity, and stable nature ensure users will be able to cheaply and easily move in and out of FEI.

A fee of 400 was chosen as the fee for FEI, as it is the equivalent of other approved stablecoins.

Implementation
This change has no implementation other than adding the Fei token address to the collateral currency whitelist, and the fee transaction.

Security Considerations
Adding FEI as a collateral does not present any foreseeable risks to the protocol. 
When using Fei users should account for its algorithmic nature, and four hour reweighting system.

Due to FEI being an algorithmic stablecoin, it is at risk of losing the peg. However this is countered through the reweighting system, coupled with the $0.95c price floor, allowing any user to always redeem their FEI for $0.95c.

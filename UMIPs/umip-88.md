## HEADERS
| UMIP-88    |                                                                                                                                  	|
|------------|-------------|
| UMIP Title | Add iFARM as a supported collateral currency |
| Authors    | EAsports and gruad |
| Status     | Last Call|
| Created    | 4/17/2021|  
| Discourse Link:	| https://discourse.umaproject.org/t/adding-ifarm-as-collateral/922 |

# SUMMARY 

This UMIP will add iFARM as approved collateral currency. This will involve adding the iFARM token to the whitelist and adding flat final fees to charge per-request. More information on FARM and iFARM can be found [here](https://farm.chainwiki.dev/en/home).

# MOTIVATION

iFARM is the interest-bearing receipt of the cash flow token FARM from Harvest Finance. All FARM staked in the SP pool either directly or through iFARM receives the benefit of a portion of all profits across all Harvest vault strategies.  The Harvest community is interested in utilizing their capital more efficiently and borrowing against their iFARM while their FARM is still earning and exploring additional use cases within the UMA ecosystem such as KPI options.

# TECHNICAL SPECIFICATIONS

To accomplish this, two changes need to be made:

* The iFARM address, 0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651, needs to be added to the collateral currency whitelist introduced in UMIP-8

* A final fee of 2 iFARM need to be added for the iFARM in the Store contract (~229.00 at 6pm ET on 2021.04.26). See [also](https://www.coingecko.com/en/coins/ifarm).  Note: iFARM increases in value over time relative to FARM due to the nature of the in wallet compounding. For more explanation see section "How does the FARM Pool work?" of Harvest [FAQ](https://harvest.finance/faq)

# RATIONALE

The rationale behind this change is to add additional collateral currency options and position potential future opportunities including allowing iFARM holders to create options or synthetic assets within the UMA ecosystem. 

2 iFARM has been chosen as a $400 USD equivalent because it is the minimum required fee and it will tend to grow over time in terms of underlying FARM.

# IMPLEMENTATION

This proposal has no additional implementation other than the two governance transactions proposed under “Technical Specification” 

# Security considerations

Since iFARM is a persistently valuable token, adding it as collateral should not impose any additional risk beyond the normal volatility risk associated with its FARM.  Users should be aware of those risks before depositing collateral.

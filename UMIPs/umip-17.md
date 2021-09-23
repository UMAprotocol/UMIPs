## Headers
| UMIP-17   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add rDAI as a collateral currency              |
| Authors    | Jeff Bennett (endymionjkb@gmail.com), Sean Brown (@smb2796) |
| Status     | Approved                                                                                                                                    |
| Created    | September 25, 2020                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will add rDAI (redeemable Dai) to the supported collateral currencies to the AddressWhitelist contract, allowing UMA users to mint synthetics using rDAI as the collateral currency. This UMIP will also add a flat final fee to charge per-request. The proposed final fee is 400 rDAI per request.

## Motivation
One of the most basic use cases for synthetic tokens is derivitives tied to underlying real-world assets, including equities - and a popular way to gain exposure to equities is through ETFs or index funds: baskets of securities chosen according to a published set of criteria.

Increasingly, and particularly among millennials, those criteria involve moral judgments and values. "Value driven investment" funds (e.g., the ETHO Climate Leadership Index) represent a rapidly rising trend in the industry, and often outperform the broader market.

An UMA synthetic tied to an "ESG" index would be a great way to "long the environment." But an even greater way would be to use rDAI as collateral for the index position, designating an environmental charity (e.g., Offsetra or rTrees) as the beneficiary. That way, the charity always benefits, even if the index underperforms. (Perhaps especially then, if position holder needs to deposit more rDAI to avoid liquidation.)

Of course, this idea can be generalized beyond ESG, to any pairing of a charitable cause to a related ETF or index fund. And since new charities are partnering with rDAI all the time - in fact, through the rDAI protocol anyone can create an arbitrary "charity" simply by providing a list of ETH addresses and weights - this is a growth industry.

A local charitable organization could create a monthly "rolling" synthetic that directed funds according to the organization's priorities that month, either by altering weights, or by creating a new list of beneficiaries.

Alternatively, the protocol also allows rDAI to be used without specifying charitable beneficiaries at all. Undesignated ("self-hat") rDAI could be used simply to offset potential losses and de-risk positions, as the collateral would naturally increase over time. Hybrid positions are also possible; e.g., 50% going to charity, and 50% compounding within the synthetic.

When using undesignated ("self-hat") rDAI as collateral for the EMP contract template, a contract sponsor would need to set `excessTokenBeneficiary` to an address they wish to receive the accrued rDAI interest. The EMP function trimExcess would then need to be called to drain the excess collateral to the `excessTokenBeneficiary`. See below for possible security implications of this approach.

## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The rDAI address, [0x261b45d85ccfeabb11f022eba346ee8d1cd488c0](https://etherscan.io/token/0x261b45d85ccfeabb11f022eba346ee8d1cd488c0) on Mainnet, needs to be added to the collateral currency AddressWhitelist introduced in UMIP-8.
   (This is the address of the proxy contract, which is the token that gets transferred.)
- A final fee of 400 rDAI needs to be added for rDAI in the Store contract.
## Rationale
This change encourages wider adoption of the UMA protocol through strengthening ties with traditional financial markets, and promoting a new use case: securing synthetic positions with interest-bearing collateral that benefits charities related to the underlying assets.

It also provide general utility by enabling the use of "compounding collateral," which serves to lower risk, offset losses, and monetize "HODLing" of inactive synthetic positions (as the first such tokens are likely to be), or those with far future expiration dates.
400 rDai was chosen because the current final fee for DAI is 400 DAI and the value of rDAI is directly equal to the value of DAI.
## Implementation
This change has no implementation other than adding the rDAI address to the collateral currency AddressWhitelist and adding the rDAI final fee to the Store contract.

## Security considerations

rDAI collateral providers should do their own due diligence on the beneficiaries of any given synthetic before opening a position. This is easy to do on a technical level, since all the "hat"-related information, including the literal Ethereum addresses of recipients, is available on-chain through the token contract interface and corresponding subgraph. (Not to mention the graphical rDAI explorer.) rDAI held in positions would be tamper-proof, as it is owned by the synthetic contract. These addresses (ideally linked to ENS domains) could then be verified through the official web sites of the charitable organizations.
rDAI itself should present very little risk. It is an ERC-20 token based on DAI, and the project was audited by Quantstamp: 
https://certificate.quantstamp.com/full/r-token-ethereum-contracts

The "logic" contract referenced by the proxy is also upgradeable, in case any issues are found. rDAI is hard-pegged to DAI, so in that sense is as safe to hold as DAI.

One of the intended uses of rDAI collateral is in support of synthetics based on ESG (or other value driven investment strategies aligned with supported charities), and this not been a common use case. So far, most synthetics (e.g., those issued by UMA) have been crypto-pairs enabling leveraged positions, or simple yield instruments such as uUSD.

Market liquidity for these new instruments will likely be low at first, and there may be insufficient DVM participation to ensure the solvency of positions. Investors would also be dependent on published financial data for the underlying ETFs (constituents, weights, and prices), which is less available and reliable than, say, the ETH-BTC price. These synthetics may therefore be riskier than other types of synthetics, and those minting such contracts should take care to set appropriate collateralization requirements, perhaps based on the measured volatility of the underlying indices.

However, this is not the only use case for rDAI in synthetics. Simply using it for compounding collateral is even "safer" than DAI itself, as the collateralization ratio would gradually increase, with no action required from the position holder (other than calling the function to apply accrued interest).

Note that the expected behavior - directing interest on all future positions to the "advertised" hat, which is the stated purpose of and motivation for users of the synthetic - depends on separate calls to the rDAI and UMA protocols, and this introduces order dependencies and timing considerations.

The hat inheritance feature of rDAI ensures that all rDAI deposited through opening positions will adopt the hat associated with the contract address, and this gets assigned the first time rDAI is transferred to the contract. So in order to set the contract's hat, the creator must open an initial position, sending in rDAI with the "advertised" hat, using a three-step mint/deploy/deposit process. If the last two steps are not done atomically, an attacker could "hijack" the synthetic by opening a position before the creator, with the hat set to the attacker's wallet - in which case all interest would go to the attacker instead of the charity.

As described above, a creator could implement a "management fee" - capturing a portion of all interest payments - by either setting one of the recipients in the hat to an account controlled by the creator (in which case `payInterest` would directly transfer funds), or by setting one of the recipients to the contract address and `excessTokenBeneficiary` to the wallet address (in which case `payInterest` would transfer rDAI to the contract, and the creator could withdraw it with `trimExccess`). In the latter case, the minter needs the EMP contract address, so the process would be deploy/mint/deposit, all of which should be done atomically. (Technically, the EMP contract address could be precomputed using the deployer address and nonce, in which case the creator could still use the regular mint/deploy/deposit sequence.)

In any case, the hat id and recipient addresses assigned to an address are publicly visible, so if such an attack did occur, it could be easily discovered, and avoided by simply abandoning the contract.
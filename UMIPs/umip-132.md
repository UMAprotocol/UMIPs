## Headers
| UMIP-132          |                                                                          |
|-------------------|--------------------------------------------------------------------------|
| UMIP Title        | Add SHERLOCK_CLAIM as a price identifier                                 |
| Authors           | Jack Sanford, Sean Brown                                                 |
| Status            | Approved                                                                |
| Created           | 09/28/21                                                                 |
| Discourse Link    | https://discourse.umaproject.org/t/sherlock-exploit-protection-umip/1344 |

## Summary

The SHERLOCK_CLAIM price identifier is intended to allow users of [Sherlock](https://sherlock.xyz/) to request the DVM for arbitration in the case of a disagreement about an smart contract exploit insurance claim.

## Motivation

Sherlock is a new type of exploit protection protocol launching this September. The idea is to have smart contract security experts assess/price protocol coverage, then get paid based on the performance of the protocols (no hacks = large payout, large hack = no payout). Protocols who want coverage will pay Sherlock monthly premiums, and in return, Sherlock will use it’s staking pool to repay hacks at protocols. Sherlock is doing a guarded launch with $30M in staking pool funds and writing coverage for up to $10M per protocol. More details can be found here. 

Other exploit protection protocols rely on their tokenholders to decide whether claims should be paid out or not. Sherlock wants to do better and would like to use UMA’s Data Verification Mechanism as the final escalation to decide on claims payouts. This would help coverage buyers feel more comfortable that they have access to an unbiased party’s decision on a claim.

For context, Sherlock agrees on coverage terms with every protocol. An example can be seen here (TBA). These terms will be broadly the same across all protocols but there may be extra language added for protocol-specific exploit risks. 

In the event of a potential exploit, Sherlock’s security team will work with the protocol to determine the nature of a hack. If the protocol believes they experienced an exploit that should be covered by Sherlock, the protocol will submit the block range of the exploit and the amount to be reimbursed by Sherlock. Next, Sherlock’s claims committee (made up of reputable security experts associated with Sherlock such as [John Mardlin](https://twitter.com/maurelian_), [Mariano Conti](https://twitter.com/nanexcool), and [Rajeev Gopalakrishna](https://twitter.com/0xRajeev)) will work to evaluate the nature of the potential exploit and then map the exploit to the coverage terms agreed to with that protocol. The committee will then decide whether to pay out the claim. If the committee decides not to pay out the claim, the protocol has the option to stake a minimum dollar amount ($50k for example) and escalate the claim to the UMA Data Verification Mechanism. The UMA tokenholders would then use information provided by the protocol, the claims committee, and importantly, security expert not associated with Sherlock, to decide whether the claim should be paid out or not. 

Relying on UMA’s DVM for claims decisions will significantly increase the value of on-chain exploit protection mechanisms in the eyes of protocols and end users. One of the biggest hurdles to adoption of coverage is the biased nature of claims processes. Sherlock believes that the involvement of UMA’s DVM will make exploit protection protocols more trustworthy and further normalize adoption of coverage by protocols and end users alike. By adding this product, UMA can blaze a trail that contributes to the safety of DeFi. Sherlock would love to set a precedent with UMA for how exploit claims disputes should be resolved on-chain. 

## Ancillary Data Specifications

```
Metric:Sherlock exploit claim arbitration,
Protocol:<PROTOCOL_REQUESTING_CLAIM>,
ChainId:<CHAIN_ID_OF_POTENTIAL_EXPLOIT>,
Value:<USD_VALUE_OF_CLAIM>,
StartBlock:<START_BLOCK_OF_POTENTIAL_EXPLOIT>,
Resources:<OPTIONAL_RESOURCE_LINKS>,
CoverageAgreement:<COVERAGE_AGREEMENT_LINK>
```

Example:
```
Metric:Sherlock exploit claim arbitration,
Protocol:UMA Protocol,
ChainId:1,
Value:1000000,
StartBlock:13207345,
CoverageAgreement:Link to protocol specific coverage agreement with Sherlock
```

For guidance on how to structure ancillary data correctly, refer [here](https://docs.umaproject.org/uma-tokenholders/guidance-on-adding-price-identifiers#ancillary-data-specification).

## Rationale and usage

The framing of the price identifier puts the responsibility on the protocol to specify the correct blocktime, blockchain, and payout amount in order to receive a payout. If any of the information is not accurate, a payout will not occur. This is mitigated by the idea that a protocol will get up to 3 chances to correctly input the data in order to successfully trigger a payout.

Because the potential request space is broad, it is possible that voters will not be able to arrive at a definitive result. In this case, the default return value should be “unresolvable” (or 0.5), which likely will also result in no payout from Sherlock to the claimer. This places the onus on the protocol to provide clear evidence that an exploit occurred. Practically from the Sherlock side, a returned value of 0.5 or 0 will make no difference, as neither will change the committee's "no payout" outcome.

It is low risk for UMA voters to return a value of 0.5, as it is likely that this will result in a resubmission of the price request by the claiming protocol once they have have accumulated more concrete evidence of their claim. If a claim is paid out in error, there is little recourse for Sherlock at that point, so it seems reasonable that a protocol should have to prove that a payout occurred and that the default should be “no action”, meaning a payout is not enacted.

## Implementation

1. Voters should decode the ancillary data and identify the protocol, chain, start block, dollar value of claim in question and any additional resources provided.
2. Because the protocol making the claim will likely be the party constructing the ancillary data and submitting a price request, voters should heavily rely on checking external resources for additional context. The Sherlock Coverage Terms Agreement should always be referenced. Additionally the Protocol's original claim as well as the Sherlock Claims Committee's original claims decision will likely always be published and should be referenced. Sherlock's Coverage Agreement details the exact types of exploits that Sherlock covers, and these should be the only exploits that are considered in arbitration. More information is provided in the `Additional Resources` section below.
3. Voters should return a value of `1` if they determine that:
   1. There was an exploit for the `Protocol` specified.
   2. The exploit type is covered by Sherlock's Coverage Agreement.
   3. The exploit happened as part of the `StartBlock` specified in ancillary data.
   4. The total USD value lost in the exploit is greater than or equal to the USD `Value` within ancillary data.
4. If voters can confidently identify that one of the above is not correct, they should return a value of `0`.
5. If voters cannot confidently assess one of the criterion above, they should return a value of `0.5` (cannot be resolved).

## Additional Resources
While the coverage agreement document between Sherlock and the protocol in question will serve as the canonical guideline as to whether an exploit falls under coverage or not, it is non-trivial to determine whether an exploit occurred, and how that exploit maps to the coverage agreement. 

Outside of the coverage agreement, UMA tokenholders should rely on 3 sources of information when making their decision:
1) The interpretation of the exploit and coverage agreement by the Sherlock claims committee and other persons associated with Sherlock. 
2) The interpretation of the exploit and coverage agreement by the protocol in question.
3) Most important, the interpretation of the exploit and coverage agreement by third party security experts. 

While information in 1) and 2) should be readily available (both parties will be motivated to explain their interpretation), we can reasonably expect 3) to be readily available as well based on historical public interest in protocol exploits and past articles produced. 

Sources of 3) could be [rekt.news](https://twitter.com/RektHQ), [Mudit Gupta](https://twitter.com/Mudit__Gupta), [Kelvin Fichter](https://twitter.com/kelvinfichter), [Igor Igamberdiev](https://twitter.com/FrankResearcher), as well as audit firms such as [PeckShield](https://twitter.com/peckshield) as long as the parties don’t have material connection to either Sherlock or the protocol in question. 

## Security Considerations

It should be noted that this price identifier is objectively complex and broad and will likely require a large amount of active participation from UMA voters to correctly analyze and resolve these requests. UMA voters should not be expected to be security experts, and therefore do not accept any liability from potential claims from either the claiming protocol or Sherlock. UMA voters should only be expected to act as an impartial jury; their responsibility is to synthesize information from ancillary data, `Additional Resources`, Sherlock's coverage terms and ad hoc information provided by Sherlock and the claiming protocol during arbitration, but not to perform complete security analysis themselves.

There are also several mitigating processes built into the Sherlock system as well as the UMA voting system. As noted previously, claiming protocols will have up to 3 total chances to submit claims and go to a DVM vote. This should allow for comprehensive information gathering and analysis, and will allow UMA voters to default to an "unresolvable" return value unless clear supporting evidence is provided either to support or contradict a claim.

The DVM voting system also allows for a multi-day discussion and information gathering process. Because of this reason, it seems acceptable that the potential price request space for this identifier is broad and potentially subjective. Both the claiming protocol, as well as Sherlock's security committee will have the opportunity to provide supporting evidence and advocate for their case. It is recommended that both parties be active in UMA's #voting [Discord channel](https://discord.gg/YE4h2YAb), as this is where most UMA voting discussion occurs.  

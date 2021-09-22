## Title

Sherlock Exploit Protection

## Summary

This query is intended to allow users of [Sherlock](https://sherlock.xyz/) to request the DVM for arbitration in the case of a disagreement about an smart contract exploit insurance claim.

This implementation will be used with the `General_KPI` price identifier, and should return one of the values passed within ancillary data depending on the results of arbitration. Additionally, within ancillary data will be a link to this document (for voter guidance on resolution steps) as well as any additional supporting resources that the price requester wishes to provide.

## Motivation

Sherlock is a new type of exploit protection protocol launching this September. The idea is to have smart contract security experts assess/price protocol coverage, then get paid based on the performance of the protocols (no hacks = large payout, large hack = no payout). Protocols who want coverage will pay Sherlock monthly premiums, and in return, Sherlock will use it’s staking pool to repay hacks at protocols. Sherlock is doing a guarded launch with $30M in staking pool funds and writing coverage for up to $10M per protocol. More details can be found here. 

Other exploit protection protocols rely on their tokenholders to decide whether claims should be paid out or not. Sherlock wants to do better and would like to use UMA’s Data Verification Mechanism as the final escalation to decide on claims payouts. This would help coverage buyers feel more comfortable that they have access to an unbiased party’s decision on a claim.

For context, Sherlock agrees on coverage terms with every protocol. An example can be seen [here](https://docs.google.com/document/d/19OEnspNhO-U3CosXt9NRSyfWlnJFq2Z1VnqGA8yJAkM/edit#heading=h.8uxda5sbuvuu). These terms will be broadly the same across all protocols but there may be extra language added for protocol-specific exploit risks. 

In the event of a potential exploit, Sherlock’s security team will work with the protocol to determine the nature of a hack. If the protocol believes they experienced an exploit that should be covered by Sherlock, the protocol will submit the block range of the exploit and the amount to be reimbursed by Sherlock. Next, Sherlock’s claims committee (made up of reputable security experts associated with Sherlock such as [John Mardlin](https://twitter.com/maurelian_), [Mariano Conti](https://twitter.com/nanexcool), and [Rajeev Gopalakrishna](https://twitter.com/0xRajeev)) will work to evaluate the nature of the potential exploit and then map the exploit to the coverage terms agreed to with that protocol. The committee will then decide whether to pay out the claim. If the committee decides not to pay out the claim, the protocol has the option to stake a minimum dollar amount ($50k for example) and escalate the claim to the UMA Data Verification Mechanism. The UMA tokenholders would then use information provided by the protocol, the claims committee, and importantly, security expert not associated with Sherlock, to decide whether the claim should be paid out or not. 

Relying on UMA’s DVM for claims decisions will significantly increase the value of on-chain exploit protection mechanisms in the eyes of protocols and end users. One of the biggest hurdles to adoption of coverage is the biased nature of claims processes. Sherlock believes that the involvement of UMA’s DVM will make exploit protection protocols more trustworthy and further normalize adoption of coverage by protocols and end users alike. By adding this product, UMA can blaze a trail that contributes to the safety of DeFi. Sherlock would love to set a precedent with UMA for how exploit claims disputes should be resolved on-chain. 

## Intended Ancillary Data

```
Metric:Sherlock exploit claim arbitration,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/sherlock.md",
Protocol:<PROTOCOL_REQUESTING_CLAIM>,
Blockchain:<BLOCKCHAIN_OF_POTENTIAL_EXPLOIT>,
Value:<USD_VALUE_OF_CLAIM>,
StartBlock:<START_BLOCK_OF_POTENTIAL_EXPLOIT>,
Resources:<OPTIONAL_RESOURCE_LINKS>,
CoverageAgreement:<COVERAGE_AGREEMENT_LINK>
```

Example:
```
Metric:Sherlock exploit claim arbitration,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/sherlock.md",
Protocol:UMA Protocol,
Blockchain:Ethereum,
Value:1,000,000,
StartBlock:13,207,345,
CoverageAgreement:Link to protocol specific coverage agreement with Sherlock
```

## Rationale and usage

The framing of the price identifier puts the responsibility on the protocol to specify the correct blocktime, blockchain, and payout amount in order to receive a payout. If any of the information is not accurate, a payout will not occur. This is mitigated by the idea that a protocol will get up to 3 chances to correctly input the data in order to successfully trigger a payout.

Because the potential request space is broad, it is possible that voters will not be able to arrive at a definitive result. In this case, the default return value should be “no payout” (or 0.5). This places the onus on the protocol to provide clear evidence that an exploit occurred. This seems like a proper approach because a protocol can always resubmit once they’ve accumulated better evidence. However, if a claim is paid out in error, there is little recourse for Sherlock at that point. It seems reasonable that a protocol should have to prove that a payout occurred and that the default should be “no action,” meaning a payout is not enacted.

## Implementation

1. Voters should decode the ancillary data and identify the protocol, start block, dollar value of claim in question and any additional resources provided.
2. Because the protocol making the claim will likely be the party constructing the ancillary data and submitting a price request, voters should heavily rely on checking external resources for additional context. The Sherlock Coverage Terms Agreement should always be referenced. Additionally the Protocol's original claim as well as the Sherlock Claims Committee's original claims decision will likely always be published and should be referenced. Sherlock's Coverage Agreement details the exact types of exploits that Sherlock covers, and these should be the only exploits that are considered in arbitration. More information is provided in the `Additional Resources` section below.
3. Voters should return a value of `1` if they determine that:
   1. There was an exploit for the `Protocol` specified.
   2. The exploit type is covered by Sherlock's Coverage Agreement.
   3. The exploit happened as part of the `StartBlock` specified in ancillary data.
   4. The total USD value lost in the exploit matches the USD `Value` within ancillary data.
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
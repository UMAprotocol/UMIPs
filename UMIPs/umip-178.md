## Headers

| UMIP-167            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add ABT as a supported collateral currency           |
| Authors             | paul@uma.xzy                                         |
| Status              | Draft                                                |
| Created             | 2023-08-23                                           |
| Discourse Link      | https://github.com/UMAprotocol/UMIPs/pull/591        |

## Summary (2-5 sentences)

This UMIP proposes adding the Across Bond Token (ABT) for use as collateral in UMA contracts. ABT implements custom transfer logic, permitting Across to realise a permissioned set of HubPool proposers, thereby reducing the "proposal attack surface" of Across.

## Motivation

Across relies on an Optimistic Asserter proposal pattern in order to verify that any proposed allocation of HubPool funds is valid and correct. Across proposers submit a proof as part of their proposal, which can be permissionally verified and optionally disputed by any observer of the system. Proposals that survive a 2 hour challenge window are subsequently able to be executed, thereby resulting in the movement of funds.

As with disputing, it is currently permissionless to propose a root bundle proposal in Across. This unfortunately provides an opportunity for malicious third-parties to submit invalid proposals in order to extract funds from the system. This marginal risk dictates the need for a lengthy challenge window on proposals in order to ensure that any such proposals are detected and disputed. This thereby reduces the number of proposals that can be made and ultimately limits the frequency at which Across HubPool funds can be allocated to bridging activities, such as refunding relayers for user deposits that they have filled.

The Across Bond Token has been designed specifically to enhance the security of Across by limiting the set of possible Across proposers, whilst still allowing any independent observer to dispute an invalid proposal. By ensuring that proposals only originate from pre-approved actors, Across will have reduced its "proposal attack surface" and will therefore be able to reduce its 2 hour challenge window. This will allow Across to scale further by reducing the time that relayers must wait for refunds, thereby improving their capital efficiency, and will ultimately deliver a better experience for the users of Across.

## Technical Specification

The following changes are proposed:

-   The ABT address [0xtbd](https://etherscan.io/address/0xtbd) shall be added to the collateral currency list introduced by UMIP-8.
-   A final fee of 0.135 shall be configured for ABT in the relevant Store contract (nominally [0x54f44eA3D2e7aA0ac089c4d8F7C93C27844057BF](https://etherscan.io/address/0x54f44eA3D2e7aA0ac089c4d8F7C93C27844057BF).

## Rationale

The final fee of 0.135 matches the existing WETH final fee. ABT can be minted and redeemed at a rate of 1:1 against Ether.

## Implementation
ABT implements a simple mechanism that restricts the set of possible proposers, whilst still allowing for permissionless disputes. It achieves this be overriding the WETH9 transferFrom() function in order to implement custom transfer logic, such that it prevents any non-approved address from transferring any amount of ABT to the Across v2 HubPool contract if they are recorded as the current proposer. This effectively prohibits Across HubPool proposals by any non-approved addresses. All other ERC20 functionality is inherited directly from a local WETH9 implementation.

The set of permitted proposers will be configurable and the can be managed by the ABT contract owner. The fact that proposers must be known to Across in advance significantly reduces the probability of an incorrect proposal being submitted, and thereby provides opportunity for the proposal challenge window to be reduced.

Migration to the ABT token for use as a bond collateral token will successfully retain the existing security properties of Across whilst dramatically reducing the attack surface area that malicious proposers might seek to exploit.

## Security considerations

This collateral type has been developed in-house by the Across team to address a specific need with respect to the proposal lifecycle. Its capabilities are limited to basic ERC20 functions, and it inherits most of its functionality from the WETH9 contract that has previously been used within the UMA ecosystem. The token has been [audited by OpenZeppelin](https://blog.openzeppelin.com/uma-across-v2-audit), with only minor typographical errors found. The ABT contract is not upgradeable, and no marginal risks to the UMA ecosystem have been identified.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

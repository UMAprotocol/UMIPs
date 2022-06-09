## Headers
- UMIP-152
- UMIP title: Add ZODIAC as a supported price identifier
- Author: John Shutt (john@umaproject.org)
- Status: Last Call
- Created: March 7, 2022

## Summary (2-5 sentences)
The ZODIAC identifier is intended to be used with an [Optimistic Governor](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/zodiac/OptimisticGovernor.sol) [Zodiac module](https://gnosis.github.io/zodiac/docs/intro) that allows you to control a [Gnosis Safe](https://gnosis-safe.io/) according to a set of rules defined off-chain and enforced with UMA's [Optimistic Oracle](https://umaproject.org/optimistic-oracle.html). Any address can propose transactions that follow the rules and any address can dispute a proposal to UMA's Optimistic Oracle within a challenge window.

## Motivation
The ZODIAC identifier, coupled with the Optimistic Governor module, will allow for a new era of flexible "optimistic governance," where management of DAO treasuries and other multi-signature wallets can be managed more effectively, without being limited to X-of-Y signing schemes or tokenholder votes, although the Optimistic Governor module can enforce those things, too.

To date, DAO governance has twisted itself to conform to the limitations of simplistic tools, instead of finding the best rules to coordinate around shared resources. The ZODIAC identifier allows a DAO to publish their rules in plain language with sufficient detail for a neutral third-party observer to determine whether transactions submitted to a Gnosis Safe follow the rules or not, and then have any address propose and execute transactions that follow those rules.

Because human voters can be brought in the loop to resolve disputes, this is an incredibly flexible and powerful form of DAO governance. Due to that flexibility, users of this identifier should be sure to make their rules as clear as possible, including the process for upgrading to a new set of rules.

## Technical Specification
The Optimistic Governor module is a new tool and can be paired with an administrative multi-signature scheme for emergency actions for greater user assurance. Over time, the signature threshold can be increased for the emergency multi-sig, and eventually the multi-sig can be eliminated entirely, with all governance actions going through the Optimistic Governor.

Each Gnosis Safe will have its own Optimistic Governor module contract which will store a hash of transactions proposed by external addresses. Each proposal hash represents a bundle of transactions and each proposal emits an event with the full transaction details.

```

event TransactionsProposed(
    address indexed proposer,
    uint256 indexed proposalTime,
    Proposal proposal,
    bytes explanation,
    uint256 challengeWindowEnds
);

struct Transaction {
    address to;
    Enum.Operation operation;
    uint256 value;
    bytes data;
}

struct Proposal {
    Transaction[] transactions;
    uint256 requestTime;
}
```

The module contract stores a mapping of proposal hashes to their proposal time, to verify proposals during execution and to prevent duplicate proposals. The contract also stores a string reference to an off-chain set of rules that have been publicly published, which may be an IPFS hash, a URI, or something else.

Other important configuration variables stored by the contract are the collateral token address (for bonds), the amount of collateral tokens proposers and disputers are required to post as a bond, the liveness period for disputes, the identifier used by the module, and the address of the Optimistic Oracle and the Finder.

```
// This maps proposal hashes to the proposal timestamps.
mapping(bytes32 => uint256) public proposalHashes;

// Since finder is set during setUp, you will need to deploy a new Optimistic Governor module if this address need to be changed in the future.
FinderInterface public immutable finder;

IERC20 public collateral;
uint64 public liveness;
// Extra bond in addition to the final fee for the collateral type.
uint256 public bondAmount;
string public rules;
// This will usually be "ZODIAC" but a deployer may want to create a more specific identifier.
bytes32 public identifier;
OptimisticOracleInterface public optimisticOracle;
```

When a user creates a proposal, they submit an array of transactions along with an optional explanation that explains the intent and purpose of the transactions, which is useful for voters trying to understand the transactions and whether or not they follow the published rules.

```
function proposeTransactions(Transaction[] memory transactions, bytes memory explanation) public {
    ...
}
```

In this function, a price request and price proposal are submitted to the Optimistic Oracle, and the proposal hash is generated and stored in a mapping to the proposal time.

```
// Create the proposal hash.
bytes32 proposalHash = keccak256(abi.encode(_transactions));

// Add the proposal hash to ancillary data.
bytes memory ancillaryData = AncillaryData.appendKeyValueBytes32("", "proposalHash", proposalHash);

// Check that the proposal is not already mapped to a proposal time, i.e., is not a duplicate.
require(proposalHashes[proposalHash] == 0, "Duplicate proposals are not allowed");

// Map the proposal hash to the current time.
proposalHashes[proposalHash] = time;

// Propose a set of transactions to the OO. If not disputed, they can be executed with executeProposal().
// docs: https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/interfaces/OptimisticOracleInterface.sol
optimisticOracle.requestPrice(identifier, time, ancillaryData, collateral, 0);
uint256 totalBond = optimisticOracle.setBond(identifier, time, ancillaryData, bondAmount);
optimisticOracle.setCustomLiveness(identifier, time, ancillaryData, liveness);

// Get the bond from the proposer and approve the bond and final fee to be used by the oracle.
// This will fail if the proposer has not granted the OptimisticGovernor contract an allowance
// of the collateral token equal to or greater than the totalBond.
collateral.safeTransferFrom(msg.sender, address(this), totalBond);
collateral.safeIncreaseAllowance(address(optimisticOracle), totalBond);

optimisticOracle.proposePriceFor(
    msg.sender,
    address(this),
    identifier,
    time,
    ancillaryData,
    PROPOSAL_VALID_RESPONSE
);

uint256 challengeWindowEnds = time + liveness;
```

After a proposal is created, an event is emitted which includes the proposer address, the proposal time, the proposal details (see: Proposal struct), the optional explanation, and the timestamp at which the challenge window ends.

```
emit TransactionsProposed(proposer, time, proposal, _explanation, challengeWindowEnds);
```

Disputers and voters can find the `rules` reference in the Optimistic Governor contract. This contract address will be the `requester` in the `ProposePrice` event emitted by the Optimistic Oracle contract.

### Ancillary Data Format

The `ancillaryData` for the price request will be generated automatically and consist of the word `proposalHash` as a key, followed by a colon, followed by the proposal hash automatically generated from the transaction details.

`proposalHash: 0x...abcdef`

## Rationale
It is impossible to capture every form of human organization in rigid programmatic structures. Without a flexible, natural language based system for outlining rules of operation, and a trustless and decentralized mechanism for enforcing those rules, DAOs can only exist in a stunted form, like an oak tree growing in a pot with no space for deep roots.

This UMIP and the associated module code brings the flexibility of law to smart contracts, with UMA voters serving as judge and jury in case of disputes. Unlike the tradition of common law, however, UMA voters do not attempt to create precedent for ambiguous cases, resolve controversy, or fill in the gaps. If there is ambiguity about whether a particular proposal follows the rules, it is simply rejected.

The onus is on the DAO to write clear rules and on the proposer to ensure their transactions follow the rules, with no room for ambiguity by a neutral third-party observer.

This methodology allows for a huge amount of flexibility for DAOs to manage their shared resources without requiring UMA voters to make subjective judgements, which would be difficult for voters and could potentially create unpredictable and undesirable results for DAOs.

## Implementation
Voters should read the plain language rules referenced in the public `rules` value in the Optimistic Governor contract that requested a price and check the proposed transactions against those rules.

This `rules` value will usually be an IPFS hash. If it is, voters can view the rules through a web browser by going to https://ipfs.io/ipfs/<RULES_HASH> or by using any other system to access the document using IPFS. If the `rules` value is a web URI, voters can simply enter the web URI into any web browser.

The system is quite flexible, so voters may need to find other publicly verifiable data to determine if the proposed transactions follow the rules. For instance, they may need to check the result of a Snapshot vote to verify that a governance proposal was approved by the DAO token holders, or check the current price of a token to verify a proposal to make a trade according to a trading strategy outlined in the rules, or confirm public misbehavior by some address to verify a proposal to slash a bond posted by that address.

If the proposer included an optional `explanation` in the ancillary data of the price request, that may be helpful for understanding the intent of the proposal, but voters should primarily consider the actual effects of the proposed transactions and verify that the transactions clearly and unambiguously follow the rules.

If a proposal is disputed, the disputer is encouraged to publish their reasoning in a public forum to assist UMA voters in their determination of whether or not the proposal was valid.

Voters should consider four sources of public information in their ruling:

1. The published rules for the Optimistic Governor module.
2. The rationale given by the proposer in explanation (if any).
3. The arguments presented by disputers.
4. The voter's understanding of what the transactions *actually* do, regardless of the stated rationale.

If a proposal follows the rules, an UMA voter should return a value of `1`.

If a proposal doesn't follow the rules, an UMA voter should return a value of `0`.

If a voter is unsure if a proposal follows the rules, an UMA voter should return a value of `0`.

If the rules are unclear or malformed, an UMA voter should return a value of `0`.

It is the responsibility of the DAO users of the `ZODIAC` identifier to write clear and unambiguous rules. If their rules are unclear, they should expect proposals that get disputed to be rejected by UMA's oracle.

It is important that the process for changing the rules be particularly clear and unambiguous, if a rule change process is allowed by the DAO. This allows the DAO to add, remove, or clarify rules as needed, analogous to a constitutional amendment.

The implementation of the Optimistic Governor module can be [found here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/zodiac/OptimisticGovernor.sol).

The requester will be the Optimistic Governor contract itself, which means voters can use the requester address to find the contract on Etherscan and inspect the public `rules` value.

Voters can use the [`DecodeTransactionData` script](https://github.com/UMAprotocol/protocol/blob/master/packages/scripts/src/DecodeTransactionData.js) to decode transaction data as needed.

### Example Rules
The `ZODIAC` identifier is designed to allow rules to be as flexible as possible while still being clear to UMA voters called in to resolve disputes. These examples are meant to inspire creativity in users creating their own rules and demonstrate the legalistic approach they should take.

The actual rules for a given module will depend entirely on the intended use of the Gnosis Safe governed by that module and the community dynamics of the DAO in charge.

As a reminder, these rules should be published publicly and referenced in a string stored in the module contract, as an IPFS hash, a website URI, or some other format.

```
EXAMPLE RULES

ABC DAO was formed to bring our token holders to the moon, Mars, and beyond.

To that end, we have established the following rules governing our treasury, contained in the Gnosis Safe at Ethereum address 0xbcd...234. This Gnosis Safe also has the ability to change certain parameters in our other smart contracts.

1. Transactions proposed by 0xabc...123 are valid unless they violate other rules. This address is a multi-signature wallet controlled by the core development team.

2. No more than 10% of the value contained in the Gnosis Safe at address 0xbcd...234, which is governed by the Zodiac module 0xcde...345, may be transferred out of the Gnosis Safe during a single 24-hour period.

3. Proposals including transactions that call functions on the smart contract 0xdef...456 must be approved by a Snapshot vote backed by more than 50% of the total supply of $ABC ERC-20 tokens and must be proposed by 0xabc...123.

4. Proposals that have been approved by a Snapshot vote backed by more than 50% of the total supply of $ABC ERC-20 tokens are valid.

5. Transactions proposed by an address owned by Elon Musk are valid unless they violate other rules. Elon Musk can prove ownership of an address through a post on the @elonmusk Twitter account combined with a public press release.

6. These rules may be changed at any time by a transaction approved by a Snapshot vote backed by more than 50% of the token supply of $ABC ERC-20 tokens, or by Elon Musk.

7. Elon Musk may not propose transactions when it is the second Tuesday of the month, Pacific Time Zone.
```

### Successful Execution Flow
1. DAO member Alice has a great idea for utilizing the DAO treasury and writes some Ethereum transactions that would execute her idea.
2. Alice holds a Snapshot vote to approve their idea and associated transactions.
3. The majority of $ABC tokens back Alice's proposal in the Snapshot vote.
4. Alice submits the proposal to the Zodiac module governing the Gnosis Safe and notes in the explanation that the proposal was approved on Snapshot and includes a link to the Snapshot results. Alice includes a bond with her proposal.
5. The proposal is not disputed within the challenge window and can be executed by any address.
6. Bob, another member of the DAO, executes Alice's proposal since Alice is out watching a movie.
7. Alice's transactions are executed and the treasury funds are spent according to her plan, which was approved by a Snapshot vote.

### Disputed Execution Flow
Starting after step 4 from the Successful Execution Flow:

1. Bob, who is jealous of Alice's popularity in the DAO, disputes her proposal even though it has been approved by a Snapshot vote. Bob includes a bond with his dispute and rages against the proposal on Twitter.
2. The dispute is escalated to UMA's data verification mechanism where UMA tokenholders analyze the proposal, the arguments from Alice and Bob, and the rules published by the DAO and referenced in the Zodiac module.
3. After reading the rules, the vast majority of UMA token holders conclude that the proposal followed the rules and should be executed, and commit a value of `1` during the commit period.
4. UMA token holders reveal their votes during the reveal period.
5. After the reveal period, the settlement value is `1`. The Zodiac module receives the settlement value and allows any user to execute the proposal.
6. Bob loses his bond and Alice gets her bond back and a portion of Bob's bond.
7. Alice, vindicated, executes her proposal.

### Blocked Execution Flow
1. Elon Musk proposes to spend some DAO treasury funds, and includes a bond with his proposal, but it is the second Tuesday of the month, Pacific Time Zone.
2. Alice disputes Elon's proposal and includes a bond with her dispute.
3. The dispute is escalated to UMA's data verification mechanism where UMA tokenholders analyze the proposal and the rules published by the DAO and referenced in the Zodiac module.
4. After reading the rules, the vast majority of UMA token holders conclude that the proposal did NOT follow the rules and should not be executed, and commit a value of `0` during the commit period.
5. UMA token holders reveal their votes during the reveal period.
6. After the reveal period, the settlement value is `0`. The Zodiac module receives the settlement value and deletes the invalid proposal.
7. Elon loses his bond and Alice receives her bond back and a portion of Elon's bond.

### Emergency Administrative Action
1. The DAO includes an emergency multi-sig that can override any proposal.
2. DAO member Alice has a great idea to steal all of the money in the treasury for herself and writes some Ethereum transactions that would execute her idea.
3. Alice holds a Snapshot vote during a holiday when people aren't paying attention and bribes enough voters to get majority approval.
4. Alice submits the proposal to the Zodiac module governing the Gnosis Safe and notes in the explanation that the proposal was approved on Snapshot and includes a link to the Snapshot results. Alice includes a bond with her proposal.
5. The signers on the emergency multi-sig are alerted in time and delete Alice's proposal.
6. The DAO votes on new rules that would prevent incidents like this in the future.

## Security considerations

### Ambiguity
Ambiguous or incomplete rules could put contracts using the `ZODIAC` identifier at risk of loss of funds. The rule that UMA voters should reject proposals that they are not certain follow the rules should help mitigate this.

### Complexity
Complex bundles of transactions may be difficult for a layperson voter to analyze, leading to reliance on statements made by experts in support of or against a proposal. The rule that UMA voters should reject proposals they are not certain about means that complex proposals that actually do follow the rules may be blocked for some time.

The DAO can resolve this issue by having alternative and less ambiguous mechanisms for expressing approval of complex proposals. For instance, the DAO's rules may state that a proposal whose transactions received XX% approval through a Snapshot vote, or were signed off on by 3 of 4 experts, should be approved.

This allows the DAO to establish straightforward rules for simple, routine, or non-controversial transactions that can be proposed by any address and understood by any neutral third party, like an UMA voter. This is much more efficient than putting those transactions through, for instance, a governance vote every time.

Complex proposals can be put through a more intensive process, like a Snapshot vote, that has an output that will be easy for a neutral third party to understand.

### Short Challenge Windows
If the rules set by a DAO are complex, or the funds in a Gnosis Safe are substantial, a short challenge window may be a security risk. They may wish to have full flexibility of an off-chain set of rules enforced by the Optimistic Oracle but also set guardrails on what transactions can be triggered according to certain criteria.

As an example, the DAO's rules may set limits on how much can be transferred out of a Gnosis Safe within a given window. Proposals that would result in greater than 5% of a Gnosis Safe's assets being transferred externally may require a 50% vote on Snapshot by tokenholders.

The rules may also add additional requirements for special transactions, like changing parameters in a smart contract system controlled by the Gnosis Safe. Those transactions may need to be proposed by a core team member and/or signed off by X-of-Y members of an expert committee. This allows experts and selected DAO members to check important transactions without fully trusting them (after all, they can be off-boarded by tokenholders through a change in the rules).

The reason to add these extra requirements for complex or potentially risky transactions is to make it easy for oracle observers to evaluate proposals within a short challenge window and dispute proposals that are obviously invalid.

The more important a transaction is, the more requirements the DAO may want to put into their rules around that transaction. That makes it more likely that a disputer will step in to block bad proposals with confidence that they will be backed up by UMA voters since some unambiguous requirement was not fulfilled.

### Continued Use of an Emergency Administrative Multi-Sig
In the long run, it should be possible to replace multi-sig control of a Gnosis Safe, with all governance actions going through the Optimistic Governor. While the Optimistic Governor is being implemented, however, and best practices around DAO rules are being established, it may be useful to retain a multi-sig as an emergency override mechanism.

This multi-sig can protect against failures caused by unclear or inadequate rules or by some issue with the Optimistic Governor itself. However, it is important to remember that the continued existence of an emergency multi-sig adds additional trust assumptions, and it is possible for rogue multi-sig signers to override actions that were approved through the DAO's stated governance system or the will of the DAO expressed through a SafeSnap vote.

Over time, the signing threshold for the emergency multi-sig can be increased to make it harder for the multi-sig to overrule the normal function of the Optimistic Governor, and eventually the multi-sig administrative powers can be dropped entirely.

### Poorly Formed Proposals
It is possible that transactions in a proposal may not match the intent of the proposer and may not be well understood by potential disputers. As a result, bad transactions may go through and result in loss of funds or accidents in smart contracts controlled by a Gnosis Safe.

This can be prevented by adding extra checks for complex proposals. Some examples are given in the "Short Challenge Windows" section above.

It may be worthwhile to add extra checks even for theoretically simple proposals, since mistakes can happen in simple proposals, too. As an example, token transfers may require a public signature from at least one member of a committee or core team, so they can take accountability for any errors in the transaction.

### Unclear, Incomplete, or Malformed Rules

If the initial rules set in the module are unclear, incomplete, or malformed, there may not be a clean way to upgrade to a new set of rules, since it may be unclear if a proposal to change the rules is valid or not according to the (bad) old rules.

It is important that the users of this identifier publish clear rules and that the rule change process, if any, be clearly specified.

If the rules explicitly specified in the module are broken, but the DAO or other user(s) of the identifier have signaled clearly somewhere else what rules should be followed and why the process of selecting those rules is valid, UMA voters should use their best judgment for whether or not to consider those rules to be valid and, if valid, whether or not a disputed proposal follows those rules.

This injection of UMA voter subjectivity into the system is messy and undesirable and should not be relied upon by users of this identifier. Poorly specified rules could result in disputed proposals and frozen governance for an indefinite period of time.

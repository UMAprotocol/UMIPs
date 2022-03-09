## Headers
- UMIP <#> 
- UMIP title: Add ZODIAC as a supported price identifier
- Author: John Shutt (john@umaproject.org)
- Status: DRAFT
- Created: March 7, 2022
- Discourse Link: TBD

## Summary (2-5 sentences)
The ZODIAC identifier is intended to be used with a [Zodiac module](https://gnosis.github.io/zodiac/docs/intro) that allows you to control a [Gnosis Safe](https://gnosis-safe.io/) according to a set of rules defined off-chain and enforced with UMA's [Optimistic Oracle](https://umaproject.org/optimistic-oracle.html). Unless the module contract has extra restrictions, any address can propose transactions that follow the rules and any address can dispute a proposal to UMA's Optimistic Oracle within a challenge window.

## Motivation
The ZODIAC identifier, coupled with the Optimistic Oracle Zodiac module, will allow for a new era of flexible "optimistic governance," where management of DAO treasuries and other multi-signature wallets can be managed more effectively, without being limited to X-of-Y signing schemes or tokenholder votes, although the Zodiac module can enforce those things, too.

To date, DAO governance has twisted itself to conform to the limitations of simplistic tools, instead of finding the best rules to coordinate around shared resources. The ZODIAC identifier allows a DAO to publish their rules in plain English with sufficient detail for a neutral third-party observer to determine whether transactions submitted to a Gnosis Safe follow the rules or not, and then have any address propose and execute transactions that follow those rules.

Because human voters can be brought in the loop to resolve disputes, this is an incredibly flexible and powerful form of DAO governance. Due to that flexibility, users of this identifier should be sure to make their rules as clear as possible, including the process for upgrading to a new set of rules.

## Technical Specification
The Zodiac module is in a draft state and currently being tested with a Gnosis Safe on Rinkeby. You can find the code on [GitHub](https://github.com/UMAprotocol/protocol/pull/3843/files).

Each Gnosis Safe will have its own Zodiac module contract which will store proposals made by external addresses. Each proposal is a bundle of transactions. See the structs defined below for technical detail.

```
struct Transaction {
    address to;
    uint256 value;
    bytes data;
}

struct Proposal {
    Transaction[] transactions;
    uint256 requestTime;
    bytes ancillaryData;
    bool status;
}
```

The module contract stores an array of `Proposal` objects and a string reference to an off-chain set of rules that have been publicly published, which may be an IPFS hash, a URI, or something else.

```
Proposal[] public proposals;
string public rules;
```

When a user creates a proposal, they submit an array of transactions along with optional ancillary data that explains the intent and purpose of the transactions, which is useful for voters trying to understand the transactions and whether or not they follow the published rules.

```
function proposeTransactions(Transaction[] memory transactions, bytes memory ancillaryData) public {
    ...
}
```

Each proposal has a unique ID, which is assigned in the transaction where a proposal is created. The ID is incremented by one with each new proposal.

```
uint256 id = proposals.length;
Proposal storage proposal = proposals[id];
```

After a proposal is created, an event is emitted which includes the proposal id, the proposer, and the current timestamp.

```
emit TransactionsProposed(id, proposer, time);
```

At the same time, a price request and price proposal are submitted to the Optimistic Oracle, including the timestamp, proposer, and ancillary data. These details are enough to find the event with the proposal ID.

```
optimisticOracle.requestAndProposePriceFor(
    identifier,
    uint32(time),
    ancillaryData,
    collateral,
    0,
    bond,
    liveness,
    proposer,
    // Canonical value representing "True"; i.e. the transactions are valid.
    int256(1e18)
);
```

The requester in the `RequestPrice` event will be the Zodiac module itself, where voters can find the `rules` identified in the Zodiac module.

### Ancillary Data Format

The `ancillaryData` submitted with proposals should consist of:

- `id`, which is automatically prepended to the ancillary data and used to find the proposal details in the module
- `rules`, which is a reference to the rules for the module, for example, an IPFS hash or a website URI
- `explanation`, which is written in natural language by the proposer and explains the nature of the transactions and how they follow the module's rules

`id:123,rules:QmTp2hEo8eXRp6wg7jXv1BLCMh5a4F3B7buAUZNZUu772j,explanation:These transactions were approved by the majority of tokenholders in a Snapshot vote on March 8, 2022.`

### Resolving Disputes

If a proposal is disputed, the disputer is encouraged to publish their reasoning in a public forum to assist UMA voters in their determination of whether or not the proposal was valid.

Voters should consider four sources of public information in their ruling:

1. The published rules for the Zodiac module.
2. The rationale given by the proposer in ancillary data.
3. The arguments presented by disputers.
4. The voter's understanding of what the transactions *actually* do, regardless of the stated rationale.

If a proposal follows the rules, an UMA voter should return a value of `1`.

If a proposal doesn't follow the rules, an UMA voter should return a value of `0`.

If a voter is unsure if a proposal follows the rules, an UMA voter should return a value of `0`.

If the rules are unclear or malformed, or the ancillary data is malformed, an UMA voter should return a value of `0`.

It is the responsibility of the DAO users of the `ZODIAC` identifier to write clear and unambiguous rules. If their rules are unclear, they should expect proposals that get disputed to be rejected by UMA's oracle.

It is important that the process for changing the rules be particularly clear and unambiguous, if a rule change process is allowed by the DAO. This allows the DAO to add, remove, or clarify rules as needed, analogous to a constitutional amendment.

### Important Special Case: Rule Changes

It is possible for a bad proposal to be made that technically follows the published rules, either by a malicious actor or due to an oversight or mistake. It is also possible for the rules in a Zodiac module to be changed via the existing governance process.

As a failsafe mechanism, it should be allowed for a DAO to change their rules in response to malicious proposals, and in those cases the new rules should be considered the official rules by UMA voters, and disputed proposals should be rejected if they violate the old rules, even if they technically followed the rules at the time of the original proposal.

It's easiest to understand this by example.

Let us consider a Magicland DAO with two rules in their published rules document:

```
1. The treasurer is allowed to move money from the treasury at their discretion for the good of the DAO.
2. The rules can be changed by a Snapshot vote where more than 50% of the token supply votes to change the rules.
```

As it turns out, the Magicland treasurer is revealed to be a serial scam artist and proposes to move 10,000 ETH from the Magicland treasury to Tornado Cash through their own wallet address.

DAO members, understandably concerned, dispute that proposal, and more than 50% of the token supply votes on Snapshot to change to new rules:

```
1. Any proposals from the former treasurer's address, 0xabc...123, are invalid and should be rejected.
2. The rules can be changed by a Snapshot vote where more than 50% of the token supply votes to change the rules.
```

The former treasurer disputes the rules change since it would prevent them from stealing money from the treasury.

The UMA voters must now consider two disputed proposal: The treasurer's proposal to move the treasury's funds to Tornado Cash and the proposal to change the rules to block the treasurer, which was approved by a majority vote on Snapshot.

The voters must consider and potentially execute the rules change proposal FIRST, even though the treasurer's proposal came earlier.

Since the majority of tokens voted in favor of the rules change on Snapshot, the UMA voters must return a value of `1` indicating that the rules change is valid.

And, importantly, they must apply the new rules *retroactively* to the treasurer's proposal, and return a value of `0` indicating that the treasurer's proposal is invalid, even though the proposal was made before the rules were changed.

This failsafe mechanism allows a DAO to change their rules when they identify a loophole or need to off-board contributors who previously had some measure of trust and personal discretion in spending DAO funds.

See also: Rule Change Race Conditions, below, in `Security considerations`.

## Rationale
It is impossible to capture every form of human organization in rigid programmatic structures. Without a flexible, natural language based system for outlining rules of operation, and a trustless and decentralized mechanism for enforcing those rules, DAOs can only exist in a stunted form, like an oak tree growing in a pot with no space for deep roots.

This UMIP and the associated module code brings the flexibility of law to smart contracts, with UMA voters serving as judge and jury in case of disputes. Unlike the tradition of common law, however, UMA voters do not attempt to create precedent for ambiguous cases, resolve controversy, or fill in the gaps. If there is ambiguity about whether a particular proposal follows the rules, it is simply rejected.

The onus is on the DAO to write clear rules and on the proposer to ensure their transactions follow the rules, with no room for ambiguity by a neutral third-party observer.

This methodology allows for a huge amount of flexibility for DAOs to manage their shared resources without requiring UMA voters to make subjective judgements, which would be difficult for voters and could potentially create unpredictable and undesirable results for DAOs.

## Implementation
The implementation of the Zodiac module is currently in a draft state [viewable here](https://github.com/UMAprotocol/protocol/pull/3843/files).

TODO: Script that can decode transactions for voters.

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
4. Alice submits the proposal to the Zodiac module governing the Gnosis Safe and notes in the ancillary data that the proposal was approved on Snapshot and includes a link to the Snapshot results. Alice includes a bond with her proposal.
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

## Security considerations

### Ambiguity
Ambiguous or incomplete rules could put contracts using the `ZODIAC` identifier at risk of loss of funds. The rule that UMA voters should reject proposals that they are not certain follow the rules should help mitigate this.

### Complexity
Complex bundles of transactions may be difficult for a layman voter to analyze, leading to reliance on statements made by experts in support of or against a proposal. The rule that UMA voters should reject proposals they are not certain about means that complex proposals that actually do follow the rules may be blocked for some time.

The DAO can resolve this issue by having alternative and less ambiguous mechanisms for expressing approval of complex proposals. For instance, the DAO's rules may state that a proposal whose transactions received XX% approval through a Snapshot vote, or were signed off on by 3 of 4 experts, should be approved.

This allows the DAO to establish straightforward rules for simple, routine, or non-controversial transactions that can be proposed by any address and understood by any neutral third party, like an UMA voter. This is much more efficient than putting those transactions through, for instance, a governance vote every time.

Complex proposals can be put through a more intensive process, like a Snapshot vote, that has an output that will be easy for a neutral third party to understand.

### Short Challenge Windows
If the rules set by a DAO are complex, or the funds in a Gnosis Safe are substantial, a short challenge window may be a security risk. They may wish to have full flexibility of an off-chain set of rules enforced by the Optimistic Oracle but also set guardrails on what transactions can be triggered according to certain criteria.

As an example, the DAO's rules may set limits on how much can be transferred out of a Gnosis Safe within a given window. Proposals that would result in greater than 5% of a Gnosis Safe's assets being transferred externally may require a 50% vote on Snapshot by tokenholders.

The rules may also add additional requirements for special transactions, like changing parameters in a smart contract system controlled by the Gnosis Safe. Those transactions may need to be proposed by a core team member and/or signed off by X-of-Y members of an expert committee. This allows experts and selected DAO members to check important transactions without fully trusting them (after all, they can be off-boarded by tokenholders through a change in the rules).

The reason to add these extra requirements for complex or potentially risky transactions is to make it easy for oracle observers to evaluate proposals within a short challenge window and dispute proposals that are obviously invalid.

The more important a transaction is, the more requirements the DAO may want to put into their rules around that transaction. That makes it more likely that a disputer will step in to block bad proposals with confidence that they will be backed up by UMA voters since some unambiguous requirement was not fulfilled.

### Rule Change Race Conditions
A clever exploiter (see: Important Special Case) who identifies a loophole may submit a proposal shortly before the start of a new UMA voting cycle, with the expectation that their proposal will be disputed quickly and voted on in the next UMA voting cycle but a change in rules will not be made in time to block their malicious proposal.

Ideally, the rules will include enough checks and balances to prevent this scenario from happening. There is a great deal of responsibility on the DAO to write safe and effective rules.

But if they fail to do so and a malicious transaction comes through right before an UMA voting cycle, the DAO should consider having an extra failsafe that allows for rapid rule changes through some mechanism outside of UMA's oracle.

For example, the rules may specify that they will "shut down" and become invalid if 50% of voters in an emergency Snapshot poll, or 3-of-5 signers on some committee, vote to invalidate them. In that scenario, UMA voters will check if the shutdown condition was triggered when evaluating a proposal.

### Poorly Formed Proposals
It is possible that transactions in a proposal may not match the intent of the proposer and may not be well understood by potential disputers. As a result, bad transactions may go through and result in loss of funds or accidents in smart contracts controlled by a Gnosis Safe.

This can be prevented by adding extra checks for complex proposals. Some examples are given in the "Short Challenge Windows" section above.

It may be worthwhile to add extra checks even for theoretically simple proposals, since mistakes can happen in simple proposals, too. As an example, token transfers may require a public signature from at least one member of a committee or core team, so they can take accountability for any errors in the transaction.

### Unclear, Incomplete, or Malformed Rules

If the initial rules set in the module are unclear, incomplete, or malformed, there may not be a clean way to upgrade to a new set of rules, since it may be unclear if a proposal to change the rules is valid or not according to the (bad) old rules.

It is important that the users of this identifier publish clear rules and that the rule change process, if any, be clearly specified.

If the rules explicitly specified in the module are broken, but the DAO or other user(s) of the identifier have signaled clearly somewhere else what rules should be followed and why the process of selecting those rules is valid, UMA voters should use their best judgment for whether or not to consider those rules to be valid and, if valid, whether or not a disputed proposal follows those rules.

This injection of UMA voter subjectivity into the system is messy and undesirable and should not be relied upon by users of this identifier. Poorly specified rules could result in disputed proposals and frozen governance for an indefinite period of time.
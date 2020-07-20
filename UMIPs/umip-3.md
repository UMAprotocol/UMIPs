## Headers
UMIP 3

UMIP title: Upgrade DVM

Author: Matt Rice (matt@umaproject.org), Prasad Tare (prasad@umaproject.org), Chris Maree (chris@umaproject.org), Nick Pai (nick@umaproject.org), Regina Cai (regina@umaproject.org)

Status: Approved

Created: April 21, 2020

## Summary
This UMIP reflects upgrades to the DVM that address issues raised by the OpenZeppelin audit as well as other minor code changes since the first deployment including expiring voting rewards. 

It covers 101 pull requests that have already been made to the UMA [protocol repo](https://github.com/UMAprotocol/protocol).

If this UMIP is approved, the code that incorporates these merged pull requests will be deployed to mainnet and become the canonical UMA DVM. 

## Motivation

The OpenZeppelin audit flagged a number of vulnerabilities that are addressed in this UMIP.

The audit will be included in this UMIP when available. 

The UMA team also added some modifications to improve code-readability, security, speed, and flexibility.

## Technical Specification

The following 101 commits in the [protocol](https://github.com/UMAprotocol/protocol) encapsulate all the updates:

ff4463a Update prettier-plugin-solidity (#1294)

c7530e8 Update Umip3Upgrader.sol (#1288)

ef7d1b8 [P1-N06] Small formatting corrections to DVM (#1271)

d451ce8 Move salt reuse warnings to commitVote, change language (#1276)

4355ec3 Change parameter name in Voting events for consistency (#1275)

dd20eec warn users against re-using salts (#1273)

819e0e8 clarify initial roundID not starting at 0/1 (#1272)

661441a Add starting id to governor constructor (#1267)

0e5ddd0 [P1-N12] Add NatSpec comments to remaining external DVM methods (#1270)

a014cfe revert Finder changes (#1269)

4b8850f Script to implement the upcoming UMIP-3 DVM upgrade (#1265)

15bb988 [P1-L22] initialize fee percentages in Store constructor (#1256)

f21afb0 [P1-L04] Update require messages (#1259)

ee52c97 Add events to MultiRole contract (#1262)

79c3201 [P1-L18] Pin @openzeppelin dependency to fixed version: v3.0.0-rc.1 (#1254)

83299ce [P1-L03] MultiRole roles can be renounced (#1247)

b1b23f6 [P1-L19] Explicitly pass in amount of ERC20 to pay as fees (#1255)

98df559 [P1-N09] Only return named variables (#1229)

a051f7c [P1-N07] Contract naming updates (#1227)

da2c224 [P1-N14] Test and document late fee behavior (#1251)

927acef Only reference IdentifierWhitelist from Finder (#1246)

c01e88a [P1-N02] Remove TODOs (#1250)

0f1b30b [P1-M01] Separate round snapshot function (#1238)

0f5537d [P1-L15] Prevent Governor proposals with data from being sent t… (#1242)

b05d0cc [P1-L05] Centralized defined interface storage library (#1241)

f924877 [P1-N15] Remove EncryptedStore and emit an extra event instead (#1231)

df60d6d [P1-L01] Compute late penalty based on current time rather than endTime (#1237)

e9b234f [P1-N08] Converge upon single source of time for all contracts in testing environments (#1236)

0bd5fbc [P1-L08] Add input validation throughout DVM (#1212)

5711c55 [P1-L09] Suppress reward events if user already retrieved or didn't vote (#1240)

46a0e3a [P1-N03] Replace all uint with uint256 (#1230)

50a88a3 [P1-H01] Require additional data in vote commit hash to prevent duplication of votes (#1217)

84b6f3a [P1-L16] Use SafeMath to add uints for rewards expiration time (#1235)

bc3c2f2 [P1-L12] Address a number of erroneous comments through the DVM (#1213)

5e33a7e [P1-L10] Replace transfer with sendValue (#1225)

9fb69b5 [P1-L13] Add onlyValidRole to setWithdrawRole (#1226)

0489477 [P1-N11] Remove hard-coded condition statement in require (#1228)

148aef6 [P1-L14] Add events to store state fee update (#1214)

f32346d [P1-L02] Prevent EOAs from registering in the finder (#1210)

4396acd [P1-M02] Test and document the bytes32 manipulation in Governor.sol (#1204)

cd5b26a [P1-L11] Correct element deletion in pendingPriceRequests array (#1207)

bb6600f [P1-N13] Remove redundant inheritance of MultiRole (#1203)

a8a9e21 [P1-N05] Use SafeERC20 in Withdrawable and Store (#1205)

c2074f9 [P1-N04] Fix typos (#1206)

766b345 [P1-M04] Refactor registry to prevent multiple address registra… (#1194)

41086df [P1-H03] Prevent re-entrancy on Governor executeProposal (#1200)

0058016 [P1-N16] Mark contracts not meant to be instantiated as `abstract` (#1201)

8d866f8 [P1-H02] Add ability for Governor to execute payable proposed transactions (#1191)

7e87c40 Non standard ERC20 PricelessPositionManager.sol tests (#1159)

f3ee036 Add Uniswap interface and mock (#1133)

bec24e3 Implement ability to partially liquidate a position (#1005)

0a4ae0a add collateral token whitelist to EMP creator (#1022)

9d403dd Change `derivative` to `contract` in the DVM (#1016)

70821e0 Upgrade to Solidity 0.6 (#970)

c3769fd Dvm Natspec and cleanup (#963)

9bfc1a2 TokenMigrator: Prevent rate == 0 (#996)

15b5250 Encrypted store (#994)

ac7d777 init (#998)

b1e8518 make pricerequest contract data private (#995)

8cd9c41 Move contract creation to multi party factory (#961)

3e3d742 merge `SyntheticToken` and `VotingToken` tokens in common implementation (#967)

2bdc746 Replace underscores ("_") in directory names with hyphens ("-") (#943)

279e916 Fix rounding errors in ExpiringMultiparty (#935)

ba870f8 init (#936)

caee497 Add methods to `VotingInterface` to eliminate imports of `Voting` (#933)

081a2cb Refactor Liquidatable withdraw (#927)

5f4595c Add Final fees to Liquidatable (#920)

90a3397 Add Final fees to PricelessPositionManager (#915)

762ac66 Add param to createLiquidation

12e6449 Token is TokenInterface (#931)

257551a Separate finder into interface and implementation (#928)

e374e9a FixedPoint new functions: add mulCeil, divCeil, isGreaterThanOrEqual, isEqual(Unsigned, unint), and isLessThanOrEqual (#907)

d3fc564 PricelessPositionManager to use Token factory to create new Synthetic Token Contracts (#923)

3ca2b66 Refactor VotingInterface from importing an implementation contract (#919)

b845456 Fix repeated withdrawal bug (#893)

7cc00a2 Replace code inside function modifiers with single-line call to internal method (#921)

2a9f2fb Use Safe ERC20 (#906)

d9efcba public -> external to save bytecode (#908)

cc54a29 Make declarations in liquidatable explicit (#918)

b89d9bd Refactor _get[interface] functions (#917)

e18ece5 Move ExpandedIERC20 and TestnetERC20 to common/ (#916)

15172e4 Removed require messages (#912)

1b3e55e Separate smart contracts into several directories (#899)

62b54eb Add fees to PricelessPositionManager (#869)

3751b15 Update `liquidatable` `disputeTime` to use `LiquidationTime` (#898)

af49c53 NFCT cleanup test refactor (#886)

3197993 Expire rewards after a certain time (#889)

7139711 Minor Liquidatable refactor (#881)

36daa0c Integrate the DVM into the NFCT (#855)

cabb203 Registry contract refactor (#834)

05ab535 MVP of Multi-party, expiring, financial template minus connection to DVM and redemption & withdrawals at position expiry (#837)

6184de0 Add getPriceRequestStatuses view method (#838)

469fd09 Improve contract viewability (#832)

b867c9d Run prettier over IdentiferWhitelist contracts (#825)

ec7da67 Uniform inflation rate handeling (#822)

072392f Refactor Voting supportedIdentifier struct and methods (#819)

f0eda85 Vote timing refactor (#821)

5ecebb0 Move to using prettier for Solidity formatting (#818)

5f7342b Remove unnecessary return value from OracleInterface method "requestPrice" (#817)

01b6dee Updated contract requires to decrease byte size (#816)

011f24f Make RewardsRetrieved event more consistent (#806)

## Rationale
Please see the individual PRs for the rationale behind each PR. 

## Implementation
Please see the individual PRs for implementation details.

This UMIP is implemented in proposal `Admin 1`. Voting will begin on Sunday, April 26th at midnight UTC.

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. 

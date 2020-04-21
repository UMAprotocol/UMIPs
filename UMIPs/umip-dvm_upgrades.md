## Headers
UMIP <#>
UMIP title: Upgrade DVM
Author: Matt Rice (matt@umaproject.org), Prasad Tare (prasad@umaproject.org), Chris Maree (chris@umaproject.org), Nick Pai (nick@umaproject.org), Regina Cai (regina@umaproject.org)
Status: Draft
Created: April 21, 2020

## Summary
This UMIP reflects upgrades to the DVM that address issues raised by the OpenZeppelin audit as well as other minor code changes since the first deployment including expiring voting rewards. 
It covers 55 pull requests that have already been made to the UMA [protocol repo](https://github.com/UMAprotocol/protocol). 
If this UMIP is approved, the code that incorporates these merged pull requests will be deployed to mainnet and become the canonical UMA DVM. 

## Motivation
The OpenZeppelin audit flagged a number of vulnerabilities that are addressed in this UMIP. 
The audit will be included in this UMIP when available. 
The UMA team also added some modifications prior to the audit to improve code-readability, security, speed, and flexibility.

## Technical Specification
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

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. 

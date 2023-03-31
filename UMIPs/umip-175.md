## Headers

| UMIP-175   |                                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| UMIP Title | Revoke minter role for depreciated contracts                                           |
| Authors    | Reinis Martinsons (reinis@umaproject.org)                                              |
| Status     | Draft                                                                                  |
| Created    | March 31, 2023                                                                         |
| Discussion | [Discourse]()                 |

## Summary

This UMIP proposes to revoke UMA token minter role for depreciated voting contracts.

## Motivation & Rationale

During each of DVM upgrades the new voting contracts got granted minter role for the UMA voting token while the previous
 contracts privileges were not revoked. Even though the minter role is only used to claim rewards, it is still
 considered a good security practice to revoke the minter role for depreciated contracts in order to reduce potential
 attack surface.

The only contracts that should retain the minter role are the current VotingV2 contract and the one that was used before
 the recent DVM upgrade so that any users with unclaimed rewards can still claim them.

## Implementation & Technical Specification

This UMIP proposes a governance transaction that calls `removeMember(uint256 roleId, address memberToRemove)` method of
 the [UMA Voting Token contract](https://etherscan.io/address/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828)
 with `roleId` set to `1` (`Roles.Minter`) and `memberToRemove` set to the following addresses in multiple transactions:
- `0xFe3C4F1ec9f5df918D42Ef7Ed3fBA81CC0086c5F`: Initial Voting contract.
- `0x9921810C710E7c3f7A7C6831e30929f19537a545`: Voting contract approved in [UMIP-3](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-3.md).
- `0x1d847fB6e04437151736a53F09b6E49713A52aad`: Voting contract approved in [UMIP-15](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-15.md).


## Security considerations

Removing the minter role for depreciated contracts reduces potential attack surface and is considered a good security
 practice.
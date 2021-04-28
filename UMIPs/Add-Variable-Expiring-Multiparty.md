## Headers
- UMIP <#> 
- UMIP title: Add Variable Expiring Multiparty financial contract template
- Author: Prelaunch Team, dev@prelaunch.finance
- Status: Draft
- Created: April 14, 2021
- Discourse Link: TBA (Pending)

## Summary (2-5 sentences)
Due to necessity and after discussing with the UMA team, their ExpiringMultiParty contract was modified to support variable expiration from an application specific authorized DAO address. Other projects such as Synthereum have needed a custom solution for this use case in the past. This financial contract template will be available for any projects on UMA to use. The contract that was modified is `PricelessPositionManager.sol`.

## Motivation
The current implementation of the ExpiringMultiParty (EMP) contract accepts a fixed expiration at the time of creation, which cannot be modified. In our use case, we needed the Prelaunch DAO to be able to expire the contract at a specific unknown future time in response to unpredictable events and factors. With the Variable EMP contract proposed, the Prelaunch DAO will be able to expire the contract at a final price after a vote of token holders votes favorably. As a backup, the contract will still expire at the expiration time set at creation. 

## Technical Specification
The main contract that was modified is `PricelessPositionManager.sol`.

First, on line 92, we add a new variable:

    address externalVariableExpirationDAOAddress;

This address represents the governance contract or address that has authority to expire the contract. On deployment it will be passed in and set in the constructor function on lines 182 and 192.

From lines 644 to 656 we have the function:

  

    function variableExpiration(uint256 settlementPrice) external override onlyPreExpiration() onlyOpenState() nonReentrant() {
    	    
    	    require(msg.sender == _getFinancialContractsAdminAddress() || msg.sender == externalVariableExpirationDAOAddress, 'Caller must be the authorized DAO or the UMA governor');
    	    
    	    contractState = ContractState.ExpiredPriceReceived;
    	    
    	    // Expiratory time now becomes the current time (variable shutdown time).
    	    
    	    // Price received at this time stamp. `settleExpired` can now withdraw at this timestamp.
    	    
    	    uint256 oldExpirationTimestamp = expirationTimestamp;
    	    
    	    expirationTimestamp = getCurrentTime();
    	    
    	    //instead of requesting the oracle price, we set the price as provided by the DAO vote.
    	    
    	    expiryPrice = FixedPoint.Unsigned(settlementPrice);
    	    
    	    emit VariableExpiration(msg.sender, oldExpirationTimestamp, expirationTimestamp);
    }
       
This function is based on the `emergencyShutdown` function located directly below it. In addition to being accessible by the UMA governor, this function is also accessible by the predefined DAO governance contract. The `settlementPrice` parameter has a maximum of 18 decimals places, and value should be multiplied by 10^18 before being sent to the contract. We also add a new event, `VariableExpiration`, which is defined on line 119.

For security purposes in case a vulnerability is discovered with the DAO contract, we include an emergency update function on lines 631 to 636:

    function emergencyUpdateDAOAddress(address DAOAddress) external {
    
	    require(msg.sender == _getFinancialContractsAdminAddress() || msg.sender == externalVariableExpirationDAOAddress, 'Caller must be the authorized DAO or the UMA governor');
	    
	    updateTimestamp = getCurrentTime();
	    
	    EmergencyUpdateDAOAddress(externalVariableExpirationDAOAddress, DAOAddress, updateTimestamp)
	    
	    externalVariableExpirationDAOAddress = DAOAddress;
	    
    }

This function can be called by the UMA governor or the DAO contract if there is a vulnerability or technical problem discovered in the DAO contract. Calling this function successfully will emit the `EmergencyUpdateDAOAddress` event as defined on line 120.

In `Liquidatable.sol`, on line 70 we define:
   address externalVariableExpirationDAOAddress;
    
and in the constructor pass it on line 188:
    params.externalVariableExpirationDAOAddress
    
Similarly, in `ExpiringMultiPartyCreator.sol`, on line 44 we define:
    address externalVariableExpirationDAOAddress;

And on line 137 it is set:
    constructorParams.externalVariableExpirationDAOAddress = params.externalVariableExpirationDAOAddress;

## Rationale
Prelaunch finance is a platform for prelaunch synthetic assets. These assets need to expire shortly after they go live on the market, however the exact dates are always up in the air and often delayed or changed. Therefore we designed this implementation to have a smooth way of expiring prelaunch synthetic assets at the right time and price.

An alternative design where the expiration would be set via UMA vote was considered. We decided to use an application specific governance model to support a wider variety of situations and reduce the burden on UMA voters. 

## Implementation
The code is available here: https://github.com/PrelaunchFinance/VEMP/tree/main/contracts

## Security considerations
Less than 50 lines of code were added. Therefore the potential surface area for an exploit is low, particularly as we receive feedback from the community and UMA team. However, we may pursue an audit in the future.

Per feedback from the UMA team we decided to use the Optimistic Oracle for the final price determination, so that the third party DAO address only has the authority to expire the contract but not determine the expiry price.

We included the `emergencyUpdateDAOAddress` to minimize potential issues with the application specific external DAO contract. However, the security of that contract is paramount as a maximum potential exploit could result in loss of funds for users of the particular application. 

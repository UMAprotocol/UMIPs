## Headers
- UMIP <#> 
- UMIP title: Add Variable Expiring MultiParty (VEMP) financial contract template
- Author: Prelaunch Team, dev@prelaunch.finance
- Status: Draft
- Created: April 14, 2021
- Discourse Link: https://discourse.umaproject.org/t/add-variable-expiring-multiparty-financial-contract-template/883

## Summary (2-5 sentences)
Due to necessity and after discussing with the UMA team, their ExpiringMultiParty contract was modified to support variable expiration from an application specific authorized DAO address. Other projects such as Synthereum have needed a custom solution for this use case in the past. This financial contract template will be available for any projects on UMA to use. The main contract that was modified is PricelessPositionManager.sol.

## Motivation
The current implementation of the ExpiringMultiParty (EMP) contract accepts a fixed expiration at the time of creation, which cannot be modified. In our use case, we needed the Prelaunch DAO to be able to expire the contract at a specific unknown future time in response to unpredictable events and factors. With the Variable EMP contract proposed, the Prelaunch DAO will be able to expire the contract at a final price after a vote of token holders votes favorably. As a backup, the contract will still expire at the expiration time set at creation. 

## Technical Specification
The main contract that was modified is PricelessPositionManager.sol, Available here: https://github.com/PrelaunchFinance/VEMP/blob/main/contracts/PricelessPositionManager.sol

The diff files showing the modifications of all files compared to the EMP contract can be found here: https://github.com/PrelaunchFinance/VEMP/tree/main/diffs
      
Here we add an update timestanp to represent when the DAO address was last changed.

    @@ -71,6 +72,8 @@ contract PricelessPositionManager is FeePayer {
         bytes32 public priceIdentifier;
         // Time that this contract expires. Should not change post-construction unless an emergency shutdown occurs.
         uint256 public expirationTimestamp;
    +    // Time that the expiration DAO last changed
    +    uint256 public updateTimestamp;
         // Time that has to elapse for a withdrawal request to be considered passed, if no liquidations occur.
         // !!Note: The lower the withdrawal liveness value, the more risk incurred by the contract.
         //       Extremely low liveness values increase the chance that opportunistic invalid withdrawal requests
         
This address represents the governance contract or address that has authority to expire the contract.

    @@ -88,6 +91,9 @@ contract PricelessPositionManager is FeePayer {
         // the functionality of the EMP to support a wider range of financial products.
         FinancialProductLibrary public financialProductLibrary;
     
    +    // address for the DAO which will have authority to expire the contract
    +    address externalVariableExpirationDAOAddress;
    +
         /****************************************
          *                EVENTS                *
          ****************************************/
          
Adding events to log setting the variable expiration and updating the DAO address.

    @@ -112,6 +118,8 @@ contract PricelessPositionManager is FeePayer {
             uint256 indexed tokensBurned
         );
         event EmergencyShutdown(address indexed caller, uint256 originalExpirationTimestamp, uint256 shutdownTimestamp);
    +    event VariableExpiration(address indexed caller, uint256 originalExpirationTimestamp, uint256 shutdownTimestamp);
    +    event UpdateDAOAddress(address indexed previousAddress, address indexed newAddress, uint256 updateTimestamp);
     
         /****************************************
          *               MODIFIERS              *


Variable to store the authenticated DAO address.

    @@ -172,7 +180,8 @@ contract PricelessPositionManager is FeePayer {
             bytes32 _priceIdentifier,
             FixedPoint.Unsigned memory _minSponsorTokens,
             address _timerAddress,
    -        address _financialProductLibraryAddress
    +        address _financialProductLibraryAddress,
    +        address _externalVariableExpirationDAOAddress
         ) FeePayer(_collateralAddress, _finderAddress, _timerAddress) nonReentrant() {
             require(_expirationTimestamp > getCurrentTime());
             require(_getIdentifierWhitelist().isIdentifierSupported(_priceIdentifier));
             
Initializing the DAO address in the constructor function.

    @@ -182,6 +191,7 @@ contract PricelessPositionManager is FeePayer {
             tokenCurrency = ExpandedIERC20(_tokenAddress);
             minSponsorTokens = _minSponsorTokens;
             priceIdentifier = _priceIdentifier;
    +        externalVariableExpirationDAOAddress = _externalVariableExpirationDAOAddress;
     
             // Initialize the financialProductLibrary at the provided address.
             financialProductLibrary = FinancialProductLibrary(_financialProductLibraryAddress);
             
Add function to update DAO address as needed. Can only be called by UMA governor or existing DAO address.

    @@ -615,6 +625,37 @@ contract PricelessPositionManager is FeePayer {
             emit ContractExpired(msg.sender);
         }
     
    +    /**
    +     * @notice Update DAO address
    +     * @dev Only the governor or authorized DAO can call this function.
    +     * The new DAOAddress will be authorized to expire the contract, and the old address will be deauthorized.
    +     */
    +    function updateDAOAddress(address DAOAddress) public {
    +        require(msg.sender == _getFinancialContractsAdminAddress() || msg.sender == externalVariableExpirationDAOAddress, 'Caller must be the authorized DAO or the UMA governor');
    +        updateTimestamp = getCurrentTime();
    +        emit UpdateDAOAddress(externalVariableExpirationDAOAddress, DAOAddress, updateTimestamp);
    +        externalVariableExpirationDAOAddress = DAOAddress;
    +    }
  
  Add the function to expire the contract at a variable time. This function is based on the emergencyShutdown function below it. The authorized DAO can execute this function. The price will be provided by the UMA oracle.
  
    +    /**
    +     * @notice Variable contract expiration under pre-defined circumstances.
    +     * @dev Only the governor or authorized DAO can call this function.
    +     * Upon variable shutdown, the contract settlement time is set to the shutdown time. This enables withdrawal
    +     * to occur via the standard `settleExpired` function.
    +     */
    +    function variableExpiration() external onlyPreExpiration() onlyOpenState() nonReentrant() {
    +        require(msg.sender == _getFinancialContractsAdminAddress() || msg.sender == externalVariableExpirationDAOAddress, 'Caller must be the authorized DAO or the UMA governor');
    +
    +        contractState = ContractState.ExpiredPriceRequested;
    +        // Expiration time now becomes the current time (variable shutdown time).
    +        // Price received at this time stamp. `settleExpired` can now withdraw at this timestamp.
    +        uint256 oldExpirationTimestamp = expirationTimestamp;
    +        expirationTimestamp = getCurrentTime();
    +        _requestOraclePriceExpiration(expirationTimestamp);
    +
    +        emit VariableExpiration(msg.sender, oldExpirationTimestamp, expirationTimestamp);
    +    }
    +
         /**
          * @notice Premature contract settlement under emergency circumstances.
          * @dev Only the governor can call this function as they are permissioned within the `FinancialContractAdmin`.


## Rationale
Prelaunch finance is a platform for prelaunch synthetic assets. These assets need to expire shortly after they go live on the market, however the exact dates are always up in the air and often delayed or changed. Therefore we designed this implementation to have a smooth way of expiring prelaunch synthetic assets at the right time and price.

An alternative design where the expiration would be set via UMA vote was considered. We decided to use an application specific governance model to support a wider variety of situations and reduce the burden on UMA voters. 

## Implementation
The code is available here: https://github.com/PrelaunchFinance/VEMP/tree/main/contracts

Main net contracts:

VariableExpiringMultiPartyCreator: https://etherscan.io/address/0x0548BA0cF38F8e5600b18C4153a89e0E05239647#contracts 
VariableExpiringMultiPartyLib: https://etherscan.io/address/0x7e8C45219463e372B3eE216523830cAD0bA92DA8#contracts

## Security considerations
Few lines of code were added. Therefore the potential surface area for an exploit is low, particularly as we receive feedback from the community and UMA team. However, we may pursue an audit in the future.

Per feedback from the UMA team we decided to use the Optimistic Oracle for the final price determination, so that the third party DAO address only has the authority to expire the contract but not determine the expiry price.

We included the updateDAOAddress function to minimize potential issues with the application specific external DAO contract. However, the security of the DAO is important as the VEMP contract could be prematurely or belatedly expired. 

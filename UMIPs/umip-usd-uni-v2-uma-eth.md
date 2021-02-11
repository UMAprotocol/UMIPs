## Headers
| UMIP-usd-uni-v2-uma-eth-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD-UNI-V2-UMA-ETH as a price identifier              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 10, 2021           |
| Discourse Link | [Link](https://discourse.umaproject.org/t/add-usd-uniswap-v2-uma-eth-price-identifier/208)  |

## Summary

The DVM should support price requests for Uniswap V2 UMA-ETH LP tokens.

## Motivation

The DVM currently does not support Uniswap V2 UMA-ETH LP tokens.

By enabling USD-UNI-V2-UMA-ETH as a price identifier, UMA will allow Uniswap V2 UMA-ETH LP tokens to be used as collateral for minting synthetic tokens.

The LP Dollar team will use the USD-UNI-V2-UMA-ETH price identifier to enable fixed borrowing costs for Uniswap V2 UMA-ETH liquidity providers.

## Data Sources & Price Feed Implementation

| Uniswap V2 UMA-ETH   |                                                                                                 |
|------------|------------------------------------------------------------------------------------------------------------------- |
| Contract Address | [0x88D97d199b9ED37C29D846d00D443De980832a22](https://etherscan.io/address/0x88D97d199b9ED37C29D846d00D443De980832a22) |
| Decimals | 18 |
| Token0 Symbol  | UMA  |
| Token0 Address  | 0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828                                                                  |
| Token0 Decimals  | 18                                                                  |
| Token1 Symbol  | WETH  |
| Token1  | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2                                                                   |
| Token1 Decimals  | 18                                                                  |

1) First, the Uniswap V2 UMA-ETH contract must be queried to get the total reserve balances in the pool. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).    
  
     Fetching total reserves balances via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0x88d97d199b9ed37c29d846d00d443de980832a22",  
        block: {number: 11824935}
      ) {
          id
          reserve0
          reserve1
        }
     }
     ```
     
     JSON Response
     ``` json
     {
       "data": {
         "pair": {
           "id": "0x88d97d199b9ed37c29d846d00d443de980832a22",
           "reserve0": "82869.968529556752869482",
           "reserve1": "1350.358508316793260065"
         }
       }
     }
     ```
     
     Fetching total reserve balances via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0x88D97d199b9ED37C29D846d00D443De980832a22");
     let reserves = await pair.methods.getReserves().call({}, 11824935);
     ```
     
     web3.js Response Object
     ```
     Result {
      '0': '82869968529556752869482',
      '1': '1350358508316793260065',
      '2': '1612905123',
      reserve0: '82869968529556752869482',
      reserve1: '1350358508316793260065',
      blockTimestampLast: '1612905123' }
    ```
    
2) Second, the total supply of LP tokens must be queried. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).

     Fetching total supply via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0x88d97d199b9ed37c29d846d00d443de980832a22",  
        block: {number: 11824935}
      ) {
          id
          totalSupply
        }
     }
     ```
     
     JSON Response
     ``` json
     {
       "data": {
         "pair": {
           "id": "0x88d97d199b9ed37c29d846d00d443de980832a22",
           "totalSupply": "8925.567938786896587578"
         }
       }
     }
     ```
     
     Fetching total supply via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0x88D97d199b9ED37C29D846d00D443De980832a22");
     let totalSupply = await pair.methods.totalSupply().call({}, 11824935);
     ```
     
     web3.js Response
     ```
     8925567938786896588578
     ```

3) Third, the ETHUSD price must be queried and used to calculate the USD value of the WETH reserves. 

    The methodology to query the price of ETHUSD is similar to [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md), with a different exchange list and decimal precision.  

    Base Currency: ETH  
    Quote Currency: USD  

    Exchanges: Coinbase Pro (ETH:USD), Kraken (ETH:USD), Bitfinex (ETH:USD), Bitstamp (ETH:USD)  
    Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.  
    Price Steps: 0.01 (2 decimals in more general trading format)  
    Rounding: Closest, 0.5 up  
    Pricing Interval: 60 seconds  
    Dispute timestamp rounding: down
    
    After finding the median ETH:USD price, calculate the USD value of the WETH reserves.
    
    Example calculation with Median ETH:USD = 1716.12:
    
    ```
    USD value of WETH reserves = WETH in reserves * WETH:USD = 
    
    = 1350.358508316793260065 * 1716.12 
    
    = 2317377.2432926153
    ```
    
4) Fourth, the UMA:USD price must be queried and used to calculate the USD value of the UMA reserves.  

    Base Currency: UMA  
    Quote Currency: USD  

    Exchanges: Coinbase Pro (UMA:USD), Binance (UMA:USDT), OKEx (UMA:USDT)
    Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.  
    Price Steps: 0.01 (2 decimals in more general trading format)  
    Rounding: Closest, 0.5 up  
    Pricing Interval: 60 seconds  
    Dispute timestamp rounding: down
    
    Note, that while using USDT markets is not ideal, protecting against a flash crash or spike in Coinbase Pro is deemed to be sufficient for inclusion. Should USDT suffer an adverse event, UMA holders should consider it an extreme event and fall back to the Coinbase Pro (UMA:USD) market.
    
    After finding the median UMA:USD(T) price, calculate the USD value of the UMA reserves.
    
    Example calculation with median UMA:USD(T) = 28.08:
    
    ```
    USD value of total UMA reserves = UMA in reserves * UMA:USD(T)
    
    = 82869.968529556752869482 * 28.08 = 2326988.7163099535
    ```

5) Fifth, use the UNI-V2-UMA-ETH total supply of LP tokens and USD value of reserves to calculate the USD value of each LP token (UNI-V2-UMA-ETH:USD).

    Example calculation of UNI-V2-UMA-ETH:USD:
  
    ```
    UNI-V2-UMA-ETH:USD =
  
    (USD value of UMA reserves + USD value of WETH reserves) / UNI-V2-UMA-ETH total supply of LP tokens)
  
    = (2326988.7163099535 + 2317377.2432926153) / 8925.567938786896587578
  
    = 520.3440264478901
    ```
6) Finally, invert UNI-V2-UMA-ETH:USD to calculate USD:UNI-V2-UMA-ETH and scale it by 1e18, rounding any trailing decimals:

    Example final calculation:
  
    ```
    USD:UNI-V2-UMA-ETH = 
  
    (1 / UNI-V2-UMA-ETH:USD) * 1e18
  
    = (1 / 520.3440264478901) * 1e18 
  
    = 1921805477092654  
    ```

## Technical Specifications

Price Identifier Name: USD-UNI-V2-UMA-ETH  
Base Currency: USD  
Quote currency: UNI-V2-UMA-ETH  
Intended Collateral Currency: UNI-V2-UMA-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

## Rationale

The USD-UNI-V2-UMA-ETH price identifier will allow Uniswap liquidity providers to mint synthetic tokens in the UMA ecosystem. The first application developed by LP Dollar will allow liquidity providers to borrow against their UNI-V2-UMA-ETH tokens as collateral at a fixed rate while earning yield on their UMA tokens.

## Security Considerations
Adding this new price identifier by itself should not effect the security to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The Uniswap smart contracts are among the highest quality in decentralized finance, safely locking up and handling billions of dollars in different assets. 

Uniswap as a price feed is online 24/7 with no downtime as it's a protocol hosted on the Ethereum blockchain. Therefore, there will be no forced existence of time gaps in price data - it will always be available.

The USD/UMA-ETH pair is susceptible to price volatility, and has moved in the ranges of 10-30% within 24 hours, with the more extreme side of the range highly unlikely, but still possible. A high collateralization requirement (120%+) should be set to mitigate this potential volatility risk.

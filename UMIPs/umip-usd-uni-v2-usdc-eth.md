## Headers
| UMIP-usd-uni-v2-usdc-eth-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD-UNI-V2-USDC-ETH as a price identifier              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 10, 2021           |
| Discourse Link | [Link](https://discourse.umaproject.org/t/add-usd-uniswap-v2-usdc-eth-as-a-price-identifier/204)         |

## Summary

The DVM should support price requests for Uniswap V2 USDC-ETH LP tokens.

## Motivation

The DVM currently does not support Uniswap V2 USDC-ETH LP tokens.

By enabling USD-UNI-V2-USDC-ETH as a price identifier, UMA will allow Uniswap V2 USDC-ETH LP tokens to be used as collateral for minting synthetic tokens. The Uniswap V2 USDC-ETH market is one of the largest CFMM pools with $301 million in liquidity supplied as of February 10, 2021. 

The LP Dollar team will use the USD-UNI-V2-USDC-ETH price identifier to enable fixed borrowing costs for Uniswap V2 USDC-ETH liquidity providers.

## Data Sources & Price Feed Implementation

| Uniswap V2 USDC-ETH   |                                                                                                 |
|------------|------------------------------------------------------------------------------------------------------------------- |
| Contract Address | [0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc](https://etherscan.io/address/0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) |
| Decimals | 18 |
| Token0 Symbol  | USDC  |
| Token0 Address  | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48                                                                  |
| Token0 Decimals  | 6                                                                  |
| Token1 Symbol  | WETH  |
| Token1  | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2                                                                   |
| Token1 Decimals  | 18                                                                  |

1) First, the Uniswap V2 USDC-ETH contract must be queried to get the total reserve balances in the pool. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).    
  
     Fetching total reserves balances via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",  
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
           "id": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
           "reserve0": "150224627.977758",
           "reserve1": "85653.251874346386555583"
         }
       }
     }
     ```
     
     Fetching total reserve balances via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc");
     let reserves = await pair.methods.getReserves().call({}, 11824935);
     ```
     
     web3.js Response Object
     ```
     Result {
       '0': '150224627977758',
       '1': '85653251874346386555583',
       '2': '1612909153',
       reserve0: '150224627977758',
       reserve1: '85653251874346386555583',
       blockTimestampLast: '1612909153' }
    ```
    
2) Second, the total supply of LP tokens must be queried. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).

     Fetching total supply via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",  
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
           "id": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
           "totalSupply": "2.572499047307645516"
         }
       }
     }
     ```
     
     Fetching total supply via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc");
     let totalSupply = await pair.methods.totalSupply().call({}, 11824935);
     ```
     
     web3.js Response
     ```
     2572499047307646516
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
    
    = 85653.251874346386555583 * 1716.12 
    
    = 146991258.60660332
    ```

4) Fourth, use the UNI-V2-USDC-ETH total supply of LP tokens and USD value of reserves to calculate the USD value of each LP token (UNI-V2-USDC-ETH:USD). USDC is treated as equal to USD.

    Example calculation of UNI-V2-USDC-ETH:USD:
  
    ```
    UNI-V2-USDC-ETH:USD =
  
    (USD value of USDC reserves + USD value of WETH reserves) / UNI-V2-USDC-ETH total supply of LP tokens)
  
    = (150224627.977758 + 146991258.60660332) / 2.572499047307645516
  
    = 115535858.75781949
    ```
6) Finally, invert UNI-V2-USDC-ETH:USD to calculate USD:UNI-V2-USDC-ETH and scale it by 1e18, rounding any trailing decimals:

    Example final calculation:
  
    ```
    USD:UNI-V2-USDC-ETH = 
  
    (1 / UNI-V2-USDC-ETH:USD) * 1e18
  
    = (1 / 115535858.75781949) * 1e18 
  
    = 8655321479.854582
  
    = 8655321480
    ```

## Technical Specifications

Price Identifier Name: USD-UNI-V2-USDC-ETH  
Base Currency: USD  
Quote currency: UNI-V2-USDC-ETH  
Intended Collateral Currency: UNI-V2-USDC-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

## Rationale

The USD-UNI-V2-USDC-ETH price identifier will allow Uniswap liquidity providers to mint synthetic tokens in the UMA ecosystem. The first application developed by LP Dollar will allow liquidity providers to borrow against their UNI-V2-USDC-ETH tokens as collateral at a fixed rate. 

## Security Considerations
Adding this new price identifier by itself should not effect the security to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The UNI-V2-USDC-ETH pool is one of the most liquid ($301 million AUM) and widely used CFMMs in existence. The Uniswap smart contracts are among the highest quality in decentralized finance, safely locking up and handling billions of dollars in different assets.

Uniswap as a price feed is online 24/7 with no downtime as it's a protocol hosted on the Ethereum blockchain. Therefore, there will be no forced existence of time gaps in price data - it will always be available.

The USD/USDC-ETH pair is susceptible to price volatility, and has moved in the ranges of 10-15% within 24 hours, with the more extreme side of the range highly unlikely, but still possible. A high collateralization requirement (120%+) should be set to mitigate this potential volatility risk.

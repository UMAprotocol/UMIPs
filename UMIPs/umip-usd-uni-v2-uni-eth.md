## Headers
| UMIP-usd-uni-v2-uni-eth-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD-UNI-V2-UNI-ETH as a price identifier              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 10, 2021           |
| Discourse Link    | [Link](https://discourse.umaproject.org/t/umip-add-usd-uniswap-v2-uni-eth-price-identifier/206)       |

## Summary

The DVM should support price requests for Uniswap V2 UNI-ETH LP tokens.

## Motivation

The DVM currently does not support Uniswap V2 UNI-ETH LP tokens.

By enabling USD-UNI-V2-UNI-ETH as a price identifier, UMA will allow Uniswap V2 UNI-ETH LP tokens to be used as collateral for minting synthetic tokens. The Uniswap V2 UNI-ETH market is one of the largest CFMM pools with $275 million in liquidity supplied as of February 10, 2021.

The LP Dollar team will use the USD-UNI-V2-UNI-ETH price identifier to enable fixed borrowing costs for Uniswap V2 UNI-ETH liquidity providers.

## Data Sources & Price Feed Implementation

| Uniswap V2 UNI-ETH   |                                                                                                 |
|------------|------------------------------------------------------------------------------------------------------------------- |
| Contract Address | [0xd3d2E2692501A5c9Ca623199D38826e513033a17](https://etherscan.io/address/0xd3d2E2692501A5c9Ca623199D38826e513033a17) |
| Decimals | 18 |
| Token0 Symbol  | UNI  |
| Token0 Address  | 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984                                                                  |
| Token0 Decimals  | 18                                                                  |
| Token1 Symbol  | WETH  |
| Token1  | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2                                                                   |
| Token1 Decimals  | 18                                                                  |

1) First, the Uniswap V2 UNI-ETH contract must be queried to get the total reserve balances in the pool. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).    
  
     Fetching total reserves balances via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xd3d2e2692501a5c9ca623199d38826e513033a17",  
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
           "id": "0xd3d2e2692501a5c9ca623199d38826e513033a17",
           "reserve0": "6951264.42324589890590596",
           "reserve1": "76674.78981470020867078"
         }
       }
     }
     ```
     
     Fetching total reserve balances via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xd3d2E2692501A5c9Ca623199D38826e513033a17");
     let reserves = await pair.methods.getReserves().call({}, 11824935);
     ```
     
     web3.js Response Object
     ```
     Result {
       '0': '6951264423245898905905960',
       '1': '76674789814700208670780',
       '2': '1612909138',
       reserve0: '6951264423245898905905960',
       reserve1: '76674789814700208670780',
       blockTimestampLast: '1612909138' }
    ```
    
2) Second, the total supply of LP tokens must be queried. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).

     Fetching total supply via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xd3d2e2692501a5c9ca623199d38826e513033a17",  
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
           "id": "0xd3d2e2692501a5c9ca623199d38826e513033a17",
           "totalSupply": "370996.507251705192964257"
         }
       }
     }
     ```
     
     Fetching total supply via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xd3d2E2692501A5c9Ca623199D38826e513033a17");
     let totalSupply = await pair.methods.totalSupply().call({}, 11824935);
     ```
     
     web3.js Response
     ```
     370996507251705192965257
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
    
    = 76674.78981470020867078 * 1716.12 
    
    = 131583140.29680333
    ```
    
4) Fourth, the UNI:USD price must be queried and used to calculate the USD value of the UNI reserves.  

    Base Currency: UNI  
    Quote Currency: USD  

    Exchanges: Coinbase Pro (UNI:USD), Kraken (UNI:USD), Bitfinex (UNI:USD)
    Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.  
    Price Steps: 0.01 (2 decimals in more general trading format)  
    Rounding: Closest, 0.5 up  
    Pricing Interval: 60 seconds  
    Dispute timestamp rounding: down  
    
    After finding the median UNI:USD price, calculate the USD value of the UNI reserves.
    
    Example calculation with Median UNI:USD = 20.58:
    
    ```
    USD value of total UNI reserves = UNI in reserves * UNI:USD
    
    = 6951264.42324589890590596 * 20.58 = 143057021.8304006
    ```

5) Fifth, use the UNI-V2-UNI-ETH total supply of LP tokens and USD value of reserves to calculate the USD value of each LP token (UNI-V2-UNI-ETH:USD).

    Example calculation of UNI-V2-UNI-ETH:USD:
  
    ```
    UNI-V2-UNI-ETH:USD =
  
    (USD value of UNI reserves + USD value of WETH reserves) / UNI-V2-UNI-ETH total supply of LP tokens)
  
    = (143057021.8304006 + 131583140.29680333) / 370996.507251705192964257
  
    = 740.2769480545874
    ```
6) Finally, invert UNI-V2-UNI-ETH:USD to calculate USD:UNI-V2-UNI-ETH and scale it by 1e18, rounding any trailing decimals:

    Example final calculation:
  
    ```
    USD:UNI-V2-UNI-ETH = 
  
    (1 / UNI-V2-UNI-ETH:USD) * 1e18
  
    = (1 / 740.2769480545874) * 1e18 
  
    = 1350845791737744.2
  
    = 1350845791737744
    ```

## Technical Specifications

Price Identifier Name: USD-UNI-V2-UNI-ETH  
Base Currency: USD  
Quote currency: UNI-V2-UNI-ETH  
Intended Collateral Currency: UNI-V2-UNI-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

## Rationale

The USD-UNI-V2-UNI-ETH price identifier will allow Uniswap liquidity providers to mint synthetic tokens in the UMA ecosystem. The first application developed by LP Dollar will allow liquidity providers to borrow against their UNI-V2-UNI-ETH tokens as collateral at a fixed rate.

## Security Considerations
Adding this new price identifier by itself should not effect the security to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The UNI-V2-UNI-ETH pool is one of the most liquid ($275 million AUM) and widely used CFMMs in existence. The Uniswap smart contracts are among the highest quality in decentralized finance, safely locking up and handling billions of dollars in different assets.

Uniswap as a price feed is online 24/7 with no downtime as it's a protocol hosted on the Ethereum blockchain. Therefore, there will be no forced existence of time gaps in price data - it will always be available.

The USD/UNI-ETH pair is susceptible to price volatility, and has moved in the ranges of 10-30% within 24 hours, with the more extreme side of the range highly unlikely, but still possible. A high collateralization requirement (120%+) should be set to mitigate this potential volatility risk.

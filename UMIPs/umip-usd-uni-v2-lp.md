## Headers
| UMIP-usd-uni-v2-lp-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD UNI-V2 LP token price identifiers              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 09, 2021           |
| Link to Discourse | [Discourse](https://discourse.umaproject.org/t/add-usd-uni-v2-wbtc-eth-as-a-price-identifier/148)                                 |

## Summary

The DVM should support price requests for the following Uniswap V2 LP tokens: WBTC-ETH, USDC-ETH, UNI-ETH, UMA-ETH.

## Motivation

The DVM currently does not support Uniswap V2 LP tokens.

By enabling LP token price identifiers, UMA will open the door for the creation of synths with CFMM (constant function market maker) LP positions.

The LP Dollar team will use the price identifiers to enable fixed borrowing costs for Uniswap V2 liquidity providers.

## Data Sources & Price Feed Implementation

| Uniswap V2 WBTC-ETH   |                                                                                                 |
|------------|------------------------------------------------------------------------------------------------------------------- |
| Contract Address | [0xBb2b8038a1640196FbE3e38816F3e67Cba72D940](https://etherscan.io/address/0xbb2b8038a1640196fbe3e38816f3e67cba72d940) |
| Decimals | 18 |
| Token0 Symbol  | WBTC  |
| Token0 Address  | 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599                                                                  |
| Token0 Decimals  | 8                                                                  |
| Token1 Symbol  | WETH  |
| Token1  | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2                                                                   |
| Token1 Decimals  | 18                                                                  |

1) First, the Uniswap V2 WBTC-ETH contract must be queried to get the total reserve balances in the pool. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).    
  
     Fetching total reserves balances via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",  
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
           "id": "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",
           "reserve0": "3667.03647028",
           "reserve1": "97499.896966146357068372"
         }
       }
     }
     ```
     
     Fetching total reserve balances via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940");
     let reserves = await pair.methods.getReserves().call({}, 11824935);
     ```
     
     web3.js Response Object
     ```
     Result {
      '0': '366703647028',
      '1': '97499896966146357068372',
      '2': '1612909138',
      reserve0: '366703647028',
      reserve1: '97499896966146357068372',
      blockTimestampLast: '1612909138' }
    ```
    
2) Second, the total supply of LP tokens must be queried. This query can be constructed with the Uniswap V2 subgraph or an Ethereum archive node. The block number used should be the closest to and before the timestamp of the price request (similar to UMIP-39).

     Fetching total supply via the [Uniswap V2 subgraph](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2):  
     
     GraphQL Request
     ``` graphql
     {
      pair(
        id: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",  
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
           "id": "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",
           "totalSupply": "0.167105037364528719"
         }
       }
     }
     ```
     
     Fetching total supply via an archive node with [web3.js](https://web3js.readthedocs.io/en/v1.3.0/):
     
     web3.js Call
     ``` javascript
     let pair = new web3.eth.Contract(abi, "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940");
     let totalSupply = await pair.methods.totalSupply().call({}, 11824935);
     ```
     
     web3.js Response
     ```
     167105037364529719
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
    
    = 97499.896966146357068372 * 1716.12 
    
    = 167321523.18154308
    ```
    
4) Fourth, the BTC:USD price must be queried and used to calculate the USD value of the WBTC reserves. 

    The methodology to query the price of BTC:USD is similar to [UMIP-7](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-7.md), with a different exchange list and decimal precision.  

    Base Currency: BTC  
    Quote Currency: USD  

    Exchanges: Coinbase Pro (BTC:USD), Kraken (BTC:USD), Bitfinex (BTC:USD), Bitstamp (BTC:USD)  
    Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.  
    Price Steps: 0.01 (2 decimals in more general trading format)  
    Rounding: Closest, 0.5 up  
    Pricing Interval: 60 seconds  
    Dispute timestamp rounding: down  
    
    After finding the median BTC:USD price, calculate the USD value of the WBTC reserves.
    
    Example calculation with Median BTC:USD = 45938.30:
    
    ```
    USD value of total WBTC reserves = WBTC in reserves * BTC:USD
    
    = 3667.03647028 * 45938.30 = 168457421.48266372
    ```

5) Fifth, use the UNI-V2-WBTC-ETH total supply of LP tokens and USD value of reserves to calculate the USD value of each LP token (UNI-V2-WBTC-ETH:USD).

    Example calculation of UNI-V2-WBTC-ETH:USD:
  
    ```
    UNI-V2-WBTC-ETH:USD =
  
    (USD value of WBTC reserves + USD value of WETH reserves) / UNI-V2-WBTC-ETH total supply of LP tokens)
  
    = (168457421.48266372 + 167321523.18154308) / .167105037364528719
  
    = 2009388525.6835613
    ```
6) Finally, invert UNI-V2-WBTC-ETH:USD to calculate USD:UNI-V2-WBTC-ETH and scale it by 1e18, rounding any trailing decimals:

    Example final calculation:
  
    ```
    USD:UNI-V2-WBTC-ETH = 
  
    (1 / UNI-V2-WBTC-ETH:USD) * 1e18
  
    = (1 / 2009388525.6835613) * 1e18 
  
    = 497663835.15
  
    = 497663835
    ```

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

Price Identifier Name: USD-UNI-V2-WBTC-ETH  
Base Currency: USD  
Quote currency: UNI-V2-WBTC-ETH  
Intended Collateral Currency: UNI-V2-WBTC-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

Price Identifier Name: USD-UNI-V2-USDC-ETH  
Base Currency: USD  
Quote currency: UNI-V2-USDC-ETH  
Intended Collateral Currency: UNI-V2-USDC-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

Price Identifier Name: USD-UNI-V2-UNI-ETH  
Base Currency: USD  
Quote currency: UNI-V2-UNI-ETH  
Intended Collateral Currency: UNI-V2-UNI-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

Price Identifier Name: USD-UNI-V2-UMA-ETH  
Base Currency: USD  
Quote currency: UNI-V2-UMA-ETH  
Intended Collateral Currency: UNI-V2-UMA-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)

## Rationale

The USD-UNI-V2 price identifiers will allow Uniswap liquidity providers to mint synthetic tokens in the UMA ecosystem. The first application developed by LP Dollar will allow liquidity providers to borrow against their LP tokens as collateral at a fixed rate. 

## Security Considerations
Adding these new price identifiers should not effect the security to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing these identifiers should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The Uniswap smart contracts are among the highest quality in decentralized finance, safely locking up and handling billions of dollars in different assets.

Uniswap as a price feed is online 24/7 with no downtime as it's a protocol hosted on the Ethereum blockchain. Therefore, there will be no forced existence of time gaps in price data - it will always be available.

These pairs are susceptible to price volatility, and have moved in the ranges of 10-30% within 24 hours, with the more extreme side of the range highly unlikely, but still possible. A high collateralization requirement (120%+) should be set to mitigate this potential volatility risk.

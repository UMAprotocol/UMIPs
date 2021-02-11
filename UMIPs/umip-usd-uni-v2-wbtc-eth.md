## Headers
| UMIP-usd-uni-v2-wbtc-eth-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD-UNI-V2-WBTC-ETH as a price identifier              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 09, 2021           |
| Link to Discourse | [Discourse](https://discourse.umaproject.org/t/add-usd-uni-v2-wbtc-eth-as-a-price-identifier/148)                                 |

## Summary

The DVM should support price requests for Uniswap V2 WBTC-ETH LP tokens.

## Motivation

The DVM currently does not support Uniswap V2 WBTC-ETH LP tokens.

By enabling USD-UNI-V2-WBTC-ETH as a price identifier, UMA will open the door for the creation of synths with CFMM (constant function market maker) LP positions. The Uniswap V2 WBTC-ETH market is one of the largest CFMM pools with $345 million in liquidity supplied as of February 09, 2021. 

The LP Dollar team will use the USD-UNI-V2-WBTC-ETH price identifier to enable fixed borrowing costs for Uniswap V2 WBTC-ETH liquidity providers.

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

## Technical Specifications

Price Identifier Name: USD-UNI-V2-WBTC-ETH  
Base Currency: USD  
Quote currency: UNI-V2-WBTC-ETH  
Intended Collateral Currency: UNI-V2-WBTC-ETH  
Collateral Decimals: 18  
Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)  

## Rationale

The USD-UNI-V2-WBTC-ETH price identifier will allow Uniswap liquidity providers to mint synthetic tokens in the UMA ecosystem. The first application developed by LP Dollar will allow liquidity providers to borrow against their UNI-V2-WBTC-ETH tokens as collateral at a fixed rate. 

## Security Considerations
Adding this new price identifier by itself should not effect the security to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The UNI-V2-WBTC-ETH pool is one of the most liquid ($345 million AUM) and widely used CFMMs in existence. The Uniswap smart contracts are among the highest quality in decentralized finance, safely locking up and handling billions of dollars in different assets.

Uniswap as a price feed is online 24/7 with no downtime as it's a protocol hosted on the Ethereum blockchain. Therefore, there will be no forced existence of time gaps in price data - it will always be available.

The USD/WBTC-ETH pair is susceptible to price volatility, and has moved in the ranges of 10-30% within 24 hours, with the more extreme side of the range highly unlikely, but still possible. A high collateralization requirement (120%+) should be set to mitigate this potential volatility risk.
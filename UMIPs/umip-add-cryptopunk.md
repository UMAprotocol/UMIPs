## Headers

| UMIP [#]            |                                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| UMIP Title          | [Add CRYPTOPUNKX-30d as DVM price identifier]                             |
| Authors             | [Kevin Chan (kevin@umaproject.org), Chase Coleman (chase@umaproject.org)] |
| Status              | [Draft]                                                                   |
| Created             | [April 19, 2021]                                                          |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |


# Summary 

This UMIP introduces a new price identifier for a token referred to as `CRYPTOPUNKX-30d`. The token is a synthetic index based on the recent trading prices of CryptoPunks.

The `CRYPTOPUNKX-30d` token will be valued differently while trading and at expiry:

- While `CRYPTOPUNKX-30d` is pre-expiry, the price will be based on the 2-hour TWAP from the highest volume Uniswap `WETH/CRYPTOPUNKX-30d` pool.
- At expiry, the `CRYPTOPUNKX` will be valued based on the most recent 30 days of CryptoPunk purchases calculated using `PunkBought` events from the Ethereum blockchain. The price will be set using the 30 day median of the most recent purchase price of each CryptoPunk traded during the most recent 30 days.

This is similar to how `uGAS` and other self-referential assets have been priced


# Motivation

There are currently few synthetic non-fungible token (NFT) indexes available in the DeFi space. As NFTs continue to grow in popularity, collectors may find it useful to be able to hedge their investments and other investors may also want to gain NFT exposure without being required to purchase and maintain custody of a NFT.

Creating a CryptoPunks index before branching into other NFTs makes sense because CryptoPunks were the original NFT. As the original NFT, CryptoPunks are highly valued and relatively liquid.

1. What are the financial positions enabled by creating this synthetic that do not already exist?
  - The DVM does not currently support any NFT based indexes. This token will be the first such index and provide a template for others to be created.
2. Please provide an example of a person interacting with a contract that uses this price identifier.
  - A collector wishing to hedge the risk of purchasing a CryptoPunk could mint `CRYPTOPUNKX-30d` which would provide protection against downward price movements in the value of CryptoPunks.
  - An investor who believes that the median trade price of CryptoPunks will increase could purchase `CRYPTOPUNKX-30d` at its current trading price and then hold until the price appreciated.
  - An investor who believes that the median trade price of CryptoPunks will decrease could mint `CRYPTOPUNKX-30d` and sell the minted tokens.


# Data Specifications

All relevant price data is computed using information that can be found on the blockchain.

* Pre-expiry, the token is valued according to the price that it trades at in the highest volume Uniswap pool.
* Post-expiry, the token is valued according to a function of the `PunkBought` events published by the CryptoPunks Market contract

-----------------------------------------
- Price identifier name: `CRYPTOPUNKX-30d`
- Markets & Pairs: **Markets & Pairs** - Uniswap `CRYPTOPUNKX-30d/ETH`, CryptoPunk Market contract `PunkBought` events
- Example price providers: **Provider to use** - Both Uniswap and `PunkBought` events should be retrieved from on-chain
- Cost to use: [Infura](https://infura.io/) supports up to 100,000 requests per day for free. Information also available on [The Graph](https://thegraph.com/)
- Real-time price update frequency: Updated every block
- Historical price update frequency: Updated every block


# Price Feed Implementation

The pre-expiry price can be determined using the existing [Uniswap price feed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js). The only required input would be determining which pool has the highest volume.

An example configuration for the Uniswap feed is below

```
"CRYPTOPUNKX-30d-JUNE21": {
  type: "uniswap",
  uniswapAddress: {TBD},
  twapLength: 7200
},
```

The post-expiry price would require the creation of a new price feed. The pseudo-code for such an identifier is below:

```
# Get the PunkBought Events from the cryptopunk contract
# for the last 30 days
events = getEvents(
    w3, cryptopunk, "PunkBought",
    block_30daysago, block_now
)

# Create cryptopunks array to store ids
cryptopunks = []

# Create mapping to store most recent price
cryptopunk_blockprice = {}

# Find the last PunkBought event for each CryptoPunk
for event in events:
    if event.cryptopunk not in cryptopunks:
        push(event.cryptopunk, cryptopunks)
        cryptopunkprice[event.cryptopunk] = {"block": event.block, "value": event.value}
    else:
        if event.block > cryptopunk_blockprice[event.cryptopunk]["block"]:
            cryptopunk_blockprice[event.cryptopunk] = {"block": event.block, "value": event.value}

# Take median of values
median([cryptopunk_blockprice[cryptopunk]["value"] for cryptopunk in cryptopunks])

```

The post-expiry price implementation can be found at [PENDING]()


# Technical Specifications

-----------------------------------------
- Price identifier name: `CRYPTOPUNKX-30d`
- Base Currency: **ETH**
- Quote Currency: **ETH**
- Rounding: Round to 6 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 25ish (as of 21 April 2021 19:34 UTC)


# Rationale

The price identifier had a few decisions that we believe were important to the design:

* _CryptoPunks_: As mentioned earlier in this document, we chose to build an index using CryptoPunks because they were the original NFT. This originality has lead to them being highly valued and having consistent enough trade volume.
* _30 day average_: The 30 day average allows for the index to reflect common trading prices a cross many CryptoPunks rather than to respond to particular transactions
* _Unique CryptoPunks_: We only use the most recent trade price for each CryptoPunk. This is a security feature since if we used each transaction then a single person could trade one CryptoPunk amongst accounts they owned to manipulate the price.
* _Median rather than the mean_: Calculating the mean incorporates the price of every single transaction which means that someone who owned a single CryptoPunk could have a small effect on the price. The median can still be manipulated but, given the uniqueness restriction above, it would require someone to own enough CryptoPunks to make up half of the monthly transactions.


# Implementation

**Pre-expiry**

When a price request is made prior to expiration, the following process should be followed:

1. Identify the `CRYPTOPUNKX-30d/ETH` pool with the highest trade volume on Uniswap
2. Retrieve 2 hour TWAP from the given pool which can be done using the Uniswap Price Feed from UMA's financial templates library


**Post-expiry**

When a price request is made post expiration, the following process should be followed:

1. Retrieve all CryptoPunk `PunkBought` events from the 30 days prior to expiration
2. Identify the last price that each CryptoPunk was traded at using the event data
3. Take the median of these pricese


**Example**


# Security Considerations

One of the main concerns is that someone with sufficient CryptoPunks chooses to manipulate the price.

For example, there are accounts that own about 400 unique CryptoPunks and the unique number of CryptoPunks that traded in the last 30 days is about 600. An individual who owns 400 CryptoPunks and traded them amongst their own accounts at prices near zero could corrupt the price by driving it to zero after having minted and sold the tokens at a high price.

One benefit to using an oracle with human intervention is that voters could recognize this type of price manipulation and there are other viable proxies for the expected price of a CryptoPunk. For example, if voters felt like there was price manipulation, they could choose to settle the contract at the current market price of `PUNKBASIC` or other 

The other main concern is if there were just insufficient CryptoPunk trades being made. If there were only 1-2 trades happening every 30 days, this index becomes much less useful because there's less information contained in its price.

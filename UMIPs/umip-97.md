## Headers

| UMIP-97                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add SPACEXLAUNCH as a supported price identifier |
| Authors             | Sean Brown (@smb2796), Andrey Belyakov (andrey@opium.team), Ali Nuraldin (ali@opium.team) |
| Status              | Approved                                                         |
| Created             | May 19, 2021                                              |
| Discourse Link      | [Link](https://discourse.umaproject.org/t/add-spacexlaunch-as-a-supported-price-identifier/1105)            |

# Summary 

The DVM should support price requests for SPACEXLAUNCH. The purpose of the SPACEXLAUNCH price identifier is to be a generalized way to evaluate the success rate of the rocket launches made by SpaceX before request date considering launches provided in ancillary data.

Ancillary data in the request will specify the parameters that should be considered during the oracle result determination process.

# Motivation

Adding a way to evaluate the success rate of SpaceX launches would open a wide range of potential synthetics (e.g. insurance).

This price identifier is not intended to be used with a registered UMA financial contract type.

First intention to use ths price identifier is to create an insurance contracts on Opium Protocol. Here is the example of how provided result will be consumed:

```
function getExecutionPayout(Derivative memory _derivative, uint256 _result) public view returns (uint256 buyerPayout, uint256 sellerPayout) {
  uint256 trigger = _derivative.params[0];
  uint256 fixedPremium = _derivative.params[1];

  if (_result < trigger) {
    sellerPayout = _derivative.margin.mul(_result).div(TRIGGER_BASE);
    buyerPayout = _derivative.margin.sub(sellerPayout);
  } else {
    buyerPayout = 0;
    sellerPayout = _derivative.margin;
  }

  // Add premium
  sellerPayout = sellerPayout.add(fixedPremium);
}
```

Price requester should consider additional time buffers for potential launch delays on it's own.

# Data Specification

- Price identifier name: **SPACEXLAUNCH** 
- Markets & Pairs: N/A
- Example data providers: https://www.rocketlaunch.live/?filter=spacex , https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches , https://docs.spacexdata.com/
- Cost to use: None
- Real-time data update frequency: N/A
- Historical data update frequency: N/A

# Price Feed Implementation

Price Feed Implementation is unnecessary for this price identifier, as it will not have liquidation bots that need to programmatically get this price.

# Technical Specifications

- Price identifier name: **SPACEXLAUNCH**
- Base Currency: **N/A**
- Quote Currency: **N/A**
- Estimated current value of price identifier: **N/A**

# Rationale

Most of the motivation and rationale for this price identifier is explained in motivation. The weights passed in with requests for this price identifier are somewhat arbitrary. This is to allow flexibility for different types of insurance products to be created, simply by adjusting the weights associated with each launch tracked. Adjusted or incorrect weights has no impact on the UMA ecosystem, but users of contracts that use this price identifier should be aware of how these are chosen.

# Implementation

1. Query for the `ancillaryData` value from the price request
2. Decode the ancillary data from bytes to UTF-8
3. Parse the encoded data and delimit key-value pairs by commas (",")
4. Evaluate success rate based on the method described in `Technical Specifications`

## Description

Ancillary data are provided by price requesters and would consist of the list of launches, where each launch is described by
- Launch id - Name of the SpaceX mission, that allows voters to uniquely identify a particular launch.
- Weight (`Wi`) - Mathematical `weight` of the launch in the overall success rate calculation. Specified wight might be any positive number that is used to define the importance of this particular launch in the overall success rate respectively to other launches provided in ancillary data.

Each launch in the list should be evaluated and its status (`Si`) should be determined according to these conditions
- If launch did not happen before the price request timestamp or the rocket did not successfully lift off, then `Si=0`
- If the rocket successfully lifted off, but did not land before the price request timestamp, or the landing was not successful then `Si=0.5`
- If the rocket successfully lifted off, and landed before the price request timestamp, then `Si=1`

Liftoff is considered successful if the rocket reached expected altitude without any significant damage and performed the required part of the mission at this altitude.

Landing is considered successful if the rocket landed on expected surface without any significant damage before request date.

Success rate than can be calculated by
```
Success Rate =  SUM(Si * Wi) / SUM(Wi)
```

i.e. sum of all products of launch statuses and corresponding weights divided by the sum of all weights

This formula will return weighted average success rate on all specified launches in rage `[0, 1]`.

## Examples

### Example 1

- Request timestamp: 1614556800 (March 1st 2021 00:00 UTC)
- List of launches:
- - Launch 1: `id0:Starlink-18,w0:1`
- - Launch 2: `id1:Starlink-19,w1:1`

Launch 1 happened, successfully lifted off, and landed before the request timestamp: `S1=1`

Launch 2 happened before request date, successfully lifted off, but did not land (or did not land before the request timestamp): `S2=0.5`

Calculating the success rate:
```
Success Rate = (1 * 1 + 1 * 0.5) / (1 + 1) = 0.75
```

### Example 2
- Request timestamp: 1612137600 (February 1st 2021 00:00 UTC)
- List of launches:
- -  Launch 1: `id0:Transporter-1,w0:1`

Launch 1 happened before request timestamp, successfully lifted off, and landed before the request timestamp: `S1=1`

Calculating the success rate:
```
Success Rate = (1 * 1) / (1) = 1
```

## Format
Ancillary data in the request will be passed as a comma-separated key-value pair delimited by colon, where each key is followed by the index in the array of launches in the following format

```
id<index>:<id>,w<index>:<weight>
```

If voters cannot correctly match a specific ID to an individual launch, `Si` should equal 0 for that launch.

If voters cannot correctly decode the ancillary data into the format defined below, or ancillary data is not passed in with the price request, voters should return 0.

## Parsing example
```
const ancillaryData = '0x6964303a537461726c696e6b2d31382c77303a312c6964313a537461726c696e6b2d31392c77313a31'
const ancillaryDataBuffer = Buffer.from(ancillaryData.slice(2), 'hex')
const result = ancillaryDataBuffer.toString() // result = "id0:Starlink-18,w0:1,id1:Starlink-19,w1:1"
```

# Security Considerations

The possibility for non-deterministic success rate calculations, since this calculation is more left up to the possibility of evaluators finding different sources of information.

## Headers

| UMIP-XX                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add SPACEXLAUNCH as a supported price identifier |
| Authors             | Sean Brown (@smb2796), Andrey Belyakov (andrey@opium.team), Ali Nuraldin (ali@opium.team) |
| Status              | Draft                                                         |
| Created             | May 19, 2021                                              |
| Discourse Link      | TBA            |

# Summary 

The DVM should support price requests for SPACEXLAUNCH. The purpose of the SPACEXLAUNCH price identifier is to be a generalized way to evaluate the success rate of the rocket launches made by SpaceX till date considering provided ancillary data

Ancillary data in the request will specify the parameters that should be considered during the oracle result determination process.

# Motivation

Provision of the way to evaluate the success rate of SpaceX launches would open a wide range of possible synthetics based on it (e.g. insurances)

# Data Specification

- Price identifier name: **SPACEXLAUNCH** 
- Markets & Pairs: **N/A**
- Example data providers: https://www.rocketlaunch.live/?filter=spacex , https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches
- Cost to use: **None**
- Real-time data update frequency: **Daily**
- Historical data update frequency: **Daily**

# Price Feed Implementation

Price Feed Implementation is unnecessary for this price identifier, as it will not have liquidation bots that need to programmatically get this price.

# Technical Specifications

- Price identifier name: **SPACEXLAUNCH**
- Base Currency: **N/A**
- Quote Currency: **N/A**
- Rounding: *Round to 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)*
- Estimated current value of price identifier: **N/A**

---

## Description
Ancillary data would consist of the list of launches, where each launch is described by
- Launch id - Name of the SpaceX mission
- Weight (`Wi`) - Weight of the launch in the overall success rate calculation

Each launch in the list should be evaluated and its status (`Si`) should be determined according to these conditions
- If launch did not happen till date or the rocket was not successfully lifted off, then `Si=0`
- If the rocket successfully lifted off, but never landed, or the landing was not successful then `Si=0.5`
- If the rocket successfully lifted off, and landed, then `Si=1`

Liftoff is considered successful if the rocket reached expected altitude without any significant damage and performed the required part of the mission at this altitude.

Landing is considered successful if the rocket landed on Earth without any significant damage till date.

Success rate than can be calculated by
```
Success Rate =  SUM(Si * Wi) / SUM(Wi)
```

i.e. sum of all products of launch statuses and corresponding weights divided by the sum of all weights

## Examples

### Example 1

- Request timestamp: 1614556800 (March 1st 2021 00:00 UTC)
- List of launches:
- - Launch 1: ID: "Starlink-18”, W: 1
- - Launch 2: ID: "Starlink-19”, W: 1

Launch 1 happened till date, successfully lifted off and landed: `S1=1`

Launch 2 happened till date, successfully lifted off, but did not landed: `S1=0.5`

Calculating the success rate:
```
Success Rate = (1 * 1 + 1 * 0.5) / (1 + 1) = 0.75
```

### Example 2
- Request timestamp: 1612137600 (February 1st 2021 00:00 UTC)
- List of launches:
- -  Launch 1: ID: "Transporter-1”, W: 1

Launch 1 happened till date, successfully lifted off and landed: S1=1

Calculating the success rate:
```
Success Rate = (1 * 1) / (1) = 1
```

##  Format
Ancillary data in the request will be passed as a JSON  in the following format

```
[{
  id: string,
  weight: number
}]
```

# Rationale

No rationale is needed. The motivation for this price identifier is explained in motivation.

# Implementation

1. Query for the `ancillaryData` value from the price request
2. Decode the ancillary data from bytes to UTF-8
3. Parse JSON from the encoded data
4. Evaluate success rate based on the method described in `Technical Specifications`

# Security Considerations

The possibility for non-deterministic success rate calculations, since this calculation is more left up to the possibility of evaluators finding different sources of information.

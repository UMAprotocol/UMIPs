## Headers
- UMIP 151
- UMIP title: VolatilityDAOracle
- Author: Volatility Group Inc.
- Status: Draft
- Created: February 16th 2022


## Summary (2-5 sentences)
The Volatility DAOracle is a collection of methodologies and implementations for indices and benchmarks. Each index can be verified by decentralized users through its data endpoint, open-source code, and methodology paper. This information can be looked up through the `timestamp` and `ancillaryData` of the `proposePrice` for each call to the Optimistic Oracle.

## Motivation
In traditional finance, there are many indices and benchmarks derived from complex calculations. In the U.S. these are typically regulated through enforcement.

In light of investigations into the manipulation of benchmarks, The Board of the International Organization of Securities Commissions (IOSCO) launched a task force to generate best practices for creating and maintaining benchmarks. IOSCO complaint benchmarks are currently the gold standard. However, even with all the transparency that being IOSCO compliant adds, much of the code used in calculations is closed source. Furthermore, IOSCO compliance does not negate conflicts of interests.

DeFi, in its ethos, should make benchmarks and indices more transparent than IOSCO standards. However, if we look at existing decentralized benchmarks and indices, they are often more closed-source and confusing than traditional finance!

We believe that benchmarks and indices can become even more transparent through blockchain. Implementations and methodologies can be fully open-source and conflicts of interest can be negated through the use of game theory to validate calculations.

This is what the Volatility DAOracle does. It creates an audit trail of benchmarks and indices and uses the game theory of the Optimistic Oracle to prove they are valid. An artifact of this audit trail is that benchmarks and indices are posted on-chain.

## Technical Specification
Each index has a data endpoint, open-source code, and methodology paper which are approved by the Volatility DAO. The Volatility DAO approves an index/benchmark through the Protocol Improvement Process which can be found on the [Volatility DAO Github](https://github.com/Volatility-DAO/PIPS). The approved PIP directory contains all necessary steps, software, and endpoints to validate an index.

The index can be looked up and validated by participants of the DVM and/or disputers through the `timestamp` and `ancillaryData` passed into the Optimistic Oracle's `proposePrice` function. The ancillaryData consists of the methodology, time window, and target asset concatenated into a single parameter: `id:{methodology}-{window}-{targetAsset}`. This parameter can be deconstructed and used to access data sources. If `ancillaryData` does not comply with these standards, DVM participants should return the "magic number": `-3735928559` which equals . We understand that this is a non-traditional format for `ancillaryData` but it is necessary to optimize storage within The DAOracle smart contracts.

For an example of how to use the `ancillaryData` to recreate an index please see Implementation below.

<ins>Redundancies for accessing data</ins>

Each PIP contains information on how to access raw data. In general there are two ways of doing this:

1. Most indices will post to IPFS and their data snapshot can be queried through two different URLs:
* One based on methodology, window, asset, and timestamp.
* One based on the IPFS hash.
2. In cases where the IPFS data is completely lost or broken, the PIP directory of the methodology will outline alternate ways of accessing the data in the README.md (e.g. it may list the exchanges or other third-party data provider from which the data originated and any special processing needed for aggregating the feed(s) for input to the open-source implementation).

As part of the PIP process The Volatility DAO sets a parameter called `dataPeriod`. This represents the time period at which snapshots of input data & index values are saved to IPFS. Only the most recent snapshot can be relayed to The Volatility Oracle for audit and it can only be audited once, subsequent submissions of the same snapshot to The Volatility Oracle are denied by our smart contracts. DVM participants should also deny repeat submissions of the same snapshot. While the Optimistic Oracle already enforces unique combinations of msg.sender, identifier, timestamp, ancillaryData by requiring that such combination has never been requested, there is still the potential for repeat submissions to be sent to the DVM. Specifially, timestamp can change but still represent the snapshot. To ensure that repeat submissions do not happen, DVM participants will need to round down the timestamp to the last `dataPeriod` (See **Implementation** below for how to round). `dataPeriod` can be set to any time resolution (e.g. 1 second or 1 hour) but should never be greater than the desired amount of time between audits.



## Rationale
Rationale For the Volatility DAOracle:

Getting frequent index results on-chain through the Optimistic Oracle is not tenable because of the Tragedy of the Commons. It is not in an individual user’s best interest to pay gas to create a frequent audit trail (e.g. economically it makes sense for an individual user to requestPrice infrequently). The Volatility DAOracle solves this by building a new layer of incentives on top of the Optimistic Oracle.


Rationale For This Specific Implementation:

Having all Volatility DAO indices and benchmarks under one UMIP is important because each individual methodology can be applied across different time periods and assets. For example, with the initial Model Free Implied Volatility methodology (MFIV) an index could be created for ETH or BTC for time periods ranging from roughly 1-364 days. This means that the single methodology could create roughly 728 indices. It would not make sense to create 728 different UMIPs, one for each index. Instead, we feel the best method is to have a single UMIP that defines an overarching framework for cataloging and querying each Volatility DAO index, its implementation, raw data, and methodology.


## Implementation
Using the `timestamp` and `ancillaryData`  from a `proposePrice` for this UMIP you can query all necessary tools to recreate any index within the Volatility DAOracle. The `timestamp` is seconds since the Unix epoch. The `ancillaryData` consists of three data points concatenated into a single parameter: `id:{methodology}-{window}-{targetAsset}`.

* `methodology` - This is the identifier for the methodology. This four-character identifier can be used to look up the methodology in the [Volatility DAO Github](https://github.com/Volatility-DAO/PIPS/tree/main/Approved/DAOracle).
* `window` - This is the time window to which the methodology is applied. Window uses standardized time formats, where lower-denomination units are lowercase and higher-denominations are uppercase:
    * `s` = seconds
    * `m` = minutes
    * `h` = hours
    * `d` = Days
    * `W` = Weeks
    * `M` = Months
    * `Y` = Year
    * For example, 14d means 14 Day volatility.
targetAsset - This is the asset to which volatility is applied. For example, ETH means Ethereum and BTC means Bitcoin.

The following example demonstrates how this system works:
1. Use `ancillaryData` and `timeStamp` from `proposePrice`:
    * ancillaryData: `MFIV-14D-ETH`
    * timeStamp: `1643288400`
2. Use the `timestamp` and `ancillaryData` to look up the following:
    * MFIV matches the methodology directory [here](https://github.com/Volatility-DAO/PIPS/tree/main/Approved/DAOracle). This is where you get the open-source code to validate the index.
    * `timestamp / window / targetAsset` are all used to query the IPFS data of the calculations. Instructions for doing this are required within the README of every PIP. You can see the MFIV README [here](https://github.com/Volatility-DAO/PIPS/tree/MFIV/Proposed/Adding_An_Index/Step_2/MFIV#readme).
    * NOTE: Every timestamp will need to be rounded down to the nearest `dataPeriod`. Each PIP will define the frequency of the dataPeriod. For example, if the `dataPeriod`is set to 300 seconds (i.e. 5 minutes) that would mean that data is posted every 5 minutes on the hour (e.g. 1:00, 1:05). You would need to round down to the closest five minute period.  You can use the following logic to round down and remove the milliseconds (`dataPeriod` timestamps are in second resolution):

```
const now = new Date()
console.info("now", now)

const utcMin = now.getUTCMinutes()
const dataPeriod = 300 / 60    // Note that 300 is the param in seconds set by the DAO. We normalize for minutes. You will need to lookup this param in the PIP.
const ipfsTimestamp = now.setUTCMinutes(Math.trunc(utcMin / dataPeriod) * dataPeriod, 0, 0)

const millisecondsRegex = /\.\d{3}?Z$/
const toIsoNoMillis = (date) => date.toISOString().replace(millisecondsRegex, "Z")

console.info("ipfsTimestamp", ipfsTimestamp)
console.info("rounded", toIsoNoMillis(new Date(ipfsTimestamp)))
```
Returning a date time that looks like the following:
```
$ node timestamp_rounding.js
now 2022-02-22T18:31:03.773Z
ipfsTimestamp 1645554600000
rounded 2022-02-22T18:30:00Z
```

   * NOTE: In some instances the `timestamp` will need to be in a human-readable date time. You can use the following free tool to convert and then round down (make sure to remove milliseconds): [https://www.epochconverter.com/](https://www.epochconverter.com/)


## Security considerations
There are several potential security considerations. Each of these has been mitigated as much as possible:

* **Data** - To create an index on the DAOracle a creator needs to provide the input data on IPFS. The infrastructure that they use to do this could be a vector of attack or could simply break. As a redundancy, the creator must also describe how to access and filter raw data. In many cases the raw data could also be a vector of an attack. The methodology should try to address this if possible. However, it may not be possible to mitigate attacks on raw data (e.g. a price series from an exchange).

* **Volatility DAO**
    * GitHub - The Volatility DAO GitHub could be a vector of attack. For example, if someone were to gain access who should not have access. Every DAO member who has access to the repo uses basic security features like 2FA and signed commits.
    * 51% attack - 51% of VOL tokens could be acquired by someone to change how an index calculates. This is mitigated by the process in which indices are approved. All indices must use open-source software and must go through a period of public review. Inserting malicious code would be possible if someone owned 51% of tokens, but users would know that the code is malicious and could avoid using it. Furthermore, the UMA community could be notified at that point and time and could take action to invalidate this UMIP.


## Uniswap Volume KPI Calculation


## Summary

This calculation is intended to track the volume (denominated in USD) across both V2 and V3 Uniswap on Ethereum.

The recommended method is to query TheGraph for Uniswap's volume. This document will detail the method that will be used to query TheGraph and also mitigate some attack vectors to manipulate the volume. The main vector of attack that we are concerned about is wash-trading where people create new pools based on worthless tokens and then drive volume up by trading the token back and forth with themself -- In practice, it would be difficult to make this profitable given the amount of trade volume that already occurs and the benefits/costs of doing so (the gas fees alone would likely be higher than the increased payoff one would receive).

However, we think it's important to protect the KPI from this and similar attack vectors and so we will compute the volume in two steps:

1. Identify a set of pairs/pools.
  - We choose to use the criteria that Uniswap itself uses to only track "meaningful usage".
  - We then took a snapshot of pools with "meaningful usage" at 00:00 UTC on August 1st, 2021.
2. Compute the volume
  - In order to further fend off manipulation, we will use an average of 30 day daily volume rather than using a single day's volume.

In this document, we'll document Uniswap's methodology, but, if we wanted, we could design our own criteria to choose pairs/pools or pick a different number of days.


## Intended Ancillary Data

```
Metric:Uniswap v2 and v3 30 day average daily volume quoted in USD, Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/uniswap-volume-kpi.md", Key:kpi_volume, Interval:daily, Aggregation:30 day average of the sum of Uniswap v2 and Uniswap v3 daily volume for a preset list of liquidity pools, Rounding:0, Scaling:-6
```


## **Implementation**

We include a description of our methodology so that it could be replicated, but, we also include a script that could be run to generate the values.


### Uniswap v2

**Pair criteria for inclusion**

Uniswap v2 has the following criteria for inclusion in their volume metric:

1. It cannot be listed in the [explicitly blacklisted tokens](https://github.com/Uniswap/uniswap-v2-subgraph/blob/master/src/mappings/helpers.ts#L22)
2. One or both tokens in a pair must be included in the [explicitly whitelisted tokens](https://github.com/Uniswap/uniswap-v2-subgraph/blob/537e5392719ea9b02b3e56a42c1f3eba116d6918/src/mappings/pricing.ts#L42-L63)
3. If there are less than 5 LPs, the liquidity must be higher than 400,000 USD
4. It must meet this criteria at 00:00 UTC on August 1st, 2021.


## Uniswap v3

**Pool criteria for inclusion**

Uniswap v3 has the following criteria for inclusion in their volume metric:

1. One or both tokens in a pair must be included in the [explicitly whitelisted tokens](https://github.com/Uniswap/uniswap-v3-subgraph/blob/main/src/utils/pricing.ts#L12-L34)
2. It must meet this criteria at 00:00 UTC on August 1st, 2021.


### Python Script

The following Python script can be used to collect this data from The Graph

```python
import os
import requests
import time

from datetime import datetime, timedelta, timezone
from pprint import pprint


TZUTC = timezone.utc
THEGRAPHURL = "https://api.thegraph.com/"
session = requests.session()


def submit_query(query, organization, subgraph):
    global session
    # Set the query url using org/subgraph info
    queryable_url = (
            THEGRAPHURL +
            "subgraphs/name/{organization}/{subgraph}"
    ).format(organization=organization, subgraph=subgraph)

    # Build the query
    query_json = {
        "query": query,
    }

    # Make the request
    res = session.post(queryable_url, json=query_json)

    if res.json().get('errors', None):
        print("Received error:")
        pprint(res.json()['errors'])
        # Close the session, wait and try again
        session.close()
        print("Retrying query:")
        pprint(query)
        session = requests.session()
        time.sleep(.5)
        res = session.post(queryable_url, json=query_json)

    return res


ETHERSCANURL = "https://api.etherscan.io/api"
ETHERSCANAPIKEY = os.environ.get("ETHERSCAN_API_UMA")


def find_most_recent_block(ts):
    params = {
        "module": "block",
        "action": "getblocknobytime",
        "closest": "before",
        "timestamp": ts,
        "apikey": ETHERSCANAPIKEY
    }
    res = session.get(ETHERSCANURL, params=params)
    if res.json()["status"] == "1":
        return res.json()["result"]
    else:
        raise ValueError("Failed to find block")


V2_TOKEN_BLACKLIST = ['0x9ea3b5b4ec044b70375236a281986106457b20ef']
V2_TOKEN_WHITELIST = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  # WETH
    '0x6b175474e89094c44da98b954eedeac495271d0f',  # DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  # USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7',  # USDT
    '0x0000000000085d4780b73119b644ae5ecd22b376',  # TUSD
    '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',  # cDAI
    '0x39aa39c021dfbae8fac545936693ac917d5e7563',  # cUSDC
    '0x86fadb80d8d2cff3c3680819e4da99c10232ba0f',  # EBASE
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51',  # sUSD
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',  # MKR
    '0xc00e94cb662c3520282e6f5717214004a7f26888',  # COMP
    '0x514910771af9ca656af840dff83e8264ecf986ca',  # LINK
    '0x960b236a07cf122663c4303350609a66a7b288c0',  # ANT
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',  # SNX
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',  # YFI
    '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',  # yCurv
    '0x853d955acef822db058eb8505911ed77f175b99e',  # FRAX
    '0xa47c8bf37f92abed4a126bda807a7b7498661acd',  # WUST
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',  # UNI
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'  # WBTC
]
V2_MIN_LIQUIDITY_TO_TRACK = 400_000

V3_TOKEN_WHITELIST = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  # WETH
    '0x6b175474e89094c44da98b954eedeac495271d0f',  # DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  # USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7',  # USDT
    '0x0000000000085d4780b73119b644ae5ecd22b376',  # TUSD
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',  # WBTC
    '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',  # cDAI
    '0x39aa39c021dfbae8fac545936693ac917d5e7563',  # cUSDC
    '0x86fadb80d8d2cff3c3680819e4da99c10232ba0f',  # EBASE
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51',  # sUSD
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',  # MKR
    '0xc00e94cb662c3520282e6f5717214004a7f26888',  # COMP
    '0x514910771af9ca656af840dff83e8264ecf986ca',  # LINK
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',  # SNX
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',  # YFI
    '0x111111111117dc0aa78b770fa6a738034120c302',  # 1INCH
    '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',  # yCurv
    '0x956f47f50a910163d8bf957cf5846d573e7f87ca',  # FEI
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',  # MATIC
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'  # AAVE
]


def approved_pairpool(pairpool, v2=True):
    if v2:
        return approved_pair_v2(pairpool)
    else:
        return approved_pool_v3(pairpool)


def approved_pair_v2(pair):
    """
    Parameters
    ----------
    pair : dict
        json representation of pair data

    Returns
    -------
    approved : bool
        True if a pair that should be tracked
    """
    # Get token addresses
    t0a = pair["token0"]["id"]
    t1a = pair["token1"]["id"]

    # Liquidity providers (TODO: Always seems to be 0?)
    lps = pair["liquidityProviderCount"]

    # Get token reserves/prices
    t0p = float(pair["token0Price"])
    t0r = float(pair["reserve0"])
    t1p = float(pair["token1Price"])
    t1r = float(pair["reserve1"])

    # Check whether either token is blacklisted
    if (t0a in V2_TOKEN_BLACKLIST) or (t1a in V2_TOKEN_BLACKLIST):
        return False
    # If both tokens whitelisted then use total reserve
    elif (t0a in V2_TOKEN_WHITELIST) and (t1a in V2_TOKEN_WHITELIST):
        total_reserve_usd = t0p * t0r + t1p * t1r
        if total_reserve_usd > V2_MIN_LIQUIDITY_TO_TRACK:
            return True
        else:
            return False
    # If it reaches this point then both are not in the whitelist
    elif t0a in V2_TOKEN_WHITELIST:
        t0_reserve_usd = (t0p * t0r)
        if 2 * t0_reserve_usd > V2_MIN_LIQUIDITY_TO_TRACK:
            return True
        else:
            return False
    # If it reaches this point then both are not in the whitelist
    elif t1a in V2_TOKEN_WHITELIST:
        t1_reserve_usd = (t1p * t1r)
        if 2 * t1_reserve_usd > V2_MIN_LIQUIDITY_TO_TRACK:
            return True
        else:
            return False
    else:
        return False


def approved_pool_v3(pool):
    """
    Parameters
    ----------
    pool : dict
        json representation of pool data

    Returns
    -------
    approved : bool
        True if a pool should be tracked
    """
    # Get token addresses
    t0a = pool["token0"]["id"]
    t1a = pool["token1"]["id"]

    # Liquidity providers
    lps = pool["liquidityProviderCount"]

    # Get token reserves/prices
    t0p = float(pool["token0Price"])
    t0r = float(pool["totalValueLockedToken0"])
    t1p = float(pool["token1Price"])
    t1r = float(pool["totalValueLockedToken1"])

    if (t0a in V3_TOKEN_WHITELIST) or (t1a in V3_TOKEN_WHITELIST):
        return True

    return False


def identify_v2_pairs(block):
    """
    Identify which pair met the requirements for inclusion
    """
    v2_pair_query = """
    {{
      pairs (
        block: {{number: {block} }},
        orderby: id,
        orderDirection: asc,
        where: {{
          id_gt: "{last_id}",
          volumeUSD_gt: 0
        }},
        first: 750,
      )
      {{
        id,
        token0 {{id, symbol}},
        token1 {{id, symbol}},
        token0Price,
        token1Price,
        reserve0,
        reserve1,
        reserveUSD,
        reserveETH,
        liquidityProviderCount,
        volumeUSD
      }}
    }}
    """

    last_id = "0x0000000000000000000000000000000000000000"
    approved_pairs = []
    while True:
        res = submit_query(
            v2_pair_query.format(block=block, last_id=last_id),
            "uniswap",
            "uniswap-v2"
        )
        res_json = res.json()["data"]["pairs"]

        for pair in res_json:
            # Update id
            last_id = pair["id"]

            # Check whether pair is approved
            pair_approved = approved_pair_v2(pair)
            if pair_approved:
                approved_pairs.append(pair)

        if len(res_json) < 750:
            break

    return approved_pairs


def identify_v3_pools(block):
    """
    Identify which pools met the requirements for inclusion
    """
    v3_pool_query = """
    {{
      pools (
        block: {{number: {block} }},
        orderby: id,
        orderDirection: asc,
        where: {{
          id_gt: "{last_id}"
        }},
        first: 750,
      )
      {{
        id,
        token0 {{id, symbol}},
        token1 {{id, symbol}},
        token0Price,
        token1Price,
        liquidityProviderCount,
        totalValueLockedToken0,
        totalValueLockedToken1,
        totalValueLockedETH,
        totalValueLockedUSD,
        volumeUSD,
      }}
    }}
    """

    last_id = "0x0000000000000000000000000000000000000000"
    approved_pools = []
    while True:
        res = submit_query(
            v3_pool_query.format(block=block, last_id=last_id),
            "uniswap",
            "uniswap-v3"
        )

        res_json = res.json()["data"]["pools"]

        for pool in res_json:
            # Update last volume
            last_id = pool["id"]

            # Check whether pair is approved
            pool_approved = approved_pool_v3(pool)
            if pool_approved:
                approved_pools.append(pool)

        if len(res_json) < 750:
            break

    return approved_pools


def uniswap_v2_pair_volume(pair, ts, ndays=30):
    """
    Computes the average volume over the last `ndays` of trading
    for a particular pair on uniswap v2.

    Returns a value in millions of USD
    """
    # days -> seconds
    nsecs = int(timedelta(days=ndays).total_seconds())

    # Pair query
    v2_query = f"""
      {{
        pairDayDatas (
          orderBy: date,
          orderDirection: desc,
          where: {{
            pairAddress: "{pair}",
            date_gte: {ts - nsecs},
            date_lt: {ts}
          }}
        ){{
          id,
          date,
          dailyVolumeUSD,
        }}
      }}
    """
    res_v2 = submit_query(v2_query, "uniswap", "uniswap-v2")
    volumeUSD = 0
    for day in res_v2.json()["data"]["pairDayDatas"]:
        volumeUSD += float(day["dailyVolumeUSD"]) / 1_000_000

    return volumeUSD / ndays


def uniswap_v3_pool_volume(pool, ts, ndays=30):
    """
    Computes the average volume over the last `ndays` of trading
    for a particular pool on uniswap v3.

    Returns a value in millions of USD
    """
    # days -> seconds
    nsecs = int(timedelta(days=ndays).total_seconds())

    # Pair query
    v3_query = f"""
      {{
        poolDayDatas (
          orderBy: date,
          orderDirection: desc,
          where: {{
            pool: "{pool}",
            date_gte: {ts - nsecs},
            date_lt: {ts}
          }}
        ){{
          id,
          date,
          volumeUSD,
        }}
      }}
    """
    res_v3 = submit_query(v3_query, "uniswap", "uniswap-v3")
    volumeUSD = 0
    for day in res_v3.json()["data"]["poolDayDatas"]:
        volumeUSD += float(day["volumeUSD"]) / 1_000_000

    return volumeUSD / ndays


def uniswap_volume_kpi(
        pp_timestamp, eval_timestamp, range_in_days=30,
        filter_pp_on_block=None, limit=None
):
    """
    Evaluates the Uniswap volume KPI metric (average volume traded in
    both v2 and v3) in two steps:

    1. Find the set of "approved" pairs/pools for the `pp_timestamp`
       (or `filter_pp_on_block`)
    2. Evaluate the average volume traded in those pairs/pools

    Parameters
    ----------
    pp_timestamp : int
        The timestamp that is used to identify pairs/pools for the KPI
    eval_timestamp : int
        The end of the evaluation window -- We'll be interested in the
        average volume from `eval_timestamp - range_in_days` to
        `eval_timestamp`
    range_in_days : int
        The number of days used to average the volume
    filter_pp_on_block : Optional(int)
        Allows one to specify a block rather than a timestamp for
        identifying pairs/pools
    limit : Optional(int)
        Allows one to limit the selection to the `limit` pairs and
        `limit` pools with the highest volume
    """
    # Identify pairs/pools of interest
    block = (
        filter_pp_on_block if filter_pp_on_block
        else find_most_recent_block(pp_timestamp)
    )
    v2_pairs = identify_v2_pairs(block)
    v3_pools = identify_v3_pools(block)

    # Sort pairs and limit if we want to restrict to those with highest
    # volume
    v2_pairs.sort(reverse=True, key=lambda x: float(x["volumeUSD"]))
    v3_pools.sort(reverse=True, key=lambda x: float(x["volumeUSD"]))
    if limit:
        v2_pairs, v3_pools = v2_pairs[:limit], v3_pools[:limit]

    # Average the volumes
    v2_volume = 0
    v2_pairs_to_volume = {}
    for pair in v2_pairs:
        pair_volume = uniswap_v2_pair_volume(pair["id"], eval_timestamp, range_in_days)
        v2_pairs_to_volume[pair["id"]] = pair_volume
        v2_volume += pair_volume

    v3_volume = 0
    v3_pools_to_volume = {}
    for pool in v3_pools:
        pool_volume = uniswap_v3_pool_volume(pool["id"], eval_timestamp, range_in_days)
        v3_pools_to_volume[pool["id"]] = pool_volume
        v3_volume += pool_volume

    return (
        block,
        {'v2': {'kpi': v2_pairs_to_volume, 'pairs': v2_pairs}, 'v3': {'kpi': v3_pools_to_volume, 'pools': v3_pools}},
        {'total': v3_volume + v2_volume, 'v2': v2_volume, 'v3': v3_volume}
    )


if __name__ == "__main__":
    # Get current dates timestamp
    pp_ts = int(
        datetime.fromisoformat("2021-08-01T00:00:00+00:00").timestamp()
    )
    current_ts = int(
        datetime.now(tz=TZUTC).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    )

    # nearest_block, pairs_and_pools, volume = uniswap_average_volume(current_ts, current_ts, 1)
    nearest_block, pairs_and_pools, volume = uniswap_volume_kpi(pp_ts, current_ts, range_in_days=30, limit=None)
    pprint({
        'Timestamp:': current_ts,
        'block': nearest_block,
        'v2_eligible_pairs': [
            address
            for address in pairs_and_pools['v2']['kpi'].keys()],
        'v3_eligible_pools': [
            address
            for address in pairs_and_pools['v3']['kpi'].keys()],
    })

    pprint({
        'v2_eligible_volume': volume['v2'],
        'v3_eligible_volume': volume['v3'],
        'kpi_volume': volume['total']
    })

```


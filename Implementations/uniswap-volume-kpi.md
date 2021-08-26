# Uniswap Volume KPI Calculation


## Summary

This calculation is intended to track the volume (denominated in USD) across both V2 and V3 Uniswap on Ethereum.

The recommended method is to query TheGraph for Uniswap's volume. This document will detail the method that will be used to query TheGraph and also mitigate some attack vectors to manipulate the volume. The main vector of attack that we are concerned about is wash-trading where people create new pools based on worthless tokens and then drive volume up by trading the token back and forth with themself -- In practice, it would be difficult to make this profitable given the amount of trade volume that already occurs and the benefits/costs of doing so (the gas fees alone would likely be higher than the increased payoff one would receive).

However, we think it's important to protect the KPI from this and similar attack vectors and so we will compute the volume in two steps:

1. Identify a set of pairs/pools.
  - We choose to use the criteria that Uniswap itself uses to only track "meaningful usage".
  - We then took a snapshot of pools with "meaningful usage" at 00:00 UTC on August 1st, 2021.
2. Compute the volume
  - In order to further fend off manipulation, we will use an average of 30 day daily volume rather than using a single day's volume.

In this document, we'll closely mimic the methodology that Uniswap uses on their website, but, if we wanted, we could design our own criteria to choose pairs/pools or pick a different number of days.


## Intended Ancillary Data

```
Metric:Uniswap v2 and v3 30 day average daily volume quoted in USD, Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/uniswap-volume-kpi.md", Key:kpi_volume, Interval:daily, Aggregation:30 day average of the sum of Uniswap v2 and Uniswap v3 daily volume for a preset list of liquidity pools, Rounding:0, Scaling:-6
```


## Implementation

We include a description of our methodology so that it could be replicated, but, we also include a script that could be run to generate the values.


### Uniswap v2

**Pair criteria for inclusion**

Uniswap v2 has the following criteria for inclusion in their volume metric:

1. It cannot be listed in the [explicitly blacklisted tokens](https://github.com/Uniswap/uniswap-v2-subgraph/blob/master/src/mappings/helpers.ts#L22)
2. One or both tokens in a pair must be included in the [explicitly whitelisted tokens](https://github.com/Uniswap/uniswap-v2-subgraph/blob/537e5392719ea9b02b3e56a42c1f3eba116d6918/src/mappings/pricing.ts#L42-L63)
3. If there are less than 5 LPs, the liquidity must be higher than 400,000 USD
4. It must meet this criteria at 00:00 UTC on August 1st, 2021.

In addition to these criteria, we restrict it further to keep only the 250 pairs with the highest volume on the date of evaluation.

The included pairs are listed in the appendix.


### Uniswap v3

**Pool criteria for inclusion**

Uniswap v3 has the following criteria for inclusion in their volume metric:

1. One or both tokens in a pair must be included in the [explicitly whitelisted tokens](https://github.com/Uniswap/uniswap-v3-subgraph/blob/main/src/utils/pricing.ts#L12-L34)
2. It must meet this criteria at 00:00 UTC on August 1st, 2021.

In addition to these criteria, we restrict it further to keep only the 1,000 pools with the highest volume on the date of evaluation.

The included pools are listed in the appendix.


## Appendix

**Python script**

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


def evaluate_v2_volume(pairs, eval_timestamp, range_in_days):
    # average the volumes
    v2_volume = 0
    v2_pairs_to_volume = {}
    for pair in pairs:
        pair_volume = uniswap_v2_pair_volume(pair["id"], eval_timestamp, range_in_days)
        v2_pairs_to_volume[pair["id"]] = pair_volume
        v2_volume += pair_volume

    return v2_volume, v2_pairs_to_volume


def evaluate_v3_volume(pools, eval_timestamp, range_in_days):
    v3_volume = 0
    v3_pools_to_volume = {}
    for pool in pools:
        pool_volume = uniswap_v3_pool_volume(pool["id"], eval_timestamp, range_in_days)
        v3_pools_to_volume[pool["id"]] = pool_volume
        v3_volume += pool_volume

    return v3_volume, v3_pools_to_volume


def uniswap_volume_kpi(
        pp_timestamp, eval_timestamp, range_in_days=30,
        filter_pp_on_block=None, v2_limit=75, v3_limit=750
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
    v2_limit : Optional(int)
        Allows one to limit the selection of v2 pairs to the `limit`
        pairs and with the highest volume
    v3_limit : Optional(int)
        Allows one to limit the selection of v3 pools to the `limit`
        pools and with the highest volume
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
    if v2_limit:
        v2_pairs = v2_pairs[:v2_limit]
    if v3_limit:
        v3_pools = v3_pools[:v3_limit]

    # average the volumes
    v2_volume, v2_pairs_to_volume = evaluate_v2_volume(
        v2_pairs, eval_timestamp, range_in_days
    )
    v3_volume, v3_pools_to_volume = evaluate_v3_volume(
        v3_pools, eval_timestamp, range_in_days
    )

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

    # Evaluate KPI from pairs/pools or "from scratch"... Set to `False`
    # once this has been run at least once
    reset = True
    if reset:
        nearest_block, pairs_and_pools, kpi_volume = uniswap_volume_kpi(
            pp_ts, pp_ts, range_in_days=30, v2_limit=250, v3_limit=1_000
        )

        with open("v2_pairs.json", "w") as f:
            json.dump(pairs_and_pools["v2"]["pairs"], f)
        with open("v3_pools.json", "w") as f:
            json.dump(pairs_and_pools["v3"]["pools"], f)
        with open("kpi_volume.json", "w") as f:
            json.dump(kpi_volume, f)

    else:
        pairs_and_pools = {
            "v2": {},
            "v3": {}
        }
        with open("v2_pairs.json", "r") as f:
            pairs_and_pools["v2"]["pairs"] = json.load(f)
        with open("v3_pools.json", "r") as f:
            pairs_and_pools["v3"]["pools"] = json.load(f)
        with open("kpi_volume.json", "r") as f:
            kpi_volume = json.load(f)

    # Evaluate KPI
    v2_volume, v2_pairs_to_volume = evaluate_v2_volume(
        pairs_and_pools["v2"]["pairs"], current_ts, 30
    )
    v3_volume, v3_pools_to_volume = evaluate_v3_volume(
        pairs_and_pools["v3"]["pools"], current_ts, 30
    )

    volume = {
        "v2": v2_volume,
        "v3": v3_volume,
        "total": v2_volume + v3_volume
    }

    pprint({
        'v2_eligible_volume': volume['v2'],
        'v3_eligible_volume': volume['v3'],
        'kpi_volume': volume['total']
    })

    kpi_val = max(0.5, min(1.0, volume["total"]/(2*kpi_volume["total"])))
    print("The KPI option is currently worth:")
    print(f"\t{kpi_val} UNI")

```

**Approved v2 pools**

'0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc','0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852','0xa478c2975ab1ea89e8196811f51a7b7ade33eb11','0xbb2b8038a1640196fbe3e38816f3e67cba72d940','0xd3d2e2692501a5c9ca623199d38826e513033a17','0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974','0x3041cbd36888becc7bbcbc0045e3b1f144466f5f','0x43ae24960e5534731fc831386c07755a2dc33d47','0x61b62c5d56ccd158a38367ef2f539668a06356ab','0xf6dcdce0ac3001b2f67f750bc64ea5beb37b5824','0xfd0a40bc83c5fae4203dec7e5929b446b07d1c76','0x6591c4bcd6d7a1eb4e537da8b78676c1576ba244','0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d','0xc50ef7861153c51d383d9a7d48e6c9467fb90c38','0xdfa42ba0130425b21a1568507b084cc246fb0c8f','0x004375dff511095cc5a197a54140a24efef3a416','0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5','0x514906fc121c7878424a5c928cad1852cc545892','0xf80758ab42c3b07da84053fd88804bcb6baa4b5c','0xd3d8c734f06229e36febd07505d8f57b7b78af7c','0xb20bd5d04be54f870d5c0d3ca85d82b34b836405','0x1812ef69e1753f908229df40d304a5fbdcd52dd3','0x85673c92f0f27a9c4d8c221f6bfefa33b716338a','0xb4d0d9df2738abe81b87b66c80851292492d1404','0x01388f9242964e2aaadef6379eb92276acb5520e','0x67b3825348521b94828127f1ee31da80ee67d285','0x5b1e45ca08fa4d65aa7fdcf9e116990fb7fce73b','0xedf1fa564a91a5664f172470c47450af17724757','0xfcd13ea0b906f2f87229650b8d93a51b2e839ebd','0x169bf778a5eadab0209c0524ea5ce8e7a616e33b','0x3155acd9f75915fcc21d34035f440da7040bd3ba','0x8c1c499b1796d7f3c2521ac37186b52de024e58c','0x1b87fde6af5396165fdadf7f532784622a824abf','0x55df969467ebdf954fe33470ed9c3c0f8fab0816','0x1cd926f3e12f7b6c2833fbe7277ac53d529a794e','0x4a0ea6ad985f6526de7d1ade562e1007e9c5d757','0xfa19de406e8f5b9100e4dd5cad8a503a6d686efe','0xbbc95e1eb6ee476e9cbb8112435e14b372563038','0x1a57ec5459928389fbb5612ff2a5e0b534fd9e2e','0x524847c615639e76fe7d0fe0b16be8c4eac9cf3c','0xa40bb1c47f6dd27142a2bd7c93bfa98db9d1f5c5','0xf6c4e4f339912541d3f8ed99dba64a1372af5e5b','0x3e78f2e7dade07ea685f8612f00477fd97162f1e','0x4b8852e4747b8a7d4caf0440e4e3397032a6723d','0xbbf933c1af0e9798615099a37a17cafc6da87732','0x2dc9d00da9542f91d5391be53ed1d58a04ec1c07','0x181655fee818e1e22c8aebb780c716e15b6f29aa','0x7f0ad87b99ba16e6e651120c2e230cf6928c3d15','0xe53533f78787c63735c77c9e2f9c60081b942cdb','0x0e9c8107682ab88604b4fbf847eeeceacf38e9e6','0x576cea6d4461fcb3a9d43e922c9b54c0f791599a','0x0b41854f5d251c12b1de6a88dd4292944f04305c','0x0e20642b32567f2dc74f149663fc474f534e1d5a','0x83973dcaa04a6786ecc0628cc494a089c1aee947','0x873056a02255872514f05249d93228d788fe4fb4','0x51bf9908dac4a283d017edc071d954ec3a4b1376','0x0555f052da0a50d39369b0f634855edc858baa18','0x819de42d3ab832eaf7111a222a8a5a7419f13b48','0x5551c4812a89bf840e3da6debd4cb1a2d5322e3a','0x82cd7e4b567ad7d2a00c3cc93ac968ccb61cafca','0xa0abda1f980e03d7eadb78aed8fc1f2dd0fe83dd','0xd876bea7f5121a8e21459224e58aec6c933a16e9','0x127146432d25686959d21f732a70274d0833031b','0xd75d1b30967d94b105f82f572ae7591cc3c48beb','0xf0d1109e723cb06e400e2e57d0b6c7c32bedf61a','0x8014851acaa37e277e7369c5a850f29a152b1169','0x4cd36d6f32586177e36179a810595a33163a20bf','0x2702bd7268793b5e1c7ee1ac2d9cae2ae2ecfe55','0x1e45eae7461c56529e5cc335f6b1f797576f8a27','0x4d5ebb22982ffeccb7b3e42a624555cb313285f0','0x9bd82673c50acb4a3b883d61e070a3c8d9b08e10','0xa39d7a85553a46faeb3ba5e0c49d6a5db67df30f','0xcc01d9d54d06b6a0b6d09a9f79c3a6438e505f71','0x231b7589426ffe1b75405526fc32ac09d44364c4','0x0de0fa91b6dbab8c8503aaa2d1dfa91a192cb149','0x420725a69e79eeffb000f98ccd78a52369b6c5d4','0x3b44f35fd81040e4d0cdccfe77714512feb1da4d','0x5ac13261c181a9c3938bfe1b649e65d10f98566b','0x7b28470032da06051f2e620531adbaeadb285408','0xeacd8a344c16b5724819c7a1c253da07f2ca50a4','0xdfb8824b094f56b9216a015ff77bdb056923aaf6','0x4a5cf9ecc6fdd4750df92a33ced79d477d9298c8','0x4a9596e5d2f9bef50e4de092ad7181ae3c40353e','0x1bcce9e2fd56e8311508764519d28e6ec22d4a47','0x5393b489e9bfb09be9cac59ed5c65cacc55cdebd','0xde6faedbcae38eec6d33ad61473a04a6dd7f6e28','0x337b182f3cafe0b3ea6105a1816aa369f3607885','0xf6887ad6f3b342840dbea138e8003f2ca14f4500','0x1197774e49f98b24c7afa88f0eb6fbd0e0786a0a','0xf94556124786e08171d278a75cf1b46ee9592227','0x9b316fef970906ec6396f67bed42de7569cfc293','0xde93684627d4e34d6ef96adf5bcabf10bbd8dd81','0x63c15476fc7c95b4d9023889e34ac491727c7220','0x5811ec00d774de2c72a51509257d50d1305358aa','0xb0071ed8e754e181f420a9e3066acea12e4f5035','0xf52f433b79d21023af94251958bed3b64a2b7930','0xeb0ea2a9dcaa1cd018f567eb0ddcfcb7e0f33e2e','0x1287f7d44369dd1a4bffcc78ab0931b7d7905ace','0x05a4fa8d7672bafc097223ce1188fa8940db2ddf','0x457fb8deb24e557f3d88ff1ce4f4c0c65d062cf9','0x8d8da72161da2d800ebdd2a316214eac7c32fca0','0x8c4621ab8aebbed0eb63da72f90757e8046ee84f','0xbaeca7c35346a8d31811ef971f38603012a12c1e','0x4161fa43eaa1ac3882aeed12c5fc05249e533e67','0xdd71f5e002143d34ea24696600bc4d82b904fafa','0x3796fee2b555da1356cdcd3e1861263b351a58a0','0xdb88a24e930b3150a9e0328ae8c7e2f811a109fb','0x64544d00595b61daaa2e1ef6fcc5a71876a897c4','0x89c0203c0bc466a0f865bb7895cf8a795c2f5252','0x7fe3b669528fd5374f7649365934b8de14e9ad79','0xccb93c0423009b13aef6a322c9d9cd789ba5b38e','0x67258f507ee5ce6bff8d589749f4380cfa9b0131','0x2fe21244d5033f9994a13bd1de040848979106b4','0xb30e2e395a3c028723084b0dd33df3e48f8bab73','0x8cef7165a30c19a2b2b3c7534b688c3ef29ee8a0','0xe53bfffd5d9a53250a3f30409fdc463cb5ed05e1','0xebfb684dd2b01e698ca6c14f10e4f289934a54d6','0xdf4ecf0e9432739605c5e095e09509993db784dd','0x6d74443bb2d50785989a7212ebfd3a8dbabd1f60','0xfa2261abb7733de5d2a518d091b72c45358d4890','0xedf187890af846bd59f560827ebd2091c49b75df','0x3c7bcaf39cc579e3a978cb371d00a13f5ab7e4da','0xb9e44be76949d95155e0994658909ca4feb9a872','0x44bff84e393f7fad97a4bfce96c1f921597bef90','0x44fa3d570f1838dcf079ac7d19b8f2d23e2b889f','0xd1411f0b0fe951e6ccc21140a2bf459de9942146','0x647dfe2c81ac8fecabe5484067bb846a21387a4a','0x33aa84cf1f0a227bd37cee5d8a58afadb8357e2a','0xe61530bd58392488f7a8d33ad1c1f59626e2f650','0x37d86a952f70d16ce1280a78c48c5b3166249710','0x2e5919bd8af91e32a52c8f83375bd67f3bcee651','0xec5c7dba9911c2e6b21337760e7c6ffdfaa16a88','0x14094f829a710075ae6a43f5c62f139049dd486f','0x572954910f9f3bdc208656d25e2402964d7c9aab','0xbf25d9fbf23a8c09b3b057c49195245714619eee','0xf2486c8f03afb444783427d620bf75510766e88d','0xbe0e9df2cf58e03dc47e7c0061cdb0f9537aeb23','0xdef7d7888f88963aa0b759de22f093133074329f','0x477fa5406598f8eb1945291867e1654c4d931659','0xd6d0ff42a885d8fed4bf18adedb1664b2d43e031','0xf2d836bb0d850a97efcd273eb6456b9c0f1f1847','0x4979816528b6aea7693e17e4dca9e32c1e37ec4f','0x852c15b77917ca7f97c258c5405b8ab52622ea24','0x5aa90dacbaa92d7a4cf057f79a4986afec3591c1','0x7fe0a2ffa9ffc907cdfb063a64aa2d538af58828','0x199cfb20d800154d024c718339d7ea61782b9ad6','0xc19f8e172078f5c2f36f5670bd54d4ed34ea7993','0x72fdeb53760a17f0861aa7bbdc2e52f676c2a6d2','0x7aee34d421fa24c2e29aa7267647818191903d53','0x5c16df9ed36cb42ad4fca9d2fe65ee3e15b338c8','0x34a0216c5057bc18e5d34d4405284564efd759b2','0xd844f967ef59cb46f2f6d2cabfe722f2e22768a5','0xe711e56f517f9e7f389d04cce875ebb4793907dd','0x90d5d478fdb3248879e9f39dc166cebb60375d6d','0x13969823767079eba8e77c0f4d90211914585499','0xd0f95b791a8c1e4c1fd473d345d440f2e51febaf','0x57a5dd974adac8738d6796502c899d13e8903141','0x33a30384cc7facc64bf66aa1f921da2175c481b6','0x94d5984b6063734bb7d051fda65418a5621c427f','0x18e7ade6b1a434e5b2f8b9af81b81e206778271a','0x31ad702e2c5154109da3090569115e6256ec24f8','0x2e133686ef8ed43eb3da66d3d5f2d27141c1e887','0xa0c0ad76a8f3e7fd87f3b1d1fe9946c396ac18b2','0x8af91a49dc547d8dc52d65393671ddd1c6ddcd24','0x91be2e7d3281ef10de0fa499db9e26afe395adf4','0x0baedd006630ef5a4d04bcafd0debed663def952','0xde9ba99a2be78de37a2eb1e22c9d6bb36ffe5419','0x818bb1c0a6866187a68c1cb0954bd0ad120eb8d7','0xb8784a63baa63ca26b40debf916540c6ee3291e6','0x7d049d15c37ba3344a43f835093e0bd905086105','0xbbed93cfe236e607cb1f5cfd3ba842c6605cad59','0x72856ac66f5d128a7bc00041b3b09749411b3d8e','0x8b00af93314928ae30892648bf2aadec2f15226a','0x2cf03eaab7635926186cb2ea54f8efb8c0fbc17a','0x2b797191b77b7579a5c32027174d79ab7b725114','0x6a5513550ea0e71eba0c365c878423cd9ab8f042','0x9dec9ad7de7850b391eef1977768a87449fe97bc','0xa0c6bea330e8e3cae10fd0c742c7fc5943feef62','0x465b364f8f186fd7e3c6b763a8cf2804ff2be034','0x14c0c25b35b98cb63e954993d037062f6c43f1d3','0xb0b4d81ce4a69516ddd9f4818db5dd3e1b1740e8','0xe3075918b21bb25fd4d0a3e58c8c85c56dc2289b','0x531bc749824cabc8cc368c9f4cf021cd5355e257','0x0a1da4f773f40478a494ec755c5536832380e4f8'

**Approved v3 pools**

'0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8','0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640','0x4e68ccd3e89f51c3074ca5072bbac773960dfa36','0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf','0xcbcdf9626bc03e24f779434178a73a0b4bad62ed','0x60594a405d53811d3bc4766596efd80fd545a270','0x11b815efb8f581194ae79006d24e0d814b7697f6','0x6c6bc977e13df9b0de53b251522280bb72383700','0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8','0x99ac8ca7087fa4a2a1fb6357269965a2014abc35','0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801','0x4585fe77225b41b697c938b018e2ac67ac5a20c0','0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8','0x6f48eca74b38d2936b02ab603ff4e36a6c0e3a77','0x5764a6f2212d502bc5970f9f129ffcd61e5d7563','0x5180545835bd68810fb7e11c7160bb7ea4ae8744','0x8c54aa2a32a779e6f6fbea568ad85a19e0109c26','0x69d91b94f0aaf8e8a2586909fa77a5c2c89818d5','0x151ccb92bc1ed5c6d0f9adb5cec4763ceb66ac7f','0x06729eb2424da47898f935267bd4a62940de5105','0x3019d4e366576a88d28b623afaf3ecb9ec9d9580','0x290a6a7460b308ee3f19023d2d00de604bcf5b42','0x2f62f2b4c5fcd7570a709dec05d68ea19c82a9ec','0x84383fb05f610222430f69727aa638f8fdbf5cc1','0xbd5fdda17bc27bb90e37df7a838b1bfc0dc997f5','0x0cfbed8f2248d2735203f602be0cae5a3131ec68','0xf87bb87fd9ea1c260ddf77b9c707ad9437ff8364','0xe8c6c9227491c0a8156a0106a0204d881bb7e531','0xea4ba4ce14fdd287f380b55419b1c5b6c3f22ab6','0xcb0c5d9d92f4f2f80cce7aa271a1e148c226e19d','0x9ac681f68a589cc3763bad9ce43be3380696b136','0x868b7bbbfe148516e5397f23982923686182c2d2','0x138080a0036e8c2c4c79d21e2a2c535fe0887d68','0xc246467ab1466f4963ba45c335479b3055e82060','0x86e69d1ae728c9cd229f07bbf34e01bf27258354','0x24ee2c6b9597f035088cda8575e9d5e15a84b9df','0x9e0905249ceefffb9605e034b534544684a58be6','0x06b1655b9d560de112759b4f0bf57d6f005e72fe','0x3139bbba7f4b9125595cb4ebeefdac1fce7ab5f1','0xcd83055557536eff25fd0eafbc56e74a1b4260b3','0x6f483af1e32cc556d92de33c0b15c0f8b03a6d12','0x5ab53ee1d50eef2c1dd3d5402789cd27bb52c1bb','0xd35efae4097d005720608eaf37e42a5936c94b44','0x92995d179a5528334356cb4dc5c6cbb1c068696c','0x9a772018fbd77fcd2d25657e5c547baff3fd7d16','0x7bea39867e4169dbe237d55c8242a8f2fcdcc387','0x16980c16811bde2b3358c1ce4341541a4c772ec9','0x68082ecc5bbad8fe77c2cb9d0e3403d9a00ccbc2','0x9febc984504356225405e26833608b17719c82ae','0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52','0x04916039b1f59d9745bf6e0a21f191d1e0a84287','0x8f8ef111b67c04eb1641f5ff19ee54cda062f163','0xd1d5a4c0ea98971894772dcd6d2f1dc71083c44e','0x3bc810483e4e2344f0e114a57af13cedc44cf717','0x2efec2097beede290b2eed63e2faf5ecbbc528fc','0x4c83a7f819a5c37d64b4c5a2f8238ea082fa1f4e','0x07ed78c6c91ce18811ad281d0533819cf848075b','0x11a38dbd302a30e52c54bb348d8fe662307ff24c','0xd017617f6f0fd22796e137a8240cc38f52a147b2','0xba8eb224b656681b2b8cce9c3fc920d98594675b','0x2028d7ef0223c45cadbf05e13f1823c1228012bf','0x829e48efcff5e879a8e1a789ac173449decb591f','0xb7c90598ccdaebcd14f43fa6635c422c3c5cecca','0x04ed15a29addad1e8189026d17879403997050a3','0x3840d56cfe2c80ec2d6555dcda986a0982b0d2db','0xdd5a65da22031b6ae5205fd89f67b5141e4f0ead','0x4c54ff7f1c424ff5487a32aad0b48b19cbaf087f','0xcba27c8e7115b4eb50aa14999bc0866674a96ecb','0xe16be1798f860bc1eb0feb64cd67ca00ae9b6e58','0x7ec0b75a98997c927ace6d87958147a105147ea0','0x6a9850e46518231b23e50467c975fa94026be5d5','0x94e4b2e24523cf9b3e631a6943c346df9687c723','0x73a6a761fe483ba19debb8f56ac5bbf14c0cdad1','0x98409d8ca9629fbe01ab1b914ebf304175e384c8','0xcd9dab5e666de980cecdc180cb31f296733e2587','0x122e55503a0b2e5cd528effa44d0b2fea300f24b','0xfa7d7a0858a45c1b3b7238522a0c0d123900c118','0x058d79a4c6eb5b11d0248993ffa1faa168ddd3c0','0xede8dd046586d22625ae7ff2708f879ef7bdb8cf','0x94b4ba66da4faa4fe09e17c0a8810d2afee70163','0xc4580c566202f5343883d0c6a378a9de245c9399','0x24dbedb4699eb996a8ceb2baef4a4ae057cf0294','0x3730ecd0aa7eb9b35a4e89b032bef80a1a41aa7f','0x632e675672f2657f227da8d9bb3fe9177838e726','0xc5af84701f98fa483ece78af83f11b6c38aca71d','0xcbbc981bd5b358d09a9346726115d3ac8822d00b','0x94391eecd76d9cb35013d7f263b64921e31842c8','0xd124c5808a0d89738e0aef655c0aa19ec6175811','0xf359492d26764481002ed88bd2acae83ca50b5c9','0x9db9e0e53058c89e5b94e29621a205198648425b','0x80c7770b4399ae22149db17e97f9fc8a10ca5100','0x9359c87b38dd25192c5f2b07b351ac91c90e6ca7','0x00cef0386ed94d738c8f8a74e8bfd0376926d24c','0xefbd546647fda46067225bd0221e08ba91071584','0xc29271e3a68a7647fd1399298ef18feca3879f59','0x861d75271e2cde18d927c5170fbf22bf472a7d1a','0xf8a95b2409c27678a6d18d950c5d913d5c38ab03','0x381fe4eb128db1621647ca00965da3f9e09f4fac','0x7379e81228514a1d2a6cf7559203998e20598346','0xda14993eee56d3fb77f23c19b98281deb385e87a','0x3289c15810e20ace49ad16b56a0db8d78bd10117','0xf7849d0852fc588210b9c0d8b26f43c0c9bc1470','0x24099552f5dadd07c4c3e32c52fd7109e7c72727','0xe2c5d82523e0e767b83d78e2bfc6fcd74d1432ef','0x886072a44bdd944495eff38ace8ce75c1eacdaf6','0xfaace66bd25abff62718abd6db97560e414ec074','0x2a84e2bd2e961b1557d6e516ca647268b432cba4','0x4f2f3bdf115539a78a30769eb42489bd0f9d47da','0xb1608e16609a7ff3ac5b0da49a0539bb0c3c3d9d','0xb06e7ed37cfa8f0f2888355dd1913e45412798c5','0xda827fe99adb2643d80fd30f750b8b96321d7726','0x4e57f830b0b4a82321071ead6ffd1df1575a16e2','0x0e2c4be9f3408e5b1ff631576d946eb8c224b5ed','0xb0f4a77bde7fee134265307c5cc19abff0ba409b','0xf4ad61db72f114be877e87d62dc5e7bd52df4d9b','0x9bd730ddcfe6b5b9ecba1cf66e153adaa807e238','0x22a0738bde54050ffc04408063fd5fbdc1205bdf','0x4e0924d3a751be199c426d52fb1f2337fa96f736','0xc772a65917d5da983b7fc3c9cfbfb53ef01aef7e','0x5720eb958685deeeb5aa0b34f677861ce3a8c7f5','0x2837809fd68e4a4104af76bbec5b622b6146b2cb','0x0923b26b1874d76e9141450cc69241229e04914d','0x34b8487fc2912c486b04d1436b07f19f7730cd43','0xbc9b75563e8df1dc761589444103342ec582cc29','0xa80964c5bbd1a0e95777094420555fead1a26c1e','0x2dd56b633faa1a5b46107d248714c9ccb6e20920','0x14de8287adc90f0f95bf567c0707670de52e3813','0x4eb91340079712550055f648e0984655f3683107','0xd0fc8ba7e267f2bc56044a7715a489d851dc6d78','0x8661ae7918c0115af9e3691662f605e9c550ddc9','0x64652315d86f5dfae30885fbd29d1da05b63add7','0xa20ad630cee74bc834aa9b8fcb432c5c02710479','0xdc7b403e2e967eaf6c97d79316d285b8a112fda7','0xe83bad50c0b3f58ded74ecd67f001337e319075f','0xfb1833894e74ebe68b8ccb02ae2623b838b618af','0x3470447f3cecffac709d3e783a307790b0208d60','0x92624da803a3e90f673c73195db8830f08219fc0','0xf1b63cd9d80f922514c04b0fd0a30373316dd75b','0x094a28b22e1b4218d590ea6fa916b3c5e670ba55','0xac6ccc2365ad727a8385438b72ee9f51aac81ccb','0x2b255d3785da10e1753dd4bff781c04ca3c87686','0x27dd7b7d610c9be6620a893b51d0f7856c6f3bfd','0x283e2e83b7f3e297c4b7c02114ab0196b001a109','0xc3f6b81fb9e6db259272026601689e383f94c0b0','0x0d47fedc9f84ceb8c95719bb6b684b50645cf2f0','0x9a9cf34c3892acdb61fb7ff17941d8d81d279c75','0xf5381d47148ee3606448df3764f39da0e7b25985','0x919fa96e88d67499339577fa202345436bcdaf79','0x00f59b15dc1fe2e16cde0678d2164fd5ff10e424','0x71eaa3f86a541177f64a15c5f5479aedcc426860','0x784479024251d7f3a6437346b5962c28c8e45061','0xbcc2adccd4de0b2656179f729c98c39dcd68c84d','0x500dcb12218a66b4aca4cc246af1e4003d02e042','0x319f4366b2ec8b0120d09522c88f919bedbb18ff','0xd94fdb60194fefa7ef8b416f8ba99278ab3e00dc','0xeb30e8ffcbd02fd4a14a52e28cd300698d00e2f7','0x1eefc75cc4458e651480e80d74b263b77a93cb11','0x5d65ecbe922c0f93905121ec6806c185f1ebe268','0xcfecabe399f08a4cbd3c1abb6783b5678d526834','0x59c38b6775ded821f010dbd30ecabdcf84e04756','0xfe4ec8f377be9e1e95a49d4e0d20f52d07b1ff0d','0x6ab3bba2f41e7eaa262fa5a1a9b3932fa161526f','0x157dfa656fdf0d18e1ba94075a53600d81cb3a97','0xe4b82df044511a7162bea1f11119f6d1283a43a8','0x13dc0a39dc00f394e030b97b0b569dedbe634c0d','0x2a0330c7e979a4d18e5b0c987b877da24dd37d04','0x60a6b23a7a87c5ce9e3f81c869691f784b18a704','0x14424eeecbff345b38187d0b8b749e56faa68539','0x8581788cef3b7ee7313fea15fe279dc2f6c43899','0x07a6e955ba4345bae83ac2a6faa771fddd8a2011','0xe3a4f7959f4e4aac08ae3029d3a707ef4ec6da95','0x22a80b1365b651eb61ed90f5d732be7735efc43f','0x5447b274859457f11d7cc7131b378363bbee4e3a','0x3b4f91c5f96d39235b1baf54dc0cfde5b6d36982','0x126b3e5bfe28244626d4b294a84c50d8a2297859','0x7270233ccae676e776a659affc35219e6fcfbb10','0xe331de28cd81b768c19a366b0e4e4675c45ec2da','0xaf585783337434fee47c9abfbd737156f9a84dd1','0x495864cad6cf60e97efcd3f14ff8b1f167956ba2','0x84ae4aa9581e6b7f50f660c5b6970aef1ed82be8','0x81216f193e8bed640a2378c38d689ebacc4b5d2c','0xfaa318479b7755b2dbfdd34dc306cb28b420ad12','0x7de84ce7b87bda2a73f8b06c6549bfba99910a40','0x71d4c0837080dc6dea591db7aafc011dde540d67','0xae614a7a56cb79c04df2aeba6f5dab80a39ca78e','0x5864dea5f1750d1f8887f9fb7f3a50f15789514e','0xfc9f572124d8f469960b94537b493f2676776c03','0x99530180bd113a816f5920d0748528cfb2009585','0x391e8501b626c623d39474afca6f9e46c2686649','0xc1cd3d0913f4633b43fcddbcd7342bc9b71c676f','0x11184bf5937beb9085b4f070e7b410be052e37a6','0x95311bbcf02608c64ec3889515af9fe43aea9e3a','0xaf1291730f716e13791d3bd837c7c31111a01778','0x9f178e86e42ddf2379cb3d2acf9ed67a1ed2550a','0x02d436dc483f445f63aac45b37db0ee661949842','0xd83d78108dd0d1dffff11ea3f99871671a52488b','0x360b9726186c0f62cc719450685ce70280774dc8','0xf2c3bd0328bdb6106d34a3bd0df0ef744551cc82','0xc2aecaa79e3376f9b058c13d2718b39a077555df','0xb6873431c2c0e6502143148cae4fab419a325826','0xc66af8bb2be8722c6151f2215a94f19580b15090','0xf90321d0ecad58ab2b0c8c79db8aaeeefa023578','0xa424cea71c4aea3d11877240b2f221c027c0e0be','0x695b30d636e4f232d443af6a93df95afd2ff485c','0x87b1d1b59725209879cc5c5adeb99d8bc9eccf12','0x5aaa28ca43c6646fd1403e508f0fca1d92357dde','0x917c52869df752d784ec73fa0881898f9bfd0fd8','0x0eedddcf6e26495d2bb6fc21fd565bf20818ec81','0x07f3d316630719f4fc69c152f397c150f0831071','0x82743c07bf3be4d55876f87bca6cce5f84429bd0','0x7cebafc6fd780c266c25329138b56bfe251c8f86','0x655e25fed94ddb846601705ace4349815e2a95d1','0x8d9fa72ca6e2add4ffc2f3695fb2d4ea4ba105eb','0xcdb0bacd8dc32c45dce0f97536646cd40835fd93','0x67e887913b13e280538c169f13d169a659a203de','0x8ecc2244e67d0bb6a1850b1db825e25354cf881a','0x5b781915b6b610a1aba8135ad5df084ffe528da4','0x2519042aa735edb4688a8376d69d4bb69431206c','0xb66c491e2356bf32b7e3ea14af7f60b3ed171a22','0x6b1c477b4c67958915b194ae8b007bf078dadb81','0xa93eb5b410b651514a18724872306f5ce9928dde','0xe8b977aa5a9303fa94818441d78575e0f697ae72','0xa46466ad5507be77ff5abdc27df9dfeda9bd7aee','0x3125e45d5665e98a08388a7df051a728b647eaae','0xd0effc6828972483db1c64106f71d6ad12606a53','0xda434d7b379f770d32601fa571532c0c75a528ee','0xaaaa50ab9c0eb7ca6e797cfe05d9805d61687e10','0xf784ce42e5d95a9f047bb6dec0d20729a30ceb77','0xf7a716e2df2bde4d0ba7656c131b06b1af68513c','0x8f0cb37cdff37e004e0088f563e5fe39e05ccc5b','0x1a205d1ef7fb2b247fea813934cf961dc98bc70b','0xba3f54d4ed114a359b3ab81ed11834a2b54addc1','0x35815d67f717e7bce9cc8519bdc80323ecf7d260','0x8b6ed5fa776f10787f1171bdeea4f3c40974df6e','0xd5ad5ec825cac700d7deafe3102dc2b6da6d195d','0xefc19ba107bf1ce57a7ab5dea228fffb899abeb0','0x3a5dbafbac514a0b40dcdf3bc3ff7763da9d2d37','0x0ce3e9e879b4623a902ee08a9921a4b9d8b27d71','0x418eb2f342d8189d480506ed814bcdf8cac52254','0x820e5ab3d952901165f858703ae968e5ea67eb31','0xb8c05b7ca698f7cfd9b8a08f177e0ac5f2696bf9','0xb1914469141ebb6e244e75cee3f35d43bf6b85e5','0x99c7550be72f05ec31c446cd536f8a29c89fdb77','0x4fde70fdadfdb82295efacef32c48328f830ab75','0xff9704a23d4c4f57c69d86e1113c1e9204cd804e','0xc75a99fa00803896349891f8471da3614bd07564','0xe4bb8d8b001502ed418ebd7a5b952ade6f305b18','0xdca19fac93729e44ccfb877fc570af7155f0f779','0x21ca348fef9f09fdb79b155a75efa7f02f82733a','0xc61b91ad56b5e8c5e4ac120c5e2e7c382f1e6844','0xbbdf8c6f272a65fe0294ef775b463b43327190d9','0x083178e6adcadbda37c02c47b1101aa19878d404','0xa34f0d0314db32f41e1194816d56d55d1f7ca7b5','0x09946d4e4ccde2a28ef269d26d9423034f5333e1','0x68f73e2180024db5b54e0e119d4f5128953f9417','0xe086085b2cceec534d65fed8e59854c2dd66f741','0x93f267fd92b432bebf4da4e13b8615bb8eb2095c','0xd8c81e66a71fcfe8258b0cf84267275cdc91cac3','0x3be033b60bc4aa789368954595332fab143987ec','0x8ec83cb2ab2727ac16ab89d825535f7613c11e4e','0x95b70b320819b1566c9a00626f57fde85b402ea4','0xa16495105b1da7738d9aac1494459bd7982c05e4','0xcef7f42e1f5737c9c2a0530dbb05212b57fb6679','0x4bec87cb126de6c1f8b410e32d1f4ae472fdd83b','0x60253945231436e57331287294e9c1ba0495ea0b','0xbb2e5c2ff298fd96e166f90c8abacaf714df14f8','0xa6f253d4894e0cbb68679816cfee647eec999964','0x86d257cdb7bc9c0df10e84c8709697f92770b335','0x80ba2de1ced9de57366514d9a797f3e10884ead5','0x6279653c28f138c8b31b8a0f6f8cd2c58e8c1705','0xfe7f3dfdf485d100c0845c9ad92906605fea3891','0x479745658a6aec2de6318273944d9549457ba813','0x5494d3a61369460147d754f3562b769218e90e96','0x4628a0a564debfc8798eb55db5c91f2200486c24','0x70bb8e6844dfb681810fd557dd741bcaf027bf94','0x8c13148228765ba9e84eaf940b0416a5e349a5e7','0xd0af1981f52146a6939385451daea0726e13a484','0xd34e4855146ac0c6d0e4a652bd5fb54830f91ba8','0xfba31f01058db09573a383f26a088f23774d4e5d','0x325365ed8275f6a74cac98917b7f6face8da533b','0x98e45940d0c76898f5659b8fc78895f35a39eb43','0x56ea002b411fd5887e55329852d5777ecb170713','0xb80946cd2b4b68bedd769a21ca2f096ead6e0ee8','0x2418c488bc4b0c3cf1edfc7f6b572847f12ed24f','0x5c28b5f471d97f53fcf132f16f9f3c0c888c1a01','0x779dfffb81550bf503c19d52b1e91e9251234faa','0x70e61de63eb3229f2ad8668a8cbd87b7a87b5f8b','0x4012737a154f1c44df37379a765b87a1ea397edc','0xc1df8037881df17dc88998824b9aea81c71bbb1b','0x5d4f3c6fa16908609bac31ff148bd002aa6b8c83','0x29bada2257424fd07b78e6992a45694873434bfc','0x56534741cd8b152df6d48adf7ac51f75169a83b2','0xf9d00163f49fb4429714b50242524b43aa404c7b','0x5654b1dd37af02f327d98c04b72acdf01ba2835c','0xb10adb35ea2f2490eb338bdc11dc723ad40f128f','0xa14afc841a2742cbd52587b705f00f322309580e','0xc05bdd0c4b0d37b84207522bcc998eedc9deecee','0x6d92d0ba4e64f26bbc0d8542d8fcc96358661769','0x01949723055a451229c7ba3a817937c966748f76','0xe0fd4c0f10be3211a1b25dab6cb0078a248c08bf','0x575700a2191097f626b651de014487cd873c99ea','0xb9249c20c3d8cd3a94839151273efd81ad01be6d','0xcaa42afda27d37ceecfbf1aaa1c6047f868e5d9b','0x68f8d8fbc1283f9667d6373c55f96f8c0aea1c33','0xf845cba831be88268b1415d976db0afc7b8c6357','0x2f79643f9fe52dcbfb90cc03f59678a8a16073bc','0x3e327a672734310d08f42da393bb1e386bbf28b7','0xe55e68925809784c8234dfcf6f8fa42c3a48b2c3','0x8dde0a1481b4a14bc1015a5a8b260ef059e9fd89','0x5859ebe6fd3bbc6bd646b73a5dbb09a5d7b6e7b7','0xb0f2fca52066920620a90e2e5198f3edf7c28686','0x5d475ce37b1d98127344132fadd80f5c5e1e1931','0x15a7e01386fe8be69e486edbc55baac10629830c','0x1a80afe14143637c0b7609e6e276464e4f748014','0x32ecd439b57fb881ea1f5df2f8581b6fdac0acac','0x7ad0557336abec0a006422bc50c25232ce89485e','0x5b97b125cf8af96834f2d08c8f1291bd47724939','0xb03f87e577c4fe4685cf2c88a8473414bb1d04f1','0xed77bb9d173271889b5600ddfef5239a4fd8b4d8','0xdca18ced4f3b926d81046ba4217f289e4893ef13','0x19e286157200418d6a1f7d1df834b82e65c920aa','0x649caaf37f36e67d1129c0fd6c6539d390ca2b82','0x80dbf454431ba9b64f0a8753f72a86afea6ee2f3','0x42670595766c9b44a2a4936b1c0e62f0e8167ace','0xde2af72e916dc56f9a65f3c9766262c00c030c98','0x6934290e0f75f64b83c3f473f65aefe97807103b','0x557d3e1ee5e8d870ef70624ac148c1253672d40d','0x68cfee5c451befdf760909a1f3721e3db9af4910','0x718961d3dd5abbef046ecb4407e38b7b4aaf9a3c','0xbff03d0e976d59db412ba44f57bdc6c299154611','0x9da737f94c9722ddc132bacd1ccb8f6691b93033','0x9a143f844831e2277cb27665f8b94b4f50e14942','0xdbfd41536a5a220e75c587ddcefaffd643ea3778','0x28e810d4b33ae24fe6f721a21e42230bcb019da1','0x16b70f44719b227278a2dc1122e8106cc929ecd1','0xf425ee359339695e234b973fb844085fa1b50014','0xe8e98c99609e5fe9c65b0f187f05df2fa9965d7c','0xba9458e13df13517612a0f0b91a9bab0d22ade90','0x46add4b3f80672989b9a1eaf62cad5206f5e2164','0x943c66d78875ddeb3aede2ac081625d0a947bbad','0x0ede8afc34e7f092f27eef121acb4de4f2e010cb','0x42eb481a3338563e1247d461477f4cbc97c9a444','0x58c2ae94565cc87000a62783c7915179951eb28e','0x098e0b9de8ed064006d9dda99b4e3d1604801cea','0xf15054bc50c39ad15fdc67f2aedd7c2c945ca5f6','0x775d0c18b291b889ab3d7f16338183bbfaf63f7a','0xbbb210ea3c86892960b8c2915d2347da48a0ff97','0x3cb75142bdae2bef3eb119affb288aeb0599dc4f','0x3a0f221ea8b150f3d3d27de8928851ab5264bb65','0x7c7acba9e3474985c17f99430a6807c5ca29bb4d','0xe9baec2ac8791a9c25f5abfbf79b2ca914c116e2','0xc274115fbc126cc6c14d724e529fce64c9e7a60e','0x95209160ca66bfe2876877429c3ab89d9b1abab5','0xc92b7c2dbda7de301fb682a9da80813def952a2b','0x9d7e5647ce3c7c2d835f2f5e82c8fdb36b0bb0fe','0xf4bbeeaa60ee7aa94b1fb340ff77e6a77abb5fd8','0xefe7b6aa87e79c6125702b4c32e64f2d0d04c779','0x9e588733b77abd51879f391fce7beb6a1de7bdbd','0x3d71021345aed9ffab1efd805e58aec9c857d525','0xad260212fe1264f42e478981d937e5c1be9c1c74','0x665019a4db37eb93eac66a926e549e3adda620db','0x0254a309f5140d457c0699e2cd0457a692a69cc4','0x4d63c8ec8e10478dc27d9f0c3478dc72947e00ca','0x4b9d0663acb7a774c327b679d423993c2a11a263','0x753a90ae2fa03d31487141bf54bd853b27f7bcf5','0x1afef33988d6c332415e83a5a2740ffebbaa4b75','0x084b5191bd08412952337b1108b6e5942418928f','0x9b92337f221ba14257613aeca567210cb88d4df1','0xd2e0add90e86079b9961fa232178049503e06401','0x92f0b57e3814e4bd74ef6a6fd6d825db522ccfe2','0x32dda59c0d3a5fb14a527b815d1596c2ee9a4ca4','0xaff1025438da93bd86427f2f9f7d06088f720a8d','0x64a0d84d1c1b92fdc1149ffe3cee5e2fe0febd8e','0xfad57d2039c21811c8f2b5d5b65308aa99d31559','0x0025ade782cc2b2415d1e841a8d52ff5dce33dfe','0x87986ae1e99f99da1f955d16930dc8914ffbed56','0x76838fd2f22bdc1d3e96069971e65653173edb2a','0x9c73935fb72a606b14c03b9a10abb7f2f66b55b5','0xf0586fef0291c262fdd1a14cd30ea8075804dd66','0x7f6ab5f1798761c610388fcb7e1178dcd7b4e8ad','0xe24442fbdf9dfb155f76821d1bb2c3794eddd873','0xb2f8b3bad4325c3c62f294da45fc144b1b180cc2','0xe0e1b825474ae06e7e932e214a735640c9bc3e71','0xa9231b30443a2eb39a4a2d5ef096bf157f4dff61','0x52414c8b908e9a75c3c8704b2ae5e39ab7156c05','0xed1da966136abaa240582166827021aedf55a6b5','0x6c063a6e8cd45869b5eb75291e65a3de298f3aa8','0x2b43fe4f41d871fbc75af6e0ce85bce38ff1edc7','0xc4d9c69962ddb2388e1532279704fc6eb199c963','0xe191ec484dc78f38b2bd733900288ff0cf2ba8a5','0x7cf12cef5ce9e5e068ebdef470ff8295e26c47b9','0x784602c0cb1a476d1d2ec7ade08fdd27e228177c','0x03a86da24f980cfeace0898883db181c74be9c13','0x298b7c5e0770d151e4c5cf6cca4dae3a3ffc8e27','0xfbba47b4c4ded47aa154a1b6dc06ec207166fc13','0x3fed392cde08fa170d6ef924eb886e7967fdf164','0x85205ea75a442f6897abef6b7e9d0c8e9366b57f','0xed45c401f948a543cb0ca6c5ad45f588cb388ec1','0x504ab5b9f8c025505a3cc3c06d1cd7b22d32f093','0x2e4784446a0a06df3d1a040b03e1680ee266c35a','0x951e0e67d620850c07ad94bbd887a79e9f2689f7','0x4d1ad4a9e61bc0e5529d64f38199ccfca56f5a42','0xc8df1e00ec7b726a3a0b6739a3534ecd6d89bb31','0xfc9da2ffb74cefffcec376571af6876868e865d6','0x7261bb346ccc02911e4b07f933ccd69dc51ee3e1','0x0d03eebe59cacb5dd521bdeed94f7ff4ce9e939a','0x749369f1dcb977b9fd1479a0c4c6604b1208d30a','0x84ae8d5429e185e5129dbde2920905c50e98ab5d','0x2266d95f215f2dcc0a0b07a78fef6f16af3677d1','0x1a76f6b9b3d9c532e0b56990944a31a705933fbd','0x9410cf01dcdccdb9b56e285b39cea375e5e90883','0xe40a2eab69d4de66bccb0ac8e2517a230c6312e8','0x1ce30058f53b7a6cc8655c6a8e8069f69ae640b3','0xbbd3cacec067f5f3a6c4c34f7931e66453438361','0x5c5a53f215771742c711652fc375ef31d592dcab','0xb6c05fb8d5a242d92e72ce63c58ec94d93d11060','0x41b536722c014a577f06a4bb0dfa08bf0b8f5e87','0xdd0cf265951256a0eb3a927f657959dea4827b6d','0xecca6db8efe28b93af5abc69fa7d8094cbefe139','0x7c8dbf6e88f52cb56dd30190558cb982f62fc660','0x7736b5006d90d5d5c0ee8148f1ea07ef82ab1677','0xbaec0e18c770993ffb1175fef493b5113cc6e32d','0xf5d90ce04151979d0a7c8eaced8ed1419e190477','0xf0be3301296bd4a90a3b8cef9124cf40ca56e5b0','0xa957d394a656742b0ebe3e37f179de73018f6fa0','0x38265fd46cae892f03c65d287738f37940c71812','0x2d7ba71dc3e391988bb7f356d07dacac92b03e5d','0x9d9a6b0189e8066a489ff1b0582e34231327d875','0x240abba6ba456e1ed5717da4abe3a4e1ecc06581','0x7d3e5afdb0e7416b401b17a64d63b63e07197272','0x0730abfb26cf04f7a31b20d42e88cd606a8441ea','0x35c349a2cadbbcdc4b3e5ca6d6e8e32e53df0c86','0xaff587846a44aa086a6555ff69055d3380fd379a','0xfb9256c0f94d0b7495327426c0dd954bdf72d220','0xb0cc75ed5aabb0acce7cbf0302531bb260d259c4','0xe7b32b39883166fb0929a12a169922414f08d002','0xcbfb0745b8489973bf7b334d54fdbd573df7ef3c','0xf5e4a4480f5e73cfe697384525d6f4a07617ac71','0xe1d92f1de49caec73514f696fea2a7d5441498e5','0xd92de63661d2e298350307a63fea2c3f1731ff9a','0x8051359d33c1bbd78ea8d4c54d922ade5848d11d','0x1c4f761649c3d4dd31a83ea0548f79585c3999ba','0xc7d6c8cc0feba14277b9367cd4b25ac587d0003e','0x53a95f5ad1f9f4596266522934ad98fa5f6396c2','0x603c0e9a12baf6e96124bde1e3f440343c6eaaf1','0xe72d262158f402faf553179b2b4aff23dfad6d4c','0x3b37b1a6644949bc1ab02af240d958b16f2e4b63','0x4da56307a38aa15ebb28c81766415b9179984036','0x7bfbc371d268df7080788eb1b6290f452307feab','0x158dff1d8cc6ce0b3b066ead4b17fd635f1dac30','0xcbe4e6f3352a4d3fa64b9ced6d8c2612e38129b7','0xfe0b65c9233145a5b980c7a8751256b63f0d557e','0x43a4fbb71025fa2c3073a58fee6de69da33b3aa8','0xb773a5a7ee006d2675537588e3233ad37be53bb9','0xd966da62dec253128dbd16a4034de6e051e1d2d7','0xa2f6eb84cf53a326152de0255f87828c647d9b95','0xbb6642dda99c7fb1ecf310baa3477fa7ba3e7c82','0x3b685307c8611afb2a9e83ebc8743dc20480716e','0xbedf43fe5df23e163e5a844c3f6fbbe4d77e5113','0xd950cd33195a1ad36c416eecf6b3317eccba77e1','0xec749ed17ebc1487e43bc5bbcb2f20a766d3a7f6','0x23bb251705615b4efe9442be5f2aeb0e20b39858','0xd050430dd432876cf5622ff60c4dc106b64fa753','0xaeac4a9ba7df813b5e6b24c0a76b7390a80a28b1','0x11b7a6bc0259ed6cf9db8f499988f9ecc7167bf5','0xa3eef0db156eeecfa55682fa4b4aee5a3330dd11','0xc542bc2b0740ceb61b63fc901fc853f42802a6af','0x087a2050f5179130e5687b410a2d41633278717a','0x8d8278c40e30cc567c498273387aa377d15aa832','0x88977729330e55aa7111fec4967d8a561ac7c741','0x82d7b381b6144670fc6777edddd0e5737f6f0633','0x4674abc5796e1334b5075326b39b748bee9eaa34','0x634af6dbe36fd92d799d5442bac62873a8d96aa9','0x6e84d5caa189c7c4e3d41801e54dedfdd74e23cf','0x22298c24aa47ce21fc315d5cfde19811088f2000','0x87d1b1a3675ff4ff6101926c1cce971cd2d513ef','0xc8d2aaba076bc96505f6442d37deaa583295d030','0xd4146e01e8380624e4f69edf178aea1e8a880cb7','0x610a94f64d1d149623369e5bac9576065d23893b','0x4c1d1c02fbb00757eb55f1827323cc9c8f1d43a5','0x2356b745747ed77191844c025eddc894fce5f5f6','0x70885952f174fb5396deebb66ce3b4b2adfcef8a','0xa324a33a6bc402de1d81b7a501bdf8ac7bf845ab','0xa8322f6d07707fb57bd111f6e98dc158b4186761','0xc8bbbbe0586764c05969878a5e6e6b3556a9b05f','0x387c2455e9a75a0f9929fade4eb4d24d620187c8','0xdceaf5d0e5e0db9596a47c0c4120654e80b1d706','0xa75ede894aa5e767674dd8043109b90ad4637b6f','0x2a372c76aff0b6393c12520566a626fa6810f4c0','0xeb05ab65ae6b24e51ddaca5b7cc4ef63a9914637','0xb13b2113dc40e8c2064f6d49577250d9f6131c28','0x543842cbfef3b3f5614b2153c28936967218a0e6','0xfad25176c366957ed4c592d21b21eec176d70630','0xa44002e8062c90a8f8b3cfce6ec70990bba28ae5','0xd9ed2b5f292a0e319a04e6c1aca15df97705821c','0x76d8938c96e8abfb44db042091131b7e9a63189c','0x7a6afca7d92f457d8b01061c816f7d5babaa4a03','0xff2bdf3044c601679dede16f5d4a460b35cebfee','0x2ab927dafa04e163530ff1aa91444279f89e24cd','0x0cf7494c9de661467403abee8454b3bbf0179a84','0x6a219c7cbd18d539ae3aaea28d6dc05821aa2db4','0x8020eab645e44ae808ebaf93b3035f52bc633f9b','0x3c8ad861df04a68e8a2559251e2009611523446d','0x83cfaa49b75e394935ffb9bbd18c045e797d6a35','0x689c55be02534aa192f4bbe916c45318ca99798d','0xf1dc1e314033ce484f13f8e574c8b1abbcbef4a1','0x8b92fe7e087dd51691495001fa47f2afeb30d043','0xb0a1b367267f711f049d05c3eeecfc3e42d9f8a0','0xf766436b551d2acb09b73d126fd49869541dfa26','0xf5906bfd9406c45061dc67f774da440d169b84d0','0x98a19d4954b433bd315335a05d7d6371d812a492','0xf5d0ba0ad8b76e64c5930430b1ba6655bf7978fa','0xc1409a2c5673299fb15da5f03c27eb1ac88f7d8c','0x259473e38b2fe68a6b7eaddb180f9d068852aaaf','0x1dfd47d8609e98b930f82e9e734d3fc6067bc643','0x11c4d3b9cd07807f455371d56b3899bbae662788','0x737a43adf2b9d1366d59ac790347fa3403df3214','0xa79e94cb24b2f2fc75b1d30a315cf2d266628a7c','0xd947e549bdbf0bcfebd5b11f8a629c88173fac97','0x5116f278d095ec2ad3a14090fedb3e499b8b5af6','0x5d8accd4ad21dca0c5add32139425f21621a13fc','0xa4bd201c839755948e4eaec754214f2b8a6e5955','0x727092c368dc04708d0db121350af351a363e53a','0xcccd28beb6bbef37fd26928bec57398289e90cf3','0x4f25f309fbe94771e4f636d5d433a8f8cd5c332b','0x07201a08626c5cf6c31834751d3c18f50ad933eb','0xcbcc3cbad991ec59204be2963b4a87951e4d292b','0x1763a4ab2b56fe1cd286b9f1a5acd0068a37e6a8','0x21c4921201c19aa96cc01d50f9c7fbdd6032b829','0xed49728e65246d81fa65f832fd5197467abbbc40','0x75682a6f58a36eb33a7811d5d0d69593a4983194','0x5cccad2332292cd5882365bb3584424241ab2210','0x3cec6746ebd7658f58e5d786e0999118fea2905c','0x632f8512166ec65c90a40fd85b8e0d76b2acdd89','0xbfa7b27ac817d57f938541e0e86dbec32a03ce53','0x5e008a2897a0c99e8e30e381c5fc99054722de30','0xea342a828376b1c4f3f06ea16172d3fad6578090','0x5696c2c2fcb7e304a5b9faaec9cd37d369c9d067','0x4693456599a8a4975862a0e720c5de7e1d09a1e4','0x44b0901fbef7d9329516ad820196998a9f8adbcb','0x686739297d913afa7f1698d4423be0a2cd558eb6','0xfa84ef015331d1bd83321e344d92489e3de0ca9d','0x5a59e4e647a3acc42b01715f3a1d271c1f7e7aeb','0xba1cd9a4fef1fe83a123e494a96f932cdd8efd98','0xc7f1498df3f2c1d5adc614a24ddbbee45c047480','0x97a5a0b2d7ed3accb7fd6404a1f5ca29320905af','0x384469431c307370c34265213daaa75139522182','0x85498e26aa6b5c7c8ac32ee8e872d95fb98640c4','0x12014971036f0279d08705d1824c30f631c4b7fb','0x955da6a5a887439ac9f19d76010bd7534c312289','0xb2cd930798efa9b6cb042f073a2ccea5012e7abf','0x2d84abe9ca1c7a7bbe85a74aeb532f86b1a7c916','0xbf394c31598146d9ea3ee9bdb565f42a019f3ab7','0xe936f0073549ad8b1fa53583600d629ba9375161','0x1c98562a2fab5af19d8fb3291a36ac3c618835d9','0xa8db34b9cb685474e4195c96736d293b3192b1e8','0xb4545adc429e628969736a460073317254a83fed','0x58791b0445d3d37699c1b1ce03786a728a5b2708','0x93dd60a8ed2539f5df4cf794ebb3ddce242e8610','0x45f199b8af62ab2847f56d0d2866ea20da0c9bbc','0xbd233d685ede81e00faaefebd55150c76778a34e','0xa96c549fa361181a94c081597171e17d27459dbb','0x429e06d1d2e640d649f1480fc82ddfb1fc047627','0xa74ec2ada6169ef93b8ef1a16a0942dfad973d38','0x816f2118e9dcd22470d2128b73b1eccc88112ea1','0xe618d00b8ed613e3a551f2a17bb8018534d55418','0x19a573b228468f3bf917389f4e2d4f2997610f71','0xf1666c2e04eeab81b839e77b5d2cc85bac380994','0x98d7363bafb38209adf42813b0d4e0b9fb9936c6','0x93be491d835be1eadda96fed57177220d7b6cf54','0x7c911d97315eafe8ee487985e4d2f21bcd6a2a0c','0x5d0cdb2dae4c13c569578e85d81fd2f41d82cd9f','0xc5bccf768e4242a0b518608b4843988ec5fb24d9','0x6486548df147764da6eb09b822915efbf3343522','0x15321a9643e5f2b20c124f7fc809dfb299830459','0x1803b7d43a17fe47b2ea70707e9ec8f4d4e5d7b7','0xff29d3e552155180809ea3a877408a4620058086','0x06ada8f74d99c6c200672b02e5c3341866ca3bfb','0x35b01400051a2c08bd90e4bee5e05b33519208c2','0xe613efc483e263e7140062e64b96c19a124ff783','0xb67e4f949a8864a1dbcd374a09957efd226376df','0xe405113bfd5b988bdba4a4ca9419a18f9e2828a6','0xa32a68920b9fba43cbecd834ff5b5c347f9d7536','0xbed423ecbb85c2abe112b26f751b79085fc9aabc','0x3cd80800a1403a96c4c8aa28cc291cb8cd6442b3','0x1475a3f259052dc57b3e92bfb6e478f4769da9e6','0x5e85bc4101d860dee7f807c2c5cb1d7ce7fc63ed','0xfdaadf43efa83c3320a60e6b238c236ece2787e1','0xac5a2c404ebba22a869998089ac7893ff4e1f0a7','0x129360c964e2e13910d603043f6287e5e9383374','0xd8e1a96b9be06c3f62789a308c963ca015bd84f3','0xff90fb880da9738b2044b243daf8172bfe413b5c','0x91550a8e20fb38757032fae1d7429e5398954628','0x1b170eebbaf9caa401263a556728e4ab0d6c1d62','0x4ba950bed410a12c1294df28ed672f50c24297de','0x952a4d899d5a61ba4de81f8e2bae1a2562ec0b33','0xda4fa998305e832cb9b9f17da54dbb06e0a9cf02','0x7d2e2fef85c67ab930268541d065be7c97f953e2','0xafe56a692fa8964e95ed0e7810c2247d3ba20b2d','0xf3037437a8f5e5025a08af0a54424d029684b2f5','0xa6102d2cece8df0350fecd2261d2c09074182bc9','0xba6f08adb52badc392d803e70d48c8071734131e','0xa15cc73e881c06d8db06b50b7a3688b763c18350','0x32a2c4c25babedc810fa466ab0f0c742df3a3555','0xf81ba0c35e59cf01682b7f2a7a3d8ea6756eba46','0x7cf70ed6213f08b70316bd80f7c2dddc94e41ac5','0xefba6ba69c82776cdd279f74fbfee1cf4e927aae','0x1ae3b4cee159c2a75190d2f89d7fca249c5dad03','0x763dd0f2f333324d1b142bf234c0dca11ec50392','0xb664620eb634401becec51da7691050e2f621248','0xc5d2ef5f26bc79b9abd7550ee4b4448f0bef2644','0x1754b94a3e63be72efe44a1828cd81c4782a46c4','0xd386b3793217d7ecc73b70de0551e9a181069a12','0x3a8027b37cd119cde72c1086ab5d7de912f61b61','0xb8ab1f72f62d59f17ab92910528bbd031d827ba5','0x1f81a9ee204e699ed34f7be997ece58605108b16','0xc5003f495a5072a81771ef8aa38c6302f45f0ace','0xeec50bcb168b66099ab00f6fdaa807ecb484c2d2','0xd1ede4862697fa88e8948fd83317e4d7888910f5','0x36bcf57291a291a6e0e0bff7b12b69b556bcd9ed','0xc02d0fa00c0bec48186026c71da2e54ebf680139','0xa0cf710f25e413c1e9c76ed6b7953b5d87b324bb','0xba965e77582566967d0edebe2b590e4ed8306095','0x216084e4a9d94c867e065d709905051a8f22f92d','0xaafac42f553bbf80862fce24dac292eec5173f72','0x5f7f44c304d016fe8cad589aaadba366528f0ad0','0xced364623800f1ec98d8c19f9ab6f412148e5733','0x8119c00d8a02c61f813675d23d5acb98851cf274','0x7ee092fd479185dd741e3e6994f255bb3624f765','0x6630b6e5e970478c574f3ffc381f5ac62f78a4f6','0xae5679aa4e945060eabe845aedcd98f9035cb48e','0xdc2c21f1b54ddaf39e944689a8f90cb844135cc9','0x39c9e3128b8736e02a30b2b9b7e50ff522b935c5','0x1d5632c41afaae0554b1a8a8e614ecf2a4d46d14','0xa295c1301e063728d733f9fb2155448fff9c70b7','0x45d8ced29bf3af9f2d369ec6ab86a0ed67dfec90','0xebdab3e7787501cad4159d87561aee0687a852ff','0x31b047f6ad452cead4b2f95e6b08ccae5b116f19','0xead17530d2d12986180a939fa70ba28f4d0d015e','0x90904cb75a9bd6cb1d4fbeed96bc1615f854aa52','0x211d30e2929dbfa4f8395fd1854a1b6e720ca011','0x0adee264d34a2c2da8113c318bf823504fca4a31','0x71e5b66ad36b411cd716366e0a3056b54f6a1e9f','0x57be500bbfd759462b93b60d1cc3273750aa6e80','0x776f223fe7d5ee39e9f199d829fb45990f9fd8a5','0x2ab653894ce12ae9b4538aefc90b2d6e96458e1d','0x0ac0c1c8e854bba874da31f566251f757982e97b','0xf9e0ac8959a92e0c91d8c1068fc23851f73a13b3','0x5620f7b870cb69dd3e21def2ebc57fc78425cd94','0xee746572fa6414bca20b6ea6e53f542ff2f2b93b','0x426d087bf4dfaa7adc31e176184dbe73ea18a0fc','0xb702ead3b0c34fddfa9b4229c981d56a868a5164','0x3e18ce4f283576d54e88f550ee2199df6a03ff22','0x8e5778ded8a7dd4000561a119b65f973158c277f','0x58b8a1cae4c8eede897c0c9987ff4b5714ef3975','0xc840464a8c3324e0bdc9429439dde3a12205424a','0x6166b56a71b02b2136fe9b7f4ccef16cded73ff4','0xce5c3a992f5089d659cc37b243517b2b0c3446f5','0x4d64fdedc4321a23b4dff449af0e54ddd42e9925','0xc3ea1c2e309ff99ed7b17a501bd8d5998918b097','0x932aec20a46edff07e47b2ac77b99c2824ba4379','0x1465988655dd229d3404b74a966a1b18dc0a12b6','0xe729879d2a8618b8a63ba1035d881f28ad9e9e7a','0x7de8ecba49a038f763d30b05268f2262ae61cc3d','0x0f9d9d1cce530c91f075455efef2d9386375df3d','0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74','0xf9d29c7c0691ca27f076828b4c1de6f6b14c0bda','0x2552018fa2768fd0af10d32a4c38586a9bade6ce','0x552de0b5d94e4187e8d0cff4fedec1aec8cf8d56','0x575cc7f6ff8b8c0b2becc94a4f0282b7247a9e4e','0x5179d9c1e8cc980b1f2b46f1ffd59ec2bcc48b78','0x18452fd36bbd92cb46366d143e7fef8ac165a0f7','0x56027930bdff39faf295a7cf6bb94b9bb9f6a718','0xd99d095bb919f91ee637cbb1001ff9e4b1b919cf','0x5b792308d5d167effa254cd1a0893b177643c6a5','0x8842d44c207b84739a69513410f3b6bd26dd499c','0x8ea48337c6c6677b0973437f2685d17717c0408e','0x399edf09888344743ea45a540e3c0543e437d153','0x64ac443960c7cc924acc42eb245035cc34f33154','0x972f43bb94b76b9e2d036553d818879860b6a114','0xb5667233194805e6972b16e815047c9c086dae4c','0x8776fc4408e7f115f5a77235844adc8ab4b7aa70','0x9437ad40056ca3ec2fc1efe41885ad4b6ac46061','0xddc9e703595afc08fd5ad049c4c129804a003177','0x9d2713fa2f387ed1284a4176e7841253b4da2a71','0xa98cd23d5c0783faaf44ffaaee90355eb9a04165','0x4a3bb087387f6b2e7c4af146678fe2c017678e87','0xd247ca3420ce876b27159e1526fcf543143f8c11','0xe5763dc0c41b531cc4edbb2aa8f17e35fbbf24c6','0x9a06cbd76d8bd043dba1530be4686fd298e4b464','0xe0b9def812e9bf420e35dd4b5a526dc9dbd34989','0x7f6de6c726d09915912d85a4b3ffe4838798b349','0x1e33923faade7aad8b095dc3298520799c11d95f','0xbe58afb4e61a13cf2ea6b6052e2e05eafe562aa8','0xf148bdb609575b613cd615bafe2b22cc47532ee8','0x38a209e1cbd71a02b4922eb4e4e5f507499e9899','0xeeed5713cdbbad1339cc80e1d60f36db27c8fd1d','0xef43c28f19b9e58444ad72d709c06a4a630f7531','0xf6a42a1963b34ad95bc82c8afe1cadf27b0abf2d','0x9272ab2d57a1cfe044328f0a7f09766593b8cf26','0x608dadd4b1673a651a4cd35729fc657e76a1f9e6','0x501fb4aace823a3deae46bdaa0c649cf5c51f244','0x27563b6922fffa1d5970aad49b7c9e160d02b881','0x175a72f57fb51998d76d63e9e6196f91ee6e0afb','0xe3a379971c9ffa73e8c74a73c4240640393a92b4','0xa2ea4d31e02d954aec68345b922bbe06d8f9ba6c','0xd99a73f743eb2821ec030acde00fb3377bfca064','0xb055103b7633b61518cd806d95beeb2d4cd217e7','0xd3dd65f0d1ebe69e727db34fa3a25b4fd5abf978','0x119f33c3266dd5ed81a9db08d5033d4052e1e145','0x0425bf56a98294c1a5080a5a1f25cbeea9464ba2','0xca52b52f1ff30b75f8b5aa8c64cf9d78d30560ca','0xe931b03260b2854e77e8da8378a1bc017b13cb97','0xf18c97261e4152c173779f749bbebc9e856d1838','0x07aa6584385cca15c2c6e13a5599ffc2d177e33b','0xa173bcfeb3f29800ec0bbd706053a5d679512cd6','0x6895219628ad5badfb1611df38337b8911adb1cf','0x6127cc12b45b7a765d6509e191d23ca97badd8d1','0x9df48332aa27f22e2e709e07b4db8f0252f71bea','0x818dbfb7e215ae074db4167902da9d89aed6ad3f','0x22b2267f1a5e14efebae53db484a1f67c2803107','0xc8f797e893d9f08db03759213b8d09f0ca6ac9c2','0x1e9934db2730e14d89a1516c534612b6806d55b1','0x53c0d552ea40055aa0311ad7bbe12152b65e8f41','0xa4b04a1faf1571ff208423eb497d625a9b2f34d8','0x600e9b4d0e18dd5922a9db3134ec7d1af85ea009','0xde05e21fa6e9f04ddd5fd1876a523369949f07af','0xc8d73d01a52ed6e212475c404ef900f1c831913e','0x6176c323b86e2753c8be14c6843398725990c777','0x905e3a9fea6c88dd8f05c6cb3df8f48919219229','0xb7f027ae8f02377da3b3bce172d07758b1ce7d9e','0x37fbebbc3db4763dc4066681ecc9390b825e94fd','0x1e5143bb68abfadc401360a55e8aca2fd292b673','0x76d66961b84a520a859a2fb6075af220be6461e8','0xf30f0c0cba4508f4443cb0084a7d376d537effed','0x1c90ef8cd8f4e880f15dacd566b3ce6e45fb8ebb','0xf152f10e4781c0d3844310193a2050384a5581f2','0x309d54007b48a76139152b211b3a6c847943a617','0x351fe122b0ccc605ef9695f8010f9b2c12c4dbe0','0xb77c56f863fff3a9593a8716f2236c33df276950','0x382c113acca7c2722d7d7b8295a805efd196c8ee','0xe744f5e2edfdcb9fdb43b288ecb8b21c8487e888','0x79b7bef14533340cb2ae7d543d7e46a0a64646f1','0x4362a591eb53e4a1430fd6ed14e276d5b9df0577','0xc3881fbb90daf3066da30016d578ed024027317c','0xaf42109724bf4ba4199da94d7ead6b0d4e57af37','0x24017386cc0af0555a6e5b0fe0443e145648612b','0xd73ea444eef6faf5423b49be3448e94ed214f1ec','0x7335118ece5464167ec940c4dba3291d1484e00f','0x290850efa2d7e130e55bbc1db2b48bc5c03097f5','0xa3f02d35f2a29ea782575ad24477b6a048bf50da','0x067ae1e9f52ff5513d2c8b3b63f11b5755f06608','0xaac051635fba070e0c18aeb1e867be614c14066e','0x39c2c2ab2a9197b99bf5933c1943363713f68e3b','0xb8f903520efdb640b2859b253f2a9ab472a27c29','0xe82425083be8e9f574d78ffeb1e2d94a6a27c99b','0x16d19dd56d2cf11d2d898f15d3033afb8b1adafd','0xde4d1af93dd7e333d071411a3d68cb1ae09bf4e3','0x8147aeb1cb347a781d97644af6c284003f11db74','0x57729d1496ab1f421a451019d28e5062dcbbdeda','0x40d5c143419b4cd48f8346af6444d2e749b9bf97','0x5c2b3edbe845764b99eaebe87377f1f9d27d2a7e','0xeab149986139bb13b95f90df397d6e89af3ae589','0xf25cb7f26b3bf82b559c6c998a7afd9cfbb831e9','0xf83d5aaab14507a53f97d3c18bdb52c4a62efc40','0xe05e653453f733786f2dabae0ffa1e96cfcc4b25','0xe1fc415f87465b024ee62f55ef33d8f822705b5b','0x81ec0cbe58bc6df61aa632dc99beb6f87f0e2a17','0x2e3d86bd99f68328139378b285ce2e745b81bb75','0xf129f1224d8317e6ddfeaa70897fda1e467ba0ad','0x94651cbdd2c1fa4f7c1139e7e89fc975a9fcad5e','0x51607403450d8251086d982ec8b686d291600cdb','0xf5ce0293c24fd0990e0a5758e53f66a36ca0118f','0xb03168f432208bceb53422e8139d8880875cadd1','0x391d16f51dc64cd6c38ce041512741a47abfa0da','0xd48e3d2bb8ab61b297a41d61fb13f8f487fc484e','0xaa36dbf3fd5bfcf1350cb8d830708f28de37ae53','0x5252febfc81f5c987ff23e446ee4275056732946','0x35548c4af3fcf16b7ccda9031f4df63b7c1bb1ac','0x05aaa0053fa5c28e8c558d4c648cc129bea45018','0xc129bed3196de3315b1be05c6d1a2455f610dcc0','0x6236f4a39048a2e0098309507e0b33325011aca2','0x42497ea76a66caea529b818a48e20d2323a76f10','0x3fe55d440adb6e07fa8e69451f5511d983882487','0x1c83f897788c1bb0880de4801422f691f34406b6','0xce198ddd044c411ed26a67c90fa7bf62c9d34177','0x489cebe6cd5dc5dcb7047a1f0d4f358a5d2fb295','0x675e2f47052f6b496f9f2f8d4b8bcd2a6c1c805c','0x8f10a53176641b4b673be37d1065e0690a5a3fb4','0xcf4c6d29557443b3d3c9238c919338b0d6155aa7','0xe178380d5879e4c590f6cdd2996e2f601b2e0ecd','0x60c51a68d3c75b62f723e6a2da29c6f1fbe4b7c5','0x4858411a69af3351ed7d448a0d65c6146c11c218','0xf0a1088219ad372e971e62adec376377ea875ad0','0xdd51b862f5b3e23f5625a303329078fa695eb558','0xb8fce31f3dd2f0de6823575f1d35da4a306a5777','0x264c7a632ce9171f93fba58a834bb78b4dab9d82','0xca7e75e4d1916d72c0fd9b303f0d28ea3da1650a','0x839461916fe1bef1bb5909e0b55c35d28c415bc8','0x6fba9ef54b841dda97802b0707fa9e210cb48d01','0x209b4654b88437f79165bb33d1d1f67bd1759784','0x4c6bd5c32bedd36a92feac511197838c87c9bf82','0x4351825d4b6b92264c76ffa10b4981074fa01326','0x1992930ab49a367acc9515f485fb798341bb25e4','0xbde484db131bd2ae80e44a57f865c1dfebb7e31f','0xf86a418d0cbcb95a1286422b29aae22c7b7280e9','0x7fd626e58ef2de3be03113b8e7b154e8edf90eeb','0x9e5bfb074aa3a90daf84484f9e099ad39d64d578','0x389baf82665869cc1b70a1d33628ea01fa22a050','0xc59511889997707c4e859668fd509311ec49f85f','0x113ecd438bff3e63a95b0b9d18c38bbf066db5a0','0xdceb026bdbeabef09b823de8cb76aacb899cf576','0x99a6880748ceb61c3d9b6d4cd49edb59f79f405d','0xfa97d2c20571474ae1ef6783789ef7cf42d6cb22','0xe288137d9e4d51eeab30bc30afd0f2da85e90acd','0x99c58992057347622bdeeb5aaada7837e2755f88','0xb31a38f4e228ca8d0873ddb3530a89ac80aafdf4','0x57e9eff84c9d1229edaf5d8bd83c5650118feb8e','0x1ad96c413367ebb4f9c8961a751cf144c9278592','0x10581399a549dbfffdbd9b070a0ba2f9f61620d2','0xce3dd41cfe1d14e66df18fa66ff5bb1dfd98b880','0xee0273fb5a7ce399e54ff1daec354f17b8a4ab20','0x272a46a8d4b572a267b7c90ea64874c6655b1de4','0x8df124291507807bcfe5e0e1fb9f3d093ad78cd6','0x8460563edb328c42c8bcfee1e224a7ad8db02f7f','0x97e7d56a0408570ba1a7852de36350f7713906ec','0xa89ae75f2bcd5b59566bde15bff02a40e9014d51','0x99132b53ab44694eeb372e87bced3929e4ab8456','0x664b92ece366db41042942c5ca41e3398078dd63','0x732ff409632c700dbbdb8843660e57856790a4d0','0x7f2b2d6fae29947a39df41c0718fc5b88747e1f2','0xf7a7309b3c2e1ade65a11e8ec65a6062c2d754a0','0x5598931bfbb43eec686fa4b5b92b5152ebadc2f6','0xf6866aaeb54042418410d1333cb489f3650dde5b','0x548838a45d922230a99eec8a3710ff0f8d203f18','0x9081b403b02282acf28b59a950de98d091de940d','0x05a9716cd1c08361252ebd7c8c88c3b26c5ab73f','0x5963f8e5b20ace84a297aa819c130a2b4308249c','0x6394aeab6ac8993dc62f5e18e46762b75eb890d8','0x5f78a75ee92885cb8b32bdde19b17600bebfb270','0x8fc91697ee952161edb5934a2d2bbab16ebc6d2a','0xdab59355190d110f9f71a5f97993511343264db3','0x11fd6e1c7a9f4c03d6e1be7d469ad626f937c28d','0x3f1a6182af41665e6d261efc895335f70e49b443','0xd340b57aacdd10f96fc1cf10e15921936f41e29c','0x66bf3ff8972639df2643a8ac2041186761c098b6','0x5b5c8eb7142e5f484099853fefeaa74e56d0dda9','0xe103f2668a68538f71c90f701091d18da2244e9f','0x689b322bf5056487eec7f9b2577cd43a37eb6302','0x87ade669de2a7cfc193112b7d885f5203a27635a','0xde9e8cc0b43ef606036125e13e0f1b83415bcca1','0xe845469aae04f8823202b011a848cf199420b4c1','0x57af956d3e2cca3b86f3d8c6772c03ddca3eaacb','0x0e10ee115fa6252fe72e2590c3a5561941d67be9','0xe8e7201e427c2509f03f5bf6cece711687623dff','0xf4a7f5bd555ae46eab6b6c5f83332eee6c598970','0xc0b338fd9ad61a808a9fcea24eeddcc89f96068b','0x6dc567b75b36bbecfa895277273f5be5170ae261','0xa1c129e8e093f935969be783790ccae472f8ba1a','0x52f01c2c685c7bc243e266d9eb0f9bfb184e0df1','0x015b79c21b7d58e25bac7977711db280f0efa7e4','0x8e20916f3657e3e885d9536f8850e6be6bce2508','0x70c6bd8fc6c48dc57f95c9b8adff4ab9f0e19f5a','0x84ea2e00fd6c4d08e88c5f59265b79de530bea0b','0xd73070db67ac6d8ba1c31fdf365c84eb964e93e3','0x5a54a656b9a29f48cb84241e89104ad6e0f88a0a','0xdbfd99a28787a31ee06dec5f00deb090ff04d956','0xc686f0bfee4f61161a3af55757a7483002ac8839','0xec13130ddc44d7f330b637abc315710afcbe4049','0x683d6a62fc628d9b1ff7662dde2a17856a05e4a1','0x27878ae7f961a126755042ee8e5c074ea971511f','0xd390b185603a730b00c546a951ce961b44f5f899','0x679a26814bbdee092367f41e8aefd73695fb9c6b','0x3c4323f83d91b500b0f52cb19f7086813595f4c9','0x36e0fbf33c9bae7350353bfd7ed759bbb0b43415','0x6a3eb6fe80270e761aab614c48f776066e7d6ad1','0xf4d686c684b2a05cbd4fccb77121b503e6d00389','0xcbf3daf2e4a3be10fad16cb5a388dac56d5b3a02','0xdade25f6394e12f2f9cc0844efc32f2f662188e6','0xb8b71473301407f29c31f0e2b13af963aeab4393','0xe3ee7ca56b5ae12876df64dc4017c873f91bdd6e','0x70bc703dd5ced7d461ec5b3009e0a2d685ef20f5','0x0bbb7c3ef37b37330125547b76a992aeb5a83119','0x3ee301ed8f42d106def4f9d9730ea3367880b771','0xabd57587522f6fa7d6d77aaab8a22afbfafa015a','0xdce6e7d5d400773c876689f10a5dca6a438ccf88','0x06f171de64205e4dd881c49d57e6e4ada7c37726','0x49e382973249f00ff37eacb3307702bb7693a4ed','0xa89a1cdf5fe93d754b6064b9f761747d03176c54','0x81663f727bf8461a9115b01748105cec0fe44446','0x412940fdac1214fc3df430769f54e69210a18e49','0xdcebd5d749e1e2b476f4fcefc20fb1caba793b0c','0xb3b48af42cfc7e35b5fbbccf63adf7d0345d96cb','0x97a86cff15d1af9eebd67274341291fa73d0f204','0xc6ee20d4097bbbf84419f680953319e1f6f610a3','0x0c42fd87bfedfe3589bf25ae3d07c273ec6e39dd','0x343fa3c8d17d5f7ed95f5b619490be3d7eb4f4be','0xfa8a5082174c53eff6866a96e3253b9d5403cb12','0xdc253c1da38c6644b2ebf2430ec007c7e16b9dc2','0x6fe9465012c38e3fb66df8894348967d5b48260d','0x3b725b629b7c547eb9b30f34604bfdd4e958076e','0xf109067c13601f0d04e1bcba8bd1a4bad77363c0','0x83606a6ed800bec388bec1299b49d32c1f92e616','0xe6868579ca50ef3f0d02d003e6d3e45240efcb35','0xa9fc406744afdd46ef96f6ddb343fc124ec25254','0xc485b2757ca69e83998bf4543833409bc7a417ac','0x82841dfd5c6c4a788db25caddfdcc4530b48336b','0x064880be0b82d07f5476653e3ceb1dbcd14be40b','0x0221d724c1a37b8c54dd99fefddae2b903d193d6','0xee828cccb3c149e01de4e69d2a21e38a7b65ccbf','0x7852e0a431d72e75a27b71ba109e5fcb04e0fcd0','0x507c54914ca6cf2d4d833307d0357b8c2d148a0d','0x372b9bbbc1486569ad3faed2b08130954dabfbb3','0x6582b944069f6c45e0ea05fb87b0bf71bfaacbfb','0x9da1d1c9353b32c9e15adf11fadbe9f0860fccfa','0x5fddcbf2320314e75ee254005302d52be3396906','0x3a65361033c8b172a910272d9ac0137147dbb95f','0x3813d7807b6076e45dfca3cfe70bb2cce3f441d7','0xe3baa96ad46457d9e6cdd4e32abc11e2c124ec49','0xe11ee9c18d03b43d6a7fc53e51aedda8451e837a','0xe22c44bb5ce8253e32579c947cf98bb17d7fcdec','0x8f9a0935b26097a1fc15d4919e0b9e466edc1c57','0xb395f092e21101a2bb8fae3892d2eef149aa2067','0xb38c979367cbadbe23026e9dda66ec6cbe926ff7','0xed9e1a15e7c638e552e8d390567cebfe7d278178','0x7a3c548416bbe8e09ac4fd6151af2dc6957a75ca','0x596d7bcfd45577abe581a71f810fe72bc10a5420','0x21c2b87b02eb013570e1753dd22bb62f042e0902','0xf2c055823dd744234694815c6c42f2956191ce1f','0x405127050fc7e45d861e84cb96368b6e45015bb9','0x4768f4dfb46b26889ffaab881945bd7d340505c2','0x5628950419c53d429e99c127807c43a4f8b5a57e','0x6c8c4b301f89ef6d5ebcc0ca2bdc5106058e3601','0x83a1ccda053b7a9c696c532eb3555ecd7cca8a18','0x13236638051f7643c0006f92b72789684dc92477','0x6e9eeee4936d7d73933ea6409103c3df9713562e','0x9ca37e40aef2686a6f44cb4e2708849231ef3878','0xe7a05d7f38c62871102ddb30387d7a5935a554b8','0xa462c95042fc3aa96aedc89ca4daadb7ebd366d8','0x46631c701eae6c6f1880cdd6898675bbf20886bb','0x924f230530e8fb5eb4db3e72c48a534e8d1fc06a','0xedba3e1ec78153fba15697ca1814da28c41e4efd','0x0df4019374c11a7795cfef78f88d4c1aa3300462','0x903d26296a9269f9cfc08d6e5f640436b6d2f8f5','0xaef97897fc4e284526e6eee1115344e3f5ed979c','0xee7337aafc70a0af093a6745f0235a1e72967470','0xfc6f0f91a8f61bea100b3c15affabd486fc1507c','0x1314ae4cf2a9440303fef6ae0fdc9ea5ad7a2a37','0x53614b950b201b061df191279055f54a9f79c341','0x4702abebad5281b53ddc6bf474f271e5b38033f4','0x1d0f3c580378daf7c66c090e098819f633e04880','0xa5555ee6d6a7e6b243a493ce1047e3365ccb9a76','0x855a765d9dc0c30e83312a86a7c7e32506f0657e','0x788248dddf945542ca202713e6cb74195db07209','0x42828ac0ef0591081478d4e6a06a4b92695f8017','0xbf4901af7c3cacb83480916cac02912fac7d7eb8','0x6a2259ac6714c6dd825f7fd615fb7ecde05eb09f','0x471aca8f8dea063695b2b15fbca3e402fa4e3385','0xa87998484c19d68807debdc280e18424d55743a9','0xde77450d0887994364b62a93e14a3a76d2db9162','0x44f9469d0d5393d3a01a0d4fa14fe7713c1ad1f7','0x655517d8f0dad78641982e91bf4889f6869bfdf7','0x1f0a97a0b7c4783a471d883cff5e85d13fe2ef3e','0xa372c9e116c68f0c9fb2fc9b011a8513a4a5d211','0xe0f0e02a16b45f949b98856b61175e63ca5f6293','0x16774c080ac2d2f376fc1e449cf6d98917760664','0xfc4602aa8b7f070f3d0e17f27b10dbcc737474e1','0xf9dccb69eb0b3a64d659b30f0be74c35c96d230e','0x866dfba0a5f07effcac524839cd35adc0edda3c0','0x68a1b3dbdfaa0529371ac8e9d87bec40fac254cb','0x9127c5c988917b879b3b9bc87d11ee2c9bdeda73','0xf5e40fe622b06c2f08d179ccd77b192c124d238c','0x5eb837c4b76239dcbe770be1de9a198b98078faf','0xb011e4eb4111ef00b620a5ed195836dcd69db1ff','0x68add60da802f739b84505aafdb6145be4d41162','0x7bdf4fd5ee9ca73492e4b0591b310ce27758872f','0x4af7475a8d51ee117b1454832454b84cbba1eecf','0xb1de756d038a7f5d5f3076151304d4cc225cacfb','0xd203036cb2fc9ed81e16d87e026269e68dc1e897','0xd9a50099d63ea00ccd770cfc41075e7670bea6a4','0x78c9db2cd074d581203810f379ef53a56da883ea','0xa9166690c35d900a57d2ec132c58291bc0678944','0xfa18f4ee096cd153e6caf601c8b63bdfc1a0e60b','0x8c1cb0cccb941dc1083d1b73c14cb350a11a426e','0xe9566699f443459dfab77cbf100a63f0d5f75d43','0x0db6a5bf8588afd9c84ea79591644e6e0474e63b','0x04e08fd3503c971d510674b2bc5c9a17d4760eaa','0x72d9172cb42019c0cc661ec6eb0fca38385079d6','0x596101125094f9d65a579b2cfc4c26059cb64e81','0xb703259778a7045a1614990bc451bda48ca9d6a8','0xf9db11a26da162399bdba5ad2d4e0db3623d367e','0xa8509cbee6710f212dd9534d3e2e0914e6af727c','0x0ed18a54afe970cdff76d2b17251c22025d41c5d','0x5eb5dc3d8c74413834f1ca65c3412f48cd1c67a6','0x307c4d0a83931c3eebe501f8f0c0b4c249bcf206','0x22878c545228663350841f0255d2b541be4ee783','0x1ab5d8acd6a5ae87a2968e7f33021600f112933c','0xcdff6ddfc9e4807c9927fd58708c2ef3484cc305','0xf459ae3199362764cec11f1a1dfb07ad1c93a58b','0xfebf38b1d34818d4827034f97b7d6d77c79d4997'

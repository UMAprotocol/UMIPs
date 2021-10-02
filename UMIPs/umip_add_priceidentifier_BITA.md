## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add CGLCAR, CKLCAR, and CNLCAR as supported price identifiers |
| Authors             | Jeffrey Bennett (endymionjkb@gmail.com)                       |
| Status              | Draft                                                         |
| Created             | 9/6/2021                                                      |
| Discourse Link      | discourse.umaproject.org/t/add-a-basket-of-price-identifiers-calculated-by-bita-bitadata-com/1322

# Summary 

The DVM should support price requests for three fiat carbon indices: CGLCAR, CKLCAR, and CNLCAR, issued by Confluence Analytics, and computed and published
by BITA (bitadata.com). See the [index page](https://www.confluenceanalytics.com/indexes) for a description of CGLCAR. The others are similar, but focused
regionally (Korea and Norway).

# Motivation

ESG (Environmental, Social, Governance) funds are high performing and growing in popularity in the traditional finance world, but there is currently
no way to gain exposure to these types of funds in crypto.

The first price identifiers are: CGLCAR, CKLCAR, and CNLCAR, corresponding to the global and regional low carbon indices from Confluence Analytics.
Confluence Analytics proposes to create Perpetual Synthetics that track these indices, and then include them in liquidity pools.

# Data Specifications
BITA is an EU-registered [index administrator](https://www.bitadata.com/assets/files/index-services/BITA_Index_Administration_-_Service_One_Pager.pdf).
They calculate indices in both fiat and crypto, adjusting for corporate actions, stock splits, etc., and produce daily detailed files for all holdings,
which are also accessible through an API.

There is a rate-limited public API for current and historical index prices. The limit is 100 requests per minute per user.

Prices are updated daily after market close ("EOD"). The EOD price is the official index close price, calculated with official exchange-issued close prices.
It is calculated after the last exchange (for which constituents exist) has closed and issued a price confirmation (normally calculated around 00:00 GMT).
They use official close prices coming directly from the exchanges. The index is open (calculated) as long as there is at least 1 constituent' exchange open.
On early close days, they will still calculate the index EOD price at around 00:00 GMT.

-----------------------------------------
- Price identifier name: CGLCAR (Confluence Global ESG Low Carbon Index)
- Base Currency: - USD
- Example data providers: BITA
- Cost to use: Free, rate-limited
- Real-time data update frequency: daily
- Historical data update frequency: daily
-----------------------------------------
- Price identifier name: CKLCAR (Confluence Analytics Korea ESG Low Carbon Index)
- Base Currency: - USD
- Example data providers: BITA
- Cost to use: Free, rate-limited
- Real-time data update frequency: daily
- Historical data update frequency: daily
-----------------------------------------
- Price identifier name: CNLCAR (Confluence Analytics Norway ESG Low Carbon Index)
- Base Currency: - USD
- Example data providers: BITA
- Cost to use: Free, rate-limited
- Real-time data update frequency: daily
- Historical data update frequency: daily

# Price Feed Implementation

The price feed is a REST API hosted at api.bitadata.com. Users first "log in" (with public credentials) to obtain a token, then use standard token authentication for subsequent requests.
The public credentials provide access to the three indices named above. The API returns high precision floating point numbers, but these are US currency values, so the price feed
implementation will round them to 2 decimals.

# Rationale
These are proprietary indices, and a feed should also become available on the Confluence site. The founders have a great track record: one is co-founder of Etho Capital, which published the
best-performing ESG index in the US (ticker ETHO on NASDAQ), now with a 5+ year track record.

Nevertheless, a third party licensed entity (on a different continent), whose entire business is publishing indices, is an even more reliable and resilient data source.

Eventually these indices may be listed on a major stock exchange, such as NASDAQ, at which point there will be many additional data feeds.

# Implementation

To retrieve index prices, first POST a Basic Authentication login with the following credentials to obtain an expiring access token:

```
curl --location --request POST 'https://api.bitadata.com/v1/login/' \
--header 'Content-Type: application/json' \
--data-raw '{
	"user": "confluence_public",
	"password": "P3AQ88Az$!CddnnY"
}'
```
This should return a token:

```
{
  "message": "Authenticated succesfully",
  "token": "eyJ0eXAiOiQiLCJhbGciOiJIUzI1NiJ9.eyJzd..."
}
```

This token grants access to the "indexes_eod" and "index_value" endpoints.

For the current price of one or more indices, use the access token returned above:

```
curl --location --request POST 'https://api.bitadata.com/v1/index_value/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJ0eXAiOiQiLCJhbGciOiJIUzI1NiJ9.eyJzd...' \
--data-raw '{"indexes": ["CGLCAR","CNLCAR"]}'
```

Returns:

```
{
    "type":"index_value",
    "data":[
      {"time":"2021-09-03T22:10:15.896Z","index_id":"CGLCAR","value":1023.5248741978535},
      {"time":"2021-09-03T22:10:29.857Z","index_id":"CNLCAR","value":1011.3961111526498}
    ]
}                                                
```

For historical prices, use the access token returned above:

```
curl --location --request POST 'https://api-test.bitadata.com/v1/indexes_eod/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJ0eXAiOiQiLCJhbGciOiJIUzI1NiJ9.eyJzd...' \
--data-raw '{
	"indexes": ["CGLCAR"],
	"start_date": "2021-08-01",
	"end_date": "2021-09-06"
}'
```

Returns:

```
{
    "type":"indexes_eod",
    "start_date":"2021-08-01",
    "end_date":"2021-09-06",
    "data":
      {"CGLCAR":[
          {"timestamp":"2021-08-01","value":"985.273234232"},
          {"timestamp":"2021-08-02","value":"990.1532423214"},
          {"timestamp":"2021-08-03","value":"991.4032342342"},
          ...
          {"timestamp":"2021-09-03","value":"1023.52324234234"}
        ]
      }
    }                                                                                             
```

You can find full API documentation [here](https://docs.bitadata.com/). For dispute resolution, the floating point values should be rounded to 2 decimal
currency values, to match the price feed implementation.

# Security Considerations

Adding this new identifier by itself poses a little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

The global index has a large number of constituents (mostly large cap), and should be fairly stable. The country-based ones are potentially a bit more volatile - and could be influenced by local events in those countries (currently Korea and Norway). Also, these are fiat indices, so they only have prices on days when the traditional financial markets are open.

This means price discontinuities (like the infamous "CME" gaps of Bitcoin) are possible over weekends and holidays, and due to these gaps, a larger number of liquidations and disputes may arise. In order to mitigate this theoretical risk, a higher collateralization requirement (125%+) should be set, or a reserve fund mechanism should be implemented in order to automatically rebalance the collateralization ratio above 100%.

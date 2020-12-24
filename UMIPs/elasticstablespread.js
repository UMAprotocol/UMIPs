// Imports
const axios = require("axios"); // Axios for requests

/**
 * Collect token price from cryptowatch
 * @param {string} exchange name
 * @param {string} token pair
 * @param {boolean} tetherDenominated true if pair denominated in usdt
 * @returns {float} token pair price
 */
async function collectCryptowatchPrice(exchange, token, tetherDenominated) {
  // Collect token price
  const price = // Collect resulting price from object
    // Async call to cryptowatch
    (
      await axios.get(
        // Containing exchange, pair, and api-key
        `https://api.cryptowat.ch/markets/${exchange}/${token}/price`
      )
    ).data.result.price;

  // If pair is denominated in USDT
  if (tetherDenominated) {
    // Collect current tether price
    const tetherPrice = // Collect resulting price from object
      // Async call to cryptowatch
      (
        await axios.get(
          // With hardcoded bitfinex usdt pricefeed
          `https://api.cryptowat.ch/markets/bitfinex/usdtusd/price`
        )
      ).data.result.price;

    // Return price * tether price to return symbol price in USD
    return price * tetherPrice;
  }

  // Return symbol price in USD
  return price;
}

/**
 * Calculate MUSD price from Uniswap
 * @returns {float} MUSD price
 */
async function collectUniswapPrice(tokenAddress) {
  // Collect averaged Ethereum price
  const ethereumPrice = calculatePriceAverage([
    // From CB Pro
    await collectCryptowatchPrice("coinbase-pro", "ethusd"),
    // + FTX
    await collectCryptowatchPrice("ftx", "ethusd"),
  ]);

  const tokenAddressToQuery = tokenAddress;

  // Retrieve price from Uniswap Subgraph
  const priceInETH = // Collect derivedETH price
    // POST subgraph
    (
      await axios.post(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
        {
          query: `
      {
        token(id: "${tokenAddressToQuery}") {
          derivedETH,
        }
      } 
    `,
        }
      )
    ).data.data.token.derivedETH;

  // Return float(priceInETH) * ethereumPrice
  return +priceInETH * ethereumPrice;
}

/**
 * Retrieve MUSD price from Balancer
 * @returns {float} MUSD price
 */
async function collectMUSDBalancerPrice() {
  // Float cast return
  return +(
    // POST Balancer subgrah for MUSD price
    (
      await axios.post(
        "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
        // With tokenPrice query
        {
          query: `
      {
        tokenPrice(id:"0xe2f2a5c287993345a840db3b0845fbc70f5935a5") {
          price
        }
      }
      `,
        }
      )
    ).data.data.tokenPrice.price
  );
}

/**
 * Calculate average of array of prices
 * @param {number[]} prices array containing prices
 * @returns {float} averaged price
 */
function calculatePriceAverage(prices) {
  // Return reduced sum / length of price array
  return prices.reduce((a, b) => a + b) / prices.length;
}

/**
 * Calculate weighted pricing from averaged pair pricefeeds
 * @param {number[]} averagedPrices array containing token prices
 * @returns {float} weighted price
 */
function calculateWeightedBasket(averagedPrices) {
  let basket = 0; // Placeholder basket price

  // For each item in averagedPrices
  for (let i = 0; i < averagedPrices.length; i++) {
    // Basket += (averagedPrice * (1 / length(averagedPrice)))
    basket += (1 / averagedPrices.length) * averagedPrices[i];
  }

  // Return weighted price
  return basket;
}

/**
 * Calculate ELASTICSTABLESPREAD identifier
 * @returns {float} representing identifier value
 */
async function calculateELASTICSTABLESPREAD() {
  // Calculate weighted price average of non ethereum basket tokens
  const elasticEthereumBasketPrice = calculateWeightedBasket([
	await collectUniswapPrice("0x853d955acef822db058eb8505911ed77f175b99e"),
	await collectUniswapPrice("0x36f3fd68e7325a35eb768f1aedaae9ea0689d723"),
	await collectUniswapPrice("0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a")
  ]);

  // Calculate averaged MUSD price
  const MUSDPrice = calculatePriceAverage([
    await collectUniswapPrice("0xe2f2a5c287993345a840db3b0845fbc70f5935a5"),
    await collectMUSDBalancerPrice(),
  ]);

  /**
   * Return calculated stablespread
   */
  // Take max between calculation and 0, and min between calculation and 2
  return Math.min(
    Math.max(
    (elasticEthereumBasketPrice - MUSDPrice + 1).toFixed(8),
    0
   ),
   2
  );
}

/**
 * Script runner
 */
async function main() {
  // Output stablespread to console
  console.log("ELASTICSTABLESPREAD: " + (await calculateELASTICSTABLESPREAD()));
}

// Run script
main();

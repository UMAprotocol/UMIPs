## Headers

| UMIP-190            |                                                                 |
| ------------------- | --------------------------------------------------------------- |
| **UMIP Title**      | Currency Whitelist Maintenance and Fee Updates |
| **Authors**         | UMA Protocol Team                                               |
| **Status**          | Draft                                                           |
| **Created**         | August 28, 2025                                                 |

---

## Summary

This UMIP proposes whitelist housekeeping across Ethereum mainnet, Polygon, Arbitrum, Optimism, Base, and Blast:

- **Remove** a defined set of deprecated currency addresses from each network’s whitelist.  
- **Reset final fees to 0** for removed currencies.  
- **Update final fees** for WETH on all supported chains, and for ABT on mainnet.  
- **Retire Boba messenger support** (chainId **288**) on mainnet.  

To keep on-chain proposals small and auditable, these changes are executed via **four separate proposals** (Parts 1–4). The canonical action lists are included below.

---

## Motivation

Over time, UMA’s currency whitelists accumulate assets that are no longer actively used. Periodic housekeeping removes inactive entries and simplifies operations. This UMIP performs:

- **Whitelist pruning** of currencies that are not actively used on mainnet, Polygon, Arbitrum, Optimism, Base, and Blast. **Note: these currencies could be re-whitelisted in the future if use cases arise.**
- **Fee table alignment** for actively used currencies (WETH, USDC, ABT).  
- **Removal of Boba chain support** by retiring the Boba messenger.  

No protocol semantics change and no new functionality is introduced—this is a standard clean-up and parameter alignment exercise.

---

## Technical Specification

All actions are executed through the standard UMA Governor process on each network.

### Common operations

- **Remove currency from whitelist:**  
  `removeFromWhitelist(address collateral)`
- **Set/Reset final fee:**  
  `setFinalFee(address currency, FixedPoint.Unsigned memory newFinalFee)`  
  (For removed currencies, `newFee = 0`.)
- **Retire messenger (mainnet):**  
  Remove Boba **chainId 288** from supported messenger list in [OracleHub](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372).

### Fee updates (active currencies)

- **Mainnet WETH:** `0.135 → 0.055`  
- **Mainnet ABT:** `0.135 → 0.055`  
- **Polygon WETH:** `0.135 → 0.055`  
- **Arbitrum WETH:** `0.135 → 0.055`  
- **Optimism WETH:** `0.135 → 0.055`  
- **Base WETH:** `0.135 → 0.055`  
- **Blast WETH:** `0.135 → 0.055`  

---

## Proposal Details

### UMIP 190: Part 1 of 4 (Mainnet)
- Remove Boba messenger (chainId 288) on mainnet  
- Remove & reset fee to 0 for the following mainnet currencies:  
  DAI, renBTC, PERL, rDAI, USDT, bSLP, DSD, bBADGER, renDOGE, OCEAN, WBTC, YAM, AAVE, LINK, SNX, UMA, UNI, UNI-V2 (multiple LPs), ANT, INDEX, DPI, SUSHI, xSUSHI, XIO, BAL, bDIGG, LON, MASK, BANK, SFI, VSP, FRAX, DEXTF, ORN, BOND, PUNK-BASIC, LUSD, iFARM, yvUSDC, UST, BNT, vBNT, BAND, SDT  
  (See action list for exact addresses.)

### UMIP 190: Part 2 of 4 (Mainnet)
- Remove & reset fee to 0 for the following mainnet currencies:  
  KP3R, CREAM, CHAIN, ERN, OPEN, yyDAI+yUSDC+yUSDT+yTUSD, RAI, COMP, YFI, ALCX, ALPHA, MKR, REN, CRV, RGT, NFTX, DFX, BASK, BADGER, OHM, IDLE, GNO, POOL, DOUGH, FEI, TRIBE, FOX, GYSR, MPH, APW, SNOW, NDX, RBN, BANK, YEL, BPRO, VOL, IF, PERP, GRO, MATIC, FLUID, JRT, AQUA, IDIA, QUARTZ, ibBTC, BOBA  
  (See action list for exact addresses.)

### UMIP 190: Part 3 of 4 (Mainnet + Polygon + Arbitrum)
- Reset final fee for BOBA on mainnet.  
- Remove & reset fee to 0 for the following mainnet currencies: DOM, CRE8R, COMFI, FDT, PSP, BEAN, MAGIC, THOR, ACX.  
- Update fees on mainnet:  
  - WETH → 0.055  
  - ABT → 0.055  
- Polygon removals: TESTERC20, DAI, USDT0, UNI, WBTC, AAVE, COMP, SNX, SUSHI, YFI, CRV, BAL, BOND, BADGER, QI, renBTC, YEL, DFX, miMATIC, BIFI, ICE, IRON, POOL, WPOL, INST, AX, YAM, JRT, DOM, COMFI, UMA, VSQ, PSP, TETU.  
- Update Polygon WETH → 0.055.  
- Arbitrum removals: USDT0, WBTC, UMA.  

### UMIP 190: Part 4 of 4 (Arbitrum + Optimism + Base + Blast)
- Reset fee to 0 for UMA on Arbitrum.  
- Arbitrum removals: DAI, LINK, UNI, SUSHI, BAL, BOND, SDT, CREAM, RAI, COMP, YFI, MKR (hex artifact), CRV, RGT, BADGER, OHM, GNO, NDX, PERP, ibBTC, MAGIC.  
- Update Arbitrum WETH → 0.055.  
- Optimism removals: DAI, USDT, WBTC, LINK, UMA, UNI, BOND, LUSD, RAI, PERP.  
- Update Optimism WETH → 0.055.  
- Base removals: DAI, USDbC, SNX, SUSHI, BAL, LUSD, iFARM, COMP, YFI, CRV, POOL, JRT, USDT.  
- Update Base WETH → 0.055.  
- Blast removals: WBTC.  
- Update Blast WETH → 0.055.  

---

## Security Considerations

- This proposal **removes** entries and aligns parameters; it does not add new functionality.  
- Changes are **network-isolated** and limited to the addresses listed above.  
- Splitting actions across four votes avoids exceeding transaction size limits and improves auditability.  

---

## Detailed Action Lists

### Proposal 1 of 4 — Actions (Mainnet batch + Boba messenger)
```
- Remove Boba messenger (chainId 288) on mainnet
- Remove DAI (0x6B175474E89094C44Da98b954EedeAC495271d0F) from whitelist on mainnet
- Reset final fee for DAI (0x6B175474E89094C44Da98b954EedeAC495271d0F) to 0 on mainnet
- Remove renBTC (0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D) from whitelist on mainnet
- Reset final fee for renBTC (0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D) to 0 on mainnet
- Remove PERL (0xeca82185adCE47f39c684352B0439f030f860318) from whitelist on mainnet
- Reset final fee for PERL (0xeca82185adCE47f39c684352B0439f030f860318) to 0 on mainnet
- Remove rDAI (0x261b45D85cCFeAbb11F022eBa346ee8D1cd488c0) from whitelist on mainnet
- Reset final fee for rDAI (0x261b45D85cCFeAbb11F022eBa346ee8D1cd488c0) to 0 on mainnet
- Remove USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7) from whitelist on mainnet
- Reset final fee for USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7) to 0 on mainnet
- Remove bSLP (0x758A43EE2BFf8230eeb784879CdcFF4828F2544D) from whitelist on mainnet
- Reset final fee for bSLP (0x758A43EE2BFf8230eeb784879CdcFF4828F2544D) to 0 on mainnet
- Remove DSD (0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3) from whitelist on mainnet
- Reset final fee for DSD (0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3) to 0 on mainnet
- Remove bBADGER (0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28) from whitelist on mainnet
- Reset final fee for bBADGER (0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28) to 0 on mainnet
- Remove renDOGE (0x3832d2F059E55934220881F831bE501D180671A7) from whitelist on mainnet
- Reset final fee for renDOGE (0x3832d2F059E55934220881F831bE501D180671A7) to 0 on mainnet
- Remove OCEAN (0x967da4048cD07aB37855c090aAF366e4ce1b9F48) from whitelist on mainnet
- Reset final fee for OCEAN (0x967da4048cD07aB37855c090aAF366e4ce1b9F48) to 0 on mainnet
- Remove WBTC (0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599) from whitelist on mainnet
- Reset final fee for WBTC (0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599) to 0 on mainnet
- Remove YAM (0x0AaCfbeC6a24756c20D41914F2caba817C0d8521) from whitelist on mainnet
- Reset final fee for YAM (0x0AaCfbeC6a24756c20D41914F2caba817C0d8521) to 0 on mainnet
- Remove AAVE (0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9) from whitelist on mainnet
- Reset final fee for AAVE (0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9) to 0 on mainnet
- Remove LINK (0x514910771AF9Ca656af840dff83E8264EcF986CA) from whitelist on mainnet
- Reset final fee for LINK (0x514910771AF9Ca656af840dff83E8264EcF986CA) to 0 on mainnet
- Remove SNX (0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F) from whitelist on mainnet
- Reset final fee for SNX (0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F) to 0 on mainnet
- Remove UMA (0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828) from whitelist on mainnet
- Reset final fee for UMA (0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828) to 0 on mainnet
- Remove UNI (0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984) from whitelist on mainnet
- Reset final fee for UNI (0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984) to 0 on mainnet
- Remove UNI-V2 (0xBb2b8038a1640196FbE3e38816F3e67Cba72D940) from whitelist on mainnet
- Reset final fee for UNI-V2 (0xBb2b8038a1640196FbE3e38816F3e67Cba72D940) to 0 on mainnet
- Remove UNI-V2 (0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) from whitelist on mainnet
- Reset final fee for UNI-V2 (0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) to 0 on mainnet
- Remove UNI-V2 (0xd3d2E2692501A5c9Ca623199D38826e513033a17) from whitelist on mainnet
- Reset final fee for UNI-V2 (0xd3d2E2692501A5c9Ca623199D38826e513033a17) to 0 on mainnet
- Remove UNI-V2 (0x88D97d199b9ED37C29D846d00D443De980832a22) from whitelist on mainnet
- Reset final fee for UNI-V2 (0x88D97d199b9ED37C29D846d00D443De980832a22) to 0 on mainnet
- Remove ANT (0xa117000000f279D81A1D3cc75430fAA017FA5A2e) from whitelist on mainnet
- Reset final fee for ANT (0xa117000000f279D81A1D3cc75430fAA017FA5A2e) to 0 on mainnet
- Remove INDEX (0x0954906da0Bf32d5479e25f46056d22f08464cab) from whitelist on mainnet
- Reset final fee for INDEX (0x0954906da0Bf32d5479e25f46056d22f08464cab) to 0 on mainnet
- Remove DPI (0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b) from whitelist on mainnet
- Reset final fee for DPI (0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b) to 0 on mainnet
- Remove SUSHI (0x6B3595068778DD592e39A122f4f5a5cF09C90fE2) from whitelist on mainnet
- Reset final fee for SUSHI (0x6B3595068778DD592e39A122f4f5a5cF09C90fE2) to 0 on mainnet
- Remove xSUSHI (0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272) from whitelist on mainnet
- Reset final fee for xSUSHI (0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272) to 0 on mainnet
- Remove XIO (0x0f7F961648aE6Db43C75663aC7E5414Eb79b5704) from whitelist on mainnet
- Reset final fee for XIO (0x0f7F961648aE6Db43C75663aC7E5414Eb79b5704) to 0 on mainnet
- Remove BAL (0xba100000625a3754423978a60c9317c58a424e3D) from whitelist on mainnet
- Reset final fee for BAL (0xba100000625a3754423978a60c9317c58a424e3D) to 0 on mainnet
- Remove bDIGG (0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a) from whitelist on mainnet
- Reset final fee for bDIGG (0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a) to 0 on mainnet
- Remove LON (0x0000000000095413afC295d19EDeb1Ad7B71c952) from whitelist on mainnet
- Reset final fee for LON (0x0000000000095413afC295d19EDeb1Ad7B71c952) to 0 on mainnet
- Remove MASK (0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074) from whitelist on mainnet
- Reset final fee for MASK (0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074) to 0 on mainnet
- Remove BANK (0x24A6A37576377F63f194Caa5F518a60f45b42921) from whitelist on mainnet
- Reset final fee for BANK (0x24A6A37576377F63f194Caa5F518a60f45b42921) to 0 on mainnet
- Remove SFI (0xb753428af26E81097e7fD17f40c88aaA3E04902c) from whitelist on mainnet
- Reset final fee for SFI (0xb753428af26E81097e7fD17f40c88aaA3E04902c) to 0 on mainnet
- Remove VSP (0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421) from whitelist on mainnet
- Reset final fee for VSP (0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421) to 0 on mainnet
- Remove FRAX (0x853d955aCEf822Db058eb8505911ED77F175b99e) from whitelist on mainnet
- Reset final fee for FRAX (0x853d955aCEf822Db058eb8505911ED77F175b99e) to 0 on mainnet
- Remove DEXTF (0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0) from whitelist on mainnet
- Reset final fee for DEXTF (0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0) to 0 on mainnet
- Remove ORN (0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a) from whitelist on mainnet
- Reset final fee for ORN (0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a) to 0 on mainnet
- Remove BOND (0x0391D2021f89DC339F60Fff84546EA23E337750f) from whitelist on mainnet
- Reset final fee for BOND (0x0391D2021f89DC339F60Fff84546EA23E337750f) to 0 on mainnet
- Remove PUNK-BASIC (0x69BbE2FA02b4D90A944fF328663667DC32786385) from whitelist on mainnet
- Reset final fee for PUNK-BASIC (0x69BbE2FA02b4D90A944fF328663667DC32786385) to 0 on mainnet
- Remove LUSD (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0) from whitelist on mainnet
- Reset final fee for LUSD (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0) to 0 on mainnet
- Remove iFARM (0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651) from whitelist on mainnet
- Reset final fee for iFARM (0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651) to 0 on mainnet
- Remove yvUSDC (0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9) from whitelist on mainnet
- Reset final fee for yvUSDC (0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9) to 0 on mainnet
- Remove UST (0xa47c8bf37f92aBed4A126BDA807A7b7498661acD) from whitelist on mainnet
- Reset final fee for UST (0xa47c8bf37f92aBed4A126BDA807A7b7498661acD) to 0 on mainnet
- Remove BNT (0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C) from whitelist on mainnet
- Reset final fee for BNT (0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C) to 0 on mainnet
- Remove vBNT (0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94) from whitelist on mainnet
- Reset final fee for vBNT (0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94) to 0 on mainnet
- Remove BAND (0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55) from whitelist on mainnet
- Reset final fee for BAND (0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55) to 0 on mainnet
- Remove SDT (0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F) from whitelist on mainnet
- Reset final fee for SDT (0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F) to 0 on mainnet
```

### Proposal 2 of 4 — Actions (Mainnet batch):
```
- Remove KP3R (0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44) from whitelist on mainnet
- Reset final fee for KP3R (0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44) to 0 on mainnet
- Remove CREAM (0x2ba592F78dB6436527729929AAf6c908497cB200) from whitelist on mainnet
- Reset final fee for CREAM (0x2ba592F78dB6436527729929AAf6c908497cB200) to 0 on mainnet
- Remove CHAIN (0xC4C2614E694cF534D407Ee49F8E44D125E4681c4) from whitelist on mainnet
- Reset final fee for CHAIN (0xC4C2614E694cF534D407Ee49F8E44D125E4681c4) to 0 on mainnet
- Remove ERN (0xBBc2AE13b23d715c30720F079fcd9B4a74093505) from whitelist on mainnet
- Reset final fee for ERN (0xBBc2AE13b23d715c30720F079fcd9B4a74093505) to 0 on mainnet
- Remove OPEN (0x69e8b9528CABDA89fe846C67675B5D73d463a916) from whitelist on mainnet
- Reset final fee for OPEN (0x69e8b9528CABDA89fe846C67675B5D73d463a916) to 0 on mainnet
- Remove yyDAI+yUSDC+yUSDT+yTUSD (0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c) from whitelist on mainnet
- Reset final fee for yyDAI+yUSDC+yUSDT+yTUSD (0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c) to 0 on mainnet
- Remove RAI (0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919) from whitelist on mainnet
- Reset final fee for RAI (0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919) to 0 on mainnet
- Remove COMP (0xc00e94Cb662C3520282E6f5717214004A7f26888) from whitelist on mainnet
- Reset final fee for COMP (0xc00e94Cb662C3520282E6f5717214004A7f26888) to 0 on mainnet
- Remove YFI (0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e) from whitelist on mainnet
- Reset final fee for YFI (0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e) to 0 on mainnet
- Remove ALCX (0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF) from whitelist on mainnet
- Reset final fee for ALCX (0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF) to 0 on mainnet
- Remove ALPHA (0xa1faa113cbE53436Df28FF0aEe54275c13B40975) from whitelist on mainnet
- Reset final fee for ALPHA (0xa1faa113cbE53436Df28FF0aEe54275c13B40975) to 0 on mainnet
- Remove 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 from whitelist on mainnet
- Reset final fee for 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 to 0 on mainnet
- Remove REN (0x408e41876cCCDC0F92210600ef50372656052a38) from whitelist on mainnet
- Reset final fee for REN (0x408e41876cCCDC0F92210600ef50372656052a38) to 0 on mainnet
- Remove CRV (0xD533a949740bb3306d119CC777fa900bA034cd52) from whitelist on mainnet
- Reset final fee for CRV (0xD533a949740bb3306d119CC777fa900bA034cd52) to 0 on mainnet
- Remove RGT (0xD291E7a03283640FDc51b121aC401383A46cC623) from whitelist on mainnet
- Reset final fee for RGT (0xD291E7a03283640FDc51b121aC401383A46cC623) to 0 on mainnet
- Remove NFTX (0x87d73E916D7057945c9BcD8cdd94e42A6F47f776) from whitelist on mainnet
- Reset final fee for NFTX (0x87d73E916D7057945c9BcD8cdd94e42A6F47f776) to 0 on mainnet
- Remove DFX (0x888888435FDe8e7d4c54cAb67f206e4199454c60) from whitelist on mainnet
- Reset final fee for DFX (0x888888435FDe8e7d4c54cAb67f206e4199454c60) to 0 on mainnet
- Remove BASK (0x44564d0bd94343f72E3C8a0D22308B7Fa71DB0Bb) from whitelist on mainnet
- Reset final fee for BASK (0x44564d0bd94343f72E3C8a0D22308B7Fa71DB0Bb) to 0 on mainnet
- Remove BADGER (0x3472A5A71965499acd81997a54BBA8D852C6E53d) from whitelist on mainnet
- Reset final fee for BADGER (0x3472A5A71965499acd81997a54BBA8D852C6E53d) to 0 on mainnet
- Remove OHM (0x383518188C0C6d7730D91b2c03a03C837814a899) from whitelist on mainnet
- Reset final fee for OHM (0x383518188C0C6d7730D91b2c03a03C837814a899) to 0 on mainnet
- Remove IDLE (0x875773784Af8135eA0ef43b5a374AaD105c5D39e) from whitelist on mainnet
- Reset final fee for IDLE (0x875773784Af8135eA0ef43b5a374AaD105c5D39e) to 0 on mainnet
- Remove GNO (0x6810e776880C02933D47DB1b9fc05908e5386b96) from whitelist on mainnet
- Reset final fee for GNO (0x6810e776880C02933D47DB1b9fc05908e5386b96) to 0 on mainnet
- Remove POOL (0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e) from whitelist on mainnet
- Reset final fee for POOL (0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e) to 0 on mainnet
- Remove DOUGH (0xad32A8e6220741182940c5aBF610bDE99E737b2D) from whitelist on mainnet
- Reset final fee for DOUGH (0xad32A8e6220741182940c5aBF610bDE99E737b2D) to 0 on mainnet
- Remove FEI (0x956F47F50A910163D8BF957Cf5846D573E7f87CA) from whitelist on mainnet
- Reset final fee for FEI (0x956F47F50A910163D8BF957Cf5846D573E7f87CA) to 0 on mainnet
- Remove TRIBE (0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B) from whitelist on mainnet
- Reset final fee for TRIBE (0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B) to 0 on mainnet
- Remove FOX (0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d) from whitelist on mainnet
- Reset final fee for FOX (0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d) to 0 on mainnet
- Remove GYSR (0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb) from whitelist on mainnet
- Reset final fee for GYSR (0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb) to 0 on mainnet
- Remove MPH (0x8888801aF4d980682e47f1A9036e589479e835C5) from whitelist on mainnet
- Reset final fee for MPH (0x8888801aF4d980682e47f1A9036e589479e835C5) to 0 on mainnet
- Remove APW (0x4104b135DBC9609Fc1A9490E61369036497660c8) from whitelist on mainnet
- Reset final fee for APW (0x4104b135DBC9609Fc1A9490E61369036497660c8) to 0 on mainnet
- Remove SNOW (0xfe9A29aB92522D14Fc65880d817214261D8479AE) from whitelist on mainnet
- Reset final fee for SNOW (0xfe9A29aB92522D14Fc65880d817214261D8479AE) to 0 on mainnet
- Remove NDX (0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83) from whitelist on mainnet
- Reset final fee for NDX (0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83) to 0 on mainnet
- Remove RBN (0x6123B0049F904d730dB3C36a31167D9d4121fA6B) from whitelist on mainnet
- Reset final fee for RBN (0x6123B0049F904d730dB3C36a31167D9d4121fA6B) to 0 on mainnet
- Remove BANK (0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198) from whitelist on mainnet
- Reset final fee for BANK (0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198) to 0 on mainnet
- Remove YEL (0x7815bDa662050D84718B988735218CFfd32f75ea) from whitelist on mainnet
- Reset final fee for YEL (0x7815bDa662050D84718B988735218CFfd32f75ea) to 0 on mainnet
- Remove BPRO (0xbbBBBBB5AA847A2003fbC6b5C16DF0Bd1E725f61) from whitelist on mainnet
- Reset final fee for BPRO (0xbbBBBBB5AA847A2003fbC6b5C16DF0Bd1E725f61) to 0 on mainnet
- Remove VOL (0x5166E09628b696285E3A151e84FB977736a83575) from whitelist on mainnet
- Reset final fee for VOL (0x5166E09628b696285E3A151e84FB977736a83575) to 0 on mainnet
- Remove IF (0xB0e1fc65C1a741b4662B813eB787d369b8614Af1) from whitelist on mainnet
- Reset final fee for IF (0xB0e1fc65C1a741b4662B813eB787d369b8614Af1) to 0 on mainnet
- Remove PERP (0xbC396689893D065F41bc2C6EcbeE5e0085233447) from whitelist on mainnet
- Reset final fee for PERP (0xbC396689893D065F41bc2C6EcbeE5e0085233447) to 0 on mainnet
- Remove GRO (0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7) from whitelist on mainnet
- Reset final fee for GRO (0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7) to 0 on mainnet
- Remove MATIC (0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0) from whitelist on mainnet
- Reset final fee for MATIC (0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0) to 0 on mainnet
- Remove FLUID (0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb) from whitelist on mainnet
- Reset final fee for FLUID (0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb) to 0 on mainnet
- Remove JRT (0x8A9C67fee641579dEbA04928c4BC45F66e26343A) from whitelist on mainnet
- Reset final fee for JRT (0x8A9C67fee641579dEbA04928c4BC45F66e26343A) to 0 on mainnet
- Remove AQUA (0xD34a24006b862f4E9936c506691539D6433aD297) from whitelist on mainnet
- Reset final fee for AQUA (0xD34a24006b862f4E9936c506691539D6433aD297) to 0 on mainnet
- Remove IDIA (0x0b15Ddf19D47E6a86A56148fb4aFFFc6929BcB89) from whitelist on mainnet
- Reset final fee for IDIA (0x0b15Ddf19D47E6a86A56148fb4aFFFc6929BcB89) to 0 on mainnet
- Remove QUARTZ (0xbA8A621b4a54e61C442F5Ec623687e2a942225ef) from whitelist on mainnet
- Reset final fee for QUARTZ (0xbA8A621b4a54e61C442F5Ec623687e2a942225ef) to 0 on mainnet
- Remove ibBTC (0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F) from whitelist on mainnet
- Reset final fee for ibBTC (0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F) to 0 on mainnet
- Remove BOBA (0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc) from whitelist on mainnet
```

### Proposal 3 of 4 — Actions (Mainnet wrap-up + Fee updates; Polygon batch)
```
- Reset final fee for BOBA (0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc) to 0 on mainnet
- Remove DOM (0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F) from whitelist on mainnet
- Reset final fee for DOM (0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F) to 0 on mainnet
- Remove CRE8R (0xaa61D5dec73971CD4a026ef2820bB87b4a4Ed8d6) from whitelist on mainnet
- Reset final fee for CRE8R (0xaa61D5dec73971CD4a026ef2820bB87b4a4Ed8d6) to 0 on mainnet
- Remove COMFI (0x752Efadc0a7E05ad1BCCcDA22c141D01a75EF1e4) from whitelist on mainnet
- Reset final fee for COMFI (0x752Efadc0a7E05ad1BCCcDA22c141D01a75EF1e4) to 0 on mainnet
- Remove FDT (0xEd1480d12bE41d92F36f5f7bDd88212E381A3677) from whitelist on mainnet
- Reset final fee for FDT (0xEd1480d12bE41d92F36f5f7bDd88212E381A3677) to 0 on mainnet
- Remove PSP (0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5) from whitelist on mainnet
- Reset final fee for PSP (0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5) to 0 on mainnet
- Remove BEAN (0xDC59ac4FeFa32293A95889Dc396682858d52e5Db) from whitelist on mainnet
- Reset final fee for BEAN (0xDC59ac4FeFa32293A95889Dc396682858d52e5Db) to 0 on mainnet
- Remove MAGIC (0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A) from whitelist on mainnet
- Reset final fee for MAGIC (0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A) to 0 on mainnet
- Remove THOR (0xa5f2211B9b8170F694421f2046281775E8468044) from whitelist on mainnet
- Reset final fee for THOR (0xa5f2211B9b8170F694421f2046281775E8468044) to 0 on mainnet
- Remove ACX (0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F) from whitelist on mainnet
- Reset final fee for ACX (0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F) to 0 on mainnet
- Set final fee for WETH (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) on mainnet: 0.135 → 0.055
- Set final fee for ABT (0xee1DC6BCF1Ee967a350e9aC6CaaAA236109002ea) on mainnet: 0.135 → 0.055
- Remove TESTERC20 (0x68306388c266dce735245A0A6DAe6Dd3b727A640) from whitelist on polygon
- Reset final fee for TESTERC20 (0x68306388c266dce735245A0A6DAe6Dd3b727A640) to 0 on polygon
- Remove DAI (0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063) from whitelist on polygon
- Reset final fee for DAI (0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063) to 0 on polygon
- Remove USDT0 (0xc2132D05D31c914a87C6611C10748AEb04B58e8F) from whitelist on polygon
- Reset final fee for USDT0 (0xc2132D05D31c914a87C6611C10748AEb04B58e8F) to 0 on polygon
- Remove UNI (0xb33EaAd8d922B1083446DC23f610c2567fB5180f) from whitelist on polygon
- Reset final fee for UNI (0xb33EaAd8d922B1083446DC23f610c2567fB5180f) to 0 on polygon
- Remove WBTC (0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6) from whitelist on polygon
- Reset final fee for WBTC (0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6) to 0 on polygon
- Remove AAVE (0xD6DF932A45C0f255f85145f286eA0b292B21C90B) from whitelist on polygon
- Reset final fee for AAVE (0xD6DF932A45C0f255f85145f286eA0b292B21C90B) to 0 on polygon
- Remove COMP (0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c) from whitelist on polygon
- Reset final fee for COMP (0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c) to 0 on polygon
- Remove SNX (0x50B728D8D964fd00C2d0AAD81718b71311feF68a) from whitelist on polygon
- Reset final fee for SNX (0x50B728D8D964fd00C2d0AAD81718b71311feF68a) to 0 on polygon
- Remove SUSHI (0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a) from whitelist on polygon
- Reset final fee for SUSHI (0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a) to 0 on polygon
- Remove YFI (0xDA537104D6A5edd53c6fBba9A898708E465260b6) from whitelist on polygon
- Reset final fee for YFI (0xDA537104D6A5edd53c6fBba9A898708E465260b6) to 0 on polygon
- Remove CRV (0x172370d5Cd63279eFa6d502DAB29171933a610AF) from whitelist on polygon
- Reset final fee for CRV (0x172370d5Cd63279eFa6d502DAB29171933a610AF) to 0 on polygon
- Remove BAL (0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3) from whitelist on polygon
- Reset final fee for BAL (0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3) to 0 on polygon
- Remove BOND (0xA041544fe2BE56CCe31Ebb69102B965E06aacE80) from whitelist on polygon
- Reset final fee for BOND (0xA041544fe2BE56CCe31Ebb69102B965E06aacE80) to 0 on polygon
- Remove BADGER (0x1FcbE5937B0cc2adf69772D228fA4205aCF4D9b2) from whitelist on polygon
- Reset final fee for BADGER (0x1FcbE5937B0cc2adf69772D228fA4205aCF4D9b2) to 0 on polygon
- Remove QI (0x580A84C73811E1839F75d86d75d88cCa0c241fF4) from whitelist on polygon
- Reset final fee for QI (0x580A84C73811E1839F75d86d75d88cCa0c241fF4) to 0 on polygon
- Remove renBTC (0xDBf31dF14B66535aF65AaC99C32e9eA844e14501) from whitelist on polygon
- Reset final fee for renBTC (0xDBf31dF14B66535aF65AaC99C32e9eA844e14501) to 0 on polygon
- Remove YEL (0xD3b71117E6C1558c1553305b44988cd944e97300) from whitelist on polygon
- Reset final fee for YEL (0xD3b71117E6C1558c1553305b44988cd944e97300) to 0 on polygon
- Remove DFX (0xE7804D91dfCDE7F776c90043E03eAa6Df87E6395) from whitelist on polygon
- Reset final fee for DFX (0xE7804D91dfCDE7F776c90043E03eAa6Df87E6395) to 0 on polygon
- Remove miMATIC (0xa3Fa99A148fA48D14Ed51d610c367C61876997F1) from whitelist on polygon
- Reset final fee for miMATIC (0xa3Fa99A148fA48D14Ed51d610c367C61876997F1) to 0 on polygon
- Remove BIFI (0xFbdd194376de19a88118e84E279b977f165d01b8) from whitelist on polygon
- Reset final fee for BIFI (0xFbdd194376de19a88118e84E279b977f165d01b8) to 0 on polygon
- Remove ICE (0x4A81f8796e0c6Ad4877A51C86693B0dE8093F2ef) from whitelist on polygon
- Reset final fee for ICE (0x4A81f8796e0c6Ad4877A51C86693B0dE8093F2ef) to 0 on polygon
- Remove IRON (0xD86b5923F3AD7b585eD81B448170ae026c65ae9a) from whitelist on polygon
- Reset final fee for IRON (0xD86b5923F3AD7b585eD81B448170ae026c65ae9a) to 0 on polygon
- Remove POOL (0x25788a1a171ec66Da6502f9975a15B609fF54CF6) from whitelist on polygon
- Reset final fee for POOL (0x25788a1a171ec66Da6502f9975a15B609fF54CF6) to 0 on polygon
- Remove WPOL (0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270) from whitelist on polygon
- Reset final fee for WPOL (0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270) to 0 on polygon
- Remove INST (0xf50D05A1402d0adAfA880D36050736f9f6ee7dee) from whitelist on polygon
- Reset final fee for INST (0xf50D05A1402d0adAfA880D36050736f9f6ee7dee) to 0 on polygon
- Remove AX (0x5617604BA0a30E0ff1d2163aB94E50d8b6D0B0Df) from whitelist on polygon
- Reset final fee for AX (0x5617604BA0a30E0ff1d2163aB94E50d8b6D0B0Df) to 0 on polygon
- Remove YAM (0xb3B681dEE0435eCc0a508e40B02b3C9068D618cd) from whitelist on polygon
- Reset final fee for YAM (0xb3B681dEE0435eCc0a508e40B02b3C9068D618cd) to 0 on polygon
- Remove JRT (0x596eBE76e2DB4470966ea395B0d063aC6197A8C5) from whitelist on polygon
- Reset final fee for JRT (0x596eBE76e2DB4470966ea395B0d063aC6197A8C5) to 0 on polygon
- Remove DOM (0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c) from whitelist on polygon
- Reset final fee for DOM (0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c) to 0 on polygon
- Remove COMFI (0x72bba3Aa59a1cCB1591D7CDDB714d8e4D5597E96) from whitelist on polygon
- Reset final fee for COMFI (0x72bba3Aa59a1cCB1591D7CDDB714d8e4D5597E96) to 0 on polygon
- Remove UMA (0x3066818837c5e6eD6601bd5a91B0762877A6B731) from whitelist on polygon
- Reset final fee for UMA (0x3066818837c5e6eD6601bd5a91B0762877A6B731) to 0 on polygon
- Remove VSQ (0x29F1e986FCa02B7E54138c04C4F503DdDD250558) from whitelist on polygon
- Reset final fee for VSQ (0x29F1e986FCa02B7E54138c04C4F503DdDD250558) to 0 on polygon
- Remove PSP (0x42d61D766B85431666B39B89C43011f24451bFf6) from whitelist on polygon
- Reset final fee for PSP (0x42d61D766B85431666B39B89C43011f24451bFf6) to 0 on polygon
- Remove TETU (0x255707B70BF90aa112006E1b07B9AeA6De021424) from whitelist on polygon
- Reset final fee for TETU (0x255707B70BF90aa112006E1b07B9AeA6De021424) to 0 on polygon
- Set final fee for WETH (0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619) on polygon: 0.135 → 0.055
- Remove USD₮0 (0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9) from whitelist on arbitrum
- Reset final fee for USD₮0 (0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9) to 0 on arbitrum
- Remove WBTC (0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f) from whitelist on arbitrum
- Reset final fee for WBTC (0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f) to 0 on arbitrum
- Remove UMA (0xd693Ec944A85eeca4247eC1c3b130DCa9B0C3b22) from whitelist on arbitrum
```

### Proposal 4 of 4 — Actions (Arbitrum wrap-up + Optimism, Base, Blast batches & fee updates)
```
- Reset final fee for UMA (0xd693Ec944A85eeca4247eC1c3b130DCa9B0C3b22) to 0 on arbitrum
- Remove DAI (0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1) from whitelist on arbitrum
- Reset final fee for DAI (0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1) to 0 on arbitrum
- Remove LINK (0xf97f4df75117a78c1A5a0DBb814Af92458539FB4) from whitelist on arbitrum
- Reset final fee for LINK (0xf97f4df75117a78c1A5a0DBb814Af92458539FB4) to 0 on arbitrum
- Remove UNI (0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0) from whitelist on arbitrum
- Reset final fee for UNI (0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0) to 0 on arbitrum
- Remove SUSHI (0xd4d42F0b6DEF4CE0383636770eF773390d85c61A) from whitelist on arbitrum
- Reset final fee for SUSHI (0xd4d42F0b6DEF4CE0383636770eF773390d85c61A) to 0 on arbitrum
- Remove BAL (0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8) from whitelist on arbitrum
- Reset final fee for BAL (0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8) to 0 on arbitrum
- Remove BOND (0x0D81E50bC677fa67341c44D7eaA9228DEE64A4e1) from whitelist on arbitrum
- Reset final fee for BOND (0x0D81E50bC677fa67341c44D7eaA9228DEE64A4e1) to 0 on arbitrum
- Remove SDT (0x7bA4a00d54A07461D9DB2aEF539e91409943AdC9) from whitelist on arbitrum
- Reset final fee for SDT (0x7bA4a00d54A07461D9DB2aEF539e91409943AdC9) to 0 on arbitrum
- Remove CREAM (0xf4D48Ce3ee1Ac3651998971541bAdbb9A14D7234) from whitelist on arbitrum
- Reset final fee for CREAM (0xf4D48Ce3ee1Ac3651998971541bAdbb9A14D7234) to 0 on arbitrum
- Remove RAI (0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2) from whitelist on arbitrum
- Reset final fee for RAI (0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2) to 0 on arbitrum
- Remove COMP (0x354A6dA3fcde098F8389cad84b0182725c6C91dE) from whitelist on arbitrum
- Reset final fee for COMP (0x354A6dA3fcde098F8389cad84b0182725c6C91dE) to 0 on arbitrum
- Remove YFI (0x82e3A8F066a6989666b031d916c43672085b1582) from whitelist on arbitrum
- Reset final fee for YFI (0x82e3A8F066a6989666b031d916c43672085b1582) to 0 on arbitrum
- Remove 4d4b520000000000000000000000000000000000000000000000000000000000 (0x2e9a6Df78E42a30712c10a9Dc4b1C8656f8F2879) from whitelist on arbitrum
- Reset final fee for 4d4b520000000000000000000000000000000000000000000000000000000000 (0x2e9a6Df78E42a30712c10a9Dc4b1C8656f8F2879) to 0 on arbitrum
- Remove CRV (0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978) from whitelist on arbitrum
- Reset final fee for CRV (0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978) to 0 on arbitrum
- Remove RGT (0xef888bcA6AB6B1d26dbeC977C455388ecd794794) from whitelist on arbitrum
- Reset final fee for RGT (0xef888bcA6AB6B1d26dbeC977C455388ecd794794) to 0 on arbitrum
- Remove BADGER (0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E) from whitelist on arbitrum
- Reset final fee for BADGER (0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E) to 0 on arbitrum
- Remove OHM (0x6E6a3D8F1AfFAc703B1aEF1F43B8D2321bE40043) from whitelist on arbitrum
- Reset final fee for OHM (0x6E6a3D8F1AfFAc703B1aEF1F43B8D2321bE40043) to 0 on arbitrum
- Remove GNO (0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1) from whitelist on arbitrum
- Reset final fee for GNO (0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1) to 0 on arbitrum
- Remove NDX (0xB965029343D55189c25a7f3e0c9394DC0F5D41b1) from whitelist on arbitrum
- Reset final fee for NDX (0xB965029343D55189c25a7f3e0c9394DC0F5D41b1) to 0 on arbitrum
- Remove PERP (0x753D224bCf9AAFaCD81558c32341416df61D3DAC) from whitelist on arbitrum
- Reset final fee for PERP (0x753D224bCf9AAFaCD81558c32341416df61D3DAC) to 0 on arbitrum
- Remove ibBTC (0x9Ab3FD50FcAe73A1AEDa959468FD0D662c881b42) from whitelist on arbitrum
- Reset final fee for ibBTC (0x9Ab3FD50FcAe73A1AEDa959468FD0D662c881b42) to 0 on arbitrum
- Remove MAGIC (0x539bdE0d7Dbd336b79148AA742883198BBF60342) from whitelist on arbitrum
- Reset final fee for MAGIC (0x539bdE0d7Dbd336b79148AA742883198BBF60342) to 0 on arbitrum
- Set final fee for WETH (0x82aF49447D8a07e3bd95BD0d56f35241523fBab1) on arbitrum: 0.135 → 0.055
- Remove DAI (0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1) from whitelist on optimism
- Reset final fee for DAI (0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1) to 0 on optimism
- Remove USDT (0x94b008aA00579c1307B0EF2c499aD98a8ce58e58) from whitelist on optimism
- Reset final fee for USDT (0x94b008aA00579c1307B0EF2c499aD98a8ce58e58) to 0 on optimism
- Remove WBTC (0x68f180fcCe6836688e9084f035309E29Bf0A2095) from whitelist on optimism
- Reset final fee for WBTC (0x68f180fcCe6836688e9084f035309E29Bf0A2095) to 0 on optimism
- Remove LINK (0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6) from whitelist on optimism
- Reset final fee for LINK (0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6) to 0 on optimism
- Remove UMA (0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea) from whitelist on optimism
- Reset final fee for UMA (0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea) to 0 on optimism
- Remove UNI (0x6fd9d7AD17242c41f7131d257212c54A0e816691) from whitelist on optimism
- Reset final fee for UNI (0x6fd9d7AD17242c41f7131d257212c54A0e816691) to 0 on optimism
- Remove BOND (0x3e7eF8f50246f725885102E8238CBba33F276747) from whitelist on optimism
- Reset final fee for BOND (0x3e7eF8f50246f725885102E8238CBba33F276747) to 0 on optimism
- Remove LUSD (0xc40F949F8a4e094D1b49a23ea9241D289B7b2819) from whitelist on optimism
- Reset final fee for LUSD (0xc40F949F8a4e094D1b49a23ea9241D289B7b2819) to 0 on optimism
- Remove RAI (0x7FB688CCf682d58f86D7e38e03f9D22e7705448B) from whitelist on optimism
- Reset final fee for RAI (0x7FB688CCf682d58f86D7e38e03f9D22e7705448B) to 0 on optimism
- Remove PERP (0x9e1028F5F1D5eDE59748FFceE5532509976840E0) from whitelist on optimism
- Reset final fee for PERP (0x9e1028F5F1D5eDE59748FFceE5532509976840E0) to 0 on optimism
- Set final fee for WETH (0x4200000000000000000000000000000000000006) on optimism: 0.135 → 0.055
- Remove DAI (0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb) from whitelist on base
- Reset final fee for DAI (0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb) to 0 on base
- Remove USDbC (0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA) from whitelist on base
- Reset final fee for USDbC (0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA) to 0 on base
- Remove SNX (0x22e6966B799c4D5B13BE962E1D117b56327FDa66) from whitelist on base
- Reset final fee for SNX (0x22e6966B799c4D5B13BE962E1D117b56327FDa66) to 0 on base
- Remove SUSHI (0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA) from whitelist on base
- Reset final fee for SUSHI (0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA) to 0 on base
- Remove BAL (0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2) from whitelist on base
- Reset final fee for BAL (0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2) to 0 on base
- Remove LUSD (0x368181499736d0c0CC614DBB145E2EC1AC86b8c6) from whitelist on base
- Reset final fee for LUSD (0x368181499736d0c0CC614DBB145E2EC1AC86b8c6) to 0 on base
- Remove iFARM (0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea) from whitelist on base
- Reset final fee for iFARM (0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea) to 0 on base
- Remove COMP (0x9e1028F5F1D5eDE59748FFceE5532509976840E0) from whitelist on base
- Reset final fee for COMP (0x9e1028F5F1D5eDE59748FFceE5532509976840E0) to 0 on base
- Remove YFI (0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239) from whitelist on base
- Reset final fee for YFI (0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239) to 0 on base
- Remove CRV (0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415) from whitelist on base
- Reset final fee for CRV (0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415) to 0 on base
- Remove POOL (0xAe31207aC34423C41576Ff59BFB4E036150f9cF7) from whitelist on base
- Reset final fee for POOL (0xAe31207aC34423C41576Ff59BFB4E036150f9cF7) to 0 on base
- Remove JRT (0xde0D2ee637D3e4Fd02bc99508CA5e94dd7055766) from whitelist on base
- Reset final fee for JRT (0xde0D2ee637D3e4Fd02bc99508CA5e94dd7055766) to 0 on base
- Remove USDT (0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2) from whitelist on base
- Reset final fee for USDT (0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2) to 0 on base
- Set final fee for WETH (0x4200000000000000000000000000000000000006) on base: 0.135 → 0.055
- Remove WBTC (0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692) from whitelist on blast
- Reset final fee for WBTC (0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692) to 0 on blast
- Set final fee for WETH (0x4300000000000000000000000000000000000004) on blast: 0.135 → 0.055
```
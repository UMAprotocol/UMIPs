## Title

Post processing instructions for Covenant bribe options on CelsiusX wrapped assets in QiDao vault gauge voting.

## Post processing

Voters should apply below specified transformation function on the resolved aggregated vote percentage in order to resolve final Covenant bribe payout scale:

| Vote result (%) | Resolved payout scale               |
|-----------------|-------------------------------------|
| 0 - 10          | 10,000                              |
| 10 - 15         | 10,000 + 2,000 * (Vote result - 10) |
| 15 - 20         | 20,000 + 1,000 * (Vote result - 15) |
| 20 - 100        | 25,000 + 500 * (Vote result - 20)   |

The resolved payout scale should be in the range from 10,000 to 65,000 and can be visually represented as graph below:
<img src="https://user-images.githubusercontent.com/77973553/157061543-5798bf5d-ecb1-4af9-8fe4-98eeb3155dc9.png" alt="Price function" width="500"/>


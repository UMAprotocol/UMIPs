## Headers

| UMIP-181            |                                                                   | 
| ------------------- | -------------------------------------------------------------     |
| UMIP Title          | Add `MULTIPLE_CHOICE_QUERY` as a supported price identifier       |
| Authors             | David Adams                                                       |
| Status              | Draft                                                             |
| Created             | April 4, 2024                                                     |

# Summary 

The DVM should support requests for the `MULTIPLE_CHOICE_QUERY` price identifier. `MULTIPLE_CHOICE_QUERY` is intended to allow any requester to pose a question with specific answers. This UMIP does not attempt to put any other restrictions on the content of the query, and instead leaves construction of the query up to the requester within ancillary data.

Price settlement should happen based on inspecting the ancillary data choices and can be settled in the following ways:
- Options can be specified, and if a valid answer is among them, then return the value associated with that answer.
- No options are specified, and the answer should be intepreted as yes or no, with a value of 1 and 0 respectively.
- If the question can be answered eventually, just not at the current time, or at the time an answer was proposed (event based expiry only), submit an error representing "too early", ie "magic number": `type(int256).min` or `-57896044618658097711785492504343953926634992332820282019728792003956564819968`.
- If the question cannot ever be answered; For instance, it cant be parsed, is unitelligble, the options do not represent a valid answer, it should be answered with a value representing no answer possible: `type(int256).max` or `57896044618658097711785492504343953926634992332820282019728792003956564819967`.

# Motivation
This identifier is meant to address limitations of the YES_OR_NO_QUERY identifier when prediction markets try to integrate their requests in the [Optimistic Oracle UI](https://oracle.uma.xyz).

This identifier intends to improve the following:
1. Allow requesters specify possible answers that are visible to proposers. These answers can include both custom labels and custom values. 
2. Allow requesters to easily validate their formatting to have confidence it will display correctly in the Oracle UI.
3. Allow requesters to display rich text using the markdown format, which will include headers, links, tables, etc, in their description.

# Data Specifications 

It is not possible to define specific data sources or markets for this identifier. Determination of data sources and results are left entirely up to voters at the time of settlement, as the best method of determining the results for each request will depend on the question being asked.

# Price Feed Implementation

No price feed is needed (or possible) for this price identifier.

# Technical Specifications

-----------------------------------------
- Price identifier name: MULTIPLE_CHOICE_QUERY
- Base Currency: NA
- Quote Currency: NA
- Rounding: None, there is a predetermined set of results.
- Estimated current value of price identifier: NA


# Ancillary Data Specifications
When converted from bytes to UTF-8, interpret the string as a stringified JSON object in the following form:

```ts
{
  // Require a title string
  title: string; 
  // The full description of the question, optionally using markdown.
  description: string; 
  // Optionally specify labels and values for each option a user can select. 
  // If not specified the default is ["no", "yes"], which corresponds to prices ['0','1'] in wei.
  // numbers must be convertible to a signed int256, and specified as integers in base 10.
  options?:[label:string,value:string][];
}
```
An example vote, decoding ancillary data back into a JS object:
```ts
{
  title: "NCAAB: Arizona Wildcats vs. Clemson Tigers",
  description:`In the upcoming NCAAB game, scheduled for March 28 at 7:09 PM ET:
If the Arizona Wildcats win, the market will resolve to “Arizona”.
If the Clemson Tigers win, the market will resolve to “Clemson”.
`,
  // The values specified are in wei, and are passed through to consuming contract as is. 
  options:[
    ["Arizona",'0'],  
    ["Clemson",'1'],
  ]
})
```
The description instructs the voter on how to interpret the options, and submit the numerical value (0,1) according to which option is correct.
Other values that are valid votes are
No answer possible - This is a possible response if for instance the game was cancelled.

Other examples of why no answer possible can be considered as a response:

- The JSON portion of the ancillary data cannot be parsed, or it does not match the typescript specification.
- The description is unintelligable or nonsensical.
- The proposed options are unintelligable or cannot possibly answer the question.

Answer is too early - This is a possible response if an answer was optimistically proposed before the game ended, the proposer could not have known the answer, but the question is valid.

# Rationale
This specification is not as compact as YES_OR_NO in terms of bytes used, but allows a more expressive format for proposers and improved user experience when interacting with the Oracle UI.
With this specification requesters can easily validate their ancillary data using typescript, or a javascript runtime schema validator, giving them confidence that their data will be rendered correctly to end users.

# Implementation
- Voters should decode the ancillary data and attempt to interpret the question. Interpreting the ancillary data may require ignoring any ancillary data past the last closing bracket, "}", in order to properly parse the data as JSON.
- If there is no valid json, or the JSON data does not match the typescript type specified above, voters should return "no answer possible" (57896044618658097711785492504343953926634992332820282019728792003956564819967).
- If the request is "event based expiry", voters should determine the time at which an answer was proposed (proposal timestamp) and make a judgement if the proposed answer could have been known at that time, according to the question.
- If the request is not "event based expiry", voters should attempt to determine the answer at the time the request was proposed, in the case where the answer could change, based on the time the question is asked.
- If the answer could not have been known at the time the answer was proposed, answer with "early answer" (-57896044618658097711785492504343953926634992332820282019728792003956564819968).
- If none of those error conditions apply, voters should determine if any of the options specified are valid answers to the question based on the description, or if no options are specified, if yes or no are valid answers.
- Vote with the value of the option provided. Each value is specified in wei and should be used as is ( no conversions ). If no options are provided assume yes is 1 and no is 0.
- If a voter believes no answer can be determined based on the question and the options provided, return the value representing "no answer possible".

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this price identifier should be careful to construct a question in a way that they can be sure that a deterministic outcome can be reached. 

There are also potential contract-level attacks that could result from people intentionally asking non-deterministic questions and using this to their advantage. As a rule, users of any contract that uses this price identifier should be sure to review the ancillary data used beforehand. 

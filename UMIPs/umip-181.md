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
- Options are specified, and a valid answer is among them, then return the value associated with that answer.
- No options are specified, and the answer should be intepreted as yes or no, with a value of 1 and 0 respectively.
- If none of the options, specified or not, can be considered valid answers to the question, in that case submit the "Magic number" (-57896044618658097711785492504343953926634992332820282019728792003956564819968) which signals that the question is not answerable.

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
  // If not specified the default is ["no", "yes"], which corresponds to prices [0,1] in wei.
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
If the game is not completed by April 10, 2024 (11:59 PM ET), the market will resolve 50-50.
`,
  // The values specified are in wei, and are passed through to consuming contract as is. 
  options:[
    ["Arizona",'0'],  
    ["Clemson",'1'],
    ["50-50",'5000000000000000000'], 
  ]
})
```
The description instructs the voter on how to interpret the options, and submit the numerical value (0,1,5000000000000000000) according to which option is correct. Magic number is also a valid response if for some reason the question cannot be answered according to the description.

# Rationale
This specification is not as compact as YES_OR_NO in terms of bytes used, but allows a safer and more expressive format for proposers and improved user experience when interacting with the Oracle UI.
With this specification requesters can easily validate their ancillary data using typescript, or a javascript runtime schema validator, giving them confidence that their data will be rendered correctly to end users.

# Implementation
- Voters should decode the ancillary data and attempt to interpret the question.
- Voters should determine if any of the options specified are valid answers to the question based on the description, or if no options are specified, if yes or no are valid answers.
- Vote with the value of the option provided. Each value is specified in wei. If yes, submit 1, if no submit 0.
- If a voter cannot make a determination about what the correct answer to the question is or if there is no question present, UMA voters should return the magic number (-57896044618658097711785492504343953926634992332820282019728792003956564819968).
- If there is no ancillary data or it is not interpretable to UTF-8, voters should return magic number.

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this price identifier should be careful to construct a question in a way that they can be sure that a deterministic outcome can be reached. 

There are also potential contract-level attacks that could result from people intentionally asking non-deterministic questions and using this to their advantage. As a rule, users of any contract that uses this price identifier should be sure to review the ancillary data used beforehand. 

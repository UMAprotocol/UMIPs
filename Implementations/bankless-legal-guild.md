## Title

Bankless Legal Guild - BANK Legal Assessment KPI

## Summary:

Bankless DAO Legal Guild is testing out the use of KPI options to incentivize/ reward participation in creating a legal assessment of the BANK token. 

## Motivation:

Using KPI options creates a structure where each contributor to the project is incentivized to meet global deadlines for completion. The guild will also use distribution of the KPI options to encourage individuals to participate in such a way that only quality work will be eligible for reward.

## Intended Ancillary Data

Metric:Completion percentage of Bankless DAO Legal Guild's project to legally assess the BANK token as determined by the Guild,
Endpoint:”https://docs.google.com/spreadsheets/d/1jkRO91ACGFCwhwVQsXKtnAt1Nz2qSdkNg9XYJdgbmYs/edit?usp=sharing”,
Method:””,
Key:Total Section Completion Percentage,
Interval:varied,
Rounding:4,
Scaling:0

## Technical Specifications:

- KPI Option token name: LEGAL
- KPI Option expiry timestamp: 1633024800 (September 30, 2021 18:00 UTC)
- Collateral per pair: 1 BANK; each option token would expire worth 1 BANK if you meet your goal 100%.
- Metric: Total completion(%) of the document described above by the deadline established above. 
- Rounding: 4 decimals
- Endpoint: Legal Guild Project Completion Record

## Process:

The Bankless DAO Legal Guild will utilize the endpoint document(linked above) to record completion(%) of the project on a weekly basis. During their weekly evaluation meetings, the following steps will be taken:

1. Review the scope of work from the previous weeks for each section of the project. Previous weeks that have reached 100% completion do not require additional review.
2. Using their internal consensus mechanism, determine total % completion for each section (based on quality and completeness). 
    - If tasks from a previous week were not complete at the time, but have since been completed, that week’s total % completion should be updated accordingly as well. As the project progresses, each weekly % complete should trend towards 100%.
3. As % completion is determined, the results should be recorded in the appropriate section of the endpoint document. There is a tab for each section of the project, and a weekly breakdown within each tab to record progress.
    - After reaching a consensus, the % completion should be indicated in the appropriate green colored box within each tab. This action will automatically update the summary page information.
4. On the summary page, there is a single blue colored box that represents the total % completion for the project. It is calculated in the following way:
    - Section completion: calculated as an average of all weekly % completion data points. 
    - Section weight: a designated % of the project established prior to contract launch that determines the value of that section in relation to the project as a whole (not all sections are weighted equally)
    - Total completion: Calculated as a sum of each section’s total value, which can be represented by (section completion x section weight)

Note: token distribution will also be determined during their weekly evaluations based on internal consensus mechanisms. However, the details of that process are not relevant to the payout implementation, so they will not be addressed in this document.

## Payout Determination:

At expiry, the payout value should be determined by the total project completion %, which will be represented in the blue box on the summary page of the endpoint doc. The methodology required to calculate this value manually is included in the process section above, but should only be required in the event that the summary page has been accidentally edited. 

The value proposed to settle the price should be written as a decimal rounded to 4 digits. For example, if the total project completion is 95.38% then the proposed value should be expressed as 0.9538. In this example, each KPI option token will pay out 95.38% of the collateral per pair listed above in the technical specifications section. Any unpaid collateral will be returned to the guild treasury

## Security considerations:

The “source of truth” document for this project will only be editable by Legal Guild approved individuals. The summary page has been protected to prevent accidental editing, so the only changes made to the document should take place on the appropriate tabs at each weekly evaluation. 

The “source of truth” document contains the ability to see previous edits, meaning that any manipulation can be detected by any authorized user of the doc.

# ADR: Sakana AI Fugu Admission Gate

- **Date reviewed:** 2026-11-10
- **Status:** Blocked pending written authorization and acceptable enterprise/data terms
- **Owner:** Revenant A.I. LLC / Engram platform (company signatory and legal status to be verified)
- **Related:** [Engram Intelligence primary ADR](2026-11-10-engram-intelligence-primary.md), [Integration boundaries](../architecture/INTEGRATIONS.md)

## Decision

Do not integrate or invoke Sakana AI Fugu for Engram product development or user requests under the public API terms reviewed on 2026-11-10. Do not send Engram user data, personal information, project source, private prompts, or memory to the service.

This is a product/security admission decision based on the published terms, not a legal opinion. It may be reconsidered if Sakana AI provides written authorization or an enterprise agreement that expressly permits the intended Engram development and service use, and establishes suitable data processing and security terms.

## Evidence reviewed

1. Sakana AI API Terms of Service, effective 2026-09-28:
   - Section "Prohibited Conduct" prohibits inputting personal information about the user or a third party.
   - The same section prohibits using the service to develop or provide a product or service that competes with Sakana's service, including an AI service or API.
   - The retention section says Sakana is not obligated to store input/output content, and notes that trained model weights, vendor caches, or audit logs may not be deleted.
   - Source: https://console.sakana.ai/terms-of-service

2. Sakana AI API Platform Privacy Policy, last updated 2026-07-21:
   - Describes processing of prompts, uploaded content, outputs, session data, and other service-interaction data.
   - Lists training, fine-tuning, evaluation, and system improvement as processing purposes, subject to available opt-out controls and internal processes.
   - Describes international transfers, including Japan and the United States, and retention based on operational/legal needs.
   - Source: https://console.sakana.ai/privacy-policy

3. Sakana AI API Pricing:
   - The API is paid. The pricing page currently lists subscription plans and model-specific pay-as-you-go rates; prices and allowances can change.
   - Source: https://console.sakana.ai/pricing

4. Sakana AI company information:
   - Sakana AI K.K. identifies itself as a Tokyo-based AI research and development company.
   - Source: https://sakana.ai/company-info/

## Why this blocks Engram

Engram is an AI platform. Its intended service includes persistent user identity, memory, personalized context, and potentially confidential workspace data. The public restrictions on competitive AI-service development and personal-information input appear materially inconsistent with that use. The privacy and retention descriptions also require stronger contractual assurances before any Engram data is transmitted.

## Requirements to reconsider

Obtain and review a written enterprise agreement or explicit authorization that:
- expressly permits the intended Engram product-development and production-service use;
- resolves the competitive-service restriction;
- permits necessary personal-data processing and establishes controller/processor roles as applicable;
- defines input/output retention, deletion, backup, cache, and audit-log handling;
- states whether prompts or outputs are used for training, evaluation, or fine-tuning and provides enforceable controls;
- identifies subprocessors, data locations, international-transfer terms, and security controls;
- allocates incident response, breach notification, liability, and support responsibilities;
- supplies clear billing, rate-limit, and usage-monitoring terms.

Verify that Revenant A.I. LLC is in good standing and that the person accepting the agreement has authority to bind the company. Do not accept click-through terms or purchase credits as a substitute for the required review.

## Operational controls while blocked

- Do not create or store a Sakana API key for Engram.
- Do not add a Fugu provider adapter or route traffic to Fugu.
- Do not use Fugu for Engram coding, evaluation, prompt tuning, or product tests.
- Do not send Engram project files, private user data, memory, prompts, or outputs to Fugu.
- Keep the Reasoning provider contract independent so a future approved adapter does not change Engram identity or control-plane ownership.

No Sakana AI account, subscription, API call, or charge has been created by this decision.

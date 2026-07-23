# Lincah AI Assistant Architecture Review & Recommendations

## Overall Assessment

The proposed design is already strong as a production foundation for a
domain-specific RAG assistant. The primary objective should remain
**restricting the model to trusted knowledge**, not making it answer
more broadly.

Overall maturity: **8.5--9/10**

------------------------------------------------------------------------

# Recommended Improvements

## 1. Separate Intent from Task

Intent alone is not enough.

Example:

-   "Paket saya stuck di hub"
-   "Bagaimana alur paket setelah pickup?"

Both belong to shipping, but require different responses.

### Intent

-   general_knowledge
-   support_operational
-   sales_prepurchase
-   out_of_scope_hidden

### Task

-   explain
-   troubleshoot
-   guide
-   lookup
-   compare
-   clarify

Example:

``` yaml
intent: support_operational
task: troubleshoot
```

------------------------------------------------------------------------

## 2. Split Support into Topics

Instead of one large support bucket:

-   Shipment
-   Order
-   COD
-   Claim
-   Void
-   Rate
-   Dashboard
-   Account
-   Payment
-   Withdrawal
-   Pickup

Example output:

``` yaml
intent: support_operational
topic: shipment
```

This significantly improves retrieval quality.

------------------------------------------------------------------------

## 3. Add Knowledge Domain Classification

Suggested domains:

-   shipping
-   finance
-   dashboard
-   account
-   courier
-   API
-   promotion

This enables filtering before retrieval.

------------------------------------------------------------------------

## 4. Validate Extracted Entities

Do not only extract entities.

Validate:

-   Tracking Number
-   Order ID
-   Invoice
-   Courier

Invalid values should not be treated as real identifiers.

------------------------------------------------------------------------

## 5. Use Hybrid Retrieval

Recommended pipeline:

``` text
Keyword Search (BM25)
        +
Vector Search
        +
Reranker
```

Flow:

``` text
Query
 ↓
Keyword
 ↓
Vector
 ↓
Merge
 ↓
Rerank
 ↓
Top 3–5 Evidence
```

------------------------------------------------------------------------

## 6. Source Priority

When multiple documents exist, define priority.

Example:

``` text
SOP
↓
Announcement
↓
FAQ
↓
Glossary
```

SOP should always override FAQ.

------------------------------------------------------------------------

## 7. Conflict Resolution

If documents disagree:

Example:

-   SOP A → Claim = 3 days
-   SOP B → Claim = 5 days

Never let the LLM choose.

Use:

-   Latest version
-   Highest priority document

------------------------------------------------------------------------

## 8. Freshness Metadata

Each chunk should contain:

-   version
-   updated_at
-   effective_date
-   expiry_date

Retriever should prioritize newer knowledge.

------------------------------------------------------------------------

## 9. Better Confidence Score

Confidence should combine:

-   Retrieval score
-   Intent confidence
-   Evidence agreement
-   Number of supporting chunks

Decision:

-   High → Answer
-   Medium → Clarify
-   Low → Redirect

------------------------------------------------------------------------

## 10. Clarification Policy

Clarification should only request relevant information.

Allowed:

-   Tracking Number
-   Order ID
-   Courier
-   Shipment Date
-   Seller/Buyer
-   Screenshot

Avoid open-ended questions.

------------------------------------------------------------------------

## 11. Safety Against Prompt Pressure

Examples:

-   "Pokoknya jawab saja."
-   "Menurutmu bagaimana?"

Rule:

Continue answering **only from retrieved knowledge**.

Never switch into unrestricted ChatGPT mode.

------------------------------------------------------------------------

## 12. Response Templates by Intent

### General Knowledge

Definition

↓

Explanation

↓

Steps

### Support

Empathy

↓

Diagnosis

↓

Safe Steps

↓

Request Required Information

### Sales

Capability

↓

Benefits

↓

Requirements

↓

Next Action

------------------------------------------------------------------------

## 13. Retry Retrieval

If retrieval fails:

``` text
Rewrite Query
 ↓
Retrieve Again
 ↓
Fallback
```

Do not immediately redirect after the first failed retrieval.

------------------------------------------------------------------------

## 14. Chunk Metadata

Each chunk should include:

-   document
-   section
-   version
-   updated_at
-   topic
-   intent
-   keywords

------------------------------------------------------------------------

## 15. Logging

Log:

-   Query
-   Intent
-   Topic
-   Task
-   Entities
-   Retrieved Chunks
-   Confidence
-   Response
-   Fallback
-   Escalation
-   User Feedback (optional)

Useful for continuous improvement.

------------------------------------------------------------------------

## 16. Abstain Policy

Differentiate between:

### Out of Scope

Question is outside Lincah logistics.

→ Redirect politely.

### In Scope but Unsupported

Question relates to Lincah, but no supporting knowledge exists.

→ Do **not** infer or predict.

Instead:

-   Give a neutral response.
-   Ask for relevant operational details if applicable.
-   Redirect safely.

------------------------------------------------------------------------

# Recommended Production Pipeline

``` text
                    User Query
                         │
                         ▼
            Query Normalization
      (spelling, synonym, abbreviation)
                         │
                         ▼
      Intent + Topic + Task Classifier
                         │
                         ▼
      Entity Extraction & Validation
                         │
                         ▼
        Hybrid Knowledge Retrieval
      (Keyword + Vector + Reranker)
                         │
                         ▼
          Evidence Validation
(Source Priority, Version, Freshness)
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      Evidence Enough?         No Evidence
              │                     │
              ▼                     ▼
   Constrained Response     Clarify / Redirect
              │
              ▼
       Response Validation
(No Hallucination / No Unsupported Claims)
              │
              ▼
             User
```

------------------------------------------------------------------------

# Final Recommendation

Priority improvements:

1.  Separate **Intent**, **Topic**, and **Task**.
2.  Introduce **Source Priority**, **Version**, and **Freshness**
    metadata.
3.  Use **Hybrid Retrieval** (Keyword + Vector + Reranker).
4.  Add **Evidence Validation** and **Abstain Policy**.
5.  Include **Query Normalization**, **Entity Validation**, and
    **Logging**.

With these additions, the assistant will be more robust against
hallucination, easier to maintain, and significantly more reliable for
production use within the Lincah logistics knowledge domain.

# GOProfit — ERD

Dokumen ini memisahkan model domain dari penyimpanan. MVP saat ini belum
memakai database; halaman Saved menyimpan snapshot `SavedCalculation` di
localStorage. Diagram berikut adalah model konseptual yang bisa dipakai saat
storage persisten ditambahkan.

```mermaid
erDiagram
    MARKETPLACE ||--o{ FEE_RULE : provides
    CALCULATION ||--|| PRODUCT_ECONOMICS : has
    CALCULATION ||--o{ SELLER_ADJUSTMENT : includes
    CALCULATION ||--o{ CALCULATION_FEE : includes
    CALCULATION ||--o{ OPERATING_COST : includes
    CALCULATION ||--o| TARGET_PROFIT : defines
    CALCULATION ||--o| CAMPAIGN_RESULT : checks
    MARKETPLACE ||--o{ CALCULATION : uses
    FEE_RULE ||--o{ CALCULATION_FEE : snapshots

    MARKETPLACE {
        string id PK
        string code UK
        string name
        string country_code
        string currency_code
    }

    FEE_RULE {
        string id PK
        string marketplace_id FK
        string name
        string fee_type
        string calculation_base
        int rate_bps
        bigint fixed_amount
        date effective_from
        date effective_to
        string eligibility
    }

    CALCULATION {
        string id PK
        string marketplace_id FK
        string kind
        string name
        string status
        string rule_version
        datetime created_at
        datetime updated_at
    }

    PRODUCT_ECONOMICS {
        string calculation_id PK,FK
        bigint list_price
        bigint hpp_per_unit
    }

    SELLER_ADJUSTMENT {
        string id PK
        string calculation_id FK
        string adjustment_type
        bigint amount
        string scope
    }

    CALCULATION_FEE {
        string id PK
        string calculation_id FK
        string fee_rule_id FK
        string source
        string fee_type
        string calculation_base
        int rate_bps
        bigint fixed_amount
        boolean active
    }

    OPERATING_COST {
        string id PK
        string calculation_id FK
        string cost_type
        string name
        bigint amount
        string scope
    }

    TARGET_PROFIT {
        string calculation_id PK,FK
        string mode
        bigint amount_per_order
        int rate_bps
    }

    CAMPAIGN_RESULT {
        string calculation_id PK,FK
        bigint media_ad_spend
        bigint additional_ad_cost
        bigint attributed_gmv
        bigint direct_gmv
        int orders
        int units_sold
        int clicks
    }
```

## Mapping ke code sekarang

- `Marketplace` → `PlanAdsInput.marketplace` dan `SHOPEE_MARKETPLACE`.
- `ProductEconomics` → `listPrice` dan `hppPerUnit`.
- `SellerAdjustment` → `SellerAdjustment[]`.
- `CalculationFee` → `ScenarioFee[]`.
- `OperatingCost` → `ScenarioCost[]`.
- `TargetProfit` → union `TargetProfit`.
- `CampaignResult` → `CampaignInput` di dalam `CheckAdsInput`.
- `Calculation` snapshot → `SavedCalculation` di repository browser.

`PlanAdsResult` dan `CheckAdsResult` tidak perlu menjadi tabel sumber pada
MVP. Keduanya adalah hasil deterministik yang bisa dihitung ulang dari input
dan `calculationRuleVersion`, tetapi boleh disimpan sebagai snapshot untuk
riwayat dan audit ringan.

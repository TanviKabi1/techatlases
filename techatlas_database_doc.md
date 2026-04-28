# TechAtlas — Database Documentation

> **Database Engine:** MySQL · **ORM:** Prisma · **Total Tables:** 14

---

## ER Diagram

```mermaid
erDiagram
    region {
        uuid id PK
        varchar name UK
        varchar continent
        datetime created_at
    }

    company {
        uuid id PK
        varchar name
        varchar size
        varchar industry
        uuid region_id FK
        datetime created_at
    }

    tech_category {
        uuid id PK
        varchar name UK
        text description
        decimal popularity_score
        datetime created_at
    }

    technology {
        uuid id PK
        varchar name UK
        uuid category_id FK
        datetime created_at
    }

    ai_tool {
        uuid id PK
        varchar name UK
        text description
        varchar category
        datetime created_at
    }

    developers {
        uuid id PK
        varchar name
        varchar email
        int age
        varchar country
        uuid region_id FK
        int years_coding
        varchar education_level
        datetime created_at
    }

    work_profile {
        uuid id PK
        uuid developer_id FK_UK
        uuid company_id FK
        varchar job_role
        varchar employment_type
        decimal salary
        varchar remote_work
        datetime created_at
    }

    developers_tech {
        uuid id PK
        uuid developer_id FK
        uuid technology_id FK
        int proficiency
        int years_used
        datetime created_at
    }

    uses_ai {
        uuid id PK
        uuid developer_id FK
        uuid ai_tool_id FK
        varchar sentiment
        varchar use_case
        int adoption_score
        datetime created_at
    }

    raw_survey_data {
        uuid id PK
        json raw_json
        boolean processed
        datetime imported_at
        datetime processed_at
    }

    users {
        uuid id PK
        varchar email UK
        varchar password
        datetime created_at
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        varchar role
        datetime created_at
    }

    profiles {
        uuid id PK_FK
        varchar email
        varchar display_name
        datetime created_at
    }

    newspaper_messages {
        uuid id PK
        varchar display_name
        text message
        datetime created_at
    }

    saved_technologies {
        uuid id PK
        uuid user_id FK
        varchar technology_name
        datetime created_at
    }

    saved_trends {
        uuid id PK
        uuid user_id FK
        varchar trend_name
        varchar trend_category
        datetime created_at
    }

    user_roadmap {
        uuid id PK
        uuid user_id FK
        varchar technology_name
        varchar status
        int progress
        int priority
        datetime created_at
    }

    region        ||--o{ company         : "has"
    region        ||--o{ developers      : "belongs to"
    company       ||--o{ work_profile    : "employs"
    tech_category ||--o{ technology      : "contains"
    developers    ||--|| work_profile    : "has one"
    developers    ||--o{ developers_tech : "uses"
    developers    ||--o{ uses_ai         : "adopts"
    technology    ||--o{ developers_tech : "used by"
    ai_tool       ||--o{ uses_ai         : "used in"
    users         ||--o{ user_roles      : "assigned"
    users         ||--|| profiles        : "has profile"
    users         ||--o{ saved_technologies : "saves"
    users         ||--o{ saved_trends    : "saves"
    users         ||--o{ user_roadmap    : "plans"
```

---

## Entity Classifications

| Entity | Type | Reason |
|---|---|---|
| `region` | **Strong Entity** | Exists independently; referenced by others |
| `company` | **Strong Entity** | Exists independently; linked to region |
| `tech_category` | **Strong Entity** | Independent; parent of technologies |
| `technology` | **Strong Entity** | Exists independently; linked to category |
| `ai_tool` | **Strong Entity** | Fully independent |
| `developers` | **Strong Entity** | Core entity; root of all developer data |
| `users` | **Strong Entity** | Auth entity; exists independently |
| `newspaper_messages` | **Strong Entity** | Standalone user-submitted content |
| `raw_survey_data` | **Strong Entity** | Standalone import buffer |
| `work_profile` | **Weak Entity** | Existentially dependent on `developers` (CASCADE DELETE) |
| `profiles` | **Weak Entity** | Shares PK with `users`; no independent existence |
| `developers_tech` | **Associative / Junction Entity** | Represents M:N between `developers` ↔ `technology` |
| `uses_ai` | **Associative / Junction Entity** | Represents M:N between `developers` ↔ `ai_tool` |
| `user_roles` | **Associative / Junction Entity** | Represents M:N between `users` ↔ roles |
| `saved_technologies` | **Associative Entity** | Links `users` to saved tech names |
| `saved_trends` | **Associative Entity** | Links `users` to saved trend names |
| `user_roadmap` | **Associative Entity** | Links `users` to learning roadmap items |

---

## Attribute Types

| Table | Attribute | Type | Notes |
|---|---|---|---|
| `developers` | `name`, `email`, `country` | Simple | Atomic single values |
| `developers` | `age` | Simple | Stored, not derived |
| `developers` | `years_coding` | Simple | Stored; **could be derived** from `created_at` minus start year |
| `developers` | `education_level` | Simple | Enum-style: Bachelors, Masters, PhD, etc. |
| `developers` | `region_id` | FK | Links to `region` |
| `tech_category` | `popularity_score` | **Derived** | Auto-updated by trigger `trg_update_popularity_after_insert/delete` |
| `developers_tech` | `proficiency`, `years_used` | Simple | Attributes on relationship (junction table) |
| `uses_ai` | `sentiment`, `use_case`, `adoption_score` | Simple | Attributes on M:N relationship |
| `user_roadmap` | `status`, `progress`, `priority` | Simple | Multi-state tracking attributes |
| `company` | `size` | Simple | Enum-style: Startup, Medium, Large, Enterprise |
| `work_profile` | `salary` | Simple | Validated by trigger (cannot be negative) |
| `work_profile` | `remote_work` | Simple | Values: Remote, On-site, Hybrid |
| `user_roles` | `role` | Simple | Values: admin, moderator, user |
| `raw_survey_data` | `raw_json` | **Multi-valued / Composite** | JSON blob; stores variable-structure survey data |

> **Multi-valued attribute note:** `developers` logically has multi-valued technology skills — represented relationally via `developers_tech` (3–7 entries per developer).

---

## Tables & Sample Records

---

### 1. `region`

Stores global geographic regions. **Strong entity.**

| id | name | continent | created_at |
|---|---|---|---|
| uuid-1 | North America | Americas | 2024-01-01 |
| uuid-2 | Western Europe | Europe | 2024-01-01 |
| uuid-3 | South Asia | Asia | 2024-01-01 |
| uuid-4 | East Asia | Asia | 2024-01-01 |
| uuid-5 | Africa | Africa | 2024-01-01 |

---

### 2. `tech_category`

Parent category for technologies. `popularity_score` is a **derived attribute** (auto-updated by SQL trigger).

| id | name | description | popularity_score | created_at |
|---|---|---|---|---|
| uuid-a | Frontend | Web client side technologies | 95 | 2024-01-01 |
| uuid-b | Backend | Server side logic, APIs | 90 | 2024-01-01 |
| uuid-c | AI & LLM | Artificial Intelligence & LLMs | 98 | 2024-01-01 |
| uuid-d | DevOps | Infrastructure & CI/CD | 80 | 2024-01-01 |
| uuid-e | Mobile | iOS and Android development | 75 | 2024-01-01 |

---

### 3. `technology`

Individual technologies belonging to a category.

| id | name | category_id | created_at |
|---|---|---|---|
| uuid-t1 | React | uuid-a (Frontend) | 2024-01-01 |
| uuid-t2 | Next.js | uuid-a (Frontend) | 2024-01-01 |
| uuid-t3 | Python | uuid-b (Backend) | 2024-01-01 |
| uuid-t4 | Docker | uuid-d (DevOps) | 2024-01-01 |
| uuid-t5 | OpenAI API | uuid-c (AI & LLM) | 2024-01-01 |

---

### 4. `ai_tool`

AI tools used by developers. Independent strong entity.

| id | name | description | category | created_at |
|---|---|---|---|---|
| uuid-ai1 | GitHub Copilot | AI pair programmer | Development | 2024-01-01 |
| uuid-ai2 | ChatGPT | General purpose LLM | Productivity | 2024-01-01 |
| uuid-ai3 | Claude 3 | Long context Anthropic model | Productivity | 2024-01-01 |
| uuid-ai4 | Cursor | AI-first code editor | Development | 2024-01-01 |
| uuid-ai5 | Midjourney | AI image generation | Design | 2024-01-01 |

---

### 5. `company`

Companies associated with developer work profiles.

| id | name | size | industry | region_id | created_at |
|---|---|---|---|---|---|
| uuid-c1 | Quantum Leap | Startup | Finance | uuid-1 | 2024-01-01 |
| uuid-c2 | EcoSync | Medium | Education | uuid-2 | 2024-01-01 |
| uuid-c3 | CyberDyne | Large | Cybersecurity | uuid-3 | 2024-01-01 |
| uuid-c4 | IndiTech | Enterprise | SaaS | uuid-4 | 2024-01-01 |
| uuid-c5 | Nexus Systems | Startup | Deep Tech | uuid-5 | 2024-01-01 |

---

### 6. `developers`

Core entity — 200 developer records seeded. Country and education level are multi-valued in spirit (many values per attribute domain).

| id | name | email | age | country | region_id | years_coding | education_level | created_at |
|---|---|---|---|---|---|---|---|---|
| uuid-d1 | Talent_1 | talent_1@techatlas.io | 22 | USA | uuid-1 | 2 | Masters | 2024-01-01 |
| uuid-d2 | Talent_2 | talent_2@techatlas.io | 23 | Germany | uuid-2 | 3 | PhD | 2024-01-01 |
| uuid-d3 | Talent_3 | talent_3@techatlas.io | 24 | India | uuid-3 | 4 | Bachelors | 2024-01-01 |
| uuid-d4 | Talent_4 | talent_4@techatlas.io | 25 | Japan | uuid-4 | 5 | Self-taught | 2024-01-01 |
| uuid-d5 | Talent_5 | talent_5@techatlas.io | 26 | Brazil | uuid-5 | 6 | Associate | 2024-01-01 |

---

### 7. `work_profile` *(Weak Entity)*

One-to-one with `developers`. Deleted if the developer is deleted (CASCADE). Salary validated by SQL trigger (no negatives).

| id | developer_id | company_id | job_role | employment_type | salary | remote_work | created_at |
|---|---|---|---|---|---|---|---|
| uuid-w1 | uuid-d1 | uuid-c1 | Frontend Developer | Full-time | 85000 | Remote | 2024-01-01 |
| uuid-w2 | uuid-d2 | uuid-c2 | Backend Engineer | Contract | 110000 | Hybrid | 2024-01-01 |
| uuid-w3 | uuid-d3 | uuid-c3 | ML Engineer | Full-time | 130000 | On-site | 2024-01-01 |
| uuid-w4 | uuid-d4 | uuid-c4 | Fullstack Engineer | Freelance | 75000 | Remote | 2024-01-01 |
| uuid-w5 | uuid-d5 | uuid-c5 | SRE/DevOps | Full-time | 95000 | Hybrid | 2024-01-01 |

---

### 8. `developers_tech` *(Associative / Junction Entity)*

Resolves the M:N between `developers` and `technology`. Each developer has 3–7 records. `proficiency` and `years_used` are **relationship attributes**.

| id | developer_id | technology_id | proficiency (1–5) | years_used | created_at |
|---|---|---|---|---|---|
| uuid-dt1 | uuid-d1 | uuid-t1 (React) | 4 | 3 | 2024-01-01 |
| uuid-dt2 | uuid-d1 | uuid-t3 (Python) | 2 | 1 | 2024-01-01 |
| uuid-dt3 | uuid-d2 | uuid-t4 (Docker) | 3 | 5 | 2024-01-01 |
| uuid-dt4 | uuid-d3 | uuid-t5 (OpenAI API) | 5 | 2 | 2024-01-01 |
| uuid-dt5 | uuid-d4 | uuid-t2 (Next.js) | 4 | 4 | 2024-01-01 |

> **Unique constraint:** `(developer_id, technology_id)` — one entry per developer-tech pair.

---

### 9. `uses_ai` *(Associative / Junction Entity)*

Resolves M:N between `developers` and `ai_tool`. `sentiment`, `use_case`, `adoption_score` are **relationship attributes**.

| id | developer_id | ai_tool_id | sentiment | use_case | adoption_score (1–10) | created_at |
|---|---|---|---|---|---|---|
| uuid-ua1 | uuid-d1 | uuid-ai1 | Positive | Production Coding | 8 | 2024-01-01 |
| uuid-ua2 | uuid-d1 | uuid-ai2 | Neutral | Learning/Upskilling | 5 | 2024-01-01 |
| uuid-ua3 | uuid-d2 | uuid-ai3 | Positive | Automation | 9 | 2024-01-01 |
| uuid-ua4 | uuid-d3 | uuid-ai4 | Positive | Production Coding | 7 | 2024-01-01 |
| uuid-ua5 | uuid-d4 | uuid-ai5 | Negative | Learning/Upskilling | 2 | 2024-01-01 |

> **Unique constraint:** `(developer_id, ai_tool_id)`

---

### 10. `raw_survey_data`

Import buffer for raw JSON survey entries before processing. `processed_at` is a **derived/nullable attribute** (set only after processing).

| id | raw_json | processed | imported_at | processed_at |
|---|---|---|---|---|
| uuid-r1 | `{"lang": "Python", "exp": 3}` | false | 2024-03-01 | null |
| uuid-r2 | `{"lang": "Go", "tools": ["Docker"]}` | true | 2024-03-02 | 2024-03-03 |
| uuid-r3 | `{"ai_used": true, "tool": "ChatGPT"}` | false | 2024-03-04 | null |

---

### 11. `users`

Authentication entity for the platform's user accounts.

| id | email | password (hashed) | created_at |
|---|---|---|---|
| uuid-u1 | admin@techatlas.io | $2b$10$... | 2024-01-01 |
| uuid-u2 | dev@techatlas.io | $2b$10$... | 2024-02-01 |
| uuid-u3 | user@techatlas.io | $2b$10$... | 2024-02-15 |

---

### 12. `user_roles` *(Associative Entity)*

Assigns roles to users. Allows multiple roles per user.

| id | user_id | role | created_at |
|---|---|---|---|
| uuid-ur1 | uuid-u1 | admin | 2024-01-01 |
| uuid-ur2 | uuid-u2 | moderator | 2024-02-01 |
| uuid-ur3 | uuid-u3 | user | 2024-02-15 |

> **Unique constraint:** `(user_id, role)`

---

### 13. `profiles` *(Weak Entity)*

Shares its PK with `users` — **identifying relationship** (1:1). No independent existence.

| id (= user_id) | email | display_name | created_at |
|---|---|---|---|
| uuid-u1 | admin@techatlas.io | System Admin | 2024-01-01 |
| uuid-u2 | dev@techatlas.io | DevUser | 2024-02-01 |
| uuid-u3 | user@techatlas.io | TechExplorer | 2024-02-15 |

---

### 14. `newspaper_messages`

Standalone community messages; no FK dependency.

| id | display_name | message | created_at |
|---|---|---|---|
| uuid-n1 | Tanvi | "React 19 is a game changer!" | 2024-04-01 |
| uuid-n2 | Dev42 | "AI tools boosted my productivity 3x" | 2024-04-02 |
| uuid-n3 | CodeNinja | "Go is the future of backend." | 2024-04-03 |

---

### 15. `saved_technologies`

Stores tech names a user has bookmarked.

| id | user_id | technology_name | created_at |
|---|---|---|---|
| uuid-st1 | uuid-u2 | React | 2024-04-10 |
| uuid-st2 | uuid-u2 | Docker | 2024-04-10 |
| uuid-st3 | uuid-u3 | Python | 2024-04-11 |

---

### 16. `saved_trends`

Stores trend topics a user has saved.

| id | user_id | trend_name | trend_category | created_at |
|---|---|---|---|---|
| uuid-sg1 | uuid-u2 | Rise of AI Coding Tools | AI & LLM | 2024-04-10 |
| uuid-sg2 | uuid-u3 | WebAssembly Adoption | Frontend | 2024-04-11 |
| uuid-sg3 | uuid-u3 | Edge Computing | Cloud Computing | 2024-04-12 |

---

### 17. `user_roadmap`

Learning roadmap tracker per user. `progress` is a **derived-like** attribute (computed from completion steps in UI but stored here).

| id | user_id | technology_name | status | progress (%) | priority | created_at |
|---|---|---|---|---|---|---|
| uuid-rm1 | uuid-u2 | Kubernetes | planned | 0 | 1 | 2024-04-10 |
| uuid-rm2 | uuid-u2 | Rust | in-progress | 40 | 2 | 2024-04-11 |
| uuid-rm3 | uuid-u3 | LangChain | completed | 100 | 1 | 2024-04-12 |

---

## SQL Views (Derived / Virtual Tables)

| View Name | Description |
|---|---|
| `developer_technology_view` | Joins developers → region → tech → category → work_profile |
| `ai_tool_usage_view` | Joins developers → uses_ai → ai_tool → region → work_profile |
| `tech_category_insights` | Aggregates developer count, tech count, avg proficiency per category |

---

## SQL Triggers

| Trigger | Table | Event | Purpose |
|---|---|---|---|
| `trg_validate_salary_before_insert` | `work_profile` | BEFORE INSERT | Rejects negative salary values |
| `trg_validate_salary_before_update` | `work_profile` | BEFORE UPDATE | Rejects negative salary values |
| `trg_update_popularity_after_insert` | `developers_tech` | AFTER INSERT | Recalculates `tech_category.popularity_score` |
| `trg_update_popularity_after_delete` | `developers_tech` | AFTER DELETE | Recalculates `tech_category.popularity_score` |

---

## Stored Procedure

| Procedure | Description |
|---|---|
| `GetDevelopersTopTechnology()` | Uses a cursor to iterate all developers and returns each developer's most-used technology in a temp table |

---

## Relationship Summary

| From | To | Cardinality | Via |
|---|---|---|---|
| `region` | `company` | 1 : N | `company.region_id` |
| `region` | `developers` | 1 : N | `developers.region_id` |
| `tech_category` | `technology` | 1 : N | `technology.category_id` |
| `company` | `work_profile` | 1 : N | `work_profile.company_id` |
| `developers` | `work_profile` | 1 : 1 | `work_profile.developer_id` (UNIQUE) |
| `developers` | `technology` | M : N | `developers_tech` junction |
| `developers` | `ai_tool` | M : N | `uses_ai` junction |
| `users` | `user_roles` | 1 : N | `user_roles.user_id` |
| `users` | `profiles` | 1 : 1 | shared PK `profiles.id` |
| `users` | `saved_technologies` | 1 : N | `saved_technologies.user_id` |
| `users` | `saved_trends` | 1 : N | `saved_trends.user_id` |
| `users` | `user_roadmap` | 1 : N | `user_roadmap.user_id` |

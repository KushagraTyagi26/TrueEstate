<div align="center">

# 🏠 TrueEstate

### Rental Intelligence, Beyond Price Prediction.

**An end-to-end machine learning platform that transforms property, market, and accessibility data into actionable rental decisions.**

<br />

`Machine Learning` · `XGBoost` · `FastAPI` · `Next.js` · `TypeScript` · `Supabase`

<br />

**Predict Fair Rent · Evaluate Listings · Discover Localities · Compare Properties**

</div>

---

## ◈ The Intelligence Layer for Rental Decisions

Finding a rental property is easy.

Understanding whether it is **fairly priced, well-connected, suitable for your budget, and better than the alternatives** is considerably harder.

**TrueEstate** is an ML-powered rental intelligence platform built to solve that problem.

Instead of treating rental valuation as a single prediction task, TrueEstate combines **machine learning, market intelligence, accessibility signals, valuation logic, and recommendation systems** to create a complete decision layer for renters.

> **TrueEstate doesn't simply estimate what a property should cost. It helps determine whether it is worth renting.**

---

## ◈ From Prediction to Decision Intelligence

Most rental prediction systems end here:

```text
Property Features
       │
       ▼
   ML Model
       │
       ▼
Predicted Rent
```

TrueEstate extends the pipeline:

```text
                         ┌─────────────────────┐
                         │   Property Details  │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             ▼                      ▼                      ▼
      Market Signals        Locality Intelligence   Accessibility Data
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ ML Valuation Engine │
                         └──────────┬──────────┘
                                    ▼
                     Fair Rental Value Estimation
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
          Listing Analysis    Value Scoring     Market Position
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    ▼
                     Recommendation & Comparison
                                    │
                                    ▼
                         Rental Decision Insights
```

The result is not merely a number — it is **context around that number**.

---

## ◈ What TrueEstate Can Do

### 01 — Estimate Fair Market Rent

TrueEstate estimates the expected monthly rental value of a property using its physical characteristics, locality information, engineered features, and market signals.

The prediction layer provides:

- Estimated monthly rent
- Expected rental range
- Predicted ₹/sq. ft.
- Locality market rate
- Locality + BHK market rate
- Accessibility context

---

### 02 — Evaluate a Listing

A property's asking rent means little without understanding its underlying market value.

TrueEstate compares the **asking rent against its estimated fair value** and determines the property's market position.

```text
Asking Rent
     │
     ├──── Fair Rent Estimate
     ├──── Expected Market Range
     ├──── Price Difference
     ├──── Market Position
     └──── Value Score
```

Listings can then be interpreted as **fairly priced, above the expected range, or below the expected range**.

---

### 03 — Discover Better Localities

TrueEstate includes a recommendation engine designed around the renter rather than the listing.

Users can specify:

- Monthly budget
- Preferred city
- BHK requirement
- Property size
- Furnishing preference
- Lifestyle / accessibility priority

The system evaluates eligible localities and ranks them using **budget compatibility, rental characteristics, accessibility, and available market intelligence**.

---

### 04 — Understand Accessibility

Rental value is influenced by more than the property itself.

TrueEstate incorporates proximity to key infrastructure:

| Signal | Intelligence |
|:---|:---|
| 🚇 Transit | Distance to nearby transport infrastructure |
| 🏥 Healthcare | Proximity to hospitals |
| 🏫 Education | Proximity to schools |
| 🛍️ Amenities | Proximity to malls and commercial infrastructure |

These signals are consolidated into an **Accessibility Score**, adding location context to valuation and recommendation decisions.

---

### 05 — Compare Properties Intelligently

Two similarly priced properties can represent very different value.

TrueEstate provides side-by-side comparison across:

- Asking rent
- Estimated fair rent
- Price difference
- Predicted rental rate
- Value score
- Accessibility score
- Market position
- Nearby infrastructure

The comparison engine then identifies the property offering the **strongest overall combination of value and accessibility**.

---

## ◈ Engineering the Valuation Pipeline

TrueEstate's ML pipeline goes beyond feeding raw property columns into a regression model.

The feature space incorporates property characteristics alongside derived and market-aware signals, including:

```text
Property Features
├── Area
├── Bedrooms
├── Bathrooms
├── Balconies
├── Property Type
└── Furnishing

Engineered Features
├── Area per Bedroom
├── Bathrooms per Bedroom
└── Balconies per Bedroom

Market Intelligence
├── Locality Market Rate
├── Locality + BHK Market Rate
└── City-Level Market Signals

Location Intelligence
├── Hospital Distance
├── School Distance
├── Mall Distance
├── Transit Distance
└── Accessibility Score
```

The resulting feature representation is processed through an **XGBoost-based valuation pipeline** exposed through the backend inference layer.

---

## ◈ Platform Architecture

TrueEstate follows a separated frontend, intelligence, and inference architecture.

```text
┌──────────────────────────────────────────────┐
│                 USER EXPERIENCE              │
│                                              │
│          Next.js · React · TypeScript        │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTPS / JSON
                       ▼
┌──────────────────────────────────────────────┐
│                API / SERVICE LAYER           │
│                                              │
│                 FastAPI · Python             │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Valuation     Recommendation   Comparison
      Engine          Engine         Engine
          │            │            │
          └────────────┼────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│             INTELLIGENCE LAYER               │
│                                              │
│  XGBoost · Market Data · Accessibility Data  │
└──────────────────────────────────────────────┘

        Authentication → Supabase + Google OAuth
        Frontend       → Vercel
        Backend / ML   → Render
```

---

## ◈ Technology Foundation

| Domain | Technology |
|---|---|
| **Machine Learning** | Python · XGBoost · Scikit-learn |
| **Data Engineering** | Pandas · NumPy |
| **API Layer** | FastAPI · Uvicorn |
| **Frontend** | Next.js · React · TypeScript |
| **Interface** | Tailwind CSS · Lucide |
| **Authentication** | Supabase Auth · Google OAuth |
| **Frontend Infrastructure** | Vercel |
| **Backend Infrastructure** | Render |
| **Version Control** | Git · GitHub |

---

## ◈ API Surface

The intelligence layer is exposed through a focused REST API:

```http
POST /predict
POST /evaluate
POST /recommend
POST /compare
GET  /analyze/{city}/{locality}
GET  /health
```

Each capability remains separated at the service layer while sharing the underlying valuation and location intelligence infrastructure.

---

## ◈ Supported Markets

The current production system supports:

```text
Bangalore  ·  Mumbai  ·  New Delhi
```

Locality-level information is used wherever sufficient data is available, with broader market signals supporting the valuation pipeline when required.

---

## ◈ Why This Problem Matters

Property marketplaces are optimized for **discovering listings**.

They do not necessarily answer the questions that follow:

> Is ₹55,000 reasonable for this property?

> What should a similar property actually rent for?

> Am I paying a premium for this locality?

> Could my budget get me a better-connected location?

> Which of these properties represents better overall value?

TrueEstate is designed around those questions.

It transforms rental information from something users must manually interpret into **structured decision intelligence**.

---

<div align="center">

## Built Around One Principle

### **A rental decision should be informed by more than the asking price.**

TrueEstate combines **valuation, market context, accessibility, recommendations, and comparison** into one rental intelligence platform.

<br />

**Predict less. Understand more. Rent smarter.**

</div>

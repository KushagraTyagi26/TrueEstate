# 🏠 TrueEstate

**TrueEstate is an ML-powered rental intelligence platform designed to help users make better rental decisions — not just predict rent.**

Traditional rent prediction models mainly answer **“How much should this property cost?”** TrueEstate goes further by combining machine learning, locality intelligence, accessibility data, market analysis, and recommendation systems to help users understand **whether a property is worth renting and which locality best fits their needs.**

---

## 💡 Why TrueEstate?

Finding a rental property isn't only about predicting its price.

A renter also needs to know:

- Is the property **fairly priced or overpriced**?
- Is the locality suitable for their **budget**?
- How accessible is it to **metros, schools, hospitals and malls**?
- Are there **better localities** for the same requirements?
- How does one listing compare with another?

TrueEstate brings these decisions into a **single intelligent platform**.

---

## ✨ Key Features

### 🧠 ML Rent Estimation
Predicts the expected rental value of a property using property characteristics, locality information and market signals.

### ⚖️ Fair Price & Listing Evaluation
Compares the asking rent with the estimated fair market value and identifies whether a property is **fairly priced, overpriced or potentially good value**.

### 🎯 Smart Locality Recommendation Engine
Users provide their **budget and priorities**, such as being closer to:

- 🚇 Metro / transport
- 🏥 Hospitals
- 🏫 Schools
- 🛍️ Malls

TrueEstate then recommends localities that best match those requirements.

### 📍 Accessibility Intelligence
Analyzes distances to important amenities and generates an **Accessibility Score** to make localities easier to evaluate.

### 📊 Locality & Market Intelligence
Provides insights such as locality rental rates, accessibility information and **market positioning** to give context behind the model's predictions.

### 🔄 Property Comparison
Allows users to compare multiple properties across **price, predicted fair rent, accessibility, locality and value metrics** instead of comparing listings manually.

---

## 🚀 What Makes It Different?

Most rental ML projects stop at:

`Property Details → ML Model → Predicted Rent`

TrueEstate works more like:

`Property + Locality + Market + Accessibility → ML Estimation → Fair Price Analysis → Recommendation & Comparison`

> **TrueEstate doesn't just predict what a property may cost — it helps users decide whether they should rent it.**

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Machine Learning** | Python, XGBoost, Scikit-learn, Pandas, NumPy |
| **Backend** | FastAPI, Uvicorn |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Authentication** | Supabase Auth, Google OAuth |
| **Data Intelligence** | Rental market data + accessibility/amenity data |
| **Version Control** | Git, GitHub |

---

## ☁️ Cloud Deployment

| Component | Platform |
|---|---|
| **Frontend** | Vercel |
| **ML Model + FastAPI Backend** | Render |
| **Authentication** | Supabase |
| **Source Code** | GitHub |

The application follows a separated architecture where the **Next.js frontend communicates with a deployed FastAPI API**, which handles ML inference, valuation, locality recommendations and comparison logic.

---

## 🏗️ Core System

```text
User
  ↓
Next.js Frontend
  ↓
FastAPI Backend
  ↓
┌─────────────────────────────┐
│ ML Rent Estimation          │
│ Market Intelligence         │
│ Accessibility Intelligence  │
│ Fair Price Evaluation       │
│ Recommendation Engine       │
│ Property Comparison         │
└─────────────────────────────┘
  ↓
Rental Decision Insights
```

---

## 🌍 Why It Matters

Rental platforms provide thousands of listings, but renters still have to determine whether those listings are **reasonably priced and suitable for their lifestyle**.

TrueEstate attempts to bridge that gap by transforming rental data into **decision intelligence**, helping users evaluate not only the property but also the locality and surrounding infrastructure.

---


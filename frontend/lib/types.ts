export type Furnishing =
  | "Furnished"
  | "Semi-Furnished"
  | "Unfurnished"

export type PropertyType =
  | "Flat"
  | "House"
  | "Villa"

export type City =
  | "Bangalore"
  | "Mumbai"
  | "New Delhi"


// ============================================================
// FRONTEND PROPERTY INPUT
// ============================================================

export interface PropertyInput {
  city: City
  locality: string
  area: number
  bedrooms: number
  bathrooms: number
  balconies: number
  furnishing: Furnishing
  propertyType: PropertyType
  askingRent?: number
}


// ============================================================
// SHARED ACCESSIBILITY VIEW MODEL
// ============================================================

export interface Accessibility {
  score: number
  hospital: number
  school: number
  mall: number
  transit: number
}


// ============================================================
// PREDICTION UI MODEL
// ============================================================

export interface Prediction {
  estimatedRent: number
  predictedRate: number
  localityRate: number
  bedroomRate: number
  accessibility: Accessibility
}


// ============================================================
// EVALUATION UI MODEL
// ============================================================

export interface Evaluation extends Prediction {
  askingRent: number
  difference: number
  differencePercent: number
  status: string

  lowerBound: number
  upperBound: number

  valueScore: number
  valueLabel: string

  priceFairness: number
  marketPosition: number

  askingRate: number
  interpretation: string
}


// ============================================================
// RECOMMENDATION UI MODEL
// ============================================================

export interface Recommendation {
  locality: string
  match: number

  estimatedRent: number
  rate: number

  accessibility: Accessibility

  budgetFit: number
  priorityScore: number
  specificity: number

  source:
    | "locality_bed"
    | "locality"
    | "city"

  reasons: string[]
}


// ============================================================
// COMPARISON UI MODEL
// ============================================================

export interface ComparisonProperty
  extends PropertyInput {
  propertyId: number
  rank: number

  fairRent: number
  valueScore: number
  valueLabel: string

  priceFairness: number
  marketPosition: number

  status: string
  expectedRange: string

  accessibility: Accessibility

  predictedRate: number
  localityRate: number
}


export interface CompareResponse {
  properties: ComparisonProperty[]

  winner: {
    propertyId: number
    city: string
    locality: string
    valueScore: number
    valueLabel: string
    reasons: string[]
  }
}


// ============================================================
// DEFAULT PROPERTY
// ============================================================

export const defaultProperty: PropertyInput = {
  city: "Bangalore",
  locality: "Whitefield",
  area: 1200,
  bedrooms: 2,
  bathrooms: 2,
  balconies: 1,
  furnishing: "Semi-Furnished",
  propertyType: "Flat",
  askingRent: 55000,
}


// ============================================================
// OPTIONS
// ============================================================

export const cityOptions: City[] = [
  "Bangalore",
  "Mumbai",
  "New Delhi",
]

export const localityOptions = [
  "Whitefield",
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Kanakapura Road",
  "Andheri East",
  "Powai",
  "Saket",
]


// ============================================================
// FORMATTING
// ============================================================

export const formatINR = (
  value: number
) =>
  `₹${Math.round(value).toLocaleString(
    "en-IN"
  )}`
  
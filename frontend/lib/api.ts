import type { PropertyInput } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

/* ============================================================
   INTERNAL HELPERS
============================================================ */

function toBackendProperty(input: PropertyInput) {
  return {
    city: input.city,
    locality: input.locality,
    area: input.area,

    // Frontend -> FastAPI naming
    beds: input.bedrooms,
    bathrooms: input.bathrooms,
    balconies: input.balconies,
    furnishing: input.furnishing,
    property_type: input.propertyType,

    ...(input.askingRent !== undefined && {
      asking_rent: input.askingRent,
    }),
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const error = await response.json()

      if (error?.detail) {
        message =
          typeof error.detail === "string"
            ? error.detail
            : JSON.stringify(error.detail)
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message)
  }

  return response.json()
}

/* ============================================================
   RENT PREDICTION
============================================================ */

export async function predictRent(input: PropertyInput) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toBackendProperty(input)),
  })

  return handleResponse(response)
}

/* ============================================================
   PROPERTY EVALUATION
============================================================ */

export async function evaluateProperty(input: PropertyInput) {
  if (input.askingRent === undefined) {
    throw new Error(
      "Asking rent is required to evaluate a property."
    )
  }

  const response = await fetch(`${API_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toBackendProperty(input)),
  })

  return handleResponse(response)
}

/* ============================================================
   LOCALITY RECOMMENDATIONS
============================================================ */

export interface RecommendationRequest {
  city: string
  budgetMin: number
  budgetMax: number
  area: number
  bedrooms: number
  priority: string
  topN?: number
}

export async function recommendLocalities(
  input: RecommendationRequest
) {
  const payload = {
    city: input.city,
    budget_min: input.budgetMin,
    budget_max: input.budgetMax,
    area: input.area,
    beds: input.bedrooms,
    priority: input.priority,
    top_n: input.topN ?? 5,
  }

  const response = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

/* ============================================================
   PROPERTY COMPARISON
============================================================ */

export async function compareProperties(
  properties: PropertyInput[]
) {
  if (properties.length < 2 || properties.length > 3) {
    throw new Error(
      "Property comparison requires 2 or 3 properties."
    )
  }

  const payload = {
    properties: properties.map(toBackendProperty),
  }

  const response = await fetch(`${API_URL}/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

/* ============================================================
   LOCATION ANALYSIS
============================================================ */

export async function analyzeLocation(
  city: string,
  locality: string
) {
  const response = await fetch(
    `${API_URL}/analyze/${encodeURIComponent(city)}/${encodeURIComponent(locality)}`
  )

  return handleResponse(response)
}

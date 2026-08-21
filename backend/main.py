from fastapi import FastAPI, HTTPException

from schemas import PropertyInput
from model_service import predict_rent
from location_service import get_location_intelligence
from valuation_service import evaluate_price


app = FastAPI(
    title="TrueEstate API",
    description=(
        "AI-powered rental price, valuation, "
        "and location intelligence API"
    ),
    version="2.1.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "TrueEstate API is running",
        "status": "success",
        "version": "2.1.0"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# RENT PREDICTION
# ============================================================

@app.post("/predict")
def predict(property_data: PropertyInput):

    try:
        result = predict_rent(
            property_data.model_dump()
        )

        return {
            "status": "success",
            "currency": "INR",
            **result
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# PROPERTY PRICE EVALUATION
# ============================================================

@app.post("/evaluate")
def evaluate_property(property_data: PropertyInput):

    try:
        data = property_data.model_dump()

        asking_rent = data.get("asking_rent")

        if asking_rent is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "asking_rent is required "
                    "for property evaluation"
                )
            )

        # Get TrueEstate fair-rent estimate
        prediction = predict_rent(data)

        # Compare asking rent with predicted fair rent
        valuation = evaluate_price(
            predicted_rent=prediction[
                "predicted_monthly_rent"
            ],
            asking_rent=asking_rent
        )

        return {
            "status": "success",
            "currency": "INR",

            "valuation": valuation,

            "market_intelligence": {
                "predicted_rate_per_sqft":
                    prediction[
                        "predicted_rate_per_sqft"
                    ],

                "locality_market_rate":
                    prediction[
                        "locality_market_rate"
                    ],

                "locality_bed_market_rate":
                    prediction[
                        "locality_bed_market_rate"
                    ],

                "accessibility_score":
                    prediction[
                        "accessibility_score"
                    ],

                "accessibility_available":
                    prediction[
                        "accessibility_available"
                    ]
            }
        }

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# LOCATION ANALYSIS
# ============================================================

@app.get("/analyze/{city}/{locality}")
def analyze_location(
    city: str,
    locality: str
):

    location_data = get_location_intelligence(
        city,
        locality
    )

    if location_data is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No location data "
                f"available for {city}"
            )
        )

    return {
        "status": "success",
        "location_intelligence":
            location_data
    }

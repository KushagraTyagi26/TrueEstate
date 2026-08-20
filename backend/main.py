from fastapi import FastAPI, HTTPException

from schemas import PropertyInput
from model_service import predict_rent
from location_service import get_location_intelligence


app = FastAPI(
    title="TrueEstate API",
    description=(
        "AI-powered rental price and "
        "location intelligence API"
    ),
    version="2.0.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "TrueEstate API is running",
        "status": "success",
        "version": "2.0.0"
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
# LOCATION ANALYSIS
# ============================================================

@app.get("/analyze/{city}/{locality}")
def analyze_location(
    city: str,
    locality: str
):

    location_data = (
        get_location_intelligence(
            city,
            locality
        )
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

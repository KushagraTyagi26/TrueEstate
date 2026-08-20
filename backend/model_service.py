import os
import pickle
import pandas as pd

from location_service import get_location_intelligence


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)


# ============================================================
# LOAD MODEL + FEATURES
# ============================================================

with open(
    os.path.join(
        MODEL_DIR,
        "trueestate_rate_model.pkl"
    ),
    "rb"
) as f:
    model = pickle.load(f)


with open(
    os.path.join(
        MODEL_DIR,
        "trueestate_feature_columns.pkl"
    ),
    "rb"
) as f:
    feature_columns = pickle.load(f)


# ============================================================
# LOAD MARKET-RATE LOOKUPS
# ============================================================

locality_rates = pd.read_csv(
    os.path.join(
        MODEL_DIR,
        "locality_market_rates.csv"
    )
)

locality_bed_rates = pd.read_csv(
    os.path.join(
        MODEL_DIR,
        "locality_bed_market_rates.csv"
    )
)

city_rates = pd.read_csv(
    os.path.join(
        MODEL_DIR,
        "city_market_rates.csv"
    )
)


print("✅ TrueEstate production model loaded")
print("Expected features:", len(feature_columns))


# ============================================================
# MARKET RATE LOOKUP
# ============================================================

def get_market_rates(city, locality, beds):

    # --------------------------------------
    # Locality + BHK rate
    # --------------------------------------

    bed_match = locality_bed_rates[
        (locality_bed_rates["city"] == city)
        &
        (locality_bed_rates["locality"] == locality)
        &
        (locality_bed_rates["beds"] == beds)
    ]

    # --------------------------------------
    # Locality rate
    # --------------------------------------

    locality_match = locality_rates[
        (locality_rates["city"] == city)
        &
        (locality_rates["locality"] == locality)
    ]

    # --------------------------------------
    # City fallback
    # --------------------------------------

    city_match = city_rates[
        city_rates["city"] == city
    ]

    if city_match.empty:
        raise ValueError(
            f"Unsupported city: {city}"
        )

    city_rate = float(
        city_match.iloc[0]["city_market_rate"]
    )

    if not locality_match.empty:

        locality_market_rate = float(
            locality_match.iloc[0][
                "locality_market_rate"
            ]
        )

    else:
        locality_market_rate = city_rate


    if not bed_match.empty:

        locality_bed_market_rate = float(
            bed_match.iloc[0][
                "locality_bed_market_rate"
            ]
        )

    else:
        locality_bed_market_rate = (
            locality_market_rate
        )

    return (
        locality_market_rate,
        locality_bed_market_rate
    )


# ============================================================
# PREPROCESS
# ============================================================

def preprocess_input(data):

    city = data["city"]
    locality = data["locality"]
    area = float(data["area"])
    beds = int(data["beds"])
    bathrooms = int(data["bathrooms"])
    balconies = int(data["balconies"])
    furnishing = data["furnishing"]
    property_type = data["property_type"]


    # --------------------------------------
    # MARKET FEATURES
    # --------------------------------------

    (
        locality_market_rate,
        locality_bed_market_rate
    ) = get_market_rates(
        city,
        locality,
        beds
    )


    # --------------------------------------
    # ACCESSIBILITY
    # --------------------------------------

    access = get_location_intelligence(
        city,
        locality
    )

    if access is None:
        raise ValueError(
            f"No accessibility information "
            f"available for {city}"
        )


    # --------------------------------------
    # START WITH EXACT MODEL FEATURES
    # --------------------------------------

    row = {
        feature: 0
        for feature in feature_columns
    }


    # --------------------------------------
    # BASIC PROPERTY FEATURES
    # --------------------------------------

    row["area"] = area
    row["beds"] = beds
    row["bathrooms"] = bathrooms
    row["balconies"] = balconies


    # --------------------------------------
    # ENGINEERED FEATURES
    # --------------------------------------

    safe_beds = max(beds, 1)

    row["area_per_bedroom"] = (
        area / safe_beds
    )

    row["bath_per_bedroom"] = (
        bathrooms / safe_beds
    )

    row["balcony_per_bedroom"] = (
        balconies / safe_beds
    )


    # --------------------------------------
    # MARKET FEATURES
    # --------------------------------------

    row["locality_market_rate"] = (
        locality_market_rate
    )

    row["locality_bed_market_rate"] = (
        locality_bed_market_rate
    )


    # --------------------------------------
    # ACCESSIBILITY FEATURES
    # --------------------------------------

    row["hospital_km"] = access["hospital_km"]
    row["school_km"] = access["school_km"]
    row["mall_km"] = access["mall_km"]
    row["station_km"] = access["station_km"]

    row["accessibility_score"] = (
        access["accessibility_score"]
    )

    row["accessibility_available"] = (
        access["accessibility_available"]
    )


    # --------------------------------------
    # CITY DUMMIES
    # Bangalore = baseline
    # --------------------------------------

    if city == "Mumbai":
        row["city_Mumbai"] = 1

    elif city == "New Delhi":
        row["city_New Delhi"] = 1


    # --------------------------------------
    # FURNISHING
    # Furnished = baseline
    # --------------------------------------

    if furnishing == "Semi-Furnished":
        row["furnishing_Semi-Furnished"] = 1

    elif furnishing == "Unfurnished":
        row["furnishing_Unfurnished"] = 1


    # --------------------------------------
    # PROPERTY TYPE
    # --------------------------------------

    property_column = (
        f"property_type_{property_type}"
    )

    if property_column in row:
        row[property_column] = 1


    # --------------------------------------
    # DATAFRAME IN EXACT TRAINING ORDER
    # --------------------------------------

    processed = pd.DataFrame(
        [row],
        columns=feature_columns
    )

    return (
        processed,
        access,
        locality_market_rate,
        locality_bed_market_rate
    )


# ============================================================
# PREDICTION
# ============================================================

def predict_rent(data):

    (
        processed,
        access,
        locality_market_rate,
        locality_bed_market_rate
    ) = preprocess_input(data)

    predicted_rate = float(
        model.predict(processed)[0]
    )

    predicted_rate = max(
        predicted_rate,
        0
    )

    predicted_rent = (
        predicted_rate *
        float(data["area"])
    )

    return {
        "predicted_monthly_rent":
            round(predicted_rent, 2),

        "predicted_rate_per_sqft":
            round(predicted_rate, 2),

        "locality_market_rate":
            round(locality_market_rate, 2),

        "locality_bed_market_rate":
            round(locality_bed_market_rate, 2),

        "accessibility_score":
            round(
                access["accessibility_score"],
                2
            ),

        "accessibility_available":
            access[
                "accessibility_available"
            ]
    }

import os
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

LOOKUP_PATH = os.path.join(
    BASE_DIR,
    "models",
    "accessibility_lookup.csv"
)

location_df = pd.read_csv(LOOKUP_PATH)

# Normalize text
location_df["locality_key"] = (
    location_df["locality"]
    .astype(str)
    .str.strip()
    .str.lower()
)

location_df["city_key"] = (
    location_df["city"]
    .astype(str)
    .str.strip()
    .str.lower()
)

print("✅ Accessibility lookup loaded")
print("Locality rows:", len(location_df))


def get_location_intelligence(city: str, locality: str):

    city_clean = city.strip().lower()
    locality_clean = locality.strip().lower()

    result = location_df[
        (location_df["city_key"] == city_clean)
        &
        (location_df["locality_key"] == locality_clean)
    ]

    # --------------------------------------
    # Exact locality found
    # --------------------------------------

    if not result.empty:

        row = result.iloc[0]

        return {
            "city": row["city"],
            "locality": row["locality"],
            "hospital_km": float(row["hospital_km"]),
            "school_km": float(row["school_km"]),
            "mall_km": float(row["mall_km"]),
            "station_km": float(row["station_km"]),
            "accessibility_score": float(
                row["accessibility_score"]
            ),
            "accessibility_available": int(
                row["accessibility_available"]
            )
        }

    # --------------------------------------
    # Locality unavailable → city fallback
    # --------------------------------------

    city_data = location_df[
        location_df["city_key"] == city_clean
    ]

    if city_data.empty:
        return None

    return {
        "city": city,
        "locality": locality,
        "hospital_km": float(
            city_data["hospital_km"].median()
        ),
        "school_km": float(
            city_data["school_km"].median()
        ),
        "mall_km": float(
            city_data["mall_km"].median()
        ),
        "station_km": float(
            city_data["station_km"].median()
        ),
        "accessibility_score": float(
            city_data["accessibility_score"].median()
        ),
        "accessibility_available": 0
    }

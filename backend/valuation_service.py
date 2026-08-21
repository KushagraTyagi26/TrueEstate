import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

UNCERTAINTY_PATH = (
    BASE_DIR
    / "models"
    / "valuation_uncertainty.json"
)


with open(UNCERTAINTY_PATH, "r") as file:
    UNCERTAINTY_CONFIG = json.load(file)


def get_calibration_band(predicted_rent: float) -> dict:
    """
    Select the validation calibration band using
    TrueEstate's predicted monthly rent.
    """

    bands = UNCERTAINTY_CONFIG["bands"]

    if predicted_rent < 20000:
        return bands["under_20k"]

    elif predicted_rent < 50000:
        return bands["20k_50k"]

    elif predicted_rent < 100000:
        return bands["50k_1l"]

    else:
        return bands["over_1l"]


def evaluate_price(
    predicted_rent: float,
    asking_rent: float
) -> dict:
    """
    Evaluate the asking rent against TrueEstate's
    estimated fair rent.

    The expected range is constructed from signed
    validation residuals:

        residual = actual_rent - predicted_rent

    Q10 and Q90 therefore create an empirical
    central 80% prediction interval.
    """

    band = get_calibration_band(predicted_rent)

    q10 = band["q10_residual"]
    q90 = band["q90_residual"]

    # Validation-calibrated expected range
    lower_bound = max(
        0,
        predicted_rent + q10
    )

    upper_bound = max(
        lower_bound,
        predicted_rent + q90
    )

    difference = (
        asking_rent - predicted_rent
    )

    difference_pct = (
        difference / predicted_rent
    ) * 100


    # --------------------------------------------------------
    # PRICE POSITION
    # --------------------------------------------------------

    if asking_rent < lower_bound:
        status = "Below Expected Range"

    elif asking_rent <= upper_bound:
        status = "Within Expected Range"

    else:
        status = "Above Expected Range"


    return {
        "asking_rent": round(
            asking_rent,
            2
        ),

        "fair_rent": round(
            predicted_rent,
            2
        ),

        "expected_range": {
            "lower": round(
                lower_bound,
                2
            ),
            "upper": round(
                upper_bound,
                2
            )
        },

        "price_difference": round(
            difference,
            2
        ),

        "price_difference_pct": round(
            difference_pct,
            2
        ),

        "price_status": status,

        "uncertainty": {
            "method":
                "prediction_conditional_calibration",

            "coverage":
                "80%",

            "lower_residual":
                round(q10, 2),

            "upper_residual":
                round(q90, 2)
        }
    }

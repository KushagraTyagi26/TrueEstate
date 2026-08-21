from pathlib import Path

import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


# ============================================================
# LOAD LOOKUP TABLES
# ============================================================

accessibility_df = pd.read_csv(
    MODELS_DIR / "accessibility_lookup.csv"
)

locality_rates_df = pd.read_csv(
    MODELS_DIR / "locality_market_rates.csv"
)

locality_bed_rates_df = pd.read_csv(
    MODELS_DIR / "locality_bed_market_rates.csv"
)

city_rates_df = pd.read_csv(
    MODELS_DIR / "city_market_rates.csv"
)


# ============================================================
# GENERAL HELPERS
# ============================================================

def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 10.0
) -> float:

    return max(
        minimum,
        min(value, maximum)
    )


def distance_score(
    distance_km: float
) -> float:
    """
    Convert amenity distance into a continuous 0-10 score.

    Smaller distance = better score.

    Examples:
    0 km   -> 10.0
    1 km   -> 8.7
    2 km   -> 7.4
    5 km   -> 3.5
    8+ km  -> 1.0
    """

    distance_km = max(
        float(distance_km),
        0.0
    )

    score = 10.0 - (
        distance_km * 1.3
    )

    return clamp(
        score,
        minimum=1.0,
        maximum=10.0
    )


# ============================================================
# BUDGET SCORE
# ============================================================

def calculate_budget_score(
    estimated_rent: float,
    budget_min: float,
    budget_max: float
) -> float:
    """
    Measure how well a locality's estimated rent
    matches the user's budget.

    Inside budget = 10/10.

    Below budget remains attractive.

    Above budget receives an increasingly
    strong penalty.
    """

    if budget_min <= estimated_rent <= budget_max:
        return 10.0

    # --------------------------------------------------------
    # BELOW USER'S PREFERRED RANGE
    # --------------------------------------------------------

    if estimated_rent < budget_min:

        difference_ratio = (
            budget_min - estimated_rent
        ) / max(budget_min, 1)

        score = (
            9.0
            - difference_ratio * 4
        )

        return clamp(score)

    # --------------------------------------------------------
    # ABOVE USER'S MAXIMUM BUDGET
    # --------------------------------------------------------

    difference_ratio = (
        estimated_rent - budget_max
    ) / max(budget_max, 1)

    score = (
        8.0
        - difference_ratio * 15
    )

    return clamp(score)


# ============================================================
# PRIORITY SCORE
# ============================================================

def calculate_priority_score(
    row,
    priority: str
) -> float:
    """
    Calculate score based on what matters
    most to the user.
    """

    if priority == "Transit":

        return distance_score(
            float(row["station_km"])
        )

    elif priority == "Hospitals":

        return distance_score(
            float(row["hospital_km"])
        )

    elif priority == "Schools":

        return distance_score(
            float(row["school_km"])
        )

    elif priority == "Malls":

        return distance_score(
            float(row["mall_km"])
        )

    # Balanced
    return clamp(
        float(
            row["accessibility_score"]
        )
    )


# ============================================================
# MARKET RATE LOOKUP
# ============================================================

def get_market_rate(
    city: str,
    locality: str,
    beds: int
):
    """
    Market-rate fallback hierarchy:

    1. Locality + bedroom rate
    2. Locality rate
    3. City rate
    """

    # --------------------------------------------------------
    # LOCALITY + BEDROOM
    # --------------------------------------------------------

    bed_match = locality_bed_rates_df[
        (
            locality_bed_rates_df["city"]
            == city
        )
        &
        (
            locality_bed_rates_df["locality"]
            == locality
        )
        &
        (
            locality_bed_rates_df["beds"]
            == beds
        )
    ]

    if not bed_match.empty:

        rate = float(
            bed_match.iloc[0][
                "locality_bed_market_rate"
            ]
        )

        return rate, "locality_bed"


    # --------------------------------------------------------
    # LOCALITY FALLBACK
    # --------------------------------------------------------

    locality_match = locality_rates_df[
        (
            locality_rates_df["city"]
            == city
        )
        &
        (
            locality_rates_df["locality"]
            == locality
        )
    ]

    if not locality_match.empty:

        rate = float(
            locality_match.iloc[0][
                "locality_market_rate"
            ]
        )

        return rate, "locality"


    # --------------------------------------------------------
    # CITY FALLBACK
    # --------------------------------------------------------

    city_match = city_rates_df[
        city_rates_df["city"] == city
    ]

    if not city_match.empty:

        rate = float(
            city_match.iloc[0][
                "city_market_rate"
            ]
        )

        return rate, "city"


    raise ValueError(
        f"No market-rate data available for {city}"
    )


# ============================================================
# DATA SPECIFICITY SCORE
# ============================================================

def calculate_data_specificity_score(
    rate_source: str
) -> float:
    """
    Score how specific/reliable the market-rate source is.

    locality_bed = most specific
    locality     = medium specificity
    city         = fallback / lowest specificity
    """

    if rate_source == "locality_bed":
        return 10.0

    elif rate_source == "locality":
        return 7.0

    elif rate_source == "city":
        return 4.0

    return 4.0


# ============================================================
# RECOMMENDATION REASONS
# ============================================================

def build_reasons(
    estimated_rent: float,
    budget_min: float,
    budget_max: float,
    accessibility_score: float,
    priority: str,
    row
):
    reasons = []


    # --------------------------------------------------------
    # BUDGET
    # --------------------------------------------------------

    if budget_min <= estimated_rent <= budget_max:

        reasons.append(
            "Estimated rent fits your preferred budget."
        )

    elif estimated_rent < budget_min:

        reasons.append(
            "Estimated rent is below your preferred budget."
        )

    else:

        reasons.append(
            "Estimated rent is above your preferred budget."
        )


    # --------------------------------------------------------
    # ACCESSIBILITY
    # --------------------------------------------------------

    if accessibility_score >= 9:

        reasons.append(
            "Excellent overall accessibility."
        )

    elif accessibility_score >= 8:

        reasons.append(
            "Strong overall accessibility."
        )


    # --------------------------------------------------------
    # USER PRIORITY
    # --------------------------------------------------------

    if priority == "Transit":

        reasons.append(
            "Nearest transit point is approximately "
            f"{float(row['station_km']):.2f} km away."
        )

    elif priority == "Hospitals":

        reasons.append(
            "Nearest hospital is approximately "
            f"{float(row['hospital_km']):.2f} km away."
        )

    elif priority == "Schools":

        reasons.append(
            "Nearest school is approximately "
            f"{float(row['school_km']):.2f} km away."
        )

    elif priority == "Malls":

        reasons.append(
            "Nearest mall is approximately "
            f"{float(row['mall_km']):.2f} km away."
        )


    return reasons


# ============================================================
# MAIN RECOMMENDATION ENGINE
# ============================================================

def recommend_localities(
    data: dict
) -> dict:

    city = data["city"]

    budget_min = float(
        data["budget_min"]
    )

    budget_max = float(
        data["budget_max"]
    )

    area = float(
        data["area"]
    )

    beds = int(
        data["beds"]
    )

    priority = data.get(
        "priority",
        "Balanced"
    )

    top_n = int(
        data.get(
            "top_n",
            5
        )
    )


    # ========================================================
    # VALIDATION
    # ========================================================

    if budget_min > budget_max:

        raise ValueError(
            "budget_min cannot be greater than budget_max"
        )


    # ========================================================
    # GET LOCALITIES FOR SELECTED CITY
    # ========================================================

    candidates = (
        accessibility_df[
            accessibility_df["city"]
            == city
        ]
        .drop_duplicates(
            subset=["locality"]
        )
        .copy()
    )


    if candidates.empty:

        raise ValueError(
            f"No recommendation data available for {city}"
        )


    recommendations = []


    # ========================================================
    # SCORE EACH LOCALITY
    # ========================================================

    for _, row in candidates.iterrows():

        locality = str(
            row["locality"]
        )


        # ----------------------------------------------------
        # MARKET RATE
        # ----------------------------------------------------

        market_rate, rate_source = (
            get_market_rate(
                city=city,
                locality=locality,
                beds=beds
            )
        )


        # ----------------------------------------------------
        # ESTIMATED MONTHLY RENT
        # ----------------------------------------------------

        estimated_rent = (
            market_rate * area
        )


        # ----------------------------------------------------
        # BUDGET FIT
        # ----------------------------------------------------

        budget_fit_score = (
            calculate_budget_score(
                estimated_rent,
                budget_min,
                budget_max
            )
        )


        # ----------------------------------------------------
        # ACCESSIBILITY
        # ----------------------------------------------------

        accessibility_score = clamp(
            float(
                row[
                    "accessibility_score"
                ]
            )
        )


        # ----------------------------------------------------
        # USER PRIORITY
        # ----------------------------------------------------

        priority_score = (
            calculate_priority_score(
                row,
                priority
            )
        )


        # ----------------------------------------------------
        # DATA SPECIFICITY
        # ----------------------------------------------------

        data_specificity_score = (
            calculate_data_specificity_score(
                rate_source
            )
        )


        # ====================================================
        # FINAL MATCH SCORE
        #
        # Budget fit        45%
        # User priority     25%
        # Accessibility     20%
        # Data specificity  10%
        # ====================================================

        match_score = (
            0.45 * budget_fit_score
            +
            0.25 * priority_score
            +
            0.20 * accessibility_score
            +
            0.10 * data_specificity_score
        )

        match_score = round(
            clamp(match_score),
            2
        )


        # ----------------------------------------------------
        # EXPLANATIONS
        # ----------------------------------------------------

        reasons = build_reasons(
            estimated_rent=estimated_rent,
            budget_min=budget_min,
            budget_max=budget_max,
            accessibility_score=accessibility_score,
            priority=priority,
            row=row
        )


        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        recommendations.append({

            "locality":
                locality,

            "estimated_monthly_rent":
                round(
                    estimated_rent,
                    2
                ),

            "estimated_rate_per_sqft":
                round(
                    market_rate,
                    2
                ),

            "rate_source":
                rate_source,

            "match_score":
                match_score,

            "budget_fit_score":
                round(
                    budget_fit_score,
                    2
                ),

            "priority_score":
                round(
                    priority_score,
                    2
                ),

            "data_specificity_score":
                round(
                    data_specificity_score,
                    2
                ),

            "accessibility_score":
                round(
                    accessibility_score,
                    2
                ),

            "weights": {
                "budget_fit": 0.45,
                "user_priority": 0.25,
                "accessibility": 0.20,
                "data_specificity": 0.10
            },

            "distances": {

                "hospital_km":
                    round(
                        float(
                            row["hospital_km"]
                        ),
                        2
                    ),

                "school_km":
                    round(
                        float(
                            row["school_km"]
                        ),
                        2
                    ),

                "mall_km":
                    round(
                        float(
                            row["mall_km"]
                        ),
                        2
                    ),

                "station_km":
                    round(
                        float(
                            row["station_km"]
                        ),
                        2
                    )
            },

            "reasons":
                reasons
        })


    # ========================================================
    # RANK LOCALITIES
    # ========================================================

    recommendations.sort(
        key=lambda item:
            item["match_score"],
        reverse=True
    )


    top_results = recommendations[
        :top_n
    ]


    return {

        "city":
            city,

        "requirements": {

            "budget_min":
                budget_min,

            "budget_max":
                budget_max,

            "area":
                area,

            "beds":
                beds,

            "priority":
                priority
        },

        "localities_evaluated":
            len(recommendations),

        "recommendations":
            top_results
    }

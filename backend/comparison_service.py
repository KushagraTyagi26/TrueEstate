from model_service import predict_rent
from valuation_service import evaluate_price
from value_service import calculate_value_score


# ============================================================
# INDIVIDUAL PROPERTY ANALYSIS
# ============================================================

def analyze_property_for_comparison(
    data: dict,
    property_number: int
) -> dict:

    asking_rent = data.get(
        "asking_rent"
    )

    if asking_rent is None:
        raise ValueError(
            "asking_rent is required for "
            "every property being compared"
        )


    # --------------------------------------------------------
    # RENT PREDICTION
    # --------------------------------------------------------

    prediction = predict_rent(
        data
    )


    # --------------------------------------------------------
    # VALUATION
    # --------------------------------------------------------

    valuation = evaluate_price(
        predicted_rent=prediction[
            "predicted_monthly_rent"
        ],
        asking_rent=asking_rent
    )


    # --------------------------------------------------------
    # MARKET INTELLIGENCE
    # --------------------------------------------------------

    market_intelligence = {

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


    # --------------------------------------------------------
    # VALUE SCORE
    # --------------------------------------------------------

    value_analysis = calculate_value_score(
        asking_rent=asking_rent,
        area=float(
            data["area"]
        ),
        valuation=valuation,
        market_intelligence=market_intelligence
    )


    return {

        "property_id":
            property_number,

        "city":
            data["city"],

        "locality":
            data["locality"],

        "area":
            float(
                data["area"]
            ),

        "beds":
            int(
                data["beds"]
            ),

        "asking_rent":
            round(
                float(asking_rent),
                2
            ),

        "fair_rent":
            valuation[
                "fair_rent"
            ],

        "expected_range":
            valuation[
                "expected_range"
            ],

        "price_status":
            valuation[
                "price_status"
            ],

        "price_difference_pct":
            valuation[
                "price_difference_pct"
            ],

        "asking_rate_per_sqft":
            value_analysis[
                "asking_rate_per_sqft"
            ],

        "predicted_rate_per_sqft":
            market_intelligence[
                "predicted_rate_per_sqft"
            ],

        "locality_market_rate":
            market_intelligence[
                "locality_market_rate"
            ],

        "accessibility_score":
            market_intelligence[
                "accessibility_score"
            ],

        "value_score":
            value_analysis[
                "value_score"
            ],

        "value_label":
            value_analysis[
                "value_label"
            ],

        "value_components":
            value_analysis[
                "components"
            ]
    }


# ============================================================
# BEST PROPERTY EXPLANATION
# ============================================================

def build_best_choice_reasons(
    best_property: dict,
    all_properties: list
) -> list:

    reasons = []

    # --------------------------------------------------------
    # VALUE SCORE
    # --------------------------------------------------------

    highest_value = max(
        item["value_score"]
        for item in all_properties
    )

    if (
        best_property["value_score"]
        == highest_value
    ):
        reasons.append(
            "Highest overall value-for-money score."
        )


    # --------------------------------------------------------
    # ACCESSIBILITY
    # --------------------------------------------------------

    highest_accessibility = max(
        item["accessibility_score"]
        for item in all_properties
    )

    if (
        best_property["accessibility_score"]
        == highest_accessibility
    ):
        reasons.append(
            "Best accessibility among compared properties."
        )


    # --------------------------------------------------------
    # ASKING RENT
    # --------------------------------------------------------

    lowest_rent = min(
        item["asking_rent"]
        for item in all_properties
    )

    if (
        best_property["asking_rent"]
        == lowest_rent
    ):
        reasons.append(
            "Lowest asking rent among compared properties."
        )


    # --------------------------------------------------------
    # PRICE STATUS
    # --------------------------------------------------------

    if (
        best_property["price_status"]
        != "Above Expected Range"
    ):
        reasons.append(
            "Asking rent is not above TrueEstate's "
            "expected market range."
        )


    return reasons


# ============================================================
# MAIN COMPARISON ENGINE
# ============================================================

def compare_properties(
    properties: list
) -> dict:

    if len(properties) < 2:
        raise ValueError(
            "At least two properties are required"
        )

    if len(properties) > 3:
        raise ValueError(
            "A maximum of three properties can be compared"
        )


    results = []


    # --------------------------------------------------------
    # ANALYZE EACH PROPERTY
    # --------------------------------------------------------

    for index, property_data in enumerate(
        properties,
        start=1
    ):

        result = (
            analyze_property_for_comparison(
                property_data,
                property_number=index
            )
        )

        results.append(
            result
        )


    # --------------------------------------------------------
    # RANK BY VALUE SCORE
    # --------------------------------------------------------

    ranked = sorted(
        results,
        key=lambda item:
            item["value_score"],
        reverse=True
    )


    best_property = ranked[0]


    # --------------------------------------------------------
    # ASSIGN RANK
    # --------------------------------------------------------

    for rank, item in enumerate(
        ranked,
        start=1
    ):
        item[
            "comparison_rank"
        ] = rank


    # --------------------------------------------------------
    # BEST CHOICE EXPLANATION
    # --------------------------------------------------------

    reasons = (
        build_best_choice_reasons(
            best_property,
            ranked
        )
    )


    return {

        "properties_compared":
            len(ranked),

        "best_choice": {

            "property_id":
                best_property[
                    "property_id"
                ],

            "city":
                best_property[
                    "city"
                ],

            "locality":
                best_property[
                    "locality"
                ],

            "value_score":
                best_property[
                    "value_score"
                ],

            "value_label":
                best_property[
                    "value_label"
                ],

            "reasons":
                reasons
        },

        "comparison":
            ranked
    }

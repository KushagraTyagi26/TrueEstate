def clamp(value, minimum=0.0, maximum=10.0):
    return max(minimum, min(value, maximum))


# ============================================================
# PRICE FAIRNESS
# ============================================================

def calculate_price_score(
    asking_rent: float,
    fair_rent: float,
    lower_bound: float,
    upper_bound: float
) -> float:
    """
    Score based on TrueEstate's calibrated valuation range.

    10 = excellent deal
    8  = around fair-rent estimate
    5  = upper end of expected range
    <5 = above expected range
    """

    # Excellent deal
    if asking_rent <= lower_bound:
        return 10.0

    # Lower bound → fair rent
    # 10 → 8
    if asking_rent <= fair_rent:

        span = max(
            fair_rent - lower_bound,
            1
        )

        position = (
            asking_rent - lower_bound
        ) / span

        return clamp(
            10 - (2 * position)
        )

    # Fair rent → upper expected range
    # 8 → 5
    if asking_rent <= upper_bound:

        span = max(
            upper_bound - fair_rent,
            1
        )

        position = (
            asking_rent - fair_rent
        ) / span

        return clamp(
            8 - (3 * position)
        )

    # --------------------------------------------------------
    # ABOVE EXPECTED RANGE
    #
    # Penalize much more aggressively.
    # --------------------------------------------------------

    excess_ratio = (
        asking_rent - upper_bound
    ) / max(upper_bound, 1)

    score = (
        5
        - excess_ratio * 20
    )

    return clamp(score)


# ============================================================
# MARKET POSITION
# ============================================================

def calculate_market_score(
    asking_rate: float,
    locality_market_rate: float
) -> float:
    """
    Compare the LISTING'S asking ₹/sqft against
    the locality market benchmark.

    Lower/equal asking rate = stronger tenant value.
    """

    if locality_market_rate <= 0:
        return 5.0

    ratio = (
        asking_rate
        / locality_market_rate
    )

    if ratio <= 0.80:
        return 10.0

    elif ratio <= 0.90:
        return 9.0

    elif ratio <= 1.00:
        return 8.0

    elif ratio <= 1.10:
        return 6.5

    elif ratio <= 1.20:
        return 5.0

    elif ratio <= 1.35:
        return 3.0

    else:
        return 1.0


# ============================================================
# VALUE LABEL
# ============================================================

def get_value_label(score: float) -> str:

    if score >= 8.5:
        return "Excellent Value"

    elif score >= 7.0:
        return "Good Value"

    elif score >= 5.5:
        return "Fair Value"

    elif score >= 4.0:
        return "Weak Value"

    else:
        return "Poor Value"


# ============================================================
# OVERALL VALUE SCORE
# ============================================================

def calculate_value_score(
    asking_rent: float,
    area: float,
    valuation: dict,
    market_intelligence: dict
) -> dict:
    """
    TrueEstate Value-for-Money Score.

    Components:

    Price Fairness       55%
    Accessibility       25%
    Market Position     20%
    """

    fair_rent = valuation[
        "fair_rent"
    ]

    lower_bound = valuation[
        "expected_range"
    ]["lower"]

    upper_bound = valuation[
        "expected_range"
    ]["upper"]


    # --------------------------------------------------------
    # PRICE FAIRNESS
    # --------------------------------------------------------

    price_score = calculate_price_score(
        asking_rent=asking_rent,
        fair_rent=fair_rent,
        lower_bound=lower_bound,
        upper_bound=upper_bound
    )


    # --------------------------------------------------------
    # ACCESSIBILITY
    # --------------------------------------------------------

    accessibility_score = clamp(
        float(
            market_intelligence[
                "accessibility_score"
            ]
        )
    )


    # --------------------------------------------------------
    # ASKING RATE / SQFT
    # --------------------------------------------------------

    asking_rate = (
        asking_rent / area
    )


    # --------------------------------------------------------
    # MARKET POSITION
    # --------------------------------------------------------

    market_score = calculate_market_score(
        asking_rate=asking_rate,

        locality_market_rate=float(
            market_intelligence[
                "locality_market_rate"
            ]
        )
    )


    # --------------------------------------------------------
    # WEIGHTED VALUE SCORE
    # --------------------------------------------------------

    overall_score = (
        0.55 * price_score
        +
        0.25 * accessibility_score
        +
        0.20 * market_score
    )

    overall_score = round(
        clamp(overall_score),
        2
    )


    return {
        "value_score":
            overall_score,

        "value_label":
            get_value_label(
                overall_score
            ),

        "asking_rate_per_sqft":
            round(
                asking_rate,
                2
            ),

        "components": {

            "price_fairness":
                round(
                    price_score,
                    2
                ),

            "accessibility":
                round(
                    accessibility_score,
                    2
                ),

            "market_position":
                round(
                    market_score,
                    2
                )
        },

        "weights": {
            "price_fairness": 0.55,
            "accessibility": 0.25,
            "market_position": 0.20
        }
    }

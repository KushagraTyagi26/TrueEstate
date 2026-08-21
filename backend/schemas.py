from pydantic import BaseModel, Field
from typing import Literal, Optional


# ============================================================
# PROPERTY INPUT
# Used by /predict and /evaluate
# ============================================================

class PropertyInput(BaseModel):
    city: Literal[
        "Bangalore",
        "Mumbai",
        "New Delhi"
    ]

    locality: str

    area: float = Field(gt=0)
    beds: int = Field(ge=1)
    bathrooms: int = Field(ge=0)
    balconies: int = Field(ge=0)

    furnishing: Literal[
        "Furnished",
        "Semi-Furnished",
        "Unfurnished"
    ]

    property_type: Literal[
        "Flat",
        "House",
        "Villa"
    ]

    # Optional because /predict does not require it.
    # /evaluate checks that it is provided.
    asking_rent: Optional[float] = Field(
        default=None,
        gt=0
    )


# ============================================================
# RECOMMENDATION INPUT
# Used by /recommend
# ============================================================

class RecommendationInput(BaseModel):

    city: Literal[
        "Bangalore",
        "Mumbai",
        "New Delhi"
    ]

    # User's preferred monthly-rent range
    budget_min: float = Field(
        ge=0
    )

    budget_max: float = Field(
        gt=0
    )

    # Approximate property requirements
    area: float = Field(
        gt=0
    )

    beds: int = Field(
        ge=1
    )

    # What matters most to the user when
    # ranking localities
    priority: Literal[
        "Balanced",
        "Transit",
        "Hospitals",
        "Schools",
        "Malls"
    ] = "Balanced"

    # Number of recommendations returned
    top_n: int = Field(
        default=5,
        ge=1,
        le=10
    )
    
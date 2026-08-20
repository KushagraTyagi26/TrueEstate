from pydantic import BaseModel, Field
from typing import Literal


class PropertyInput(BaseModel):
    city: Literal["Bangalore", "Mumbai", "New Delhi"]
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
    
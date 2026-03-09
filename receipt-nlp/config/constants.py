"""
config/constants.py
~~~~~~~~~~~~~~~~~~~
Immutable, typed constants for the recipe NLP pipeline.

Design principles
-----------------
* Every vocabulary is a ``frozenset`` or an immutable mapping — accidental
  mutation raises a ``TypeError`` rather than silently corrupting state.
* Related constants are grouped into ``NamedTuple`` / ``dataclass`` structs so
  callers use attribute access (``DifficultyLevel.EASY.max_steps``) instead of
  brittle nested dict lookups.
* Canonical aliases are resolved via dicts so downstream code never needs
  to handle spelling variants.
* Public API is a flat ``__all__`` — everything else is considered private.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from types import MappingProxyType
from typing import FrozenSet

__all__ = [
    # Enums
    "CookingMethod",
    "DietaryTag",
    "AllergenGroup",
    "SEOTag",
    # Vocabulary constants
    "UNIT_ALIASES",
    "CANONICAL_UNITS",
    "MODIFIERS",
    "MULTI_WORD_MODIFIERS",
    "ALLERGEN_KEYWORDS",
    "COOKING_METHODS",
    # Difficulty
    "DifficultyThreshold",
    "DIFFICULTY_THRESHOLDS",
    # Misc
    "SEO_TAGS",
    "STOP_WORDS",
]


# ---------------------------------------------------------------------------
# Enums — named constants for categorical values
# ---------------------------------------------------------------------------

class CookingMethod(StrEnum):
    BAKE    = "bake"
    BOIL    = "boil"
    BROIL   = "broil"
    FRY     = "fry"
    GRILL   = "grill"
    POACH   = "poach"
    ROAST   = "roast"
    SAUTE   = "sauté"
    SIMMER  = "simmer"
    SMOKE   = "smoke"
    STEAM   = "steam"
    STIR_FRY = "stir-fry"


class DietaryTag(StrEnum):
    VEGETARIAN   = "vegetarian"
    VEGAN        = "vegan"
    GLUTEN_FREE  = "gluten-free"
    DAIRY_FREE   = "dairy-free"
    NUT_FREE     = "nut-free"
    KETO         = "keto"
    PALEO        = "paleo"
    LOW_CARB     = "low-carb"
    HIGH_PROTEIN = "high-protein"
    WHOLE30      = "whole30"


class AllergenGroup(StrEnum):
    """The 9 major US allergens (FASTER Act, 2023)."""
    MILK      = "milk"
    EGGS      = "eggs"
    FISH      = "fish"
    SHELLFISH = "shellfish"
    TREE_NUTS = "tree nuts"
    PEANUTS   = "peanuts"
    WHEAT     = "wheat"
    SOYBEANS  = "soybeans"
    SESAME    = "sesame"


class SEOTag(StrEnum):
    QUICK_DINNER = "quick dinner"
    HEALTHY      = "healthy"
    VEGETARIAN   = "vegetarian"
    VEGAN        = "vegan"
    GLUTEN_FREE  = "gluten-free"
    HIGH_PROTEIN = "high-protein"
    LOW_CARB     = "low-carb"
    FAMILY_MEAL  = "family meal"
    COMFORT_FOOD = "comfort food"
    MEAL_PREP    = "meal prep"
    ONE_POT      = "one pot"
    UNDER_30_MIN = "under 30 minutes"


# ---------------------------------------------------------------------------
# Unit vocabulary — alias → canonical form
# ---------------------------------------------------------------------------

UNIT_ALIASES: MappingProxyType[str, str] = MappingProxyType({
    # teaspoon
    "tsp": "tsp", "t": "tsp",
    "teaspoon": "tsp", "teaspoons": "tsp",
    # tablespoon
    "tbsp": "tbsp", "tbs": "tbsp",
    "tablespoon": "tbsp", "tablespoons": "tbsp",
    # cup
    "cup": "cup", "cups": "cup", "c": "cup",
    # metric weight
    "g": "g", "gram": "g", "grams": "g",
    "kg": "kg", "kilogram": "kg", "kilograms": "kg",
    # imperial weight
    "oz": "oz", "ounce": "oz", "ounces": "oz",
    "lb": "lb", "lbs": "lb", "pound": "lb", "pounds": "lb",
    # metric volume
    "ml": "ml", "milliliter": "ml", "milliliters": "ml",
    "millilitre": "ml", "millilitres": "ml",
    "l": "l", "liter": "l", "liters": "l",
    "litre": "l", "litres": "l",
    # kitchen volume
    "pt": "pt", "pint": "pt", "pints": "pt",
    "qt": "qt", "quart": "qt", "quarts": "qt",
    "gal": "gal", "gallon": "gal", "gallons": "gal",
    # loose / count
    "pinch": "pinch", "pinches": "pinch",
    "dash": "dash", "dashes": "dash",
    "clove": "clove", "cloves": "clove",
    "slice": "slice", "slices": "slice",
    "piece": "piece", "pieces": "piece",
    "can": "can", "cans": "can",
    "pkg": "package", "package": "package", "packages": "package",
    "bunch": "bunch", "bunches": "bunch",
    "sprig": "sprig", "sprigs": "sprig",
    "stalk": "stalk", "stalks": "stalk",
    "head": "head", "heads": "head",
    "sheet": "sheet", "sheets": "sheet",
    "strip": "strip", "strips": "strip",
    "handful": "handful", "handfuls": "handful",
})

# Sorted unique set of canonical unit strings (useful for spaCy EntityRuler)
CANONICAL_UNITS: FrozenSet[str] = frozenset(UNIT_ALIASES.values())


# ---------------------------------------------------------------------------
# Modifier vocabulary
# ---------------------------------------------------------------------------

# Single-word modifiers — stored as frozenset for O(1) lookup
MODIFIERS: FrozenSet[str] = frozenset({
    # prep
    "chopped", "diced", "minced", "sliced", "grated", "shredded",
    "crushed", "mashed", "pureed", "blended", "crumbled",
    "julienned", "halved", "quartered", "ground",
    # state
    "fresh", "dried", "frozen", "canned", "packed", "drained",
    "rinsed", "toasted", "roasted", "cooked", "raw", "softened",
    "melted", "chilled", "peeled", "deveined", "trimmed",
    "pitted", "seeded", "zested",
    # size
    "large", "medium", "small", "extra-large",
    # cut
    "boneless", "skinless", "bone-in", "skin-on",
    # quality
    "heaping", "scant", "level",
    "unsalted", "salted", "low-sodium",
    "reduced-fat", "full-fat", "whole", "skim", "nonfat",
})

# Multi-word modifiers — must be checked before single-word ones (longest match)
MULTI_WORD_MODIFIERS: FrozenSet[str] = frozenset({
    "finely chopped", "roughly chopped", "coarsely chopped",
    "thinly sliced", "thickly sliced",
    "lightly beaten", "room temperature",
    "at room temperature",
    "extra virgin",         # for olive oil
    "freshly ground",
    "freshly squeezed",
})


# ---------------------------------------------------------------------------
# Allergen keyword mapping — keyword → allergen group
# ---------------------------------------------------------------------------

ALLERGEN_KEYWORDS: MappingProxyType[str, AllergenGroup] = MappingProxyType({
    # milk / dairy
    "milk": AllergenGroup.MILK,
    "dairy": AllergenGroup.MILK,
    "cream": AllergenGroup.MILK,
    "butter": AllergenGroup.MILK,
    "cheese": AllergenGroup.MILK,
    "yogurt": AllergenGroup.MILK,
    "whey": AllergenGroup.MILK,
    "casein": AllergenGroup.MILK,
    # eggs
    "egg": AllergenGroup.EGGS,
    "eggs": AllergenGroup.EGGS,
    "albumin": AllergenGroup.EGGS,
    "mayonnaise": AllergenGroup.EGGS,
    # fish
    "fish": AllergenGroup.FISH,
    "salmon": AllergenGroup.FISH,
    "tuna": AllergenGroup.FISH,
    "cod": AllergenGroup.FISH,
    "tilapia": AllergenGroup.FISH,
    "anchovies": AllergenGroup.FISH,
    "anchovie": AllergenGroup.FISH,
    # shellfish
    "shellfish": AllergenGroup.SHELLFISH,
    "shrimp": AllergenGroup.SHELLFISH,
    "prawn": AllergenGroup.SHELLFISH,
    "crab": AllergenGroup.SHELLFISH,
    "lobster": AllergenGroup.SHELLFISH,
    "clam": AllergenGroup.SHELLFISH,
    "oyster": AllergenGroup.SHELLFISH,
    "scallop": AllergenGroup.SHELLFISH,
    # tree nuts
    "tree nut": AllergenGroup.TREE_NUTS,
    "almond": AllergenGroup.TREE_NUTS,
    "cashew": AllergenGroup.TREE_NUTS,
    "walnut": AllergenGroup.TREE_NUTS,
    "pecan": AllergenGroup.TREE_NUTS,
    "pistachio": AllergenGroup.TREE_NUTS,
    "macadamia": AllergenGroup.TREE_NUTS,
    "hazelnut": AllergenGroup.TREE_NUTS,
    "coconut": AllergenGroup.TREE_NUTS,
    # peanuts
    "peanut": AllergenGroup.PEANUTS,
    "peanuts": AllergenGroup.PEANUTS,
    "groundnut": AllergenGroup.PEANUTS,
    # wheat / gluten
    "wheat": AllergenGroup.WHEAT,
    "gluten": AllergenGroup.WHEAT,
    "flour": AllergenGroup.WHEAT,
    "bread": AllergenGroup.WHEAT,
    "pasta": AllergenGroup.WHEAT,
    "semolina": AllergenGroup.WHEAT,
    "bulgur": AllergenGroup.WHEAT,
    "farro": AllergenGroup.WHEAT,
    # soy
    "soy": AllergenGroup.SOYBEANS,
    "soybean": AllergenGroup.SOYBEANS,
    "tofu": AllergenGroup.SOYBEANS,
    "tempeh": AllergenGroup.SOYBEANS,
    "edamame": AllergenGroup.SOYBEANS,
    "miso": AllergenGroup.SOYBEANS,
    # sesame
    "sesame": AllergenGroup.SESAME,
    "tahini": AllergenGroup.SESAME,
})


# ---------------------------------------------------------------------------
# Cooking method vocabulary
# ---------------------------------------------------------------------------

COOKING_METHODS: FrozenSet[str] = frozenset(m.value for m in CookingMethod) | frozenset({
    # verb forms not covered by the enum values
    "baked", "boiled", "broiled", "fried", "deep-fried", "pan-fried",
    "grilled", "poached", "roasted", "sautéed", "sauteed",
    "simmered", "smoked", "steamed", "stir-fried",
    "blanched", "braised", "caramelised", "caramelized",
    "charred", "cured", "flambéed", "flambeed", "marinated",
    "pressure-cooked", "slow-cooked",
})


# ---------------------------------------------------------------------------
# Difficulty thresholds
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DifficultyThreshold:
    label:            str
    max_steps:        int
    max_time_minutes: int


DIFFICULTY_THRESHOLDS: MappingProxyType[str, DifficultyThreshold] = MappingProxyType({
    "easy":   DifficultyThreshold("easy",   max_steps=5,   max_time_minutes=30),
    "medium": DifficultyThreshold("medium", max_steps=10,  max_time_minutes=60),
    "hard":   DifficultyThreshold("hard",   max_steps=999, max_time_minutes=999),
})


# ---------------------------------------------------------------------------
# SEO tags
# ---------------------------------------------------------------------------

SEO_TAGS: FrozenSet[str] = frozenset(t.value for t in SEOTag)


# ---------------------------------------------------------------------------
# NLP stop words to strip from ingredient names
# ---------------------------------------------------------------------------

STOP_WORDS: FrozenSet[str] = frozenset({
    "a", "an", "the", "of", "with", "and", "or", "for",
    "about", "into", "in", "on", "at", "to", "from",
    "some", "any", "each", "per",
})

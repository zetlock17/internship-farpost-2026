import json
from functools import lru_cache
from typing import Any

from app.core.config import GEO_JSON_PATH


@lru_cache(maxsize=1)
def get_geo_data() -> Any:
    with GEO_JSON_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)

#!/usr/bin/env python3
"""
tripadvisor_client.py

Simple TripAdvisor Content API client for:
 - Location Details
 - Location Photos
 - Location Reviews
 - Location Search (Find Search)
 - Nearby Search

Usage:
    export TRIPADVISOR_API_KEY="your_key_here"
    python tripadvisor_client.py details --location-id 12345
    python tripadvisor_client.py photos --location-id 12345 --limit 5
    python tripadvisor_client.py reviews --location-id 12345
    python tripadvisor_client.py search --q "Eiffel Tower"
    python tripadvisor_client.py nearby --latlong "48.8584,2.2945" --radius 1 --radius-unit km
"""

from __future__ import annotations
import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import Optional, Dict, Any, List
import argparse
import sys

BASE_URL = "https://api.content.tripadvisor.com/api/v1"
DEFAULT_TIMEOUT = 10.0  # seconds


class TripAdvisorError(Exception):
    pass


class TripAdvisorClient:
    def __init__(self, api_key: Optional[str] = None, timeout: float = DEFAULT_TIMEOUT, max_retries: int = 3):
        self.api_key = api_key or os.getenv("TRIPADVISOR_API_KEY")
        if not self.api_key:
            raise TripAdvisorError("TripAdvisor API key is required. Set TRIPADVISOR_API_KEY env var or pass api_key.")

        self.timeout = timeout
        self.session = requests.Session()
        retries = Retry(
            total=max_retries,
            backoff_factor=0.5,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=["GET", "POST"]
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retries))

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if params is None:
            params = {}
        params["key"] = self.api_key

        url = f"{BASE_URL}{path}"
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
        except requests.RequestException as e:
            raise TripAdvisorError(f"Request failed: {e}") from e

        # Helpful debug / error
        if resp.status_code >= 400:
            # Try to include response text for debugging
            try:
                err_json = resp.json()
            except Exception:
                err_json = resp.text
            raise TripAdvisorError(f"HTTP {resp.status_code} for {url} - {err_json}")

        try:
            return resp.json()
        except ValueError:
            raise TripAdvisorError("Failed to decode JSON response")

    # 1. Location Details
    def get_location_details(self, location_id: int, language: str = "en", currency: str = "USD") -> Dict[str, Any]:
        """
        GET /location/{locationId}/details
        """
        path = f"/location/{location_id}/details"
        params = {"language": language, "currency": currency}
        return self._get(path, params)

    # 2. Location Photos
    def get_location_photos(
        self,
        location_id: int,
        language: str = "en",
        limit: Optional[int] = 5,
        offset: Optional[int] = 0,
        source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        GET /location/{locationId}/photos
        source: comma-separated values from 'Expert', 'Management', 'Traveler'
        """
        path = f"/location/{location_id}/photos"
        params: Dict[str, Any] = {"language": language}
        if limit is not None:
            params["limit"] = limit
        if offset:
            params["offset"] = offset
        if source:
            params["source"] = source
        return self._get(path, params)

    # 3. Location Reviews
    def get_location_reviews(
        self,
        location_id: int,
        language: str = "en",
        limit: Optional[int] = 5,
        offset: Optional[int] = 0,
    ) -> Dict[str, Any]:
        """
        GET /location/{locationId}/reviews
        """
        path = f"/location/{location_id}/reviews"
        params: Dict[str, Any] = {"language": language}
        if limit is not None:
            params["limit"] = limit
        if offset:
            params["offset"] = offset
        return self._get(path, params)

    # 4. Find / Location Search
    def search_locations(
        self,
        search_query: str,
        category: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        latlong: Optional[str] = None,
        radius: Optional[float] = None,
        radius_unit: str = "km",
        language: str = "en",
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        GET /location/search
        category options: "hotels", "attractions", "restaurants", "geos"
        latlong format: "<lat>,<long>"
        """
        path = "/location/search"
        params: Dict[str, Any] = {"searchQuery": search_query, "language": language, "limit": limit}
        if category:
            params["category"] = category
        if phone:
            params["phone"] = phone
        if address:
            params["address"] = address
        if latlong:
            params["latLong"] = latlong
        if radius is not None:
            params["radius"] = radius
            params["radiusUnit"] = radius_unit
        return self._get(path, params)

    # 5. Nearby Search
    def nearby_search(
        self,
        latlong: str,
        category: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        radius: Optional[float] = None,
        radius_unit: str = "km",
        language: str = "en",
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        GET /location/nearby_search
        latlong required: "<lat>,<long>"
        """
        path = "/location/nearby_search"
        params: Dict[str, Any] = {"latLong": latlong, "language": language, "limit": limit}
        if category:
            params["category"] = category
        if phone:
            params["phone"] = phone
        if address:
            params["address"] = address
        if radius is not None:
            params["radius"] = radius
            params["radiusUnit"] = radius_unit
        return self._get(path, params)


# -------------------------
# CLI helper (basic)
# -------------------------
def _print_json(obj: Any):
    import json
    print(json.dumps(obj, indent=2, ensure_ascii=False))


def main(argv: Optional[List[str]] = None):
    parser = argparse.ArgumentParser(prog="tripadvisor_client.py")
    parser.add_argument("--api-key", help="TripAdvisor partner API key (overrides env TRIPADVISOR_API_KEY)")

    sub = parser.add_subparsers(dest="cmd", required=True)

    p_details = sub.add_parser("details", help="Get location details")
    p_details.add_argument("--location-id", type=int, required=True)
    p_details.add_argument("--language", default="en")
    p_details.add_argument("--currency", default="USD")

    p_photos = sub.add_parser("photos", help="Get location photos")
    p_photos.add_argument("--location-id", type=int, required=True)
    p_photos.add_argument("--limit", type=int, default=5)
    p_photos.add_argument("--offset", type=int, default=0)
    p_photos.add_argument("--source", default=None)
    p_photos.add_argument("--language", default="en")

    p_reviews = sub.add_parser("reviews", help="Get location reviews")
    p_reviews.add_argument("--location-id", type=int, required=True)
    p_reviews.add_argument("--limit", type=int, default=5)
    p_reviews.add_argument("--offset", type=int, default=0)
    p_reviews.add_argument("--language", default="en")

    p_search = sub.add_parser("search", help="Search locations")
    p_search.add_argument("--q", "--search-query", dest="q", required=True)
    p_search.add_argument("--category", default=None)
    p_search.add_argument("--latlong", default=None)
    p_search.add_argument("--radius", type=float, default=None)
    p_search.add_argument("--radius-unit", default="km")
    p_search.add_argument("--limit", type=int, default=10)
    p_search.add_argument("--language", default="en")

    p_nearby = sub.add_parser("nearby", help="Nearby search")
    p_nearby.add_argument("--latlong", required=True)
    p_nearby.add_argument("--category", default=None)
    p_nearby.add_argument("--radius", type=float, default=None)
    p_nearby.add_argument("--radius-unit", default="km")
    p_nearby.add_argument("--limit", type=int, default=10)
    p_nearby.add_argument("--language", default="en")

    args = parser.parse_args(argv)

    client = TripAdvisorClient(api_key=args.api_key if args.api_key else None)

    try:
        if args.cmd == "details":
            resp = client.get_location_details(args.location_id, language=args.language, currency=args.currency)
            _print_json(resp)
        elif args.cmd == "photos":
            resp = client.get_location_photos(
                args.location_id, language=args.language, limit=args.limit, offset=args.offset, source=args.source
            )
            _print_json(resp)
        elif args.cmd == "reviews":
            resp = client.get_location_reviews(args.location_id, language=args.language, limit=args.limit, offset=args.offset)
            _print_json(resp)
        elif args.cmd == "search":
            resp = client.search_locations(
                search_query=args.q,
                category=args.category,
                latlong=args.latlong,
                radius=args.radius,
                radius_unit=args.radius_unit,
                language=args.language,
                limit=args.limit,
            )
            _print_json(resp)
        elif args.cmd == "nearby":
            resp = client.nearby_search(
                latlong=args.latlong,
                category=args.category,
                radius=args.radius,
                radius_unit=args.radius_unit,
                language=args.language,
                limit=args.limit,
            )
            _print_json(resp)
        else:
            parser.print_help()
    except TripAdvisorError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()

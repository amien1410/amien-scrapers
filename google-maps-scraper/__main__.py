"""
    Main module for google_maps_scraper.
"""

import logging

import click

from collector import GoogleMapsDataCollector

url = "https://www.google.com/maps/search/dokter+gigi/@-3.2475527,114.5765124,13z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDcyMy4wIKXMDSoASAFQAw%3D%3D"
full = True


logging.basicConfig(level=logging.INFO)


# @click.command()
# @click.option(
#     "--url",
#     help="The URL of the page for which to return Google Maps results for.",
#     required=True,
# )
# @click.option(
#     "--full",
#     help="An option to scrape the full page of results. Might take a while.",
#     required=False,
# )
def scrape_google_maps(url: str, full: bool | None = False) -> None:
    collector = GoogleMapsDataCollector()
    collector.save_maps_data(url, full)


if __name__ == "__main__":
    scrape_google_maps(url, full)
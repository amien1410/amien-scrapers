import os
import csv
import requests
import json
import logging
from urllib.parse import urlencode
from bs4 import BeautifulSoup
import concurrent.futures
from dataclasses import dataclass, field, fields, asdict

API_KEY = ""

with open("config.json", "r") as config_file:
    config = json.load(config_file)
    API_KEY = config["api_key"]


## Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def scrape_search_results(keyword, location, page_number, retries=3):
    url = f"https://www.capterra.com/{keyword}/?page={page_number+1}"
    tries = 0
    success = False
    
    while tries <= retries and not success:
        try:
            scrapeops_proxy_url = get_scrapeops_url(url, location=location)
            response = requests.get(scrapeops_proxy_url)
            logger.info(f"Recieved [{response.status_code}] from: {url}")
            if response.status_code != 200:
                raise Exception(f"Failed request, Status Code {response.status_code}")
                
            soup = BeautifulSoup(response.text, "html.parser")
            card_stack = soup.select_one("div[data-testid='product-card-stack']")
            div_cards = card_stack.find_all("div", recursive=False)


            for div_card in div_cards:
                name = div_card.find("h2").text
                href = div_card.find("a").get("href")
                link = f"https://www.capterra.com{href}"

                rating_info = div_card.find("span", class_="sb type-40 star-rating-label").text.split("(")
                rating = float(rating_info[0])
                review_count = int(rating_info[1].replace(")", ""))
                
                search_data = {
                    "name": name,
                    "url": link,
                    "rating": rating,
                    "review_count": review_count
                }
                print(search_data)


            logger.info(f"Successfully parsed data from: {url}")
            success = True        
                    
        except Exception as e:
            logger.error(f"An error occurred while processing page {url}: {e}, retries left {retries-tries}")
            tries+=1

    if not success:
        raise Exception(f"Max Retries exceeded: {retries}")




def start_scrape(keyword, pages, location, retries=3):
    for page in range(pages):
        scrape_search_results(keyword, page, retries=retries)


if __name__ == "__main__":

    MAX_RETRIES = 3
    MAX_THREADS = 5
    PAGES = 3
    LOCATION = "us"

    logger.info(f"Crawl starting...")

    ## INPUT ---> List of keywords to scrape
    keyword_list = ["cryptocurrency-exchange-software"]
    aggregate_files = []

    ## Job Processes
    for keyword in keyword_list:
        filename = keyword.replace(" ", "-")

        start_scrape(keyword, PAGES, LOCATION, retries=MAX_RETRIES)
        aggregate_files.append(f"{filename}.csv")
    logger.info(f"Crawl complete.")

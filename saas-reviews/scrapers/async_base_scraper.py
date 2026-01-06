# src/scrapers/async_base_scraper.py
import asyncio
import logging
from pathlib import Path
from src.utils import ensure_outputs_dir
import os, sys, random
from datetime import date
from typing import List, Dict, Optional
from playwright.async_api import async_playwright, Page
from src.utils import parse_date_fuzzy, ensure_outputs_dir
import logging
import pathlib

log = logging.getLogger("async_scraper")

class AsyncBaseScraper:
    def __init__(self, company: str, start_date: date, end_date: date, product_url: Optional[str]=None, headless: bool=True, debug: bool=False):
        self.company = company
        self.start_date = start_date
        self.end_date = end_date
        self.product_url = product_url
        self.headless = headless
        self.debug = debug

    async def _maybe_accept_cookies(self, page):
        selectors = [
            "button:has-text('Accept all')",
            "button:has-text('Accept All')",
            "button:has-text('Accept')",
            "[aria-label*='Accept']",
            "button#onetrust-accept-btn-handler",
        ]
        for sel in selectors:
            try:
                btn = await page.query_selector(sel)
                if btn:
                    await btn.click()
                    await page.wait_for_timeout(500)
                    break
            except Exception:
                continue

    async def _try_load_more(self, page, max_clicks=3):
        for _ in range(max_clicks):
            try:
                btn = await page.query_selector("button:has-text('Load more'), button:has-text('Show more')")
                if not btn:
                    return
                if await btn.is_disabled():
                    return
                await btn.click()
                await page.wait_for_timeout(1200)
            except Exception:
                return

    async def _debug_dump(self, page, tag):
        if not self.debug:
            return
        out = ensure_outputs_dir()
        html_path = out / f"debug_{self.__class__.__name__.lower()}_{tag}.html"
        png_path = out / f"debug_{self.__class__.__name__.lower()}_{tag}.png"
        try:
            await page.screenshot(path=str(png_path), full_page=True)
        except Exception:
            pass
        try:
            html = await page.content()
            html_path.write_text(html, encoding="utf-8", errors="ignore")
        except Exception:
            pass

    async def scrape(self):
        from playwright.async_api import async_playwright
        try:
            async with async_playwright() as p:
                # Prefer Edge on Windows if available; fallback to Chromium
                # Build random-ish desktop Chrome UA fragment
                major = random.randint(118, 125)
                ua = f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{major}.0.0.0 Safari/537.36"
                proxy_server = os.getenv("PLAYWRIGHT_PROXY") or os.getenv("HTTP_PROXY") or os.getenv("HTTPS_PROXY")
                launch_kwargs = {"headless": self.headless}
                if proxy_server:
                    launch_kwargs["proxy"] = {"server": proxy_server}
                # Prefer Edge channel if available
                try:
                    browser = await p.chromium.launch(channel="msedge", **launch_kwargs)
                except Exception:
                    browser = await p.chromium.launch(**launch_kwargs)
                extra_headers = {
                    "Accept-Language": "en-US,en;q=0.9",
                    "Upgrade-Insecure-Requests": "1",
                }
                context = await browser.new_context(
                    viewport={"width": 1366, "height": 900},
                    user_agent=ua,
                    locale="en-US",
                    extra_http_headers=extra_headers,
                )
                page = await context.new_page()

                product_page = await self.find_product_page(page)
                if not product_page:
                    raise RuntimeError("Product page not found")

                await page.goto(product_page, wait_until="load")
                await self._maybe_accept_cookies(page)
                # Scroll to trigger lazy content
                await page.wait_for_timeout(800)
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                await page.wait_for_timeout(600)
                await self._try_load_more(page, max_clicks=2)
                await self._debug_dump(page, "loaded")

                items = await self.extract_reviews_from_page(page)
                await context.close()
                await browser.close()
                return items
        except NotImplementedError as ne:
            raise RuntimeError("Playwright cannot spawn subprocesses in this environment. Run in Python 3.12 or Linux/WSL.") from ne
        except Exception as e:
            raise RuntimeError(f"Unexpected scraper failure: {e}") from e

    async def find_product_page(self, page: Page) -> Optional[str]:
        raise NotImplementedError

    async def extract_reviews_from_page(self, page: Page) -> List[Dict]:
        raise NotImplementedError

    async def go_to_next_page(self, page: Page) -> bool:
        selectors = [
            'button:has-text("Load more")',
            'button:has-text("Load More")',
            'a[rel="next"]',
            'button:has-text("Next")',
            'button:has-text("See more")'
        ]
        for sel in selectors:
            try:
                el = await page.query_selector(sel)
                if el:
                    await el.click()
                    await page.wait_for_load_state("networkidle")
                    return True
            except Exception:
                continue
        return False

    async def should_stop_paging(self, page: Page, reviews_on_page: List[Dict]) -> bool:
        any_in_range = False
        any_parsable = False
        for r in reviews_on_page:
            d = None
            if isinstance(r.get("date"), str):
                d = parse_date_fuzzy(r["date"])
            elif r.get("date"):
                d = r.get("date")
            if d:
                any_parsable = True
                if self.start_date <= d <= self.end_date:
                    any_in_range = True
        if any_parsable and not any_in_range:
            older = True
            for r in reviews_on_page:
                if r.get("date"):
                    pd = parse_date_fuzzy(r.get("date"))
                    if pd and pd >= self.start_date:
                        older = False
                        break
            if older:
                return True
        return False

    async def accept_cookies(self, page: Page) -> bool:
        selectors = [
            "#onetrust-accept-btn-handler",
            "button#onetrust-accept-btn-handler",
            "button:has-text('Accept All')",
            "button:has-text('Accept all')",
            "button:has-text('Accept Cookies')",
            "button:has-text('I accept')",
            "button:has-text('I agree')",
            "button:has-text('Allow all')",
            "[data-testid='uc-accept-all-button']",
            "button[aria-label='Accept cookies']",
            "button:has-text('Got it')",
        ]
        for sel in selectors:
            try:
                el = await page.query_selector(sel)
                if el:
                    await el.click()
                    await page.wait_for_timeout(300)
                    return True
            except Exception:
                continue
        return False

    async def debug_dump(self, page: Page, label: str) -> None:
        try:
            ensure_outputs_dir()
            name = self.__class__.__name__.lower().replace("scraper", "")
            base = pathlib.Path("outputs") / f"debug_{name}_{label}"
            html = await page.content()
            base.with_suffix(".html").write_text(html, encoding="utf-8")
            await page.screenshot(path=str(base.with_suffix(".png")))
        except Exception:
            pass

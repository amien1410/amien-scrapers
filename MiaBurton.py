import requests
import json
import time

URL = "https://api.miaburton.com/graphql"

HEADERS = {
    "accept": "*/*",
    "content-type": "application/json",
    "country": "ID",
    "currency": "IDR",
    "language": "en",
    "origin": "https://miaburton.com",
    "referer": "https://miaburton.com/en/eyeglasses/women/2",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    # ⚠️ must be fresh
    "miaburton-req-seed": "1769352256226",
    "miaburton-req-signature": "5c71f284ff9fc7e33035c30d43565025426d7e9157cde46a8b16dc983a1c944f",
    "miaburton-req-timestamp": "1769352256226",
}

QUERY = """
query ProductsAndSiblings($input: ProductFilterInput!) {
  productsAndSiblings(input: $input) {
    items {
      sku
      brand {
        name
        slug
        uuid
      }
      category {
        name
      }
      siblings {
        name
        price
        discountPrice
        polarized
        blueFilter
        photochromic
        uuid
        slug
        sku
        modelName
        modelCode
        modelAlias
        colorCode
        colorAlias
        shape
        canonical
        bestSeller
        outOfStock
        vmEnabled
        vmAuglioEnabled
        identifier3d
        clipOn
        smart
        fastShipping
        patterns
        frameColors
        images {
          resolutions
          path
          name
        }
        translations {
          path
          language {
            label
          }
        }
      }
    }
    pageInfo {
      count
      pages
      curr
      prev
      next
    }
  }
}
"""

def fetch_all_products():
    all_items = []
    page = 1

    while True:
        payload = {
            "operationName": "ProductsAndSiblings",
            "variables": {
                "input": {
                    "filter": {
                        "category": {"eq": "eyeglasses"},
                        "gender": {"in": ["F", "U"]}
                    },
                    "perPage": 24,
                    "page": page,
                    "sort": {
                        "by": "publishingDate",
                        "direction": "DESC"
                    }
                }
            },
            "query": QUERY
        }

        resp = requests.post(URL, headers=HEADERS, json=payload)
        resp.raise_for_status()
        data = resp.json()

        # 🚨 GraphQL error handling
        if "errors" in data:
            print("GraphQL errors:")
            print(json.dumps(data["errors"], indent=2))
            break

        result = data.get("data", {}).get("productsAndSiblings")

        if result is None:
            print("productsAndSiblings is null. Full response:")
            print(json.dumps(data, indent=2))
            break

        items = result["items"]
        page_info = result["pageInfo"]

        print(f"Page {page}/{page_info['pages']} → {len(items)} items")
        print(items)
        all_items.extend(items)

        if not page_info["next"]:
            break

        page += 1
        time.sleep(0.4)

    return all_items


if __name__ == "__main__":
    products = fetch_all_products()
    print(f"\nFetched total: {len(products)} products")

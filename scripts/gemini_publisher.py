#!/usr/bin/env python3
"""Generate a validated review JSON file with Gemini.

Usage: GEMINI_API_KEY=... python scripts/gemini_publisher.py --topic "best CRM for startups"
The script writes to data/generated-reviews/ and intentionally leaves commit/push
as an explicit Git step for CI or a maintainer review.
"""
import argparse, json, os, pathlib, urllib.request

SCHEMA = {"slug": "string", "name": "string", "category": "B2B SaaS|Finance|Marketing|Developer tools", "tagline": "string", "description": "string", "score": "number 0-10", "bestFor": "string", "pros": ["string"], "cons": ["string"], "features": ["string"], "affiliateUrl": "string", "updated": "YYYY-MM-DD"}

def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--topic", required=True); args = parser.parse_args()
    key = os.environ.get("GEMINI_API_KEY")
    if not key: raise SystemExit("GEMINI_API_KEY is required")
    prompt = f"Create an independent software review for: {args.topic}. Return only valid JSON matching this schema: {json.dumps(SCHEMA)}. Do not invent user quotes, certifications, or unsupported pricing. Use today's date for updated."
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}}).encode()
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response: payload = json.load(response)
    review = json.loads(payload["candidates"][0]["content"]["parts"][0]["text"])
    required = ["slug", "name", "category", "description", "score", "pros", "cons", "features", "affiliateUrl"]
    if any(field not in review for field in required) or not 0 <= float(review["score"]) <= 10: raise ValueError("Gemini response failed review schema")
    output = pathlib.Path("data/generated-reviews") / f"{review['slug']}.json"; output.parent.mkdir(parents=True, exist_ok=True); output.write_text(json.dumps(review, indent=2) + "\n")
    print(f"Wrote {output}. Review it, then commit the file through your normal workflow.")

if __name__ == "__main__": main()

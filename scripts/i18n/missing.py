#!/usr/bin/env python3
"""List translatable strings in site-content.json that have no entry in
src/content/translations/es.json yet (run after editing the English content)."""
import json, os, re
ROOT = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(ROOT, "../../src/content")
skip = set(json.load(open(f"{CONTENT}/translations/skip-keys.json")))
es = json.load(open(f"{CONTENT}/translations/es.json"))
missing = {}
def walk(x, key=None):
    if isinstance(x, dict):
        for k, v in x.items(): walk(v, k)
    elif isinstance(x, list):
        for v in x: walk(v, key)
    elif isinstance(x, str) and key not in skip:
        t = x.strip()
        if re.search(r"[A-Za-z]{2,}", t) and not re.fullmatch(r"(https?://\S+|www\.\S+|\S+@\S+\.\S+)", t) and x not in es:
            missing.setdefault(x, key)
walk(json.load(open(f"{CONTENT}/site-content.json")))
print(f"{len(missing)} strings without a Spanish translation")
for s, k in missing.items(): print(f"  [{k}] {s[:120]!r}")

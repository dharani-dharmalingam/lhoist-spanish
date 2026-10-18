#!/usr/bin/env python3
"""Extract the unique translatable strings from site-content.json.

Writes scripts/i18n/work/strings.json: [{"id": n, "en": "...", "keys": [...]}]
Strings under the keys in src/content/translations/skip-keys.json are identifiers or
proper names used by code logic and stay English.
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "../../src/content/site-content.json")
OUT = os.path.join(ROOT, "work")

SKIP_KEYS = set(json.load(open(os.path.join(ROOT, "../../src/content/translations/skip-keys.json"))))

def translatable(s: str) -> bool:
    t = s.strip()
    if not re.search(r"[A-Za-z]{2,}", t):
        return False
    if re.fullmatch(r"(https?://\S+|www\.\S+|\S+@\S+\.\S+)", t):
        return False
    return True

strings = {}
def walk(x, key=None):
    if isinstance(x, dict):
        for k, v in x.items():
            walk(v, k)
    elif isinstance(x, list):
        for v in x:
            walk(v, key)
    elif isinstance(x, str):
        if key in SKIP_KEYS or not translatable(x):
            return
        e = strings.setdefault(x, [])
        if key not in e and len(e) < 3:
            e.append(key)

walk(json.load(open(SRC)))
os.makedirs(OUT, exist_ok=True)
items = [{"id": i, "en": s, "keys": k} for i, (s, k) in enumerate(strings.items())]
json.dump(items, open(os.path.join(OUT, "strings.json"), "w"), ensure_ascii=False, indent=1)
print(len(items), "unique strings,", sum(len(i["en"].split()) for i in items), "words")

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

SRC = Path(__file__).with_name('satuinbox_conversation.messages.training.json')
OUT = Path(__file__).with_name('similarity_groups_top20.json')
MIN_GROUP_SIZE = 20
TOP_N = 20


def normalize(text: str) -> str:
    text = unicodedata.normalize('NFKC', text).lower()
    text = re.sub(r'https?://\S+', ' <url> ', text)
    text = re.sub(r'\d+', '<num>', text)
    text = re.sub(r'[^\w\s<>]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def stem_key(text: str) -> str:
    norm = normalize(text)
    tokens = [t for t in norm.split() if t not in {'ya', 'yg', 'dan', 'di', 'ke', 'dari', 'untuk', 'min', 'kak', 'mohon'}]
    return ' '.join(tokens[:8])


def grouped_texts(data: dict[str, list[dict[str, str]]], wanted_type: str):
    counts = defaultdict(int)
    samples = defaultdict(list)
    variants = defaultdict(lambda: defaultdict(int))
    for cid, msgs in data.items():
        joined = '\n'.join(m['value'] for m in msgs if m['type'] == wanted_type).strip()
        if not joined:
            continue
        key = stem_key(joined)
        if not key:
            continue
        counts[key] += 1
        variants[key][normalize(joined)] += 1
        if len(samples[key]) < 3:
            samples[key].append({'conversationId': cid, 'text': joined})
    groups = []
    for key, count in counts.items():
        if count < MIN_GROUP_SIZE:
            continue
        top_variants = sorted(variants[key].items(), key=lambda x: (-x[1], -len(x[0]), x[0]))[:10]
        groups.append({
            'canonical': key,
            'size': count,
            'variants': [{'normalized': norm, 'count': c} for norm, c in top_variants],
            'samples': samples[key],
        })
    groups.sort(key=lambda g: (-g['size'], -len(g['canonical']), g['canonical']))
    return groups[:TOP_N]


def build_report(data: dict[str, list[dict[str, str]]]):
    return {
        'inbound': grouped_texts(data, 'inbound'),
        'outbound': grouped_texts(data, 'outbound'),
    }


def main():
    data = json.loads(SRC.read_text(encoding='utf-8'))
    report = build_report(data)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(OUT)
    print('inbound_groups', len(report['inbound']))
    print('outbound_groups', len(report['outbound']))
    assert 'inbound' in report and 'outbound' in report


if __name__ == '__main__':
    main()

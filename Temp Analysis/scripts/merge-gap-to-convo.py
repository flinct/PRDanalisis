"""
Merge 13 truly new Gap test cases into Conversation.tsv.
Renumbers from SIX-Convo-Gap-XX to SIX-Convo-713..725.
Updates summary header counts.
"""

import re

BASE = r"C:/Users/MyBook SAGA 12/Desktop/PRDanalisis"
TSV = f"{BASE}/Test/conversation/Conversation.tsv"
GAP = f"{BASE}/Test/conversation/Conversation_gap_supplement.tsv"

# ── 13 truly new test case IDs (not already in Conversation.tsv)
NEW_IDS = {
    "SIX-Convo-Gap-17": "SIX-Convo-713",  # Message status progression
    "SIX-Convo-Gap-19": "SIX-Convo-714",  # Ctrl+V paste image
    "SIX-Convo-Gap-25": "SIX-Convo-715",  # Unread badge real-time
    "SIX-Convo-Gap-27": "SIX-Convo-716",  # Tab switch <1s
    "SIX-Convo-Gap-33": "SIX-Convo-717",  # Quick search sidebar
    "SIX-Convo-Gap-35": "SIX-Convo-718",  # Failure retry on load
    "SIX-Convo-Gap-36": "SIX-Convo-719",  # Get Conversation FIFO
    "SIX-Convo-Gap-39": "SIX-Convo-720",  # Max active warning
    "SIX-Convo-Gap-41": "SIX-Convo-721",  # Invalid batch reset
    "SIX-Convo-Gap-42": "SIX-Convo-722",  # Failed fetch retry
    "SIX-Convo-Gap-45": "SIX-Convo-723",  # Switch Send-as identity
    "SIX-Convo-Gap-46": "SIX-Convo-724",  # Quoted reply preview
    "SIX-Convo-Gap-48": "SIX-Convo-725",  # Resolved→new session
}

# Read existing TSV
with open(TSV, "r", encoding="utf-8") as f:
    lines = f.readlines()

# ── Update header (lines 0-6)
# Line 0: total cases = 712 -> 725
lines[0] = lines[0].replace("712", "725", 1)

# Line 4: Need to test counts
# DEV: 371 -> 384, STAGGING: 545 -> 558, PROD: 385 -> 398
lines[4] = lines[4].replace("\t371\t", "\t384\t")
lines[4] = lines[4].replace("\t545\t", "\t558\t")
lines[4] = lines[4].replace("\t385\t", "\t398\t")

print(f"Header updated: {lines[0].strip()}")
print(f"Need to test: {lines[4].strip()}")

# ── Parse Gap file into blocks
with open(GAP, "r", encoding="utf-8") as f:
    gap_lines = f.readlines()

gap_blocks = {}
current_id = None
current_block = []
in_block = False

for line in gap_lines:
    if line.startswith("Test ID\t"):
        if current_id and current_block:
            gap_blocks[current_id] = current_block
        parts = line.split("\t")
        current_id = parts[1] if len(parts) > 1 else None
        current_block = [line]
        in_block = True
    elif in_block:
        current_block.append(line)

if current_id and current_block:
    gap_blocks[current_id] = current_block

print(f"Found {len(gap_blocks)} blocks in Gap file")

# ── Append new blocks
# Remove trailing blank lines
while lines and lines[-1].strip() == "":
    lines.pop()

added = 0
for gap_id in sorted(NEW_IDS.keys(), key=lambda x: int(x.split("-")[-1])):
    new_id = NEW_IDS[gap_id]
    if gap_id in gap_blocks:
        for line in gap_blocks[gap_id]:
            lines.append(line.replace(gap_id, new_id))
        lines.append("\n")
        added += 1
        print(f"  + Added {new_id} (from {gap_id})")
    else:
        print(f"  ! SKIP {gap_id}: not found in Gap file")

# ── Write back
with open(TSV, "w", encoding="utf-8") as f:
    f.writelines(lines)

print(f"\n✅ Done! Added {added} new test cases.")
print(f"Total lines: {len(lines)}")
print(f"Conversation.tsv now has 725 test cases (SIX-Convo-001 to 725)")

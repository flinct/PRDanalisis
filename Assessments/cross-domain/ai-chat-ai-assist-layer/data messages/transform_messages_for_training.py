import json
from pathlib import Path

import ijson

INPUT_PATH = Path(__file__).with_name('satuinbox_conversation.messages (2).json')
FIXED_INPUT_PATH = Path(__file__).with_name('satuinbox_conversation.messages.fixed.json')
OUTPUT_PATH = Path(__file__).with_name('satuinbox_conversation.messages.training.json')


def ensure_closed_array(input_path: Path, fixed_path: Path) -> Path:
    with input_path.open('rb') as src:
        with fixed_path.open('wb') as dst:
            while True:
                chunk = src.read(1024 * 1024)
                if not chunk:
                    break
                dst.write(chunk)
            src.seek(0, 2)
            if src.tell() == 0:
                raise ValueError('input file empty')
            src.seek(-1, 2)
            if src.read(1) != b']':
                dst.write(b'\n]')
    return fixed_path


def map_type(sender_type: str | None) -> str | None:
    sender_type = (sender_type or '').strip().lower()
    if sender_type == 'client':
        return 'inbound'
    if sender_type in {'account_channel', 'accountchannel'}:
        return 'outbound'
    return None


def iter_conversations(path: Path):
    with path.open('rb') as f:
        for conversation in ijson.items(f, 'item'):
            conversation_id = conversation.get('_id', {}).get('$oid')
            if not conversation_id:
                continue
            cleaned = []
            for message in conversation.get('messages', []):
                value = message.get('content')
                mapped_type = map_type(message.get('sender', {}).get('type'))
                if not value or not mapped_type:
                    continue
                cleaned.append({'value': value, 'type': mapped_type})
            if cleaned:
                yield conversation_id, cleaned


def write_output(input_path: Path, output_path: Path):
    total = 0
    with output_path.open('w', encoding='utf-8', newline='\n') as out:
        out.write('{\n')
        first = True
        for conversation_id, cleaned in iter_conversations(input_path):
            if not first:
                out.write(',\n')
            first = False
            json.dump(conversation_id, out, ensure_ascii=False)
            out.write(': ')
            json.dump(cleaned, out, ensure_ascii=False)
            total += 1
        out.write('\n}\n')
    return total


if __name__ == '__main__':
    fixed_input = ensure_closed_array(INPUT_PATH, FIXED_INPUT_PATH)
    count = write_output(fixed_input, OUTPUT_PATH)
    print(f'written {count} conversations to {OUTPUT_PATH}')
    print(f'fixed source copy: {fixed_input}')

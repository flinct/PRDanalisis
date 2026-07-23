from pathlib import Path
import json

from openpyxl import Workbook
from openpyxl.styles import Alignment

SRC = Path(__file__).with_name('satuinbox_conversation.messages.training.json')
OUT = Path(__file__).with_name('satuinbox_conversation.messages.training.xlsx')


def main():
    data = json.loads(SRC.read_text(encoding='utf-8'))
    wb = Workbook(write_only=True)
    ws = wb.create_sheet('training')
    ws.append(['conversationId', 'inbound', 'outbound'])

    for cid, msgs in data.items():
        inbound = '\n'.join(m['value'] for m in msgs if m['type'] == 'inbound')
        outbound = '\n'.join(m['value'] for m in msgs if m['type'] == 'outbound')
        ws.append([cid, inbound, outbound])

    wb.save(OUT)
    print(OUT)
    print('rows:', len(data))
    assert len(data) == 56525


if __name__ == '__main__':
    main()

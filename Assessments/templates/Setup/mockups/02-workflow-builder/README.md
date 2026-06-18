## Variant: Workflow Builder

### Design stance
Dashboard fokus ke orchestration visual: lane, sequence, gate, freeze, dan routing.

### Key choices
- Layout: mode selector kiri, sequence builder di tengah, inspector kanan
- Emphasis: workflow-first
- Interaction: switch Full/Fast lane, klik step untuk lihat detail inspector

### Trade-offs
- Strong at: sangat jelas untuk memahami urutan agent dan freeze policy
- Weak at: kurang ringkas untuk audit artifact/policy dibanding control center

### Best for
- User yang mau dashboard jadi pusat orchestration
- Scenario ketika workflow sering berubah dan perlu divisualisasikan

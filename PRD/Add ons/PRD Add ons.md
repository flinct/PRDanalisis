# **Product Requirement Document (PRD)**

**Feature:** Add Ons

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Define the requirements for Channel Add-ons feature in SatuInbox V2, enabling corporate customers to expand their omnichannel communication capabilities by adding multiple communication channels with subscription-based pricing model for Indonesian businesses. |
| Key Capabilities | Multi-channel management (WhatsApp API, Instagram, Facebook Messenger, Telegram, Email), multiple account/number support per channel, channel configuration wizard, connection health monitoring, automated billing integration, channel authentication, prorated billing for mid-month additions, channel usage analytics, and channel limit management. |
| Outcome | Enable customers to scale their omnichannel presence across multiple platforms, provide flexible channel expansion, ensure seamless integration with corporate billing system, deliver transparent pricing, and maintain reliable multi-channel operations. |

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Corporate customers cannot easily add new communication channels to expand their omnichannel reach. | Limits business growth, reduces customer touchpoints, and creates competitive disadvantage. |
| 2 | No clear pricing structure for adding multiple channels and accounts/numbers. | Customer confusion, difficulty in budget planning, and hesitation to expand channels. |
| 3 | Lack of support for multiple WhatsApp numbers or social media accounts per company. | Restricts companies with multiple brands, regions, or departments from using separate channels. |
| 4 | No automated billing integration when channels are added mid-month. | Manual billing adjustments, delayed charges, and billing inaccuracies. |
| 5 | Missing channel health monitoring across multiple accounts. | Undetected connection issues, service disruptions, and poor customer experience. |
| 6 | Complex channel setup process discourages customers from adding new channels. | Low channel adoption, reduced platform value, and missed revenue opportunities. |
| 7 | No visibility into per-channel usage and ROI. | Difficulty justifying channel costs and optimizing communication strategy. |

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Enable seamless channel expansion | ≥60% of corporate customers add at least 1 additional channel within 3 months |  |
| Drive add-on revenue growth |  |  |
| Simplify channel setup process | ≥90% of channel additions completed without support assistance |  |
| Ensure billing accuracy for add-ons | 100% of channel additions reflected correctly in next invoice |  |
| Maintain channel reliability | ≥99.5% channel uptime across all add-on channels |  |
| Improve channel adoption rate | Average 2 channels per corporate customer |  |

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As a Corporate Admin, I want to see available channel add-ons so that I can choose which channels to add. | \- Add-ons page lists all available channels\- Each channel shows: Name, icon, price, description\- "Add Channel" button for each\- Currently active channels marked as "Active"\- Pricing displayed: "Rp XXX/bulan per akun/nomor" |
| US-2 | P0 | As a Corporate Admin, I want to add a WhatsApp API number so that I can communicate via WhatsApp. | \- Click "Add WhatsApp API"\- Before confirmation modal shows: \- "Biaya prorata bulan ini: Rp \[X\]" \- "Biaya bulanan mulai bulan depan: Rp \[Y\]" \- Calculation explanation \- Total impact on next invoice\- "I understand" checkbox required\- Confirm and Cancel buttons\- Enter phone number to connect\- Authentication wizard (QR code or API key)\- Connection verification\- Billing confirmation: "Biaya Rp250.000/bulan akan ditambahkan ke tagihan Anda"\- Prorated amount shown for current month\- Number appears in channel list upon activation |
| US-3 | P0 | As a Corporate Admin, I want to remove a channel so that I stop being charged. | \- "Remove" button on each channel\- Confirmation modal: "Yakin ingin menghapus channel ini?"\- Warning: "Data percakapan akan diarsipkan"\- Credit notification: "Kredit Rp \[X\] akan diterapkan pada invoice berikutnya"\- Channel immediately deactivated\- Data archived (not deleted) |
| US-4 | P0 | As a Corporate Admin, I want to see all my active channels in one dashboard so that I can manage them easily. | \- Channel management dashboard\- Card/tile view for each channel\- Shows: Channel type, account/number, status, monthly cost\- Status indicators: Connected, Disconnected, Error\- Quick actions: Configure, View Stats, Remove\- Total monthly cost displayed |
| US-5 | P1 | As a Corporate Admin, I want to monitor channel health so that I know if there are connection issues. | \- Connection status for each channel: \- Green: Connected \- Red: Disconnected\- Last sync time displayed- Error messages if disconnected\- "Reconnect" button for failed channels\- Email alert for disconnections |
| US-6 | P1 | As a Corporate Admin, I want to see usage statistics per channel so that I can measure ROI. | \- Usage dashboard per channel showing: \- Messages sent/received \- Active conversations\<br\> \- Response time \- Customer satisfaction (if available)\- Date range filter\- Compare channels side-by-side\- Export usage report |
| US-7 | P1 | As a Corporate Admin, I want to configure channel-specific settings so that I customize behavior. | \- Settings page per channel\- Settings include: \- Channel name/label \- Auto-reply messages \- Business hours \- Assigned agents/teams \- Notification preferences\- Save and Cancel buttons\- Changes apply immediately |
| US-8 | P1 | As a Corporate Admin, I want to receive notifications when channels are added/removed so that I'm aware of billing changes. | \- Email notification immediately upon: \- Channel addition (with cost impact) \- Channel removal (with credit info) \- Channel authentication failure\- In-app notification\- Notification shows prorated/credited amount |
| US-9 | P2 | As a Corporate Admin, I want to set spending limits on channel add-ons so that I control costs. | \- Set maximum channels per type\- Set overall channel budget\- Block channel additions when limit reached\- Alert at 80%, 100% of budget\- Override mechanism with approval |
| US-10 | P2 | As a Corporate Admin, I want to transfer channels between departments so that I can reorganize the structure. | \- "Transfer Channel" option\- Select target department/team\- Billing remains at company level\- Conversation history maintained\- Agents reassigned automatically\- Notification sent to affected teams |

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| Channel Types & Pricing | **WhatsApp API:**\- Price: IDR 250,000 per number/month\- Multiple numbers supported\- Official WhatsApp Business API**Instagram:**\- Price: IDR 100,000 per account/month\- Requires Instagram Business account\- DM management enabled**Telegram:**\- Price: IDR 100,000 per bot/month\- Bot API integration\- Group chat support**Email:**\- Price: IDR 150,000 per domain/month\- SMTP/IMAP configuration\- Custom domain email **Facebook Messenger:**\- Price: IDR 100,000 per page/month\- Requires Facebook Business Page\- Messenger API integration |
| Channel Addition Flow | **1\. Channel Selection:**\- Browse available channels\- View pricing and features\- Click "Add Channel"**2\. Authentication:**\- Channel-specific auth method\- OAuth for Instagram\- OAuth for WhatsApp\- SMTP credentials for email**3\. Configuration:**\- Set channel name/label\- Assign to team/department\- Configure basic settings**4\. Billing Confirmation:**\- Show prorated charge\- Show recurring monthly charge\- Require explicit confirmation**5\. Activation:**\- Verify connection\- Send test message\- Activate channel\- Add to billing |
| Multiple Channels Support | \- Unlimited channels per type\- Each channel billed separately\- Unique identifier per channel\- Clear naming/labeling system\- Channel grouping by type or department |
| Channel Authentication | **WhatsApp API:**\- Method: Phone number \+ API key from Meta\- Verification via SMS or call**Instagram:**\- OAuth 2.0 with Instagram\- Requires Instagram Business account\- Facebook Page connection required**Facebook Messenger:**\- OAuth 2.0 with Facebook\- Page admin permissions required\- Webhook subscription **Telegram:**\- BotFather token\- Bot username registration\- Webhook configuration**Email:**\- SMTP server, port, credentials\- IMAP for receiving\- SPF/DKIM validation |
| Billing Integration | \- Automatic addition to billing system\- Prorated charge calculated for current month\- Full charge starting next month\- Appears as line item in next invoice\- Channel removal: Prorated credit issued\- No refunds for current month after activation |
| Channel Management | \- Enable/Disable toggle (without removing)\- Edit channel settings\- Rename/relabel channels\- Reassign to different teams\- View connection history\- Force reconnection\- Remove channel (with confirmation) |
| Channel Health Monitoring | \- Real-time connection status\- Uptime percentage tracking\- Last successful message timestamp\- Error rate monitoring\- Automated reconnection attempts\- Alert system for failures |
| Usage Analytics | Per channel metrics:\- Messages sent (by agent)\- Messages received\- Broadcast campaigns\- Active conversations\- Average response time\- Customer satisfaction scores\- Conversation resolution rate |
| Channel Limits & Controls | \- Default: No limits (unlimited channels)\- Admin can set limits: \- Max channels per type \- Overall channel budget \- Approval workflow for expensive channels\- Warning system before limit reached |

## **6 | Non-Functional Requirements**

| Category | Details |
| :---: | :---: |
|  |  |

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| Channel Add-ons Marketplace | Grid/card view of available channels:\- Channel logo/icon\- Channel name\- Short description\- Pricing (large, prominent)\- "Add Channel" button\- "Active" badge if already added\- "Popular" badge for common channels | Dashboard → Add-ons → Browse channels → Click "Add Channel" → Start setup wizard |
| Channel Setup Wizard | Multi-step wizard:**Step 1:** Choose authentication method**Step 2:** Authenticate (OAuth/API key)**Step 3:** Configure channel settings**Step 4:** Review and confirm billing**Step 5:** Test connection\- Progress bar at top\- "Back" and "Next" navigation\- "Save Draft" option\- Help tooltips at each step | Add-ons → Select channel → Step 1 → Authenticate → Configure → Confirm → Test → Done |
| Channel Management Dashboard | List/grid view of active channels:\- Channel cards with: \- Type icon and name \- Connection status (colored badge) \- Account/number identifier \- Monthly cost \- Quick actions menu (⋮)\- Filter: By type, status\- Search: By name or account\- Bulk actions: Select multiple, disable/remove\- Total monthly cost at top | Dashboard → Channels → View all → Select channel → Manage/Configure |
| Channel Detail View | Detailed view of single channel:\- Header: Channel name, status, cost\- Tabs: \- Overview: Key metrics \- Settings: Configuration \- Usage: Analytics and charts \- History: Connection logs \- Billing: Cost breakdown\- "Reconnect" button if disconnected\- "Remove Channel" button (bottom, danger color) | Channel list → Click channel → View tabs → Edit settings → Save |
| Billing Confirmation Modal | Modal dialog before adding channel:\- Clear pricing breakdown: \- Prorated charge this month: IDR X \- Monthly charge from next month: IDR Y\- Calculation explanation\- Impact on next invoice\- Checkbox: "I understand the billing"\- "Cancel" and "Confirm & Add Channel" buttons | Setup wizard → Final step → Billing modal → Confirm → Channel added |
| Channel Health Dashboard | Real-time monitoring view:\- List of all channels with status\- Uptime percentage (last 30 days)\- Last message sent/received time\- Error count and rate\- "Reconnect All" button\- Auto-refresh every 30 seconds\- Export health report | Dashboard → Channel Health → View all statuses → Investigate issues → Reconnect |
| Usage Analytics View | Per-channel analytics:\- Date range selector\- Key metrics cards: \- Total messages \- Active conversations \- Response time \- Customer satisfaction\- Charts: \- Message volume over time (line chart) \- Messages by agent (bar chart) \- Conversation outcomes (pie chart)\- "Export Report" button | Channel detail → Usage tab → Select date range → View charts → Export |

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Authentication Failed | Show error reason; Allow retry; Link to help docs | "Autentikasi gagal: \[alasan\]. Pastikan kredensial benar dan coba lagi." |
| Channel Already Connected | Prevent duplicate; Show existing channel; Offer to reconnect | "Channel ini sudah terhubung. Lihat channel aktif atau hubungkan akun/nomor lain." |
| Insufficient Permissions | Explain required permissions; Guide to grant access | "Izin tidak mencukupi. Pastikan akun memiliki izin: \[daftar izin\]. Panduan: \[link\]" |
| Connection Test Failed | Show error details; Offer troubleshooting steps; Allow manual override | "Koneksi gagal: \[detail error\]. Coba: 1\) Periksa koneksi internet, 2\) Verifikasi kredensial, 3\) Hubungi support." |
| Billing Limit Reached | Block addition; Show current limit; Offer limit increase request | "Limit channel tercapai. Limit saat ini: \[X\] channels. Ajukan peningkatan limit atau hapus channel yang tidak digunakan." |
| Channel Disconnected | Auto-retry connection; Send alert; Show reconnect button | "Channel terputus. Mencoba koneksi ulang otomatis. Klik 'Reconnect' untuk coba manual." |
| Rate Limit Exceeded | Queue requests; Show retry time; Explain rate limits | "Terlalu banyak permintaan. Platform \[channel\] membatasi \[X\] request/menit. Coba lagi dalam \[Y\] detik." |
| Platform API Error | Log error; Retry automatically; Show generic message to user | "Terjadi error dari \[platform\]. Tim kami sudah diberitahu. Coba lagi dalam beberapa menit." |
| Token Expired | Prompt re-authentication; Send email reminder; Block channel until fixed | "Token channel kadaluarsa. Silakan autentikasi ulang untuk melanjutkan layanan." |
| Channel Removal Failed | Log error; Offer manual removal request; Contact support | "Gagal menghapus channel. Permintaan Anda telah dicatat. Tim support akan memproses dalam 24 jam." |

## **9 | Dependencies & Risks**

| Dependency | Details |
| :---: | :---: |
|  |  |

| Risk | Probability | Impact | Mitigation |
| :---: | :---: | :---: | :---: |
|  |  |  |  |

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| :---: | :---: | :---: |
|  |  |  |

## **11 | Future Considerations**

| Consideration | Priority |
| :---: | :---: |
|  |  |

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| :---: | :---: | :---: |
|  |  |  |


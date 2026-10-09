# Benchmark Eksternal — Register/Signup + Onboarding Platform Omnichannel CS

**Scope:** Intercom, Zendesk, Freshchat (Freshworks), Qiscus, Crisp
**Tujuan:** Benchmark skema register + onboarding untuk Assessment Report audit SatuInbox.
**Tanggal riset:** mengacu konten live/terkini 2024–2026. Tiap klaim disertai URL sumber.
**Catatan metodologi:** Field signup yang butuh render JS/behind-gate ditandai jika tidak bisa diverifikasi langsung. "Tidak terkonfirmasi" = tidak ditemukan sumber eksplisit, bukan berarti fitur tidak ada.

---

## 1. Intercom

### Signup flow
- Entry: halaman signup menampilkan **"Start your 14-day free trial, no credit card needed"**. Field awal minimal: **company email**, atau **Continue with Google** (SSO/social Google). Setelah email, lanjut ke langkah berikutnya (form bertahap). Sumber: https://www.intercom.com/signup?solution_id=28
- **Card upfront: TIDAK.** Pricing page eksplisit "14-day cardless free trial". Sumber: https://www.intercom.com/pricing
- Email verification: **tidak terkonfirmasi** detail langkahnya (signup flow di-gate oleh JS; field lanjutan seperti password/nama/workspace tidak bisa diverifikasi langsung). Google sign-in tersedia sebagai alternatif tanpa password.
- Self-serve: **Ya** (Start free trial langsung). Jalur sales juga ada ("Get a demo" / Contact sales) untuk plan Advanced/Expert. Sumber: https://www.intercom.com/pricing

### Onboarding flow
- Intercom punya alur onboarding web bertahap (workspace setup, install Messenger/widget, invite team, product tour). Rekaman flow per-screen tersedia pihak ketiga (Pageflows, versi Aug 2025). Sumber: https://pageflows.com/post/desktop-web/onboarding/intercom/
- Langkah eksak internal (urutan wizard) **tidak terkonfirmasi** dari sumber resmi teks; flow produk mencakup install widget, inviting people, building a chatbot (daftar flow Pageflows). Sumber: https://pageflows.com/post/desktop-web/onboarding/intercom/

### Free trial / freemium
- **14-day free trial** (Intercom helpdesk + Fin AI Agent included). Tidak ada free-forever tier untuk helpdesk; model berbayar per seat + Fin $0.99/outcome. Sumber: https://www.intercom.com/pricing
- Program **Early Stage**: diskon ~93% untuk startup (<$10M raised, ≤15 karyawan) — bukan free tier, tapi harga sangat murah. Sumber: https://www.intercom.com/pricing
- Setelah trial habis: harus pilih paid plan (Essential/Advanced/Expert). **Detail auto-expire tidak terkonfirmasi** teksnya.

### Multi-tenancy / workspace
- Konsep **workspace** per akun; plan Expert mendukung **Multibrand Messenger / Help Center** (multi-brand dalam satu workspace). SSO & identity management di tier Expert. Sumber: https://www.intercom.com/pricing
- Jumlah workspace per akun: **tidak terkonfirmasi**.

### SSO
- **Google sign-in** saat signup (semua). **SSO/SAML (identity management)** sebagai fitur enterprise di plan **Expert**. Sumber: https://www.intercom.com/signup?solution_id=28 ; https://www.intercom.com/pricing

---

## 2. Zendesk

### Signup flow
- Halaman register: **"Start your free 14-day trial — 100% free. No credit card required."** Wizard **7 langkah (Step 1 of 7)**:
  1. Work email
  2. First name, Last name
  3. Phone number
  4. Company
  5. Jumlah karyawan (1-9 / 10-49 / 50-99 / 100-249 / 250-499 / 500-999 / 1000-4999 / 5000+)
  6. Pilih **subdomain** (`.zendesk.com`)
  7. Buat **password**

  Sumber: https://www.zendesk.com/register/
- **Card upfront: TIDAK** ("No credit card required"). Sumber: https://www.zendesk.com/register/
- Self-serve: **Ya**. Jalur sales/demo juga tersedia.
- Email verification: **tidak terkonfirmasi** eksplisit di halaman register (subdomain + password dibuat di wizard; verifikasi email kemungkinan bagian setup — tidak ada sumber teks yang mengonfirmasi).

### Onboarding flow
- Setelah signup, trial menjalankan **automatic setup** dengan **setup wizard** untuk menghubungkan email support. Opsi connect: Gmail, Microsoft Exchange, email forwarding, atau alamat Zendesk support. Sumber: https://support.zendesk.com/hc/en-us/articles/9104802071578-Zendesk-Suite-trial-Connect-your-support-email
- Automatic setup dimulai begitu sign up free trial; menggunakan AI untuk setup otomatis akun. Sumber (sama): https://support.zendesk.com/hc/en-us/articles/9104802071578-Zendesk-Suite-trial-Connect-your-support-email

### Free trial / freemium
- **14-day free trial**, full-featured (akses tangani tiket nyata, bangun help center). Sumber (pihak ketiga, expert-verified): https://www.eesel.ai/blog/zendesk-trial
- Trial default pada Zendesk Suite; bisa switch plan (Team/Growth/Professional/Enterprise/Enterprise Plus) selama evaluasi. Sumber: https://support.zendesk.com/hc/en-us/articles/9104802071578-Zendesk-Suite-trial-Connect-your-support-email
- **Tidak ada free-forever tier** untuk Suite. Setelah trial: pilih paid plan. **Detail auto-expire tidak terkonfirmasi** teks resmi.

### Multi-tenancy / workspace
- Model berbasis **subdomain** (satu akun = satu instance `*.zendesk.com` dipilih saat signup). Sumber: https://www.zendesk.com/register/
- Multi-brand didukung di tier atas (umum untuk Zendesk Suite), namun jumlah akun/subdomain per user: **tidak terkonfirmasi** dari sumber yang diekstrak.

### SSO
- **Tidak terkonfirmasi** dari halaman register (password-based signup). Zendesk mendukung SSO/SAML di tier enterprise (pengetahuan umum), tapi **tidak diverifikasi** sumber dalam riset ini → tandai tidak terkonfirmasi.

---

## 3. Freshchat (Freshworks)

### Signup flow
- Halaman signup Freshchat "Sign up for a 14-day free trial". Field form: **First name, Last name, Work email, Company name, Organization size** (dropdown: 1-10 … 10000+), **Phone** (opsional), + checkbox Terms & marketing. Pilihan **data center location** (United States / India / Europe / Australia). Sumber: https://www.freshworks.com/live-chat-software/signup/
- **Card upfront: TIDAK** — "No credit card required. No strings attached." Sumber: https://www.freshworks.com/live-chat-software/signup/
- Self-serve: **Ya**.
- Email verification / SSO / Google saat signup: **tidak terkonfirmasi** (form resmi tidak menampilkan tombol Google; verifikasi email tidak dinyatakan eksplisit di halaman).

### Onboarding flow
- Setelah signup, setup mencakup **create widgets** dan **web chat topics (live chat)** untuk menghubungkan channel chat. Sumber: https://crmsupport.freshworks.com/support/solutions/articles/50000011578-create-widgets ; https://crmsupport.freshworks.com/support/solutions/articles/50000011579-create-web-chat-topics-live-chat-
- Urutan wizard guided eksak: **tidak terkonfirmasi** dari sumber resmi teks.

### Free trial / freemium
- Signup memulai **14-day free trial pada plan Pro**. Bisa switch antar plan selama trial untuk evaluasi. Sumber: https://crmsupport.freshworks.com/support/solutions/articles/50000004525-how-does-the-14-day-free-trial-work-
- **Setelah trial:** wajib pindah ke paid plan **atau downgrade ke plan Free** (Freshchat punya **Free tier**). Sumber (sama): https://crmsupport.freshworks.com/support/solutions/articles/50000004525-how-does-the-14-day-free-trial-work-
- Tiers Freshchat: Free, Growth, Pro, Enterprise. Sumber (sama).

### Multi-tenancy / workspace
- Akun terikat ke **organization** + **data center region** dipilih saat signup. Sumber: https://www.freshworks.com/live-chat-software/signup/
- Jumlah workspace/akun per user: **tidak terkonfirmasi**. Catatan: Freshchat kini bagian dari **Freshdesk Omni** (rebranding CSS) — signup Omni mengarah ke suite. Sumber: https://crmsupport.freshworks.com/support/solutions/articles/50000004525-how-does-the-14-day-free-trial-work-

### SSO
- **Tidak terkonfirmasi** saat signup self-serve. (SSO tersedia di tier atas secara umum, tidak diverifikasi di riset ini.)

---

## 4. Qiscus (Omnichannel Chat)

### Signup flow
- **Register** di https://omnichannel.qiscus.com/register lalu lengkapi informasi akun. Sumber: https://documentation.qiscus.com/omnichannel-chat/getting-started
- **Email verification: YA** — setelah daftar, user menerima email verifikasi dan **wajib verifikasi email** sebelum lanjut. Sumber (sama): https://documentation.qiscus.com/omnichannel-chat/getting-started
- Field eksak signup (password/social/Google): **tidak terkonfirmasi** (halaman register di-gate oleh WAF, tidak bisa diekstrak; docs hanya menyebut "complete the required account information").
- Self-serve: **Ya** (register + trial langsung). Jalur enterprise/quote juga ada (produk tertentu quote-only). Sumber: https://www.eesel.ai/blog/qiscus-pricing
- **Card upfront: TIDAK untuk memulai** — kartu (credit/debit) dikelola di menu **Payment Method** untuk **recurring billing**, bukan prasyarat trial. Sumber: https://documentation.qiscus.com/omnichannel-chat/subscriptions

### Onboarding flow (Quick Start resmi)
1. Register di Qiscus Omnichannel website + lengkapi info akun.
2. Verifikasi email.
3. Login ke **Qiscus Omnichannel dashboard**.
4. Buka halaman **Integration** (tombol **+** di kiri) → tab **Qiscus Widget** → copy snippet → paste ke HTML website (connect first channel = widget).

   Sumber: https://documentation.qiscus.com/omnichannel-chat/getting-started
- Channel tambahan (WhatsApp, FB Messenger, LINE, Telegram, dll) lewat **Channel Integration**. Fitur: agent management, filtering per channel, chatbot integration. Sumber: https://documentation.qiscus.com/omnichannel-chat ; https://documentation.qiscus.com/omnichannel-chat/getting-started

### Free trial / freemium
- **14-day trial period untuk user baru.** Sumber: https://documentation.qiscus.com/omnichannel-chat/subscriptions
- **Tidak ada free-forever tier** terkonfirmasi; model = paid plans. Kelola subscription di Settings → Subscription (Current Subscription, Usage Activity, Top Up MAU, Upgrade Plan by currency). Sumber (sama).
- Setelah trial: upgrade ke paid plan. Billing per **currency** (USD tersedia). Sumber: https://documentation.qiscus.com/omnichannel-chat/subscriptions ; https://www.eesel.ai/blog/qiscus-pricing

### Multi-tenancy / workspace & model billing
- Billing bertingkat **3 "meter"**: (1) **plan** (jumlah agent seats + ceiling **MAU/Monthly Active Users**), (2) **overage** (extra agents/extra MAU), (3) **WhatsApp usage** per-message (pass-through dari Meta). Sumber: https://www.eesel.ai/blog/qiscus-pricing
- Omnichannel Chat punya **3 tier berbayar** dengan harga publik dalam USD (Agents + MAU + Analytics + Agent Co-Pilot sebagai pembeda); sebagian produk Qiscus lain quote-only. Angka tier eksak: lihat sumber (tabel). Sumber: https://www.eesel.ai/blog/qiscus-pricing ; https://www.qiscus.com/pricing
- Billing Email: admin bisa tambah hingga **3 alamat email** billing. Sumber: https://documentation.qiscus.com/omnichannel-chat/subscriptions
- Jumlah workspace per akun: **tidak terkonfirmasi**.

### SSO
- **Tidak terkonfirmasi** (tidak ada sumber eksplisit SSO/Google pada signup Qiscus Omnichannel).

---

## 5. Crisp

### Signup flow
- Signup page (Step 1/3): **"Create your free Crisp account"**. Opsi: **Sign up with Google** (SSO/social), atau email. Field email: **First name, Last name, Email, Password** + checkbox Terms/Privacy + marketing opt-in + **hCaptcha**. Sumber: https://app.crisp.chat/initiate/signup/
- **Card upfront: TIDAK** — Free plan "Forever" tanpa kartu; trial plan berbayar juga tanpa kartu di depan. Sumber: https://crisp.chat/en/pricing/
- Multi-step: signup "Step 1/3" → menyiratkan wizard 3 langkah (langkah 2-3 kemungkinan setup workspace/website; **isi eksak tidak terkonfirmasi**). Sumber: https://app.crisp.chat/initiate/signup/
- Self-serve: **Ya** (fully self-serve, termasuk Free plan).
- Email verification: **tidak terkonfirmasi** eksplisit.

### Onboarding flow
- Onboarding web Crisp (rekaman flow pihak ketiga, versi Jan 2024) mencakup langkah seperti **Adding a website** (connect widget pertama), install plugin, creating knowledge base/article. Sumber: https://pageflows.com/post/desktop-web/onboarding/crisp/
- Core onboarding: pasang **website chat widget** (di plan Free sekalipun), shared inbox, mobile apps, chat SDKs, e-commerce integration (Shopify/WooCommerce/dll). Sumber: https://crisp.chat/en/pricing/
- Urutan wizard internal eksak: **tidak terkonfirmasi** dari sumber resmi teks.

### Free trial / freemium
- **Free plan "Forever"** (gratis selamanya): **2 seats**, website chat widget, shared inbox, mobile apps, chat SDKs, contact form, e-commerce integrations, push notifications. Sumber: https://crisp.chat/en/pricing/
- **Trial 14 hari** untuk plan berbayar — "Try any plan for free for 14 days" (full access ke semua fitur). Sumber: https://crisp.chat/en/pricing/
- Tier berbayar: **Mini** ($45/bulan per workspace, 4 seats), plus tier lebih tinggi. Sumber: https://crisp.chat/en/pricing/
- Setelah trial: tetap bisa turun ke Free plan atau pilih paid. **Detail auto-expire tidak terkonfirmasi** teks.

### Multi-tenancy / workspace
- Model **per-workspace**: harga berbayar dihitung **"per month, per workspace"** (mis. Mini $45/workspace). Mengindikasikan **satu akun bisa punya banyak workspace**, masing-masing ditagih terpisah. Sumber: https://crisp.chat/en/pricing/
- Satu workspace bisa menampung beberapa website (fitur "Adding a website" / multi-website). Sumber: https://pageflows.com/post/desktop-web/onboarding/crisp/

### SSO
- **Google sign-up** tersedia saat signup. SSO/SAML enterprise: **tidak terkonfirmasi** dari sumber yang diekstrak. Sumber: https://app.crisp.chat/initiate/signup/

---

## Tabel Komparasi Ringkas

| Platform | Signup fields | Email verify | Card upfront | Free trial | Onboarding wizard | SSO |
|---|---|---|---|---|---|---|
| **Intercom** | Company email **atau** Google; field lanjutan tidak terkonfirmasi | Tidak terkonfirmasi | **Tidak** (cardless) | 14 hari (helpdesk + Fin); no free-forever; Early Stage 93% off | Ya (workspace setup, install widget, invite, product tour) — langkah eksak tidak terkonfirmasi | Google di signup; SAML/SSO di tier **Expert** |
| **Zendesk** | Work email, nama, phone, company, size, **subdomain**, password (7 langkah) | Tidak terkonfirmasi | **Tidak** (no CC) | 14 hari, full-featured; no free-forever | **Ya** — automatic setup + setup wizard (connect email) | Tidak terkonfirmasi (riset ini) |
| **Freshchat** | First/Last name, work email, company, org size, phone, data-center region | Tidak terkonfirmasi | **Tidak** (no CC) | 14 hari trial **Pro** → downgrade ke **Free tier**; ada freemium | Setup widget + web chat topics; urutan eksak tidak terkonfirmasi | Tidak terkonfirmasi |
| **Qiscus** | Register + "required account information"; field eksak tidak terkonfirmasi | **Ya** (wajib verifikasi email) | **Tidak** di awal (card utk recurring billing) | 14 hari; no free-forever; billing MAU + agent + WA usage | **Ya** (Quick Start: register → verify → login → integrate widget) | Tidak terkonfirmasi |
| **Crisp** | First/Last name, email, password **atau** Google; +hCaptcha (Step 1/3) | Tidak terkonfirmasi | **Tidak** (Free forever + 14d trial) | **Free plan "Forever" (2 seats)** + 14 hari trial plan berbayar | Ya (add website/widget, KB) — langkah eksak tidak terkonfirmasi | Google di signup; SAML/SSO tidak terkonfirmasi |

---

## Sumber (daftar URL)

- Intercom pricing (cardless trial, tiers, Early Stage, multibrand/SSO Expert): https://www.intercom.com/pricing
- Intercom signup (email/Google, no card): https://www.intercom.com/signup?solution_id=28
- Intercom onboarding flow (pihak ketiga, Aug 2025): https://pageflows.com/post/desktop-web/onboarding/intercom/
- Zendesk register (7-step wizard, no CC, subdomain): https://www.zendesk.com/register/
- Zendesk free trial (14 hari): https://www.zendesk.com/free-trial/
- Zendesk Suite trial — automatic setup + setup wizard (connect email): https://support.zendesk.com/hc/en-us/articles/9104802071578-Zendesk-Suite-trial-Connect-your-support-email
- Zendesk trial guide (pihak ketiga, expert-verified, Jan 2026): https://www.eesel.ai/blog/zendesk-trial
- Freshchat signup (fields, no CC, data center): https://www.freshworks.com/live-chat-software/signup/
- Freshchat 14-day trial (Pro → Free): https://crmsupport.freshworks.com/support/solutions/articles/50000004525-how-does-the-14-day-free-trial-work-
- Freshchat create widgets: https://crmsupport.freshworks.com/support/solutions/articles/50000011578-create-widgets
- Freshchat web chat topics: https://crmsupport.freshworks.com/support/solutions/articles/50000011579-create-web-chat-topics-live-chat-
- Qiscus Getting Started (register, email verify, widget integrate): https://documentation.qiscus.com/omnichannel-chat/getting-started
- Qiscus Subscriptions (14-day trial, MAU, payment method, billing email): https://documentation.qiscus.com/omnichannel-chat/subscriptions
- Qiscus Omnichannel intro (fitur, channels): https://documentation.qiscus.com/omnichannel-chat
- Qiscus pricing analysis (3 meter billing, USD tiers, pihak ketiga, Aug 2026): https://www.eesel.ai/blog/qiscus-pricing
- Qiscus pricing (resmi): https://www.qiscus.com/pricing
- Crisp signup (Google/email, fields, hCaptcha, Step 1/3): https://app.crisp.chat/initiate/signup/
- Crisp pricing (Free forever 2 seats, 14-day any-plan trial, per-workspace): https://crisp.chat/en/pricing/
- Crisp onboarding flow (pihak ketiga, Jan 2024): https://pageflows.com/post/desktop-web/onboarding/crisp/

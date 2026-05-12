# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Live Chat Widget  
**Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2025-10-09 | Yusril Ibnu | Initial PRD per standard. |
| v1.1 | 2026-02-06 | Yusril Ibnu | Updated scope to match current UI. Added Launcher Image upload and Custom Color Picker. Clarified Widget Account topics for routing and tagging. |

## **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Provide a configurable Live Chat Widget that can be embedded on websites and connects to the unified inbox for real time customer support. |
| Scope | Configuration includes appearance, welcome message, form widget, widget account, installation snippet, and developer methods. |

| In Scope | Out of Scope |
| ----- | ----- |
| Appearance settings including launcher icon or launcher image, color palette and custom color picker, header logo, and preferences toggles. | Advanced theme builder. |
| Form Widget builder with default fields and custom fields. | Multi language widget UI. |
| Widget Account list and edit for topics and sub topics used for tagging and routing. | CMS plugins and marketplace distribution. |
| Installation snippet with copy to clipboard. | Complex workflow builder for routing. |
| Developer methods for session data and widget controls. | Deep analytics dashboard in widget settings. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Teams need a quick way to deploy a branded web chat without heavy setup. | Slow adoption and inconsistent support experience. |
| PS-002 | Lack of visitor context and routing signals reduces triage efficiency. | Longer handle time and misrouting. |
| PS-003 | Branding controls are limited when launcher is icon only and color is preset only. | Brand mismatch and lower conversion on chat entry. |

## **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Reduce time to first working widget. | 90% of new tenants can install and see widget live in 5 minutes or less. |
| OKR-002 | Improve pre chat context collection. | 70% of enabled widgets use at least 1 form field beyond default. |
| OKR-003 | Improve branding flexibility without complexity. | 60% of enabled widgets customize launcher using image or custom color within 30 days. |
| OKR-004 | Improve routing readiness. | 80% of widget accounts have at least 1 Topic set for tagging and routing. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable or disable Live Chat Widget so I can control whether the widget is active on my website. | 1\. Given I am on tab "Penampilan", When I toggle "Enable Widget Live Chat" to ON, Then the widget becomes active for all installed sites using my widget account. 2\. Given I am on tab "Penampilan", When I toggle "Enable Widget Live Chat" to OFF, Then the widget does not render on the website and visitors cannot start chat. 3\. Given the widget is OFF, When a developer loads the website, Then no chat launcher is shown and no chat open action works. |
| US-002 | P0 | As an Admin, I want to set welcome messages so visitors see the correct greeting before chatting. | 1\. Given I am on tab "Penampilan", When I edit "Greeting message" and "Introduction message", Then "Preview" updates immediately. 2\. Given I click "Simpan & Aktifkan", When I reload settings page, Then the saved messages persist. 3\. Given I exceed the character limit, When I try to save, Then I see an inline error and saving is blocked. |
| US-003 | P0 | As an Admin, I want to customize widget theme and branding so the widget matches my brand. | 1\. Given I am on section "Tema & Merek Widget", When I choose a launcher icon, Then the launcher in "Preview" updates. 2\. Given I upload a header logo in "Logo Tajuk", When I click "Simpan & Aktifkan", Then the header logo is shown in the widget header. 3\. Given I enable "Whitelabel widget", When I click "Simpan & Aktifkan", Then the widget does not show Satuinbox branding. |
| US-004 | P0 | As an Admin, I want to upload a launcher image so I can use a custom button image for Live Chat. | 1\. Given I am on section "Tema & Merek Widget", When I select launcher type "Gambar", Then I can upload an image file and see it in "Preview". 2\. Given I upload a non square image, When it renders in the launcher, Then the aspect ratio is preserved and the image is not stretched. 3\. Given I upload an unsupported file type, When I click upload, Then I see an error and the old launcher remains unchanged. |
| US-005 | P0 | As an Admin, I want a custom color picker so I can choose any color beyond the palette. | 1\. Given I am on section "Pilih warna untuk mengganti tema", When I pick a color using "Custom color", Then the theme color updates in "Preview". 2\. Given I enter an invalid HEX value, When I click "Simpan & Aktifkan", Then saving is blocked and an error is shown. 3\. Given I select a palette color, When I save, Then the stored theme color matches the selected palette color. |
| US-006 | P0 | As an Admin, I want to configure the pre chat form so agents receive context before chat starts. | 1\. Given I am on tab "Form Widget", When I set fields "Name", "Email", and "Phone" as "Required", Then the widget blocks chat start until all required fields are valid. 2\. Given I add a custom field "Text" or "Number", When I click "Simpan & Aktifkan", Then the field appears in the widget form and the value is stored as conversation context. 3\. Given I delete a custom field, When I click "Simpan & Aktifkan", Then the field no longer appears for new visitors and is not required. |
| US-007 | P0 | As an Admin, I want to manage Widget Accounts so each widget embed can have its own topics used for tagging and routing. | 1\. Given I am on tab "Akun Widget", When I click "+ New account" and save a new account, Then it appears in the list with its "Display name". 2\. Given I edit a widget account and set "Topic" and "Sub topic", When a visitor starts chat using that account, Then the conversation is tagged with those values for routing and filtering. 3\. Given I search in "Search widget account name", When I type a keyword, Then only matching widget accounts are shown. |
| US-008 | P0 | As an Admin, I want to install the widget easily so I can go live fast. | 1\. Given I am on tab "Instalasi", When I click "Copy code", Then the snippet is copied to clipboard. 2\. Given I paste the snippet into the website head, When the site loads, Then the widget renders without console errors. 3\. Given the widget is not installed, When I open "Instalasi", Then I see status "Not installed" and troubleshooting text. |
| US-009 | P0 | As a Developer, I want to push session data so the widget can prefill visitor identity and help routing. | 1\. Given the widget script is installed, When I call the documented method to set session values, Then the widget stores the values and can prefill form fields if present. 2\. Given I send invalid value types, When I call session set, Then the call fails with a clear error and no partial data is applied. 3\. Given I remove the session, When I call session remove, Then the widget clears stored session data for the visitor. |
| US-010 | P0 | As a Developer, I want to control the widget open state and visibility so I can integrate it with my website UI. | 1\. Given the widget is loaded, When I call the toggle open method with open true, Then the widget opens. 2\. Given the widget is loaded, When I call the hide method with hide true, Then the launcher is hidden and the widget cannot be opened by click. 3\. Given the widget is not loaded yet, When I call toggle open, Then the action is queued and applied after widget is ready. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Enablement | FR-001: System MUST provide a setting "Enable Widget Live Chat" as a boolean toggle. FR-002: System MUST prevent widget rendering when disabled. |
| Welcome Messages | FR-003: System MUST provide fields for "Greeting message" and "Introduction message" with live preview. FR-004: System MUST enforce character limits on both fields. |
| Theme and Branding | FR-005: System MUST support launcher type selection with values "Ikon" and "Gambar". FR-006: System MUST support launcher icon selection from predefined icons. FR-007: System MUST support launcher image upload types PNG, JPG, JPEG, and WEBP. FR-008: System MUST automatically optimize uploaded launcher images for fast delivery and consistent rendering. FR-009: System MUST render launcher image without distortion by preserving aspect ratio. FR-010: System MUST support theme color selection via palette and via custom color picker. FR-011: System MUST store theme color as HEX value and apply it consistently to widget UI elements. FR-012: System MUST support header logo upload and display in widget header when enabled. |
| Preferences | FR-013: System MUST support "Play a sound for incoming messages" toggle. FR-014: System MUST support "Whitelabel widget" toggle. |
| Form Widget | FR-015: System MUST provide default fields "Name", "Email", and "Phone". FR-016: System MUST allow marking each field as required or optional. FR-017: System MUST support adding custom fields with types "Text" and "Number". FR-018: System MUST validate form inputs client side before allowing chat start. FR-019: System MUST attach submitted form values to the created conversation as visitor context. |
| Widget Account | FR-020: System MUST provide a Widget Account list with search and pagination. FR-021: System MUST allow creating and editing widget accounts with "Display name". FR-022: System MUST allow setting one or more "Topic" values per widget account. FR-023: System MUST allow setting one or more "Sub topic" values per widget account. FR-024: System MUST include the widget account identifier in the installation snippet. |
| Tagging and Routing | FR-025: System MUST tag each new conversation created via widget with channel tag "Live Chat". FR-026: System MUST attach widget account "Topic" and "Sub topic" to the conversation as tags for routing and filtering. FR-027: System MUST allow existing routing configuration in the inbox to use these tags to route conversations. |
| Installation | FR-028: System MUST show a read only install snippet with "Copy code" control. FR-029: System MUST show basic troubleshooting guidance for CSP or missing script load. |
| Publishing | FR-030: System MUST provide "Simpan & Aktifkan" action that persists configuration and applies it to the widget immediately. FR-031: System MUST warn on unsaved changes when navigating away. |
| Permissions | FR-032: System MUST restrict settings access to authorized roles only. FR-033: System MUST block unauthorized access with a clear error message. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save if theme color HEX is invalid. | "Format warna tidak valid." |
| EH-002 | Upload | Reject launcher image file type not in PNG, JPG, JPEG, WEBP. | "Format file tidak didukung." |
| EH-003 | Upload | Reject file size above limit. | "Ukuran file terlalu besar." |
| EH-004 | Upload | If image optimization fails, keep previous launcher and do not apply partial update. | "Gagal memproses gambar. Silakan coba lagi." |
| EH-005 | Form | Block chat start when required fields are missing or invalid. | "Lengkapi data yang wajib diisi." |
| EH-006 | Install | If script blocked by CSP, show install troubleshooting guidance. | "Widget gagal dimuat. Periksa konfigurasi CSP dan kode instalasi." |
| EH-007 | Permission | Block unauthorized access to settings. | "Akses ditolak." |
| EH-008 | Server | On save failure, keep draft values on screen and allow retry. | "Gagal menyimpan. Silakan coba lagi." |

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Launcher image is rectangular and does not fit launcher container. | Render with preserved aspect ratio and centered with padding. |
| EC-002 | Launcher image is JPG or WEBP without transparency. | Render as provided and do not attempt to fake transparency. |
| EC-003 | Admin switches launcher type from image to icon and back. | Persist both settings and activate only the selected type. |
| EC-004 | Visitor opens widget with old cached config. | Apply latest live config on next widget load. |
| EC-005 | Form config changes while a visitor is mid session. | Apply changes on next page refresh and do not break current open widget session. |
| EC-006 | Topic or Sub topic list changes after conversations already exist. | Existing conversations keep their historical tags. New conversations use latest configuration. |
| EC-007 | Developer calls widget methods before widget is ready. | Queue actions and apply after ready event. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings navigation | Left navigation shows "Widget" under "Channels". | 1\. User opens Settings. 2\. User selects "Widget". | US-001, US-002, US-003 |
| Tab: Penampilan | Includes enable toggle, welcome messages, theme and branding, preferences, preview, and action button. | 1\. User edits fields. 2\. Preview updates. 3\. User clicks "Simpan & Aktifkan". | US-001, US-002, US-003, US-004, US-005 |
| Section: Tema & Merek Widget | Launcher shape, launcher icon picker, launcher image uploader, theme color palette, custom color picker, header logo, toggles. | 1\. User selects launcher type "Ikon" or "Gambar". 2\. User selects icon or uploads image. 3\. User selects palette color or "Custom color". | US-003, US-004, US-005 |
| Preview panel | Desktop and Mobile toggle. Shows widget look and launcher. | 1\. User toggles "Desktop" and "Mobile". 2\. Preview reflects current edits. | US-002, US-003, US-004, US-005 |
| Tab: Form Widget | Shows default fields and custom field add controls. | 1\. User sets required toggles. 2\. User adds custom field using "Text" or "Number". 3\. User deletes a custom field using trash icon. 4\. User clicks "Simpan & Aktifkan". | US-006 |
| Tab: Akun Widget | Table list with search, pagination, create new account, edit account, topics and sub topics chips. | 1\. User searches account by name. 2\. User clicks "+ New account". 3\. User edits "Topic" and "Sub topic". 4\. User saves changes. | US-007 |
| Tab: Instalasi | Shows install snippet, status, copy button, and docs. | 1\. User clicks "Copy code". 2\. User pastes in website head. 3\. User verifies widget appears. | US-008 |
| Loading states | Skeleton or spinner for widget accounts list and settings load. | 1\. User opens tab. 2\. Loading state shown until data loads. | US-007, US-008 |
| Empty states | Widget account list empty, no topics selected, no header logo uploaded. | Provide clear empty copy and call to action. | US-003, US-007 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| enable\_widget | boolean | true | Must be boolean. | Yes |
| greeting\_message | string | "Halo\!" | 0 to 200 chars. | No |
| introduction\_message | string | "Ada yang bisa kami bantu?" | 0 to 300 chars. | No |
| launcher\_shape | enum | "Default" | Allowed: "Default", "With title". | Yes |
| launcher\_title | string | "Chat here\!" | 0 to 30 chars. Required if launcher\_shape is "With title". | Conditional |
| launcher\_type | enum | "Ikon" | Allowed: "Ikon", "Gambar". | Yes |
| launcher\_icon | enum | "chat" | Required if launcher\_type is "Ikon". Must be one of available icons. | Conditional |
| launcher\_image | file | "launcher.webp" | Allowed: png, jpg, jpeg, webp. Max size 5MB. Min dimension 64x64. | Conditional |
| theme\_color\_hex | string | "\#1C7ED6" | Must be valid HEX \#RRGGBB. | Yes |
| header\_logo | file | "logo.png" | Allowed: png, jpg, jpeg, webp, gif. Max size 2MB. | No |
| show\_header\_logo | boolean | true | Must be boolean. | No |
| preference\_sound | boolean | true | Must be boolean. | No |
| preference\_whitelabel | boolean | false | Must be boolean. | No |
| prechat\_enabled | boolean | true | Must be boolean. | Yes |
| prechat\_fields | array | \[{"label":"Email","type":"text","required":true}\] | Max 10 fields. Label 1 to 30 chars. Type allowed: text, number. | Yes |
| widget\_account\_display\_name | string | "Widget Support System" | 1 to 50 chars. | Yes |
| widget\_account\_topics | array | \["HUB Bandung"\] | 0 to 10 values. Each 1 to 30 chars. | No |
| widget\_account\_sub\_topics | array | \["Tag"\] | 0 to 20 values. Each 1 to 30 chars. | No |

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Widget load p95 under 1.0s after host page load. Settings save p95 under 300ms. |
| Availability | 99.9% for widget load and settings endpoints. |
| Reliability | Save success rate 99.5% or higher. Launcher image optimization success rate 99% or higher. |
| Security | Tenant scoping enforced. Inputs sanitized. No secrets exposed in client snippet. |
| Privacy | Session data and form data stored under tenant scope. Retention follows inbox retention policy. |
| Observability | Track widget load success, JS errors, copy code clicks, save failures, upload failures. |
| Accessibility | Keyboard navigation for settings UI. Color picker and toggles accessible. Maintain contrast ratio for theme color in widget UI. |

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| External | Website CSP | Script blocked by CSP. | Provide CSP allowlist guidance in install docs. |
| Internal | Inbox tagging and routing | Missing tags break routing and reporting. | Contract tests for conversation tagging. |
| Internal | Image storage and delivery | Large images increase load time. | Automatic optimization and size limits. |
| Product | Increased scope from prior deferred items | Confusion about what is supported in v1.1. | Explicit scope and limits in this PRD. |

## **13\. Success Metrics**

| KPI | Target | Window | Source |
| ----- | ----- | ----- | ----- |
| Time to first live widget | 90% within 5 minutes | 30 days | Onboarding telemetry |
| Install success rate | 95% or higher | Ongoing | Client error beacons |
| Pre chat form usage | 70% of enabled widgets | 60 days | Configuration data |
| Launcher customization adoption | 60% use image or custom color | 30 days | Settings analytics |
| Tagging coverage | 80% widget accounts have Topic set | 60 days | Widget account config |

## **14\. Future Considerations**

| Topic | Rationale |
| ----- | ----- |
| Additional form field types | Dropdown and checkbox for richer routing signals. |
| Per page widget rules | Show different widget account by URL path. |
| CMS plugins | Reduce install friction for non technical teams. |
| Bulk actions for widget accounts | Improve admin efficiency at scale. |
| Multi language widget UI | Support regional rollouts. |

## **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| Manual script embedding required | Needs developer access to website. | Provide clear install guide and copy button. |
| Limited custom form field types | Cannot build complex intake flows. | Use text and number fields only in this version. |
| Routing depends on existing inbox configuration | Tags alone do not guarantee assignment without routing rules. | Document how tags are used by routing in inbox settings. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | Live Chat Widget: embedded web chat. Widget Account: a configuration that generates an install key and tagging context. Topic and Sub topic: tags attached to conversations for routing and filtering. |
| Installation Snippet Example | `<script>` \`window.$satuinbox \= window.$satuinbox |
| Developer Methods | 1\. Set session: `$satuinbox.push(["set","session-livechat",{ email:"a@b.com", fullname:"John Doe", phone:"+628..." }]);` 2\. Remove session: `$satuinbox.push(["remove","session-livechat",{}]);` 3\. Toggle open: `$satuinbox.push(["toggle-widget","session-livechat",{ open:true }]);` 4\. Hide launcher: `$satuinbox.push(["hide","session-livechat",{ hide:true }]);` |
| Ready Event | `window.addEventListener("message", (event) => { if (event.data?.type === "WIDGET_READY") { } });` |


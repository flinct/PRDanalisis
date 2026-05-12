# General Settings

## Introduction

| Aspect | Details |
| ----- | ----- |
| **Feature** | Settings / Workspace / General Settings |
| **Objective** | General Settings is a centralized configuration area that allows workspace owners and admins to manage basic workspace preferences, such as workspace identity, time zone, language, notifications, and critical workspace actions (e.g., deletion). |
| **Scope** | \- Provide a settings area under **Company Settings \> General** \- Allow workspace customization (name, timezone, language, notifications) \- Provide secure mechanism for workspace deletion \- Accessible only to roles with relevant permissions (Owner / Admin) |

---

1. ## Sections

| Priority | Section | Descriptions |
| ----- | ----- | ----- |
| **P0** | **Workspace & Time zone** | Allows workspace owners/admins to define the **workspace display name** and set the **default time zone** for all activities (conversations, SLAs, reports). The workspace name is visible across the application, and the time zone ensures consistency for logs and SLA calculations. |
| **P1** | **Delete workspace** | Provides the ability for **workspace owners only** to request deletion of a workspace. Deletion requests must be confirmed with full name entry and are processed by **Satuinbox Internal Superadmin** within 1x24 hours. A support channel is also provided in case of issues. |
| **P2** | **Language & Localization** | \- User can edit workspace name (min 3 chars, max 50 chars). \- User can select time zone from a dropdown list (standard IANA TZ database). \- Updates are saved and reflected across the system. \- Changing time zone updates system timestamps consistently for new data (existing logs remain unchanged). |

---

2. ## User Stories

| ID | User Story |
| ----- | ----- |
| US-GEN-01 | As an Admin, **I want to update the workspace name and time zone**, so that the workspace is identifiable and logs are aligned with local working hours. |
| US-GEN-02 | As a Workspace Owner, **I want to request deletion of my workspace with a grace period**, so that I still have a chance to cancel if the deletion was accidental or premature. |
| US-GEN-03 | As an Admin, **I want to configure the workspace default language**, so that the system interface and notifications are consistent for my team. |

3. ## Acceptance Criteria

| ID | Acceptance Criteria |
| ----- | ----- |
| AC-GEN-01 | User can edit workspace name (min 3 chars, max 50 chars). |
| AC-GEN-02 | User can select time zone from a dropdown list (standard IANA TZ database). |
| AC-GEN-03 | Updates to workspace name & time zone are saved and reflected across the system. |
| AC-GEN-04 | Changing time zone updates timestamps consistently for new data (existing logs remain unchanged). |
| AC-GEN-05 | Delete Workspace option is visible only to **Workspace Owners**. |
| AC-GEN-06 | A confirmation message explains that deletion requires full name input and will take up to 14 days. |
| AC-GEN-07 | Once confirmed, the workspace is immediately inaccessible to all members. |
| AC-GEN-08 | Workspace enters **Pending Deletion (14 days)** state. |
| AC-GEN-09 | System displays confirmation: *“Your request has been submitted. Workspace deletion will be processed within 1x24 hours.”* |
| AC-GEN-10 | During grace period, data is retained but no new activity can occur. |
| AC-GEN-11 | Workspace deletion can be canceled by contacting Satuinbox Support before the grace period ends. |
| AC-GEN-12 | After 14 days, all data is **permanently deleted** and cannot be recovered. |
| AC-GEN-13 | All actions are logged in the audit trail. |
| AC-GEN-14 | User can select a language from a predefined list (e.g., English, Bahasa Indonesia). |
| AC-GEN-15 | The selected language applies to system UI and notification templates. |
| AC-GEN-16 | Users may override language individually in personal settings (if allowed). |

---

4. ## UX Flow

### 5.1 Workspace & Time zone

**Objective:** Admin update workspace identity and default timezone.

1. Admin navigates to **General Settings → Workspace Name & Time Zone**.

2. Admin edits **Workspace Name** (input field).  
   * \-Validation: min 3 chars, max 50 chars.

3. Admin selects **Time Zone** (dropdown, based on IANA database).

4. Admin clicks **Save Changes**.

5. System validates inputs.  
   * If valid → save changes.  
   * If invalid → show error message.

6. System updates settings across the platform:  
   * New **Workspace Name** displayed everywhere.  
   * New **Time Zone** applied for SLA and reporting timestamps (new data only).

7. System logs audit trail: *“Workspace Name/Time Zone updated by \[AdminName\]”*.  
8. Success confirmation shown to Admin.

### 5.2 Delete Workspace (Grace Period)

**Objective:** Owner requests workspace deletion with a 14-day grace period.

1. Owner navigates to **General Settings → Delete Workspace**.

2. System displays warning message:  
    “Deleting this workspace will deactivate all access immediately.  
    The workspace will be permanently deleted after **14 days**.  
    You can cancel deletion before the grace period ends by contacting Satuinbox Support.”

3. Owner enters **Full Name** (must match profile).

4. System validates input:

   * If mismatch → error message shown.

   * If match → **Confirm Delete Workspace** button enabled.

5. Owner clicks **Confirm Delete Workspace**.

6. System sets workspace status to **Pending Deletion (14 days)**.

7. System applies immediate effects:

   * All members lose access.

   * Inbox, Ticketing, and Integrations stop running.

8. System shows banner: *“This workspace is scheduled for deletion on \[Date\]. Please contact Support to cancel.”*

9. Data remains securely stored during the 14-day grace period.

10. On day 14, system permanently deletes all workspace data.

11. System logs audit trail: *“Workspace permanently deleted on \[Date\] after grace period.”*

### 5.3 Language & Localization

**Objective:** Admin sets default system language for workspace.

1. Admin navigates to **General Settings → Language & Localization**.

2. Admin selects **Default Language** from dropdown (e.g., English, Bahasa Indonesia).

3. Admin clicks **Save Changes**.

4. System validates selection.

5. System updates:  
   * Default UI language applied for all users who haven’t overridden language individually.  
   * Notification templates updated to chosen language.

6. Users with **personal language override** retain their preferences.

7. System logs audit trail: *“Workspace Language updated to \[Language\] by \[AdminName\]”*.

8. Success confirmation shown to Admin.

---

5. ## Success Metrics

| ID | Category | Requirement |
| ----- | ----- | ----- |
| NFR-GEN-01 | Security | All workspace setting changes (name, timezone, language, deletion request) must be logged in the audit trail. |
| NFR-GEN-02 | Usability | Settings UI must be responsive and accessible on desktop and mobile devices. |
| NFR-GEN-03 | Reliability | Workspace deletion requests must always require Internal Superadmin validation. |
| NFR-GEN-04 | Performance | Settings changes should propagate across the system in ≤ 5 seconds. |
| NFR-GEN-05 | Privacy | Language and time zone changes should not expose any sensitive client or user data. |

6. ## Success Metrics

| Category | Metric | Target Value | Measurement Method |
| ----- | ----- | ----- | ----- |
| Operational Accuracy | Accuracy of applied time zone across reports & SLA | ≥ 95% | Cross-check report timestamps vs system TZ |
| Security | Workspace deletion requests validated by owner name | 100% | Audit log validation |
| Reliability | Workspace deletion request processed within SLA | ≤ 24 hours | Internal Superadmin process log |
| Usability | Error-free save rate for settings changes | ≥ 99% success | QA test logs & error monitoring |

7. ## Future Considerations

| Feature | Description |
| ----- | ----- |
| Business Hours / Office Hours | Allow Admins to set default company working hours to integrate with SLA, presence, and reporting. |
| Role-Based Language Settings | Different roles may have different default language preferences. |
| Bulk Workspace Actions | Allow migration or bulk update of workspace settings for enterprise clients. |
| Deletion Confirmation via MFA | Add optional **Multi-Factor Authentication** for workspace deletion requests for extra security. |

---

### FAQ

#### Why 14 days?

Kenapa 14 Hari?

1. **Grace Period (Cooling-off)**  
   * Memberi waktu jika pemilik workspace berubah pikiran.  
   * Delete workspace itu keputusan besar (semua data, integrasi, dan konfigurasi hilang). Kalau accidental click atau terburu-buru, masih bisa dibatalkan.

2. **Data Recovery & Compliance**  
   * Banyak perusahaan harus mematuhi aturan GDPR/ISO/CCPA.  
   * Data tidak boleh langsung dihapus permanen → ada periode retensi di mana data masih bisa di-restore bila diperlukan.

3. **Internal Workflow**  
   * Dalam 14 hari, sistem background Intercom bisa:  
     * Menutup subscription/payment.  
     * Menghapus integrasi eksternal.  
     * Mengarsipkan percakapan & laporan untuk backup.

4. **Customer Support & Audit**  
   * Kalau ada masalah billing atau sengketa (misalnya workspace dihapus tanpa izin pemilik sebenarnya), Intercom punya waktu untuk verifikasi.

5. **Best Practice SaaS**  
   * Banyak SaaS besar pakai pola sama: Slack, Google Workspace, hingga GitHub → semua kasih grace period 7–30 hari.  
   * Jadi bukan bug atau keterlambatan, tapi **sengaja** untuk keamanan \+ compliance.
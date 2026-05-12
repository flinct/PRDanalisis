# Admin-initated Reset Password

| Aspect | Detail |
| ----- | ----- |
| **Feature Name** | Admin Reset Password |
| **Objective** | Allow Admin or Supervisor to reset an Agent’s password directly from the **Team Member** page by entering a new password and confirming it. This feature supports operational needs when Agents face login issues or require immediate access. |
| **Target Audience** | Admin, Supervisor |
| **Scope** | \- Reset password from the **Team Member** page.- Input fields: **New Password** & **Confirm Password**.- Validation of password format according to security rules.- Automatic notification email sent to the Agent.- Action logged in **Audit Log**.- Optional: Agent must change password after first login. |

---

1. ## User Stories

| ID | User Story |
| ----- | ----- |
| US-01 | As an **Admin**, I want to reset an Agent’s password by setting a new one, so that the Agent can log in immediately if they forget their password. |
| US-02 | As a **Supervisor**, I want to reset my team member’s password, so that I can help them recover access without waiting for a reset link. |
| US-03 | As an **Agent**, I want to be notified when my password is reset by an Admin, so that I am aware and can secure my account if needed. |

---

2. ## Acceptance Criteria

| ID | Criteria | Pass/Fail Condition |
| ----- | ----- | ----- |
| AC-01 | Admin/Supervisor can select a member from the **Team Member** list and click **“Reset Password”**. | A password reset modal opens with input fields. |
| AC-02 | The password reset modal displays two fields: **New Password** and **Confirm Password**. | If empty → error “Password is required.” |
| AC-03 | Password must follow security rules (≥ 8 characters, including letters, numbers, and symbols). | If invalid → error “Password must be at least 8 characters and include numbers and symbols.” |
| AC-04 | **Confirm Password** must match **New Password**. | If not matching → error “Passwords do not match.” |
| AC-05 | Once submitted, the system updates the Agent’s password in the database. | Agent’s password is successfully changed. |
| AC-06 | The system sends an email notification to the Agent: *“Your password was reset by \[AdminName\] on \[Date/Time\]. Please log in with your new password.”* | Email successfully delivered to the Agent. |
| AC-07 | The system records the action in the **Audit Log**: who performed the reset, which account was reset, and when. | Action is visible in the Audit Log. |
| AC-08 | Optional: The Agent is required to change their password after their first login. | System redirects to **Change Password** page after first login. |

---

3. ## Functional Reqiurements

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-01 | Admin/Supervisor can select a user from the Team Member list to reset their password. | High |
| FR-02 | System must display a modal with **New Password** & **Confirm Password** input fields with validation rules. | High |
| FR-03 | System must update the Agent’s password in the database once the form is submitted successfully. | High |
| FR-04 | System must send an **email notification** to the Agent whenever their password is reset by an Admin/Supervisor. | High |
| FR-05 | System must record each password reset action in the **Audit Log**. | High |
| FR-06 | System can optionally enforce that the Agent changes their password after first login. | Medium |

4. ## Non-Functional Requirements

| ID | Category | Description |
| ----- | ----- | ----- |
| NFR-01 | Security | Passwords must be encrypted (e.g., bcrypt). |
| NFR-02 | Auditability | All password reset actions must be logged in detail. |
| NFR-03 | Usability | The reset password modal must be simple, with clear error messages. |
| NFR-04 | Notification | Notification emails must be delivered in real time and not fail silently. |

5. ## Flow \- Admin-initated Reset Password

| Step | Flow | System Behavior / Notes |
| ----- | ----- | ----- |
| **1** | Admin/Supervisor navigates to the **Team Member** page. | System displays the list of all team members. |
| **2** | Admin selects a member from the list and clicks **“Reset Password.”** | A reset password modal opens. |
| **3** | Modal displays two input fields: **New Password** and **Confirm Password.** | System applies password rules (min 8 characters, alphanumeric, unique character). |
| **4** | Admin enters a new password and confirmation password. | If fields are empty → show error: *“Password is required.”* |
| **5** | System validates password strength and checks both fields match. | If invalid → show error: *“Password must be at least 8 characters and include numbers and symbols.”* If mismatch → *“Passwords do not match.”* |
| **6** | Admin clicks **Submit.** | System updates the Agent’s password in the database. |
| **7** | Password reset success. | Toast notification: *“Password has been reset successfully for \[AgentName\]. Notification sent to the agent.”* |
| **8** | Password reset failure. | Toast notification: *“Failed to reset password. Please try again.”* |
| **9** | System sends notification email to the Agent. | Email content: *“Your password was reset by \[AdminName\] on \[Date/Time\]. Please log in with your new password.”* |
| **10** | System records the password reset action in the **Audit Log.** | Log entry includes: who reset, whose password was reset, and timestamp. |

6. ## Success Metrics

- ≥ 95% password reset processes completed without error.  
- 100% of password reset actions recorded in the audit log.  
- 100% of Agents receive a notification email after password reset.  
- ≤ 1 minute average time required for Admin to complete a password reset.


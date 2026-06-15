const { expect } = require('@playwright/test');

/**
 * AuthPage — Page Object for SatuInbox auth flows (login, register, reset/set password,
 * verify email, logout). 100% data-cy selectors (no #id / role / text / class).
 *
 * Playwright is configured with `testIdAttribute: 'data-cy'`, so getByTestId('X') => [data-cy="X"].
 * Selector names match DATA_CYPRESS_AUTH + companion `auth-page-selectors.md`.
 *
 * Drop-in: sixV2Automation/playwright/support/pages/auth.page.js
 */

const ROUTES = {
  login: '/login',
  loginV2: '/id/login',
  register: '/register',
  registerV2: '/id/register',
  resetPassword: '/reset-password',
  setNewPassword: '/set-new-password',
  verifyEmail: '/verification',
};

class AuthPage {
  constructor(page) {
    this.page = page;

    // shared
    this.authSection = page.getByTestId('Auth-Section');
    this.logo = page.getByTestId('Satuinbox-Logo');
    this.errorCard = page.getByTestId('Auth-Error');
    this.showPassword = page.getByTestId('Show-Password');

    // login
    this.loginContainer = page.getByTestId('Login-Container');
    this.loginForm = page.getByTestId('Login-Form');
    this.keywordInput = page.getByTestId('Keyword-Input');
    this.passwordInput = page.getByTestId('Password-Input');
    this.rememberMe = page.getByTestId('Remember-Me');
    this.loginButton = page.getByTestId('Login-Submit-Button');
    this.resetPasswordLink = page.getByTestId('Reset-Password-Link');
    this.registerLink = page.getByTestId('Register-Link');

    // register
    this.registerForm = page.getByTestId('Register-Form');
    this.regFullname = page.getByTestId('Fullname-Input');
    this.regUsername = page.getByTestId('Username-Input');
    this.regEmail = page.getByTestId('Email-Input');
    this.regPhone = page.getByTestId('Phone-Input');
    this.regPassword = page.getByTestId('Password-Input');
    this.regPasswordConfirm = page.getByTestId('Re-Enter-Password-Input');
    this.registerButton = page.getByTestId('Register-Submit-Button');
    this.loginLink = page.getByTestId('Login-Link');

    // reset password
    this.resetForm = page.getByTestId('Reset-Password-Form');
    this.resetEmailInput = page.getByTestId('Email-Input');
    this.resetSubmit = page.getByTestId('Reset-Password-Submit-Button');

    // set new password
    this.setNewPasswordForm = page.getByTestId('Set-New-Password-Form');
    this.setNewPasswordInput = page.getByTestId('Password-Input');
    this.setNewPasswordSubmit = page.getByTestId('Set-New-Password-Submit-Button');

    // verify email
    this.verifyEmailButton = page.getByTestId('Verify-Email-Button');

    // logout (authenticated app)
    this.userMenu = page.getByTestId('User-Menu');
    this.logoutButton = page.getByTestId('Logout-Button');
  }

  // ---------- Login ----------
  async gotoLogin({ useV2 = false } = {}) {
    await this.page.goto(useV2 ? ROUTES.loginV2 : ROUTES.login, {
      waitUntil: 'load',
      timeout: 30000,
    });
  }

  async login(identifier, password, { useV2 = false, expectSuccess = true } = {}) {
    await this.gotoLogin({ useV2 });
    await this.keywordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.keywordInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    if (expectSuccess) {
      await this.page.waitForURL(/\/conversation\/your-inbox/, { timeout: 30000 });
    }
  }

  async loginWithCredentials(credentials, options = {}) {
    return this.login(credentials.identifier, credentials.password, options);
  }

  async verifyLoginPageElements() {
    await expect(this.logo).toBeVisible();
    await expect(this.keywordInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyLoginError() {
    await expect(this.errorCard).toBeVisible();
  }

  // ---------- Register ----------
  async gotoRegister({ useV2 = false } = {}) {
    await this.page.goto(useV2 ? ROUTES.registerV2 : ROUTES.register, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await this.registerButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  async register(userData, options = {}) {
    const { fullname, username, email, phone, password } = userData;
    await this.gotoRegister(options);
    if (fullname) await this.regFullname.fill(fullname);
    if (username) await this.regUsername.fill(username);
    if (email) await this.regEmail.fill(email);
    if (phone) await this.regPhone.fill(phone);
    if (password) {
      await this.regPassword.fill(password);
      await this.regPasswordConfirm.fill(password);
    }
    await this.registerButton.click();
  }

  // ---------- Reset / set password ----------
  async requestResetPassword(email) {
    await this.page.goto(ROUTES.resetPassword, { waitUntil: 'load', timeout: 30000 });
    await this.resetEmailInput.fill(email);
    await this.resetSubmit.click();
  }

  async setNewPassword(token, password) {
    await this.page.goto(`${ROUTES.setNewPassword}?token=${token}`, {
      waitUntil: 'load',
      timeout: 30000,
    });
    await this.setNewPasswordInput.fill(password);
    await this.setNewPasswordSubmit.click();
  }

  // ---------- Verify email ----------
  async verifyEmail(token) {
    await this.page.goto(`${ROUTES.verifyEmail}?token=${token}`, {
      waitUntil: 'load',
      timeout: 30000,
    });
    await this.verifyEmailButton.click();
  }

  // ---------- Logout ----------
  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    await this.page.waitForURL(/\/login/, { timeout: 30000 });
  }

  generateRandomTestData(prefix = 'test') {
    const timestamp = Date.now();
    return {
      fullname: `${prefix} User ${timestamp}`,
      username: `${prefix}user${timestamp}`,
      email: `${prefix}${timestamp}@testmail.com`,
      phone: `08${Math.floor(Math.random() * 90000000) + 10000000}`,
      password: process.env.E2E_TEMP_PASSWORD || 'TestPassword1!',
    };
  }
}

module.exports = { AuthPage, ROUTES };

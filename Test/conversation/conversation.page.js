const { expect } = require('@playwright/test');

/**
 * ConversationPage — Page Object for the Conversation page.
 *
 * 100% data-cy selectors, synced to the FE team's current constant groups
 * (DATA_CYPRESS_CONVERSATION / CHAT_ROOM / CHAT_LIST_ITEM / CHAT_DETAIL / QUICK_ACTION).
 * Playwright config: testIdAttribute: 'data-cy', so getByTestId('X') => [data-cy="X"].
 *
 * Drop-in: sixV2Automation/playwright/support/pages/conversation.page.js
 */

const ROUTES = {
  'your-inbox': '/conversation/your-inbox',
  unassigned: '/conversation/unassigned',
  all: '/conversation/all',
  starred: '/conversation/starred',
  spam: '/conversation/spam',
  junk: '/conversation/junk',
  channel: '/conversation/channel',
  team: '/conversation/team',
  'group-chat': '/conversation/group-chat',
};

class ConversationPage {
  constructor(page) {
    this.page = page;

    // ---- Layout / root ----
    this.pageSection = page.getByTestId('Conversation-Section');
    this.sidebar = page.getByTestId('Conversation-Sidebar-Navigation');
    this.chatListContainer = page.getByTestId('conversation-list');
    this.chatListHeader = page.getByTestId('Conversation-Chat-List-Header');
    this.chatListTitle = page.getByTestId('Conversation-Chat-List-Page-Section');
    this.chatListSkeleton = page.getByTestId('conversation-list-skeleton');
    this.chatListEmpty = page.getByTestId('conversation-empty-state');

    // ---- Navigation ----
    this.inboxNav = (id) => page.getByTestId(`inbox-nav-${id}`); // your-inbox|unassigned|all|spam|starred|junk
    this.channelNav = (channelId) => page.getByTestId(`channel-nav-${channelId}`);
    this.teamNav = (n) => page.getByTestId(`team-${n}`); // 1-based

    // ---- Chat list controls / filters ----
    this.sidebarToggle = page.getByTestId('chatList-navPanelControlButton');
    this.searchButton = page.getByTestId('chatList-searchButton');
    this.statusFilter = page.getByTestId('chatList-filter-status');
    this.readFilter = page.getByTestId('chatList-filter-read');
    this.sortFilter = page.getByTestId('chatList-filter-sort');
    this.visibilityFilter = page.getByTestId('chatList-filter-visibility');
    this.advancedFilter = page.getByTestId('chatList-filter-advance');

    // ---- Chat list items (row = chat-list-<n>, sub = chat-list-<n>-<key>) ----
    this.chatItem = (n) => page.getByTestId(`chat-list-${n}`);
    this.chatItems = page.getByTestId(/^chat-list-\d+$/);
    this.cardPart = (n, key) => page.getByTestId(`chat-list-${n}-${key}`);
    this.cardName = (n) => this.cardPart(n, 'name');
    this.cardUnread = (n) => this.cardPart(n, 'unread-count');
    this.cardSla = (n) => this.cardPart(n, 'sla-badge');
    this.cardQuickAction = (n) => this.cardPart(n, 'quick-action');

    // quick-action menu items
    this.quickAction = (key) => page.getByTestId(`quick-action-${key}`); // assign|mark-read|reminder|pin|close|reopen|star|spam|junk

    // ---- Chat room ----
    this.chatRoom = page.getByTestId('Chat-Room-Container');
    this.roomHeader = page.getByTestId('Chat-Room-Header');
    this.customerName = page.getByTestId('Chat-Room-Header-Contact-Name');
    this.closeButton = page.getByTestId('chatRoom-closeConversationButton');
    this.reopenButton = page.getByTestId('chatRoom-reopenConversationButton');
    this.messagesContainer = page.getByTestId('Messages-Container');
    this.bubble = (messageId) => page.getByTestId(`Message-Bubble-${messageId}`);
    this.bubbles = page.getByTestId(/^Message-Bubble-/);
    this.messageInput = page.getByTestId('Message-Text-Input');
    this.sendButton = page.getByTestId('Send-Button');
    this.emojiButton = page.getByTestId('Emoji-Button');
    this.macroButton = page.getByTestId('Macro-Button');
    this.attachButton = page.getByTestId('Attach-File-Button');
    this.accountSelector = page.getByTestId('Account-Channel-Selector');
    this.accountOption = (channelId) => page.getByTestId(`Account-Channel-${channelId}`);

    // room banners
    this.expiredWaBanner = page.getByTestId('Chat-Room-Expired-Whatsapp-Banner');
    this.sendTemplateButton = page.getByTestId('Chat-Room-Send-Template-Button');
    this.removedBanner = page.getByTestId('Chat-Room-Removed-Banner');
    this.noSessionBanner = page.getByTestId('Chat-Room-No-Session-Banner');
    this.noSessionButton = page.getByTestId('Chat-Room-No-Session-Button');

    // ---- Detail panel ----
    this.detailTitle = page.getByTestId('Chat-Detail-Title');
    this.copyId = page.getByTestId('Chat-Detail-Copy-Id-Button');
    this.detailSection = (slug) => page.getByTestId(`Chat-Detail-Section-${slug}`);
    this.frtLabel = page.getByTestId('Chat-Detail-Sla-frt');
    this.ttcLabel = page.getByTestId('Chat-Detail-Sla-ttc');
    this.rltLabel = page.getByTestId('Chat-Detail-Sla-rlt');
    this.waitTimeLabel = page.getByTestId('Chat-Detail-Sla-wait-time');

    // ---- Modals ----
    this.assignModal = page.getByTestId('Assign-Conversation-Modal');
    this.assignModalSubmit = page.getByTestId('Assign-Modal-Submit-Button');
    this.assignModalCancel = page.getByTestId('Assign-Modal-Cancel-Button');
    this.bulkAssignModal = page.getByTestId('Bulk-Assign-Conversation-Modal');
    this.assignMemberModal = page.getByTestId('Assign-Member-Modal');
    this.assignTeamModal = page.getByTestId('Assign-Team-Modal');
    this.unassignModal = page.getByTestId('Unassign-Member-Modal');
    this.createTicketModal = page.getByTestId('Create-Ticket-Modal');
    this.createTicketSubmit = page.getByTestId('Create-Ticket-Submit-Button');
    this.junkModal = page.getByTestId('Junk-Modal');
    this.junkReasonSelect = page.getByTestId('Junk-Modal-Reason-Select');
    this.junkConfirm = page.getByTestId('Junk-Modal-Confirm-Button');
    this.bulkValidationModal = page.getByTestId('Bulk-Validation-Modal');
    this.adjustAccountModal = page.getByTestId('Adjust-Account-Modal');
  }

  // ---------- Navigation ----------
  async goto(section = 'all', query = '') {
    const path = (ROUTES[section] ?? '/conversation') + query;
    await this.page.goto(path, { waitUntil: 'load', timeout: 30000 });
    await expect(this.chatListContainer).toBeVisible({ timeout: 15000 });
  }

  async gotoChannel(channelId) {
    await this.page.goto(`${ROUTES.channel}?channel=${channelId}`, {
      waitUntil: 'load',
      timeout: 30000,
    });
  }

  async gotoTeam(teamTitle) {
    await this.page.goto(`${ROUTES.team}?team=${encodeURIComponent(teamTitle)}`, {
      waitUntil: 'load',
      timeout: 30000,
    });
  }

  // ---------- Chat list ----------
  async openChat(n = 1) {
    const item = this.chatItem(n);
    await expect(item).toBeVisible({ timeout: 60000 });
    await item.click();
    await expect(this.chatRoom).toBeVisible({ timeout: 15000 });
  }

  async openFirstChat() {
    await this.goto('all');
    await this.openChat(1);
  }

  async openQuickAction(n, key) {
    await this.cardQuickAction(n).click();
    await this.quickAction(key).click();
  }

  // ---------- Chat room ----------
  async sendMessage(text) {
    await this.messageInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.messageInput.fill(text);
    await this.sendButton.click({ force: true });
  }

  async closeConversation() {
    await this.closeButton.click();
  }

  async reopenConversation() {
    await this.reopenButton.click();
  }

  // ---------- Detail panel ----------
  async expectSlaMetricsVisible() {
    await expect(this.frtLabel).toBeVisible({ timeout: 10000 });
  }

  async openDetailSection(slug) {
    await this.detailSection(slug).click();
  }
}

module.exports = { ConversationPage, ROUTES };

from pathlib import Path

def row(*cols):
    return "\t".join(cols)

tests = [
("SIX-Convo-Gap-01","Chat List filters","Switch to All Conversation tab and verify combined chats across channels appear","accessed inbox page. linked number",["open main navigation","click tab All Conversation"],["All conversations appear across All Conversation","counters update"]),
("SIX-Convo-Gap-02","Chat List filters","Switch to Closed tab and verify resolved chats only","accessed inbox page. linked number",["open main navigation","click tab Closed"],["Only resolved chats appear in Closed"]),
("SIX-Convo-Gap-03","Chat List filters","Filter chats by channel Live Chat","accessed inbox page. linked number",["open main navigation","select channel filter Live Chat"],["Only Live Chat items appear"]),
("SIX-Convo-Gap-04","Chat List filters","Filter chats by tag CS Pre-order","accessed inbox page. linked number",["open chat list","open filter panel","select tag CS Pre-order"],["Only chats with tag CS Pre-order show","Filter badge shows current tag"]),
("SIX-Convo-Gap-05","Chat List sorting","Sort by Most Recent","accessed inbox page. linked number",["open chat list","change sort to Most Recent"],["Latest chat is at top of list","Sort persists after tab switch"]),
("SIX-Convo-Gap-06","Chat List sorting","Sort by Longest Waiting","accessed inbox page. linked number",["open chat list","change sort to Longest Waiting"],["Oldest unresolved chat is at top of list","List reorders within <1s"]),
("SIX-Convo-Gap-07","Chat List state persistence","Scroll and filter persist per tab","accessed inbox page. linked number",["open Your Inbox","scroll down to chat position 50","apply filter Agent=Rizki","switch to Unassigned then back to Your Inbox"],["Scroll position restored to previously viewed position","Filter Agent=Rizki still applied"]),
("SIX-Convo-Gap-08","Chat List bulk actions","Bulk assign unassigned chats","accessed inbox page. linked number",["open Unassigned tab","select 3 chats with checkboxes","click Assign button","confirm assign to me"],["selected chats moved to Your Inbox","toast shows success + count assigned","unassigned counter decreases"]),
("SIX-Convo-Gap-09","Chat List bulk actions","Bulk delete selected chats","accessed inbox page. linked number",["open Your Inbox","select 2 chats","click Delete and confirm"],["selected chats removed from inbox","counter updates","toast shows success message"]),
("SIX-Convo-Gap-10","Chat List indicators","Hold indicator visibility","accessed inbox page. linked number",["open Your Inbox with a chat on Hold"],["Hold icon appears on chat card","Tooltip shows who set Hold and timestamp"]),
("SIX-Convo-Gap-11","Chat List indicators","SLA countdown colors","accessed inbox page. linked number",["open Your Inbox with chats having various SLA"],["Green when SLA > 50% remaining","Yellow when SLA <= 50% and > 10% remaining","Red when SLA <= 10% or overdue"]),
("SIX-Convo-Gap-12","Chat List indicators","Presence avatars on chat card","accessed inbox page. linked number",["open Your Inbox with 2 agents viewing same conversation"],["Presence avatars appear","Hover shows agent names"]),
("SIX-Convo-Gap-13","Conversation Room bubbles","Private note bubble styling and visibility","accessed inbox page. linked number",["open conversation room","agent writes a private note"],["Private note appears with yellow background","Visible only to agents, not customer"]),
("SIX-Convo-Gap-14","Conversation Room bubbles","Inline reply-to reference shows above message","accessed inbox page. linked number",["open a chat with existing message","send a reply referencing that message"],["Replying bar shows referenced message above main bubble","Clicking reply-to opens anchored message"]),
("SIX-Convo-Gap-15","Conversation Room typing","Typing indicator shows real-time agent names","accessed inbox page. linked number",["open conversation room","agent A and B start typing"],["Typing indicator lists agent names","When more than 5 agents, shows and X more"]),
("SIX-Convo-Gap-16","Conversation Room typing","Typing indicator fades after inactivity","accessed inbox page. linked number",["open conversation room with typing agents","wait 6 seconds after typing stops"],["Typing indicator disappears"]),
("SIX-Convo-Gap-17","Conversation Room message status","Message status progression sent -> delivered -> read","accessed inbox page. linked number",["open conversation room as agent","send message to customer"],["Initially shows sent","Then shows delivered icon","Then shows read blue icon"]),
("SIX-Convo-Gap-18","Conversation Room message status","Failed message shows red and retry available","accessed inbox page. linked number",["open conversation room with failed message"],["Failed message shows red status icon","Retry icon is clickable","Auto-retry triggers every 5s with max 3 attempts"]),
("SIX-Convo-Gap-19","Conversation Room attachments","Ctrl+V paste image","accessed inbox page. linked number",["open conversation room","copy image from clipboard","paste into text area"],["Image converted to attachment preview","Send button enabled"]),
("SIX-Convo-Gap-20","Conversation Room attachments","Drag and drop file upload","accessed inbox page. linked number",["open conversation room","drag a PDF into text area"],["File preview appears before send","File attaches on send"]),
("SIX-Convo-Gap-21","Conversation Room attachments","Invalid attachment toast","accessed inbox page. linked number",["open conversation room","paste an oversized file > 100MB"],["Toast shows Gagal mengunggah file. Periksa ukuran/format."]),
("SIX-Convo-Gap-22","Conversation Room actions","Create ticket from selected message","accessed inbox page. linked number",["open conversation room","multi-select messages and click Create Ticket"],["Ticket created and linked to conversation","Ticket reference ID shown in chat"]),
("SIX-Convo-Gap-23","Conversation Room menu","Screenshot button visible if add-on active","accessed inbox page. linked number",["open conversation room with screenshot add-on enabled"],["Screenshot button appears in header","Screenshot image captured"]),
("SIX-Convo-Gap-24","Conversation Room automation","Quick Reply dropdown present and selectable","accessed inbox page. linked number",["open conversation room","open Quick Reply dropdown","select a template"],["Selected template text inserted into text area"]),
("SIX-Convo-Gap-25","Inbox Navigation","Unread badge updates real-time","accessed inbox page. linked number",["open sidebar with unread counters","receive new message in another tab"],["Unread badge on relevant tab increments within 2s"]),
("SIX-Convo-Gap-26","Inbox Navigation","Counter tooltip shows breakdown","accessed inbox page. linked number",["hover unread counter on Your Inbox"],["Tooltip shows Unassigned, Ongoing, Resolved breakdown"]),
("SIX-Convo-Gap-27","Inbox Navigation","Switching tab completes in <1s","accessed inbox page. linked number",["open unassigned","click Your Inbox","click Closed","click All Conversation"],["Each tab switch completes within 1s"]),
("SIX-Convo-Gap-28","Inbox Navigation","Create Team Inbox (Admin)","accessed inbox page. linked number",["login as Admin","click Create Team Inbox","input name CS Kurir and assign 2 agents"],["Team Inbox appears in sidebar","Assigned agents see it immediately live"]),
("SIX-Convo-Gap-29","Inbox Navigation","Rename Team Inbox (Admin)","accessed inbox page. linked number",["login as Admin","open Team Inbox settings for CS Kurir","rename to CS Driver"],["Team Inbox name updates across all agents","Live socket update reflected in sidebar"]),
("SIX-Convo-Gap-30","Inbox Navigation","Delete Team Inbox requires confirmation","accessed inbox page. linked number",["login as Admin","click Delete for Team Inbox","confirm deletion"],["Team Inbox removed","toast shows success"]),
("SIX-Convo-Gap-31","Inbox Navigation","Drag and drop chat to Team Inbox","accessed inbox page. linked number",["open Your Inbox","drag chat card to Team Inbox CS Kurir","confirm"],["Chat appears under Team Inbox CS Kurir","Owner team updates in backend"]),
("SIX-Convo-Gap-32","Inbox Navigation","Multi-select handover via checkboxes","accessed inbox page. linked number",["open Your Inbox","select 3 chats","click Handover to another agent","confirm"],["Selected chats assigned to target agent","Counters update in source and target inbox"]),
("SIX-Convo-Gap-33","Inbox Navigation","Quick search filters inbox/team names","accessed inbox page. linked number",["open sidebar search","type CS"],["Result filters matching team names","Click result navigates to inbox"]),
("SIX-Convo-Gap-34","Inbox Navigation","Keyboard shortcut tab switch","accessed inbox page. linked number",["open inbox","press Ctrl+1 for Your Inbox","press Ctrl+2 for Unassigned"],["Tabs switch accordingly with <1s"]),
("SIX-Convo-Gap-35","Inbox Navigation","Failure retry on load error","accessed inbox page. linked number",["open sidebar when API is failing"],["Shows retry button + error message","List reloads if API restored"]),
("SIX-Convo-Gap-36","Agent Pull Queue","Get Conversation assigns FIFO","accessed inbox page. linked number",["open Your Inbox as agent","click Get Conversation"],["New conversation assigned to agent","Order respects FIFO queue","Chat appears in Your Inbox"]),
("SIX-Convo-Gap-37","Agent Pull Queue","Editable batch size","accessed inbox page. linked number",["open Your Inbox","change batch field from default to 3","click Get Conversation"],["Exactly 3 conversations assigned","Batch resets to default after claim"]),
("SIX-Convo-Gap-38","Agent Pull Queue","Conflict toast on simultaneous pull","accessed inbox page. linked number",["open Your Inbox as agent A","simultaneously click Get Conversation with another agent B for last remaining chat"],["One agent gets success","Other agent sees conflict toast"]),
("SIX-Convo-Gap-39","Agent Pull Queue","Warning when max active conversations reached","accessed inbox page. linked number",["agent fills up max active conversations capacity","attempt to click Get Conversation"],["Maximum active conversations reached toast appears","No new conversation assigned"]),
("SIX-Convo-Gap-40","Agent Pull Queue","Empty queue shows no conversations available","accessed inbox page. linked number",["open Your Inbox with empty unassigned queue","click Get Conversation"],["No conversations available toast appears"]),
("SIX-Convo-Gap-41","Agent Pull Queue","Invalid batch resets to default","accessed inbox page. linked number",["input batch field with -1","click Get Conversation"],["Batch resets to queue count","System does not allow negative batch"]),
("SIX-Convo-Gap-42","Agent Pull Queue","Failed fetch prompts retry","accessed inbox page. linked number",["open Your Inbox with API unstable","click Get Conversation"],["Failed to fetch conversation. Please retry toast appears","System attempts to claim again"]),
("SIX-Convo-Gap-43","Group Chat","Group metadata system messages visible","accessed inbox page. linked number",["open a group chat","group icon changes","group name updates"],["System messages show group icon updated","System messages show group name updated","No state/ownership/SLA change triggered"]),
("SIX-Convo-Gap-44","Group Chat","Send as selector default identity","accessed inbox page. linked number",["open group chat with multi-number","inspect composer area"],["Send as selector is visible","Session identity number is preselected"]),
("SIX-Convo-Gap-45","Group Chat","Switch Send as identity and audit","accessed inbox page. linked number",["open group chat","change Send as to another eligible number","send message"],["Message sent using selected identity","Confirmation badge shows sent as number"]),
("SIX-Convo-Gap-46","Group Chat","Quoted reply preserves preview + deeplink","accessed inbox page. linked number",["open a group session with previous messages","open quoted reply preview card","click Open History"],["Preview shows previous message context","Click opens related history anchor"]),
("SIX-Convo-Gap-47","Group Chat","Multi-number inbound appends to same session","accessed inbox page. linked number",["group receives message from number A","same group receives message from number B"],["Both messages appear in same session","Outbound identity remains session default unless overridden"]),
("SIX-Convo-Gap-48","Group Chat","Resolved chat does not block new group session","accessed inbox page. linked number",["resolve group chat","new inbound arrives"],["New Unassigned session created","Banner links previous resolved session"]),
("SIX-Convo-Gap-49","Group Chat","Group typing and online state preserved","accessed inbox page. linked number",["open group with participants"],["Typing and presence update in real time"]),
]

n = len(tests)
lines = []
lines.append(row("total cases =","","",str(n),"","","","","","","","",""))
lines.append(row("DEV","","","","STAGGING","","","PROD","","","",""))
lines.append(row("Passed","","","0","Passed","","0","Passed","","0","",""))
lines.append(row("Failed","","","0","Failed","","0","Failed","","0","",""))
lines.append(row("Need to test","","",str(n),"Need to test","",str(n),"Need to test","",str(n),"",""))
lines.append(row("On test","","","0","On test","","0","On test","","0","",""))
lines.append(row("No Status","","","0","No Status","","0","No Status","","0","",""))

for (tid, scenario, desc, pre, steps, expecteds) in tests:
    lines.append(row("Test ID", tid, "", "", "", "", "", "", "","NEED TO TEST","NEED TO TEST","NEED TO TEST"))
    lines.append(row("Create at", "", "", "12/12/2025", "", "created by", "QA", "Tester", "QA", "NEED TO TEST","NEED TO TEST",""))
    lines.append(row("Scenario", "", "", scenario, "", "Pre-Condition", pre, "DATE", "12/12/2025", "12/12/2025", "12/12/2025", ""))
    lines.append(row("Url", "", "", "", "", "Description", desc, "ENV", "DEV", "STAGGING", "PROD", ""))
    step_num = 0
    for s in (steps or ["verify condition"]):
        step_num += 1
        lines.append(row("Steps", "", str(step_num), s, "", "test type", "POSITIVE", "", "", "", "", ""))
    sr_step = step_num + 1
    lines.append(row("", "", str(sr_step), "", "", "Status Response", "Expected Result", "Actual Result", "Status", "Status", "Status", ""))
    exp_step = sr_step + 1
    for e in expecteds:
        lines.append(row("", "", str(exp_step), "", "", "", e, "", "", "NEED TO TEST", "", ""))
        exp_step += 1
    lines.append("")

out = Path("Test/conversation/Conversation_gap_supplement.tsv")
out.write_text("\n".join(lines), encoding="utf-8")
print("Wrote", out)
print("Tests:", len(tests))

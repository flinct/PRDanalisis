/* === Hash Router + Page Loader === */
// ponytail: fetch pages/*.html into #page-content. Pages are standalone HTML fragments.

const PAGE_CACHE={};

const PAGE_MAP={
  'conversation':'pages/conversation.html',
  'ticketing':'pages/ticketing.html',
  'contacts':'pages/contacts.html',
  'broadcast/messages':'pages/broadcast-messages.html',
  'broadcast/templates':'pages/broadcast-templates.html',
  'broadcast/draft':'pages/broadcast-draft.html',
  'leads':'pages/leads.html',
  'visits':'pages/visits.html',
  'statistic':'pages/statistic.html',
  'notification':'pages/notification.html',
  'settings/organization-general':'pages/settings-organization-general.html',
  'settings/organization-members':'pages/settings-organization-members.html',
  'settings/organization-roles':'pages/settings-organization-roles.html',
  'settings/organization-tags':'pages/settings-organization-tags.html',
  'settings/organization-shift-hours':'pages/settings-shift-hours.html',
  'settings/shift-hours':'pages/settings-shift-hours.html',
  'settings/lead-pipeline':'pages/settings-lead-pipeline.html',
  'settings/inbox-assignments':'pages/settings-inbox-assignments.html',
  'settings/inbox-csat':'pages/settings-inbox-csat.html',
  'settings/inbox-macros':'pages/settings-inbox-macros.html',
  'settings/inbox-sla':'pages/settings-inbox-sla.html',
  'settings/inbox-team-inbox':'pages/settings-inbox-team-inbox.html',
  'settings/inbox-tickets':'pages/settings-inbox-tickets.html',
  'settings/channels-whatsapp-api':'pages/settings-channels-wa-api.html',
  'settings/channels-whatsapp-web':'pages/settings-channels-wa-web.html',
  'settings/channels-widget':'pages/settings-channels-widget.html',
  'settings/billing-cost':'pages/settings-billing-cost.html',
  'settings/developer-webhook':'pages/settings-developer-webhook.html',
};

async function loadPage(name){
  const url=PAGE_MAP[name];
  if(!url)return `<div style="padding:40px;text-align:center;color:var(--muted)">Halaman <b>${name}</b> belum dibuat.</div>`;
  return (window.__PAGES&&window.__PAGES[url])||`<div style="padding:40px;text-align:center;color:var(--danger)">Halaman ${name} tidak ada dalam bundle. Jalankan build.py.</div>`;
}

async function showPage(name){
  const el=document.getElementById('page-content');
  el.innerHTML='<div style="padding:40px;color:var(--muted)">Memuat…</div>';
  el.innerHTML=await loadPage(name);
  // Auto-inject shared settings nav for all settings pages
  if(name.startsWith('settings/')){
    const activeId=name.replace('settings/','');
    const sn=el.querySelector('.settings-sidenav');
    if(sn)sn.innerHTML=renderSettingsNav(activeId);
  }
  // Execute inline scripts in loaded page
  el.querySelectorAll('script').forEach(s=>{
    const ns=document.createElement('script');
    if(s.src)ns.src=s.src;else ns.textContent=s.textContent;
    document.body.appendChild(ns);s.remove();
  });
  // Update rail active state (match data-page on .rail-btn)
  const section=name.split('/')[0];
  document.querySelectorAll('.rail-btn[data-page]').forEach(r=>{
    r.classList.toggle('active',r.dataset.page===section||r.dataset.page===name);
  });
  window.scrollTo(0,0);
}

// Settings sidenav renderer (shared by all settings pages)
function renderSettingsNav(active){
  const nav=[
    {title:'Organisasi',items:[
      {id:'organization-general',label:'Umum',icon:'⚙'},
      {id:'organization-members',label:'Anggota',icon:'👥'},
      {id:'organization-roles',label:'Role & Permission',icon:'🔐'},
      {id:'organization-tags',label:'Tag',icon:'🏷'},
      {id:'organization-shift-hours',label:'Jadwal Kerja',icon:'🕐'},
    ]},
    {title:'Kotak Masuk',items:[
      {id:'inbox-assignments',label:'Auto-assignment',icon:'🔀'},
      {id:'inbox-csat',label:'CSAT',icon:'⭐'},
      {id:'inbox-macros',label:'Macros',icon:'⚡'},
      {id:'inbox-sla',label:'SLA',icon:'⏱'},
      {id:'inbox-team-inbox',label:'Tim Kotak Masuk',icon:'📥'},
      {id:'inbox-tickets',label:'Tiket',icon:'🎫'},
    ]},
    {title:'Channel',items:[
      {id:'channels-whatsapp-api',label:'WhatsApp API',icon:'💬'},
      {id:'channels-whatsapp-web',label:'WhatsApp Web',icon:'📱'},
      {id:'channels-widget',label:'Widget',icon:'🧩'},
    ]},
    {title:'Prospek',items:[
      {id:'lead-pipeline',label:'Pipeline Leads',icon:'💰'},
    ]},
    {title:'Billing',items:[
      {id:'billing-cost',label:'Kontrol Biaya',icon:'💳'},
    ]},
    {title:'Developer',items:[
      {id:'developer-webhook',label:'Webhook',icon:'🔗'},
    ]},
  ];
  let h='<div class="sn-title" style="font-size:15px;font-weight:700;padding:4px 16px 14px">Pengaturan</div>';
  nav.forEach(s=>{
    h+=`<div class="sn-title">${s.title}</div>`;
    s.items.forEach(i=>{
      const cls=i.id===active?'active':'';
      h+=`<div class="sn-item ${cls}" onclick="go('settings/${i.id}')">${i.icon} ${i.label}</div>`;
    });
  });
  return h;
}

function go(page){
  const target='#/'+page;
  if(window.location.hash===target)onHash();  // ponytail: same-hash click won't fire hashchange; force re-render
  else window.location.hash=target;
}

async function onHash(){
  const hash=window.location.hash.replace('#/','')||'conversation';
  await showPage(hash);
}

window.addEventListener('hashchange',onHash);

// Global search modal — mirror FE GlobalSearchModal
function openSearchModal(){
  document.getElementById('searchModal').classList.add('open');
  setTimeout(()=>document.getElementById('globalSearchInput').focus(),50);
}
function closeSearchModal(){
  document.getElementById('searchModal').classList.remove('open');
  document.getElementById('globalSearchInput').value='';
  document.getElementById('searchResults').innerHTML='';
}
function doGlobalSearchLive(q){
  const el=document.getElementById('searchResults');
  if(!q.trim()){el.innerHTML='';return}
  q=q.toLowerCase();
  // Search conversations
  const convs=DB.conversations.filter(c=>{
    const ct=c.contactId?DB.contacts.find(x=>x.id===c.contactId):null;
    const name=ct?ct.name.toLowerCase():'';
    const msg=(c.lastMsg||'').toLowerCase();
    return name.includes(q)||msg.includes(q);
  }).slice(0,5);
  // Search contacts
  const cts=DB.contacts.filter(c=>c.name.toLowerCase().includes(q)||c.phone.includes(q)).slice(0,5);
  // Search tickets
  const tks=DB.tickets.filter(t=>t.subject.toLowerCase().includes(q)).slice(0,5);
  let h='';
  if(convs.length){h+='<div style="font-weight:600;color:var(--muted);margin:8px 0 4px;font-size:11px;text-transform:uppercase">Percakapan</div>';convs.forEach(c=>{const ct=DB.contacts.find(x=>x.id===c.contactId);h+=`<div style="padding:6px 8px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="closeSearchModal();go('conversation')">${ct?ct.name:'Unknown'} · <span style="color:var(--muted)">${c.lastMsg||''}</span></div>`})}
  if(cts.length){h+='<div style="font-weight:600;color:var(--muted);margin:8px 0 4px;font-size:11px;text-transform:uppercase">Kontak</div>';cts.forEach(c=>h+=`<div style="padding:6px 8px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="closeSearchModal();go('contacts')">${c.name} · <span style="color:var(--muted)">${c.phone}</span></div>`)}
  if(tks.length){h+='<div style="font-weight:600;color:var(--muted);margin:8px 0 4px;font-size:11px;text-transform:uppercase">Tiket</div>';tks.forEach(t=>h+=`<div style="padding:6px 8px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="closeSearchModal();go('ticketing')">${t.subject}</div>`)}
  if(!h)h='<div style="color:var(--muted);text-align:center;padding:16px">Tidak ditemukan</div>';
  el.innerHTML=h;
}

// User popover toggle — mirror FE SideNavFooter UserPopoverContent
function toggleUserPop(){
  document.getElementById('userPopover').classList.toggle('hide');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#userPopover')&&!e.target.closest('#userPopBtn')){
    document.getElementById('userPopover')?.classList.add('hide');
  }
});

// Toast helper
function showToast(msg){
  let t=document.querySelector('.toast');
  if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// Notif badge updater
function updNotifBadge(){
  const unread=DB.notifications.filter(n=>!n.read).length;
  const badge=document.getElementById('notifBadge');
  if(!badge)return;
  badge.textContent=unread;
  badge.classList.toggle('hide',unread===0);
}

// Keyboard shortcut: Escape closes search/modal
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('searchModal').classList.contains('open'))closeSearchModal();
  }
});

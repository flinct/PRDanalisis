/* === Auth Flow — dummy login/register/forgot/onboarding === */
// ponytail: no real auth, DB.users is the "backend". Session = DB.currentUser.

function showAuth(form){
  ['login','register','forgot','onboarding'].forEach(f=>{
    const el=document.getElementById('auth-'+f);
    if(el)el.classList.toggle('hide',f!==form);
  });
  document.getElementById('login-err')?.classList.add('hide');
  document.getElementById('reg-err')?.classList.add('hide');
  document.getElementById('forgot-ok')?.classList.add('hide');
}

function doLogin(e){
  e.preventDefault();
  const id=document.getElementById('login-email').value.trim().toLowerCase();
  const pass=document.getElementById('login-pass').value;
  // Match by email OR username
  const user=DB.users.find(u=>(u.email===id||u.username===id)&&u.password===pass);
  if(!user){document.getElementById('login-err').classList.remove('hide');return false}
  DB.currentUser=user;saveStore();
  enterApp();
  return false;
}

function doRegister(e){
  e.preventDefault();
  const name=document.getElementById('reg-name').value.trim();
  const username=document.getElementById('reg-username')?.value?.trim()?.toLowerCase()||'';
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const pass2=document.getElementById('reg-pass2').value;
  const errEl=document.getElementById('reg-err');
  if(pass.length<8){errEl.textContent='Kata sandi minimal 8 karakter.';errEl.classList.remove('hide');return false}
  if(pass!==pass2){errEl.textContent='Kata sandi tidak cocok.';errEl.classList.remove('hide');return false}
  if(DB.users.find(u=>u.email===email)){errEl.textContent='Email sudah terdaftar.';errEl.classList.remove('hide');return false}
  if(username&&DB.users.find(u=>u.username===username)){errEl.textContent='Nama pengguna sudah digunakan.';errEl.classList.remove('hide');return false}
  const user={id:genId('u'),name,username,email,password:pass,role:'agent',initials:name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),org:''};
  dbAdd('users',user);
  DB.currentUser=user;saveStore();
  showAuth('onboarding');
  return false;
}

function doForgot(e){
  e.preventDefault();
  document.getElementById('forgot-ok').classList.remove('hide');
  return false;
}

function doOnboarding(){
  const org=document.getElementById('onb-org').value.trim();
  if(org&&DB.currentUser){
    DB.currentUser.org=org;
    dbUpdate('users',DB.currentUser.id,{org});
  }
  enterApp();
}

function enterApp(){
  document.getElementById('auth-screen').classList.add('hide');
  const app=document.getElementById('app');
  app.classList.remove('hide');
  // Role class on app for CSS gating — manual override wins over login role
  app.className='app';
  const viewRole=localStorage.getItem('viewRole')||(DB.currentUser?DB.currentUser.role:'agent')||'agent';
  app.classList.add('role-'+viewRole);
  // Layout Prospek (A/B/C/D) — persist dari localStorage, default 'a'
  app.classList.add('layout-'+(localStorage.getItem('salesLayout')||'a'));
  // Set avatar in rail footer + user popover
  if(DB.currentUser){
    const av=DB.currentUser.initials||'??';
    const name=DB.currentUser.name;
    const role=DB.currentUser.role||'agent';
    document.getElementById('userAvatarSmall').textContent=av;
    document.getElementById('userPopBtn').title=name;
    document.getElementById('upName').textContent=name;
    document.getElementById('upRole').textContent=role.charAt(0).toUpperCase()+role.slice(1);
  }
  // Update notif badge
  if(typeof updNotifBadge==='function')updNotifBadge();
  // Load default page
  onHash();
}

function doLogout(){
  DB.currentUser=null;saveStore();
  document.getElementById('app').classList.add('hide');
  document.getElementById('auth-screen').classList.remove('hide');
  showAuth('login');
}

// Auto-login if session exists
(function initAuth(){
  if(DB.currentUser){
    const user=DB.users.find(u=>u.id===DB.currentUser.id);
    if(user){DB.currentUser=user;enterApp()}
    else{DB.currentUser=null;saveStore();showAuth('login')}
  }else{showAuth('login')}
})();

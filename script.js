
// mechanics_site/assets/script.js

// --- simple site-wide JS: nav highlighter, search, comments, login, quiz scoring ---

// Nav active state
(function(){
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('nav.top a').forEach(a => {
    const href = a.getAttribute('href');
    if(href && href.endsWith(path)) a.classList.add('active');
    if(!path && href.endsWith('index.html')) a.classList.add('active');
  });
})();

// Simple local search over known pages
const PAGES = [
  {title:'Home', url:'index.html', tags:'overview project purpose site-map search comments contact'},
  {title:'Laws of Motion', url:'laws-of-motion.html', tags:'newton first second third inertia f=ma action reaction dynamics kinematics'},
  {title:'Inclined Planes', url:'inclined-planes.html', tags:'incline slope friction angle component mg sin cos resolved forces'},
  {title:'Pulley System', url:'pulley-system.html', tags:'pulleys atwood machine tension acceleration mass system'},
  {title:'Forces', url:'forces.html', tags:'weight normal tension friction drag thrust free-body diagram'},
  {title:'Quiz', url:'quiz.html', tags:'assessment questions test'},
  {title:'Assignments', url:'assignments.html', tags:'homework tasks'},
  {title:'Login', url:'login.html', tags:'form authentication privileges'}
];

function doSearch(q, ul){
  ul.innerHTML = '';
  if(!q) return;
  const needle = q.toLowerCase();
  const matches = PAGES.filter(p => (p.title + ' ' + p.tags).toLowerCase().includes(needle));
  matches.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${p.url}">${p.title}</a> <span class="badge">page</span>`;
    ul.appendChild(li);
  });
  if(ul.children.length===0){
    ul.innerHTML = '<li>No results. Try broader terms.</li>';
  }
}

// Comments (stored in localStorage)
function saveComment(name, msg){
  const key = 'comments';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.push({name, msg, at: new Date().toISOString()});
  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
}
function renderComments(container){
  const arr = JSON.parse(localStorage.getItem('comments') || '[]');
  container.innerHTML = '';
  arr.slice().reverse().forEach(c => {
    const div = document.createElement('div');
    div.className = 'card';
    const when = new Date(c.at).toLocaleString();
    div.innerHTML = `<strong>${c.name}</strong> <span class="small">(${when})</span><br>${c.msg}`;
    container.appendChild(div);
  });
}

// Login (demo only, grants simple role)
function doLogin(user, pass){
  // Demo credentials (client-only; for coursework demonstration)
  const db = {"teacher":"mechanics123", "student":"learn2move"};
  if(db[user] && db[user]===pass){
    localStorage.setItem('role', user==='teacher' ? 'teacher' : 'student');
    return true;
  }
  return false;
}
function currentRole(){
  return localStorage.getItem('role') || 'guest';
}

// Simple quiz scoring (radio/checkbox/text)
function gradeQuiz(form, resultEl){
  let score = 0, total = 0;

  // Q1 (single choice)
  total++; if(form.q1.value === '2nd') score++;

  // Q2 (text numeric)
  total++; {
    const val = (form.q2.value || '').trim();
    if(val === '4' || val === '4.0') score++;
  }

  // Q3 (multiple answers)
  total++; {
    const ok = form.querySelectorAll('[name="q3"]:checked');
    // Correct: "Tension" and "Weight" on Atwood masses → 2 correct, allow exactly those 2
    const picked = [...ok].map(i=>i.value).sort().join(',');
    if(picked === 'tension,weight') score++;
  }

  // Q4 (single choice)
  total++; if(form.q4.value === 'down-slope') score++;

  // Q5 (true/false)
  total++; if(form.q5.value === 'true') score++;

  const pct = Math.round((score/total)*100);
  resultEl.textContent = `You scored ${score}/${total} (${pct}%).`;
  resultEl.className = 'quiz-result ' + (pct>=60 ? 'good':'bad');
}

// Utility: attach handlers if elements are present
document.addEventListener('DOMContentLoaded', () => {
  // Search
  const searchInput = document.querySelector('#site-search');
  const results = document.querySelector('#search-results');
  if(searchInput && results){
    searchInput.addEventListener('input', e => doSearch(e.target.value, results));
  }

  // Comments
  const cForm = document.querySelector('#comment-form');
  const cList = document.querySelector('#comment-list');
  if(cForm && cList){
    renderComments(cList);
    cForm.addEventListener('submit', e => {
      e.preventDefault();
      saveComment(cForm.name.value.trim() || 'Anonymous', cForm.message.value.trim());
      cForm.reset();
      renderComments(cList);
    });
  }

  // Login
  const loginForm = document.querySelector('#login-form');
  const roleBadge = document.querySelector('#role-badge');
  if(loginForm){
    roleBadge.textContent = currentRole();
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const ok = doLogin(loginForm.username.value, loginForm.password.value);
      const msg = document.querySelector('#login-msg');
      if(ok){
        roleBadge.textContent = currentRole();
        msg.textContent = 'Login successful.';
        msg.className = 'notice';
      }else{
        msg.textContent = 'Invalid credentials.';
        msg.className = 'notice';
      }
    });
  }

  // Quiz
  const quizForm = document.querySelector('#quiz-form');
  const quizResult = document.querySelector('#quiz-result');
  if(quizForm && quizResult){
    quizForm.addEventListener('submit', e => {
      e.preventDefault();
      gradeQuiz(quizForm, quizResult);
    });
  }
});

const conversation = [];

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const uploadBtn = document.getElementById('upload-btn');
const uploadPopup = document.getElementById('upload-popup');
const fileChip = document.getElementById('file-chip');
const fileName = document.getElementById('file-name');
const filePreview = document.getElementById('file-preview');
const chipRemove = document.getElementById('chip-remove');
const imageInput = document.getElementById('image-input');
const docInput = document.getElementById('doc-input');
const audioInput = document.getElementById('audio-input');
const newSessionBtn = document.getElementById('new-session-btn');
const sessionList = document.getElementById('session-list');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

const docSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 11V14M12 14V17M12 14H9M12 14H15M13 3H5V21H19V9M13 3H14L19 8V9M13 3V7C13 8 14 9 15 9H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const audioSvg = '<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 22.42C8.20914 22.42 10 20.6292 10 18.42C10 16.2109 8.20914 14.42 6 14.42C3.79086 14.42 2 16.2109 2 18.42C2 20.6292 3.79086 22.42 6 22.42Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 20.42C20.2091 20.42 22 18.6292 22 16.42C22 14.2109 20.2091 12.42 18 12.42C15.7909 12.42 14 14.2109 14 16.42C14 18.6292 15.7909 20.42 18 20.42Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 18.4099V9.5C9.99907 8.0814 10.5008 6.70828 11.4162 5.62451C12.3315 4.54074 13.6012 3.81639 15 3.57996L22 2.40991V16.4099" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const iconMap = { document: docSvg, audio: audioSvg };

const endpointMap = {
  image: '/generate-from-image',
  document: '/generate-from-document',
  audio: '/generate-from-audio',
};

const fieldMap = {
  image: 'image',
  document: 'document',
  audio: 'audio',
};

const inputMap = {
  image: imageInput,
  document: docInput,
  audio: audioInput,
};

let selectedFile = null;
let fileCategory = '';
let previewUrl = null;

let sessions = [];
let currentSessionId = null;
let sessionCounter = 1;

const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

function toggleSidebar() {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.add('hidden');
}

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

uploadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  uploadPopup.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!uploadPopup.classList.contains('hidden') &&
      !uploadPopup.contains(e.target) &&
      e.target !== uploadBtn &&
      !uploadBtn.contains(e.target)) {
    uploadPopup.classList.add('hidden');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !uploadPopup.classList.contains('hidden')) {
    uploadPopup.classList.add('hidden');
  }
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    closeSidebar();
  }
});

document.querySelectorAll('.popup-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    uploadPopup.classList.add('hidden');
    inputMap[type].click();
  });
});

function handleFileSelect(e, category) {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;
  fileCategory = category;
  fileName.textContent = file.name;
  fileName.title = file.name;
  filePreview.innerHTML = '';

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (category === 'image') {
    previewUrl = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = previewUrl;
    img.alt = file.name;
    filePreview.appendChild(img);
  } else {
    filePreview.innerHTML = iconMap[category];
  }

  fileChip.classList.remove('hidden');
}

imageInput.addEventListener('change', (e) => handleFileSelect(e, 'image'));
docInput.addEventListener('change', (e) => handleFileSelect(e, 'document'));
audioInput.addEventListener('change', (e) => handleFileSelect(e, 'audio'));

chipRemove.addEventListener('click', () => {
  clearFileSelection();
});

function renderMarkdown(text) {
  if (typeof marked === 'undefined') {
    return text;
  }
  const raw = marked.parse(text);
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','ul','ol','li','code','pre','a','blockquote','hr','table','thead','tbody','tr','th','td'],
      ALLOWED_ATTR: ['href','target','rel'],
    });
  }
  return raw;
}

function clearFileSelection() {
  selectedFile = null;
  fileCategory = '';
  fileChip.classList.add('hidden');
  fileName.textContent = '';
  filePreview.innerHTML = '';
  imageInput.value = '';
  docInput.value = '';
  audioInput.value = '';
  previewUrl = null;
}

function appendMessage(role, text, extraClass = '') {
  const div = document.createElement('div');
  div.className = `message ${role}${extraClass ? ' ' + extraClass : ''}`;
  div.textContent = text;
  chatBox.appendChild(div);
  scrollToBottom();
  return div;
}

function appendUserMessageWithFile(text, file, category) {
  const div = document.createElement('div');
  div.className = 'message user';

  if (text) {
    const textEl = document.createElement('div');
    textEl.textContent = text;
    div.appendChild(textEl);
  }

  const attach = document.createElement('div');
  attach.className = 'file-attachment';

  if (category === 'image' && previewUrl) {
    const img = document.createElement('img');
    img.src = previewUrl;
    img.alt = file.name;
    img.className = 'file-thumb';
    attach.appendChild(img);
  } else {
    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.innerHTML = iconMap[category];
    attach.appendChild(icon);
  }

  const nameEl = document.createElement('span');
  nameEl.className = 'file-name';
  nameEl.textContent = file.name;
  attach.appendChild(nameEl);

  div.appendChild(attach);
  chatBox.appendChild(div);
  scrollToBottom();
  return div;
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setFormEnabled(enabled) {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  uploadBtn.disabled = !enabled;
  if (enabled) userInput.focus();
}

function saveSessions() {
  const current = sessions.find(s => s.id === currentSessionId);
  if (current) {
    current.conversation = JSON.parse(JSON.stringify(conversation));
  }
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
  localStorage.setItem('currentSessionId', currentSessionId);
}

function renderSessionList() {
  sessionList.innerHTML = '';
  sessions.forEach(s => {
    const div = document.createElement('div');
    div.className = `session-item${s.id === currentSessionId ? ' active' : ''}`;
    div.dataset.id = s.id;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'session-name';
    nameSpan.textContent = s.name;
    div.appendChild(nameSpan);

    const delBtn = document.createElement('button');
    delBtn.className = 'session-delete';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(s.id);
    });
    div.appendChild(delBtn);

    div.addEventListener('click', () => {
      switchSession(s.id);
    });

    sessionList.appendChild(div);
  });
}

function switchSession(id) {
  if (id === currentSessionId) return;

  const current = sessions.find(s => s.id === currentSessionId);
  if (current) {
    current.conversation = JSON.parse(JSON.stringify(conversation));
  }

  currentSessionId = id;
  const next = sessions.find(s => s.id === id);
  if (!next) return;

  conversation.length = 0;
  next.conversation.forEach(msg => conversation.push(msg));

  chatBox.innerHTML = '';
  conversation.forEach(msg => {
    if (msg.role === 'user') {
      const el = appendMessage('user', msg.text);
      el.className = 'message user';
    } else {
      const el = appendMessage('bot', msg.text);
      el.className = 'message bot';
      el.innerHTML = renderMarkdown(msg.text);
    }
  });

  renderSessionList();
  closeSidebar();
  saveSessions();
  scrollToBottom();
}

function newSession() {
  const id = Date.now();
  const current = sessions.find(s => s.id === currentSessionId);
  if (current) {
    current.conversation = JSON.parse(JSON.stringify(conversation));
  }

  sessions.push({ id, name: `Sesi ${sessionCounter++}`, conversation: [] });
  currentSessionId = id;
  conversation.length = 0;
  chatBox.innerHTML = '';

  renderSessionList();
  saveSessions();
  closeSidebar();
}

function deleteSession(id) {
  if (sessions.length <= 1) return;

  const wasCurrent = id === currentSessionId;
  sessions = sessions.filter(s => s.id !== id);

  if (wasCurrent) {
    const first = sessions[0];
    currentSessionId = first.id;
    conversation.length = 0;
    first.conversation.forEach(msg => conversation.push(msg));
    chatBox.innerHTML = '';
    conversation.forEach(msg => {
      if (msg.role === 'user') {
        const el = appendMessage('user', msg.text);
        el.className = 'message user';
      } else {
        const el = appendMessage('bot', msg.text);
        el.className = 'message bot';
        el.innerHTML = renderMarkdown(msg.text);
      }
    });
  }

  renderSessionList();
  saveSessions();
  scrollToBottom();
}

function initSessions() {
  const saved = localStorage.getItem('chatSessions');
  const savedId = localStorage.getItem('currentSessionId');

  if (saved) {
    sessions = JSON.parse(saved);
    if (savedId && sessions.some(s => s.id === Number(savedId))) {
      currentSessionId = Number(savedId);
    } else {
      currentSessionId = sessions[0].id;
    }
  }

  if (sessions.length === 0) {
    currentSessionId = Date.now();
    sessions.push({ id: currentSessionId, name: 'Sesi 1', conversation: [] });
    sessionCounter = 2;
  } else {
    sessionCounter = Math.max(...sessions.map(s => {
      const match = s.name.match(/Sesi (\d+)/);
      return match ? parseInt(match[1]) : 0;
    })) + 1;
  }

  const current = sessions.find(s => s.id === currentSessionId);
  if (current) {
    current.conversation.forEach(msg => conversation.push(msg));
    chatBox.innerHTML = '';
    conversation.forEach(msg => {
      if (msg.role === 'user') {
        const el = appendMessage('user', msg.text);
        el.className = 'message user';
      } else {
        const el = appendMessage('bot', msg.text);
        el.className = 'message bot';
        el.innerHTML = renderMarkdown(msg.text);
      }
    });
  }

  renderSessionList();
  scrollToBottom();
}

newSessionBtn.addEventListener('click', newSession);

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();

  if (!text && !selectedFile) return;

  if (selectedFile && !text) {
    userInput.value = '';
  }

  const userLabel = selectedFile
    ? (text ? `${text} (📎 ${selectedFile.name})` : `📎 ${selectedFile.name}`)
    : text;

  conversation.push({ role: 'user', text: userLabel });

  if (selectedFile) {
    appendUserMessageWithFile(text, selectedFile, fileCategory);
    userInput.value = '';
  } else {
    appendMessage('user', text);
    userInput.value = '';
  }

  const thinkingEl = appendMessage('bot', 'Thinking...', 'thinking');
  setFormEnabled(false);

  try {
    let res;

    if (selectedFile) {
      const fd = new FormData();
      if (text) fd.append('prompt', text);
      fd.append(fieldMap[fileCategory], selectedFile);
      res = await fetch(endpointMap[fileCategory], { method: 'POST', body: fd });
    } else {
      res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      });
    }

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data.result;

    if (reply) {
      thinkingEl.className = 'message bot';
      thinkingEl.innerHTML = renderMarkdown(reply);
      conversation.push({ role: 'model', text: reply });
    } else {
      thinkingEl.className = 'message bot error';
      thinkingEl.textContent = 'Sorry, no response received.';
    }
  } catch {
    thinkingEl.className = 'message bot error';
    thinkingEl.textContent = 'Failed to get response from server.';
  } finally {
    if (selectedFile) clearFileSelection();
    saveSessions();
    setFormEnabled(true);
    scrollToBottom();
  }
});

initSessions();

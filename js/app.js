(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const blank = () => ({ id: uid(), chinese: "", pinyin: "", vietnamese: "" });

  const state = { topics: [], view: "home", topicId: null, draft: null, errors: [], session: null, feedback: null, modal: null };

  function init() {
    let t = TopicStorage.loadTopics();
    if (t === null) {
      t = [{ id: uid(), name: "Lesson 1 - HSK1", words: [
        ["你好", "nǐ hǎo", "Xin chào"], ["谢谢", "xiè xie", "Cảm ơn"], ["再见", "zài jiàn", "Tạm biệt"],
        ["朋友", "péng you", "Bạn bè"], ["学习", "xué xí", "Học tập"]
      ].map(([chinese, pinyin, vietnamese]) => ({ id: uid(), chinese, pinyin, vietnamese })) }];
      TopicStorage.saveTopics(t);
    }
    state.topics = t;
    render();
  }

  const topic = () => state.topics.find(t => t.id === state.topicId);
  const go = (view, extra = {}) => { Object.assign(state, { view, errors: [] }, extra); render(); };

  function render() {
    $("#topicList").innerHTML = state.topics.map(t =>
      `<button class="topic-item ${t.id === state.topicId ? "active" : ""}" data-action="open" data-id="${t.id}">
        <strong>${esc(t.name)}</strong><span>${t.words.length} words</span></button>`).join("");
    const views = { home: viewHome, topic: viewTopic, all: viewAll, form: viewForm, learn: viewLearn };
    $("#main").innerHTML = views[state.view]();
    renderModal();
    const f = $("#main [data-focus]"); if (f) f.focus();
  }

  function viewHome() {
    if (!state.topics.length) return `<div class="card center"><h2>Welcome to Chinese Learning</h2>
      <p>You don't have any topics yet. Create your first topic to start learning.</p>
      <button class="btn primary" data-action="new">+ Create your first Topic</button></div>`;
    return `<h2>Welcome back 👋</h2><p class="muted">Your Topics</p><div class="grid">${state.topics.map(t =>
      `<button class="card topic-card" data-action="open" data-id="${t.id}"><h3>${esc(t.name)}</h3><span>${t.words.length} words</span></button>`).join("")}</div>`;
  }

  function viewTopic() {
    const t = topic(); const n = t.words.length; const dis = n ? "" : "disabled";
    return `<div class="card"><h2>${esc(t.name)}</h2><p class="muted">${n} Words</p>
      ${n ? "" : `<p>No vocabulary yet.</p><button class="btn" data-action="edit">+ Add Word</button>`}
      <div class="stack">
        <button class="btn" data-action="all" ${dis}>📖 See All</button>
        <button class="btn primary" data-action="learn" data-mode="vi-zh" ${dis}>🇻🇳 → 🇨🇳 Learn Vietnamese → Chinese</button>
        <button class="btn primary" data-action="learn" data-mode="zh-vi" ${dis}>🇨🇳 → 🇻🇳 Learn Chinese → Vietnamese</button>
      </div>
      <div class="row end"><button class="btn" data-action="edit">Edit Topic</button>
      <button class="btn danger" data-action="ask-delete">Delete Topic</button></div></div>`;
  }

  function viewAll() {
    const t = topic();
    return `<div class="card"><button class="btn" data-action="back">← Back</button><h2>${esc(t.name)}</h2>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Chinese</th><th>Pinyin</th><th>Vietnamese</th></tr></thead><tbody>
      ${t.words.map((w, i) => `<tr><td>${i + 1}</td><td class="zh">${esc(w.chinese)}</td><td>${esc(w.pinyin)}</td><td>${esc(w.vietnamese)}</td></tr>`).join("")}
      </tbody></table></div></div>`;
  }

  function viewForm() {
    const d = state.draft;
    return `<div class="card"><h2>${d.id ? "Edit Topic" : "Create New Topic"}</h2>
      ${state.errors.length ? `<div class="error-box">${state.errors.map(e => `<div>${esc(e)}</div>`).join("")}</div>` : ""}
      <label>Topic Name<input id="topicName" value="${esc(d.name)}" placeholder="Lesson 1 - HSK1" data-focus></label>
      <h3>Vocabulary</h3>
      ${d.words.length ? "" : `<p class="muted">No vocabulary yet.</p>`}
      <div class="table-wrap"><table class="edit"><thead><tr><th>中文</th><th>Pinyin</th><th>Tiếng Việt</th><th></th></tr></thead><tbody>
      ${d.words.map((w, i) => `<tr>${["chinese", "pinyin", "vietnamese"].map(f =>
        `<td><input data-i="${i}" data-f="${f}" value="${esc(w[f])}" placeholder="${f}"></td>`).join("")}
        <td><button class="btn icon" data-action="del-word" data-i="${i}" title="Delete">🗑</button></td></tr>`).join("")}
      </tbody></table></div>
      <button class="btn" data-action="add-word">+ Add Word</button>
      <div class="row between"><button class="btn" data-action="cancel-form">Cancel</button>
      <button class="btn primary" data-action="save-form">Done</button></div></div>`;
  }

  function viewLearn() {
    const s = state.session, t = topic(), dir = s.mode === "vi-zh" ? "Vietnamese → Chinese" : "Chinese → Vietnamese";
    const head = `<div class="row between"><strong>${esc(t.name)}</strong><button class="btn" data-action="ask-exit">✕ Exit</button></div><p class="muted">${dir}</p>`;
    if (s.isComplete && !state.feedback) return `<div class="card center learn">${head}
      <h2>🎉 Lesson Complete!</h2><p>${esc(t.name)}</p><p>Correct: ${s.correct} &nbsp; Wrong: ${s.wrong}</p>
      <p class="big">Score: ${s.total} / ${s.total}</p><p>Great job!</p>
      <div class="stack"><button class="btn primary" data-action="learn" data-mode="${s.mode}">🔄 Learn Again</button>
      <button class="btn" data-action="back">← Back to Topic</button></div></div>`;
    const fb = state.feedback, w = s.current;
    let feedback = "";
    if (fb && fb.ok) feedback = `<div class="fb ok">✓ Correct!<div class="ans">${esc(w.chinese)}<br>${esc(w.pinyin)}<br>${esc(w.vietnamese)}</div></div>
      <button class="btn primary" data-action="next" data-focus>Next →</button>`;
    if (fb && !fb.ok) feedback = `<div class="fb bad">✗ Wrong<div>Your answer:<br><b>${esc(fb.user)}</b></div><div>Correct answer:<br><b>${esc(s.expected)}</b></div></div>`;
    const input = fb && fb.ok ? "" : `<input id="answer" class="answer" autocomplete="off" placeholder="Type ${s.mode === "vi-zh" ? "Chinese" : "Vietnamese"} here..." data-focus>
      <div class="stack"><button class="btn primary" data-action="check">Check</button>
      ${fb && !fb.ok ? `<button class="btn" data-action="skip">Skip →</button>` : ""}</div>`;
    return `<div class="card center learn">${head}
      <p class="big">${s.completed.size} / ${s.total}</p>
      <div class="question ${s.mode === "zh-vi" ? "zh" : ""}">${esc(s.prompt)}</div>${input}${feedback}
      <div class="stats">Correct: ${s.correct} · Wrong: ${s.wrong} · Remaining: ${s.total - s.completed.size} · Skipped: ${s.skipped.length}</div></div>`;
  }

  function renderModal() {
    const m = state.modal, el = $("#modal");
    if (!m) { el.innerHTML = ""; return; }
    el.innerHTML = m === "exit"
      ? `<div class="overlay"><div class="dialog"><h3>Exit Learning?</h3><p>Your current progress will be lost.</p><div class="row between">
        <button class="btn primary" data-action="close-modal">No, Continue Learning</button><button class="btn danger" data-action="exit-yes">Yes, Exit</button></div></div></div>`
      : `<div class="overlay"><div class="dialog"><h3>Delete Topic?</h3><p>This will permanently delete:</p><p><b>${esc(topic().name)}</b></p><div class="row between">
        <button class="btn" data-action="close-modal">Cancel</button><button class="btn danger" data-action="delete-yes">Delete</button></div></div></div>`;
  }

  function collectDraft() {
    const d = state.draft; d.name = ($("#topicName") || {}).value || d.name;
    document.querySelectorAll("[data-i]").forEach(el => { if (el.dataset.f) d.words[+el.dataset.i][el.dataset.f] = el.value; });
  }

  function saveForm() {
    collectDraft();
    const d = state.draft, errs = [];
    const words = d.words.filter(w => w.chinese.trim() || w.pinyin.trim() || w.vietnamese.trim());
    if (!d.name.trim()) errs.push("Topic name is required.");
    if (!words.length) errs.push("Add at least one word.");
    words.forEach((w, i) => {
      if (!w.chinese.trim()) errs.push(`Word ${i + 1}: Chinese is required.`);
      if (!w.pinyin.trim()) errs.push(`Word ${i + 1}: Pinyin is required.`);
      if (!w.vietnamese.trim()) errs.push(`Word ${i + 1}: Vietnamese is required.`);
    });
    if (errs.length) { state.errors = errs; return render(); }
    const saved = { id: d.id || uid(), name: d.name.trim(), words: words.map(w => ({ id: w.id, chinese: w.chinese.trim(), pinyin: w.pinyin.trim(), vietnamese: w.vietnamese.trim() })) };
    state.topics = TopicStorage.updateTopic(state.topics, saved);
    go("topic", { topicId: saved.id });
  }

  function startLearn(mode) {
    state.session = new LearningSession(topic().words, mode);
    state.feedback = null;
    go("learn");
  }

  function check() {
    const input = $("#answer"); if (!input || !input.value.trim()) return;
    state.feedback = { ok: state.session.check(input.value), user: input.value };
    render();
  }

  const actions = {
    home: () => go("home", { topicId: null }),
    new: () => go("form", { draft: { id: null, name: "", words: [blank()] }, topicId: null }),
    open: b => go("topic", { topicId: b.dataset.id }),
    all: () => go("all"),
    back: () => go("topic"),
    learn: b => startLearn(b.dataset.mode),
    edit: () => go("form", { draft: JSON.parse(JSON.stringify(topic())) }),
    "add-word": () => { collectDraft(); state.draft.words.push(blank()); render(); const r = document.querySelectorAll("table.edit tbody tr:last-child input")[0]; if (r) r.focus(); },
    "del-word": b => { collectDraft(); state.draft.words.splice(+b.dataset.i, 1); render(); },
    "cancel-form": () => go(state.draft.id ? "topic" : "home"),
    "save-form": saveForm,
    "ask-delete": () => { state.modal = "delete"; render(); },
    "delete-yes": () => { state.topics = TopicStorage.deleteTopic(state.topics, state.topicId); state.modal = null; go("home", { topicId: null }); },
    check, 
    next: () => { state.session.next(); state.feedback = null; render(); },
    skip: () => { state.session.skip(); state.feedback = null; render(); },
    "ask-exit": () => { state.modal = "exit"; render(); },
    "exit-yes": () => { state.modal = null; state.session = null; state.feedback = null; go("topic"); },
    "close-modal": () => { state.modal = null; render(); }
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-action]");
    if (b && actions[b.dataset.action]) actions[b.dataset.action](b);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && state.modal) { state.modal = null; return render(); }
    if (e.key !== "Enter" || state.modal || state.view !== "learn" || e.target.tagName === "BUTTON") return;
    if (state.feedback && state.feedback.ok) actions.next(); else check();
  });

  init();
})();

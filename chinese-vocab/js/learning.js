function normalizeAnswer(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
// Vietnamese: also ignore diacritics so "xin chao" matches "Xin chào"
function normalizeVietnamese(value) {
  return normalizeAnswer(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

class LearningSession {
  // mode: "vi-zh" (Vietnamese -> Chinese) or "zh-vi" (Chinese -> Vietnamese)
  constructor(words, mode) {
    this.mode = mode;
    this.total = words.length;
    this.queue = shuffle(words);
    this.skipped = [];
    this.completed = new Set();
    this.correct = 0;
    this.wrong = 0;
  }
  get current() { return this.queue[0] || null; }
  get isComplete() { return this.completed.size === this.total; }
  get prompt() { return this.mode === "vi-zh" ? this.current.vietnamese : this.current.chinese; }
  get expected() { return this.mode === "vi-zh" ? this.current.chinese : this.current.vietnamese; }
  check(answer) {
    const norm = this.mode === "vi-zh" ? normalizeAnswer : normalizeVietnamese;
    const ok = norm(answer) === norm(this.expected);
    if (ok) { this.correct++; this.completed.add(this.current.id); } else this.wrong++;
    return ok;
  }
  next() {
    this.queue.shift();
    if (!this.queue.length && !this.isComplete) { this.queue = shuffle(this.skipped); this.skipped = []; }
  }
  skip() {
    if (!this.current) return;
    this.skipped.push(this.current);
    this.next();
  }
}

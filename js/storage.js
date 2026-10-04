const TopicStorage = {
  KEY: "chinese_learning_topics",
  loadTopics() {
    try { const raw = localStorage.getItem(this.KEY); return raw === null ? null : JSON.parse(raw); }
    catch (e) { return []; }
  },
  saveTopics(topics) {
    try { localStorage.setItem(this.KEY, JSON.stringify(topics)); } catch (e) { console.error(e); }
  },
  updateTopic(topics, topic) {
    const i = topics.findIndex(t => t.id === topic.id);
    if (i >= 0) topics[i] = topic; else topics.push(topic);
    this.saveTopics(topics); return topics;
  },
  deleteTopic(topics, id) {
    const rest = topics.filter(t => t.id !== id);
    this.saveTopics(rest); return rest;
  }
};

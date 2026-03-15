// Free trial usage tracking — 5 threads, 5 prompts per thread

const STORAGE_KEY = "nexus_free_usage";

interface FreeUsage {
  threads: { [threadId: string]: number }; // threadId -> prompt count
}

function getUsage(): FreeUsage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { threads: {} };
}

function saveUsage(usage: FreeUsage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function getThreadCount(): number {
  const usage = getUsage();
  return Object.keys(usage.threads).length;
}

export function getPromptCount(threadId: string): number {
  const usage = getUsage();
  return usage.threads[threadId] || 0;
}

export function canCreateThread(): boolean {
  return getThreadCount() < 5;
}

export function canSendPrompt(threadId: string): boolean {
  const usage = getUsage();
  // Thread doesn't exist yet — check if can create
  if (!(threadId in usage.threads)) {
    return getThreadCount() < 5;
  }
  return (usage.threads[threadId] || 0) < 5;
}

export function recordPrompt(threadId: string): void {
  const usage = getUsage();
  if (!usage.threads[threadId]) {
    usage.threads[threadId] = 0;
  }
  usage.threads[threadId]++;
  saveUsage(usage);
}

export function getRemainingPrompts(threadId: string): number {
  return Math.max(0, 5 - getPromptCount(threadId));
}

export function getRemainingThreads(): number {
  return Math.max(0, 5 - getThreadCount());
}

export function getTotalPromptsUsed(): number {
  const usage = getUsage();
  return Object.values(usage.threads).reduce((sum, count) => sum + count, 0);
}

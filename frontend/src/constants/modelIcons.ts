import groqIcon from '../assets/icons/groq.png';
import metaLlamaIcon from '../assets/icons/meta-llama.png';
import openaiIcon from '../assets/icons/openai.png';
import qwenIcon from '../assets/icons/qwen.png';

const modelIcons: Record<string, string> = {
  groq: groqIcon,
  'meta-llama': metaLlamaIcon,
  openai: openaiIcon,
  qwen: qwenIcon,
};

export const FALLBACK_ICON =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(138, 143, 160)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';

export function modelIcon(iconKey?: string): string {
  if (!iconKey) return FALLBACK_ICON;
  return modelIcons[iconKey] ?? FALLBACK_ICON;
}

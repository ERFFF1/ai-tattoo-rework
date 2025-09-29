export type PresetKey = 'noiseClean'|'softGradient'|'tricepsFit';

export const PRESETS: Record<PresetKey,string> = {
  noiseClean:   'remove noisy background lines; keep linework clarity; minimal celestial details',
  softGradient: 'pastel gold/orange sun rays; satin-smooth blending; reduce hard edges; soft shading',
  tricepsFit:   'vertical tall layout; adapt to back triceps anatomy; natural muscle flow; balanced light-shadow',
};

export const basePrompt = (userPrompt: string, selected: PresetKey[]) => {
  const add = selected.map(k=>PRESETS[k]).join('. ');
  const up = (userPrompt || '').trim();
  return [up, add].filter(Boolean).join('. ');
};

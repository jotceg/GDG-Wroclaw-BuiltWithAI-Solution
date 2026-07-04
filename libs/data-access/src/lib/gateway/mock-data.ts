import {
  Contradiction,
  Evaluation,
  EvaluationCriterion,
  Solution,
} from '../models';

/**
 * Canonical, hand-authored reasoning content for the demo problem:
 * **Problem 7 — Keeping buildings hot & cold (SDG 13/11)**.
 *
 * The same envelope must retain heat in winter yet reject it in summer.
 * Content is credible on purpose — Criterion Zero judges the reasoning trail,
 * not the wiring. A real backend would produce this via LLM + pytriz.
 */

export const DEMO_PROBLEM_DESCRIPTION =
  'Buildings must be kept warm in winter and cool in summer. The same walls and ' +
  'windows are expected to retain heat when it is cold outside and release it when ' +
  'it is hot, which drives large amounts of energy into heating and cooling. ' +
  'Air-conditioning is not the answer — it dumps even more heat outside.';

// ---------------------------------------------------------------------------
// Branch A — TRIZ
// ---------------------------------------------------------------------------

export function mockContradiction(problemId: string): Contradiction {
  return {
    id: `contradiction-${problemId}`,
    problemId,
    improvingParamCode: 22,
    improvingParamName: 'Loss of Energy',
    worseningParamCode: 17,
    worseningParamName: 'Temperature',
    explanation:
      'To retain heat in winter we maximise the envelope’s thermal insulation, ' +
      'minimising Loss of Energy. But a fixed, highly-insulating envelope traps solar ' +
      'and internal gains in summer, driving indoor Temperature up. A single static ' +
      'wall/window cannot both retain heat when it is cold and reject it when it is hot.',
  };
}

export function mockTrizSolutions(problemId: string): Solution[] {
  return [
    {
      id: `sol-triz-1-${problemId}`,
      problemId,
      method: 'triz',
      principleCode: '35',
      principleName: 'Parameter Changes',
      title: 'Phase-change-material (PCM) envelope layer',
      description:
        'Embed a phase-change material in the wall assembly. It absorbs heat by ' +
        'melting when the interior gets warm and releases it by solidifying when it ' +
        'cools, buffering the daily and seasonal swing without active energy input.',
    },
    {
      id: `sol-triz-2-${problemId}`,
      problemId,
      method: 'triz',
      principleCode: '15',
      principleName: 'Dynamics',
      title: 'Switchable electrochromic / thermochromic glazing',
      description:
        'Replace static glazing with glass whose solar transmittance adapts: it blocks ' +
        'solar gain in summer and lets it through in winter, so the same window serves ' +
        'both seasons instead of being a fixed compromise.',
    },
    {
      id: `sol-triz-3-${problemId}`,
      problemId,
      method: 'triz',
      principleCode: '2',
      principleName: 'Taking Out (separation in time)',
      title: 'Seasonally reconfigurable ventilated façade',
      description:
        'An air-gap façade with controllable dampers: sealed and insulating in winter, ' +
        'opened in summer to vent trapped heat (night purge). The retain and reject ' +
        'functions are separated in time rather than fought by one static layer.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Branch B — 5 Whys (scripted causal drill-down for the demo)
// ---------------------------------------------------------------------------

/** Sequential "Why?" questions, depth 1..5. Last one reaches the root cause. */
export const FIVE_WHYS_SCRIPT: readonly string[] = [
  'Why does the building need so much energy to stay comfortable?',
  'Why does heat flow the wrong way through the envelope each season?',
  'Why is the envelope’s thermal behaviour the same all year?',
  'Why do the envelope materials have no seasonal control?',
  'Why are those passive decisions frozen at construction time?',
];

/** The root cause surfaced once the drill-down completes. */
export const FIVE_WHYS_ROOT_CAUSE =
  'The envelope is designed as a single fixed compromise for two opposite seasonal ' +
  'loads, instead of as an adaptive system that can change behaviour with the season.';

/** Answers whose lowercased text contains any trigger are refused by the guardrail. */
export const OFF_TOPIC_TRIGGERS: readonly string[] = [
  'stock',
  'share price',
  'hack',
  'password',
  'ignore previous',
  'lorem ipsum',
];

export const GUARDRAIL_RESTATEMENT =
  'That is outside the scope of this root-cause analysis. Please answer about why the ' +
  'building’s energy demand or heat flow behaves the way it does.';

/** Web-search-grounded hypothesis offered when the engineer is stuck (opt-in). */
export const FIVE_WHYS_HYPOTHESIS =
  'Field studies suggest 30–40% of the seasonal swing is driven by uncontrolled ' +
  'solar gain through glazing (assumption — verify against this building’s data).';

export function mockFiveWhysSolutions(problemId: string): Solution[] {
  const rootCause = FIVE_WHYS_ROOT_CAUSE;
  return [
    {
      id: `sol-5w-1-${problemId}`,
      problemId,
      method: 'fivewhys',
      principleName: rootCause,
      title: 'Adaptive envelope controller',
      description:
        'Add low-cost sensors plus actuated shading and vents driven by season and ' +
        'indoor temperature, turning the fixed envelope into a closed-loop adaptive ' +
        'system that attacks the root cause directly.',
    },
    {
      id: `sol-5w-2-${problemId}`,
      problemId,
      method: 'fivewhys',
      principleName: rootCause,
      title: 'Automated night-flush free cooling',
      description:
        'Automatically ventilate the building with cool night air in summer to purge ' +
        'stored heat, so the structure starts each day cool and the cooling load drops ' +
        'sharply — a control change, no new materials.',
    },
    {
      id: `sol-5w-3-${problemId}`,
      problemId,
      method: 'fivewhys',
      principleName: rootCause,
      title: 'Retrofit dynamic external shading',
      description:
        'Motorised external louvres that cut solar gain in summer and retract in winter ' +
        'for passive gain — a retrofittable way to make an existing fixed façade ' +
        'behave differently per season.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Step 4 — evaluation matrix (solution x criterion), scores 1-10
// ---------------------------------------------------------------------------

type Cell = { score: number; reasoning: string };
type ScoreRow = Record<EvaluationCriterion, Cell>;

const SCORE_TABLE: Record<string, ScoreRow> = {
  'Phase-change-material (PCM) envelope layer': {
    feasibility: { score: 6, reasoning: 'Proven material, but retrofit into existing walls is invasive.' },
    impact: { score: 8, reasoning: 'Strongly flattens temperature peaks in both seasons.' },
    cost: { score: 5, reasoning: 'PCM material and integration remain relatively expensive.' },
    innovation: { score: 8, reasoning: 'Passive, self-acting phase change is an elegant physical answer.' },
  },
  'Switchable electrochromic / thermochromic glazing': {
    feasibility: { score: 6, reasoning: 'Commercially available, but whole-window replacement is heavy.' },
    impact: { score: 7, reasoning: 'Cuts solar gain well; limited to glazed area only.' },
    cost: { score: 4, reasoning: 'High per-m2 cost of switchable glazing.' },
    innovation: { score: 8, reasoning: 'Dynamic optical control of the same window per season.' },
  },
  'Seasonally reconfigurable ventilated façade': {
    feasibility: { score: 5, reasoning: 'Requires a new façade layer and damper mechanics.' },
    impact: { score: 7, reasoning: 'Effective summer venting; smaller winter benefit.' },
    cost: { score: 5, reasoning: 'Moderate construction cost for the air-gap system.' },
    innovation: { score: 7, reasoning: 'Separates retain/reject in time — clean TRIZ move.' },
  },
  'Adaptive envelope controller': {
    feasibility: { score: 8, reasoning: 'Sensors and actuators are off-the-shelf; retrofittable.' },
    impact: { score: 9, reasoning: 'Closed-loop control addresses the root cause across both seasons.' },
    cost: { score: 7, reasoning: 'Low hardware cost relative to envelope rebuilds.' },
    innovation: { score: 8, reasoning: 'Turns a static envelope into an adaptive system.' },
  },
  'Automated night-flush free cooling': {
    feasibility: { score: 9, reasoning: 'Uses existing openings; mostly a controls project.' },
    impact: { score: 7, reasoning: 'Large summer cooling savings; no winter effect.' },
    cost: { score: 9, reasoning: 'Very cheap — automation, no new materials.' },
    innovation: { score: 6, reasoning: 'Known technique, newly automated and integrated.' },
  },
  'Retrofit dynamic external shading': {
    feasibility: { score: 8, reasoning: 'Bolt-on external louvres, widely deployed.' },
    impact: { score: 8, reasoning: 'External shading is the most effective solar-gain cut.' },
    cost: { score: 7, reasoning: 'Moderate cost, no structural change.' },
    innovation: { score: 7, reasoning: 'Automated per-season actuation of a familiar device.' },
  },
};

export function mockEvaluations(solutions: Solution[]): Evaluation[] {
  const rows: Evaluation[] = [];
  for (const s of solutions) {
    const row = SCORE_TABLE[s.title];
    if (!row) continue;
    (Object.keys(row) as EvaluationCriterion[]).forEach((criterion) => {
      rows.push({
        id: `eval-${s.id}-${criterion}`,
        solutionId: s.id,
        criterion,
        score: row[criterion].score,
        reasoning: row[criterion].reasoning,
      });
    });
  }
  return rows;
}

/** Total score used to rank candidates and justify the selection. */
export function totalScore(solutionId: string, evaluations: Evaluation[]): number {
  return evaluations
    .filter((e) => e.solutionId === solutionId)
    .reduce((sum, e) => sum + e.score, 0);
}

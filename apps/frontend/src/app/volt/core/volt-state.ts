import { Injectable, computed, signal } from '@angular/core';

// Volt app state — ported 1:1 from the prototype's DCLogic component
// (docs/design-system/volt-prototype-standalone-2.html).

export type VoltPage =
  | 'landing'
  | 'workspace'
  | 'report'
  | 'form'
  | 'foundations';
export type InspectKey =
  | 'problem'
  | 'contradiction'
  | 'parallel'
  | 'candidates'
  | 'evaluation'
  | 'choice';

export interface Candidate {
  id: string;
  method: string;
  m: 'triz' | 'm2';
  title: string;
  principle: string;
  total: number;
  summary: string;
  reasoning: string;
}

const WHY_QUESTIONS = [
  'Why do buildings struggle to maintain comfortable temperatures efficiently?',
  'Why does the thermal envelope fail to adapt to changing conditions?',
  'Why are adaptive envelope materials less durable than static ones?',
  'Why do moving/phase-changing parts in envelopes degrade faster?',
  "Why haven't we found materials that combine adaptivity with long service life?",
];

const WHY_DEMO_ANSWERS = [
  "Because the thermal envelope can't respond dynamically to rapid external temperature swings without consuming significant energy.",
  'Because current envelope materials are either static (good durability, poor adaptivity) or active (good adaptivity, poor durability).',
  'Because adaptivity requires phase changes or mechanical movement, which introduces wear and fatigue at material interfaces.',
  'Because repeated thermal cycling causes micro-cracking at the boundaries between different material phases, and mechanical joints accumulate friction damage.',
  'ROOT CAUSE: The fundamental constraint is that we treat adaptivity and durability as properties of the SAME material layer, rather than decoupling them into separate functional layers.',
];

const CANDIDATES: Candidate[] = [
  {
    id: 'triz-1',
    method: 'TRIZ',
    m: 'triz',
    title: 'Phase-Change Envelope',
    principle: '35',
    total: 20,
    summary:
      'Micro-encapsulated PCM in the wall absorbs and releases latent heat, smoothing temperature swings with no moving parts.',
    reasoning:
      'principle=35 "Parameter changes"\ninsight: change the STATE of the material, not its geometry.\n→ PCM shifts solid⇄liquid at comfort setpoint, buffering heat.\n→ zero mechanism ⇒ durability preserved (resolves param 16).\nrisk: finite latent capacity on multi-day extremes.',
  },
  {
    id: 'triz-2',
    method: 'TRIZ',
    m: 'triz',
    title: 'Dynamic Segmentation',
    principle: '1·15',
    total: 19,
    summary:
      'Envelope split into independently actuated insulation cells; a failed cell is isolated and swapped without downtime.',
    reasoning:
      'principle=1 "Segmentation" + 15 "Dynamics"\ninsight: divide the envelope so adaptivity lives per-cell.\n→ each louvered cell opens/closes its insulation zone.\n→ failure is local, replaceable ⇒ durability decoupled.\nrisk: seam sealing and control complexity.',
  },
  {
    id: 'triz-3',
    method: 'TRIZ',
    m: 'triz',
    title: 'Thermal Bio-Skin',
    principle: '40·15',
    total: 16,
    summary:
      'Humidity-responsive bio-composite facade opens passive pores when hot — pinecone-scale actuation, no motors.',
    reasoning:
      'principle=40 "Composite" + 15 "Dynamics"\ninsight: motion without mechanism via material anisotropy.\n→ hygroscopic bilayer curls open above threshold.\n→ self-healing coating offsets durability loss.\nrisk: lab-stage; weathering data sparse.',
  },
  {
    id: 'm2-1',
    method: 'METHOD 2',
    m: 'm2',
    title: 'Aerogel–Vacuum Hybrid Panel',
    principle: 'A·V',
    total: 21,
    summary:
      'Aerospace-grade super-insulation with a switchable vacuum layer — ultra-thin, static, and highly durable.',
    reasoning:
      'analogy source: aerospace cryo-insulation.\ninsight: decouple adaptivity from the structure entirely.\n→ static aerogel gives baseline R-value with no wear.\n→ switchable vacuum modulates conductivity on demand.\n→ strongest durability + emissions, manufacturable.\nnote: adaptivity moderate ⇒ pair with vacuum control.',
  },
  {
    id: 'm2-2',
    method: 'METHOD 2',
    m: 'm2',
    title: 'Thermoelectric Active Skin',
    principle: 'A·TE',
    total: 17,
    summary:
      'Solid-state Peltier array pumps heat either direction, powered by integrated PV — no moving parts to wear.',
    reasoning:
      'analogy source: solid-state electronics cooling.\ninsight: active, reversible, wear-free heat transport.\n→ Peltier tiles heat or cool on command.\n→ PV skin offsets electrical draw.\nrisk: efficiency vs. passive methods (emissions score).',
  },
  {
    id: 'm2-3',
    method: 'METHOD 2',
    m: 'm2',
    title: 'Ground-Coupled Thermal Battery',
    principle: 'A·GC',
    total: 18,
    summary:
      'Borehole thermal mass buffers the building; envelope adaptivity offloaded to the earth, analogized from data-center cooling.',
    reasoning:
      'analogy source: data-center geo-cooling loops.\ninsight: move the buffering OUT of the envelope.\n→ boreholes store seasonal heat, durability = geology.\n→ envelope can stay simple and long-lived.\nrisk: high upfront cost, site-dependent feasibility.',
  },
];

const SCORES: Record<string, number[]> = {
  'triz-1': [3, 5, 4, 4, 4],
  'triz-2': [5, 4, 4, 3, 3],
  'triz-3': [4, 3, 5, 2, 2],
  'm2-1': [3, 5, 5, 3, 5],
  'm2-2': [5, 4, 3, 2, 3],
  'm2-3': [4, 5, 5, 2, 2],
};

const CRITERIA = ['Adaptivity', 'Durability', 'Emissions', 'Cost', 'Mfg.'];

const STAGES_RAW = [
  { key: 'problem', label: 'Problem', desc: 'The assigned inventive challenge, framed in plain terms.' },
  { key: 'parallel', label: 'Parallel Analysis', desc: 'TRIZ and 5 Whys run simultaneously after submission.' },
  { key: 'candidates', label: 'Merged Candidates', desc: 'Join gate: both methods deliver ≥3 candidates each.' },
  { key: 'evaluation', label: 'Evaluation', desc: 'Scored against weighted, explicit criteria.' },
  { key: 'choice', label: 'Selected Solution', desc: 'Winning solution chosen, with justification.' },
];

const INSPECT_DATA: Record<InspectKey, { num: string; title: string; input: string; output: string }> = {
  problem: {
    num: 'STEP 01 · PROBLEM',
    title: 'Problem framing',
    input: '{\n  "problem_id": 7,\n  "assignment": "Keeping Buildings Hot & Cold",\n  "sdg": [13, 11]\n}',
    output: '{\n  "framed": "Maintain comfortable interior temperature\\n   across extreme, swinging exterior conditions\\n   while minimizing energy and emissions.",\n  "domain": "built environment / HVAC",\n  "constraints": ["retrofittable", "payback < 5yr"]\n}',
  },
  contradiction: {
    num: 'TRIZ · SUB-STAGE 1-2',
    title: 'Technical contradiction',
    input: 'framed_problem + TRIZ_39_parameters',
    output: '{\n  "improving": {"param": 35, "name": "Adaptability"},\n  "worsening": {"param": 16, "name": "Durability"},\n  "matrix_lookup": [35, 15, 1, 40],\n  "reading": "Making the envelope adaptive tends to\\n   add moving/phase-changing parts that wear faster."\n}',
  },
  parallel: {
    num: 'STEP 02 · PARALLEL ANALYSIS',
    title: 'Parallel branch execution',
    input: '{\n  "gateway": "split",\n  "branches": ["triz_auto", "five_whys_interactive"],\n  "join_condition": ">=3 candidates per branch"\n}',
    output: 'triz:   formulate → matrix(39×39, pytriz) → instantiate\n        5 candidates ✓\nwhys:   5 rounds, root cause at Why 5\n        5 candidates ✓\njoin:   PASSED → merged pool: 6 unique candidates',
  },
  candidates: {
    num: 'STEP 03 · CANDIDATES',
    title: 'Candidate generation',
    input: '{\n  "methods": ["TRIZ_principles", "biomimetic_analogy"],\n  "n_per_method": 3\n}',
    output: '6 candidates generated.\nTRIZ → PCM, Dynamic Segmentation, Bio-Skin\nMethod 2 → Aerogel-Vacuum, Thermoelectric, Ground-Coupled\n(full reasoning traces attached per candidate)',
  },
  evaluation: {
    num: 'STEP 04 · EVALUATION',
    title: 'Weighted scoring',
    input: 'criteria = [Adaptivity, Durability, Emissions, Cost, Mfg]\nscale = 1..5',
    output: 'totals:\n  Aerogel-Vacuum ....... 21  ← max\n  Phase-Change ......... 20\n  Dynamic Segmentation . 19\n  Ground-Coupled ....... 18\n  Thermoelectric ....... 17\n  Bio-Skin ............. 16',
  },
  choice: {
    num: 'STEP 05 · CHOICE',
    title: 'Decision rationale',
    input: 'ranked_candidates + criteria_weights',
    output: 'winner: "Aerogel-Vacuum Hybrid Panel"\nwhy: best durability+emissions, manufacturable.\ngap: adaptivity (3/5)\nmitigation: add switchable-vacuum control layer,\n  borrowing dynamism from runner-up (Segmentation).\nconfidence: 0.82',
  },
};

@Injectable({ providedIn: 'root' })
export class VoltState {
  // ---- raw state (mirrors prototype DCLogic.state) ----
  readonly theme = signal<'dark' | 'light'>('dark');
  readonly page = signal<VoltPage>('landing');
  readonly activeStage = signal(4);
  readonly running = signal(false);
  readonly inspectorOpen = signal(false);
  readonly inspectorStage = signal<InspectKey>('problem');
  readonly expanded = signal<Record<string, boolean>>({});
  readonly form = signal({ title: '', desc: '', domain: '', constraint: '', sdg: [] as string[] });
  readonly submitted = signal(false);
  readonly errors = signal<{ title?: string; desc?: string }>({});
  readonly toast = signal<string | null>(null);
  readonly copied = signal(false);
  readonly whyStep = signal(4);
  readonly whyAnswers = signal<string[]>([...WHY_DEMO_ANSWERS]);
  readonly whyEditing = signal(-1);
  readonly whyDone = signal(true);
  readonly whyRootAt = signal(4);
  readonly whySuggestions = signal<string[] | null>(null);
  readonly trizSub = signal(3);
  readonly trizCands = signal(5);
  readonly whyCands = signal(5);

  // ---- static data ----
  readonly whyQuestions = WHY_QUESTIONS;
  readonly whyDemoAnswers = WHY_DEMO_ANSWERS;
  readonly candRaw = CANDIDATES;
  readonly scores = SCORES;
  readonly criteria = CRITERIA;
  readonly stagesRaw = STAGES_RAW;
  readonly inspectData = INSPECT_DATA;
  readonly principles = [
    { num: '35', name: 'Parameter changes' },
    { num: '15', name: 'Dynamics' },
    { num: '01', name: 'Segmentation' },
    { num: '40', name: 'Composite materials' },
  ];

  // ---- derived ----
  readonly trizDone = computed(() => this.trizSub() >= 3);
  readonly joinPassed = computed(() => this.trizDone() && this.whyDone());
  readonly joinLabel = computed(() => {
    const t = this.trizDone();
    const w = this.whyDone();
    if (t && w) return 'Join gate passed — both branches delivered ≥3 candidates';
    if (t && !w) return 'Waiting for 5 Whys to complete…';
    if (!t && w) return 'Waiting for TRIZ to complete…';
    return 'Both branches running — join gate requires ≥3 candidates each';
  });
  readonly whyProgress = computed(() => 'Why ' + Math.min(this.whyStep() + 1, 5) + ' of 5');
  readonly glowLeft = computed(
    () => ((this.activeStage() + 0.5) / STAGES_RAW.length) * 100 + '%'
  );
  readonly glowAlpha = computed(() => (this.running() ? 0.5 : 0.28));
  readonly themeToggleLabel = computed(
    () => 'Switch to ' + (this.theme() === 'dark' ? 'light' : 'dark') + ' mode'
  );

  private runTimer: ReturnType<typeof setTimeout> | undefined;
  private toastTimer: ReturnType<typeof setTimeout> | undefined;
  private copyTimer: ReturnType<typeof setTimeout> | undefined;

  // ---- actions (1:1 with prototype) ----
  go(page: VoltPage) {
    this.page.set(page);
    this.inspectorOpen.set(false);
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  toggleTheme() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  simulateRun() {
    if (this.running()) return;
    // scripted walkthrough: problem → parallel (3 TRIZ sub-stages + 5 whys progress) → merge → eval → choice
    const steps: { st: () => void; toast?: string; ms: number }[] = [
      {
        st: () => {
          this.activeStage.set(0);
          this.trizSub.set(0);
          this.trizCands.set(0);
          this.whyCands.set(0);
          this.whyDone.set(false);
          this.whyStep.set(0);
        },
        ms: 900,
      },
      {
        st: () => {
          this.activeStage.set(1);
          this.trizSub.set(0);
        },
        ms: 1100,
      },
      { st: () => this.trizSub.set(1), toast: 'Contradiction formulated', ms: 1100 },
      {
        st: () => {
          this.trizSub.set(2);
          this.whyStep.set(3);
        },
        toast: 'Contradiction matrix applied · principles [35, 15, 1, 40]',
        ms: 1100,
      },
      {
        st: () => {
          this.trizSub.set(3);
          this.trizCands.set(5);
          this.whyStep.set(4);
          this.whyDone.set(true);
          this.whyRootAt.set(4);
          this.whyAnswers.set([...WHY_DEMO_ANSWERS]);
        },
        toast: 'TRIZ complete · 5 candidates',
        ms: 900,
      },
      {
        st: () => this.whyCands.set(5),
        toast: '5 Whys complete · 5 candidates from root cause',
        ms: 900,
      },
      {
        st: () => this.activeStage.set(2),
        toast: 'Join gate passed · merged pool: 6 candidates',
        ms: 1000,
      },
      { st: () => this.activeStage.set(3), ms: 1200 },
      {
        st: () => {
          this.activeStage.set(4);
          this.running.set(false);
        },
        toast: 'Pipeline complete · winner selected',
        ms: 0,
      },
    ];
    this.running.set(true);
    let idx = 0;
    const tick = () => {
      if (idx >= steps.length) return;
      const step = steps[idx];
      step.st();
      if (step.toast) this.toastMsg(step.toast);
      idx++;
      if (idx < steps.length) this.runTimer = setTimeout(tick, step.ms);
    };
    tick();
  }

  toastMsg(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3200);
  }

  toggleExpand(id: string) {
    this.expanded.update((e) => ({ ...e, [id]: !e[id] }));
  }
  openInspector(stage: InspectKey) {
    this.inspectorOpen.set(true);
    this.inspectorStage.set(stage);
    this.copied.set(false);
  }
  closeInspector() {
    this.inspectorOpen.set(false);
  }
  copyOutput() {
    const d = INSPECT_DATA[this.inspectorStage()];
    try {
      navigator.clipboard.writeText(d.output);
    } catch {
      /* noop */
    }
    this.copied.set(true);
    clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => this.copied.set(false), 1600);
  }
  copyTrace(reasoning: string) {
    try {
      navigator.clipboard.writeText(reasoning);
    } catch {
      /* noop */
    }
    this.toastMsg('Raw output copied');
  }

  setField(k: 'title' | 'desc' | 'domain' | 'constraint', v: string) {
    this.form.update((f) => ({ ...f, [k]: v }));
  }
  toggleSdg(v: string) {
    this.form.update((f) => {
      const has = f.sdg.includes(v);
      return { ...f, sdg: has ? f.sdg.filter((x) => x !== v) : [...f.sdg, v] };
    });
  }
  fillDemo() {
    this.form.set({
      title: 'Keeping buildings hot & cold',
      desc: 'Buildings must hold a comfortable internal temperature across extreme and swinging external conditions while cutting energy use and emissions.',
      domain: 'Built environment · HVAC',
      constraint: 'Retrofittable, < 5yr payback',
      sdg: ['SDG 13', 'SDG 11'],
    });
    this.errors.set({});
  }

  // ---- 5 Whys ----
  whyAnswer() {
    const step = this.whyStep();
    const answers = this.whyAnswers();
    if (!answers[step] || !answers[step].trim()) return;
    const next = step + 1;
    const isRoot = next >= 5 || answers[step].toLowerCase().includes('root cause');
    if (isRoot) {
      this.whyDone.set(true);
      this.whyRootAt.set(step);
      this.toastMsg('Root cause identified at Why ' + (step + 1) + '!');
    } else {
      this.whyStep.set(next);
    }
  }
  whyBack(i: number) {
    this.whyEditing.set(i);
  }
  whyBackToCurrent() {
    this.whyEditing.set(-1);
  }
  whyUpdateAnswer(i: number, val: string) {
    this.whyAnswers.update((a) => {
      const copy = [...a];
      copy[i] = val;
      return copy;
    });
  }
  whySaveEdit() {
    this.whyEditing.set(-1);
    this.toastMsg('Answer updated.');
  }
  whySuggest() {
    this.whySuggestions.set([
      'Thermal mass buffering has diminishing returns at extreme swing rates',
      'Passive radiative cooling is blocked by high humidity in tropical climates',
      'Phase-change hysteresis prevents symmetric heating/cooling response',
    ]);
  }
  whyPickSuggestion(s: string) {
    this.whyUpdateAnswer(this.whyStep(), s);
    this.whySuggestions.set(null);
  }
  whyFillDemo() {
    this.whyAnswers.set([...WHY_DEMO_ANSWERS]);
    this.whyStep.set(4);
    this.whyDone.set(true);
    this.whyRootAt.set(4);
    this.toastMsg('Demo: all 5 Whys answered, root cause found.');
  }

  submitForm(e?: Event) {
    e?.preventDefault();
    const f = this.form();
    const errs: { title?: string; desc?: string } = {};
    if (!f.title.trim())
      errs.title = 'Give your problem a short title so it can be referenced later.';
    if (f.desc.trim().length < 40)
      errs.desc = 'Add a bit more detail (40+ characters) so Volt can locate the contradiction.';
    this.errors.set(errs);
    this.submitted.set(true);
    if (Object.keys(errs).length === 0) {
      this.toastMsg('Problem queued · reasoning pipeline started');
      setTimeout(() => this.go('workspace'), 700);
    }
  }

  // ---- report payloads + exports (1:1) ----
  reportPayload() {
    const winnerId = 'm2-1';
    return {
      problem: {
        id: 7,
        title: 'Keeping Buildings Hot & Cold',
        sdg: [13, 11],
        framed:
          'Buildings must hold a comfortable interior temperature across extreme and swinging exterior conditions while cutting energy use and emissions.',
        domain: 'built environment / HVAC',
        constraints: ['retrofittable', 'payback < 5 yr'],
      },
      contradiction: {
        improving: { param: 35, name: 'Adaptability' },
        worsening: { param: 16, name: 'Durability' },
        principles: [35, 15, 1, 40],
      },
      candidates: CANDIDATES.map((c) => ({
        id: c.id,
        method: c.m === 'triz' ? 'TRIZ' : 'Method2',
        title: c.title,
        principle: c.principle,
        summary: c.summary,
        reasoning: c.reasoning,
        scores: SCORES[c.id],
      })),
      evaluation: {
        criteria: CRITERIA,
        totals: Object.fromEntries(
          Object.entries(SCORES).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0)])
        ),
      },
      choice: {
        winnerId,
        title: 'Aerogel–Vacuum Hybrid Panel',
        total: 21,
        rationale:
          'Best durability + emissions with a manufacturable retrofit path. Moderate adaptivity gap closed by pairing static super-insulation with a switchable-vacuum control layer.',
        confidence: 0.82,
      },
    };
  }

  reportMarkdown() {
    const p = this.reportPayload();
    let s = '# Volt Solution Report — Problem ' + p.problem.id + '\n\n';
    s += '**' + p.problem.title + '** · SDG ' + p.problem.sdg.join(' & ') + '\n\n';
    s +=
      '## 1. Problem\n\n' +
      p.problem.framed +
      '\n\n- Domain: ' +
      p.problem.domain +
      '\n- Constraints: ' +
      p.problem.constraints.join('; ') +
      '\n\n';
    s +=
      '## 2. Technical contradiction\n\n- Improving: param ' +
      p.contradiction.improving.param +
      ' — ' +
      p.contradiction.improving.name +
      '\n- Worsening: param ' +
      p.contradiction.worsening.param +
      ' — ' +
      p.contradiction.worsening.name +
      '\n- Inventive principles: ' +
      p.contradiction.principles.join(', ') +
      '\n\n';
    s += '## 3. Candidate solutions\n\n';
    p.candidates.forEach((c) => {
      s += '### ' + c.title + ' (' + c.method + ')\n\n' + c.summary + '\n\n```\n' + c.reasoning + '\n```\n\n';
    });
    s +=
      '## 4. Evaluation\n\n| Solution | ' +
      p.evaluation.criteria.join(' | ') +
      ' | Total |\n|---|' +
      p.evaluation.criteria.map(() => '---|').join('') +
      '---|\n';
    p.candidates.forEach((c) => {
      s +=
        '| ' +
        c.title +
        ' | ' +
        c.scores.join(' | ') +
        ' | **' +
        (p.evaluation.totals as Record<string, number>)[c.id] +
        '** |\n';
    });
    s +=
      '\n## 5. Selected solution\n\n**' +
      p.choice.title +
      '** — total ' +
      p.choice.total +
      '/25 · confidence ' +
      p.choice.confidence +
      '\n\n' +
      p.choice.rationale +
      '\n';
    return s;
  }

  private download(name: string, mime: string, data: string | Blob) {
    try {
      const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 400);
    } catch (e) {
      console.warn(e);
    }
  }

  exportJSON() {
    this.download('volt-report-p7.json', 'application/json', JSON.stringify(this.reportPayload(), null, 2));
    this.toastMsg('Downloaded volt-report-p7.json');
  }
  exportMD() {
    this.download('volt-report-p7.md', 'text/markdown', this.reportMarkdown());
    this.toastMsg('Downloaded volt-report-p7.md');
  }
  exportPDF() {
    try {
      const w = window.open('', '_blank');
      if (!w) {
        this.toastMsg('Enable pop-ups to print PDF');
        return;
      }
      const md = this.reportMarkdown();
      const openScript =
        '<' + 'script>window.onload=function(){setTimeout(function(){window.print();},350);};<' + '/script>';
      const html =
        '<!doctype html><html><head><meta charset="utf-8"><title>Volt · Problem 7 report</title><style>body{font-family:"IBM Plex Sans",system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;color:#17151F;line-height:1.55}h1,h2,h3{font-family:"Space Grotesk",sans-serif}pre,code{font-family:"IBM Plex Mono",monospace;background:#F0EEF9;padding:2px 6px;border-radius:4px}pre{padding:14px;overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #D6D2E6;padding:6px 10px;text-align:left}th{background:#F0EEF9}</style></head><body>' +
        this.mdToHtml(md) +
        openScript +
        '</body></html>';
      w.document.open();
      w.document.write(html);
      w.document.close();
      this.toastMsg('Opened print dialog for PDF');
    } catch {
      this.toastMsg('PDF export failed');
    }
  }
  private mdToHtml(md: string) {
    let h = md.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    h = h.replace(/```([\s\S]*?)```/g, (_m, c) => '<pre>' + c + '</pre>');
    h = h
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>');
    h = h.replace(/^\| (.+) \|$/gm, (_m, row) => {
      const cells = (row as string).split(' | ');
      if (/^---/.test(cells[0])) return '';
      return (
        '<tr>' +
        cells
          .map((c) =>
            /^\*\*/.test(c.trim()) ? '<td><b>' + c.replace(/\*\*/g, '') + '</b></td>' : '<td>' + c + '</td>'
          )
          .join('') +
        '</tr>'
      );
    });
    h = h.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/^- (.+)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    h = h.replace(/\n\n/g, '</p><p>');
    h = '<p>' + h + '</p>';
    h = h
      .replace(/<p>(<h\d>)/g, '$1')
      .replace(/(<\/h\d>)<\/p>/g, '$1')
      .replace(/<p>(<ul>|<pre>|<table>)/g, '$1')
      .replace(/(<\/ul>|<\/pre>|<\/table>)<\/p>/g, '$1');
    return h;
  }

  // Stored-only (no compression) ZIP encoder — 1:1 port, no external libs.
  private crcTable: Uint32Array | undefined;
  private crc32(bytes: Uint8Array) {
    if (!this.crcTable) {
      const T = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        T[n] = c >>> 0;
      }
      this.crcTable = T;
    }
    let crc = ~0;
    for (let i = 0; i < bytes.length; i++) crc = this.crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return ~crc >>> 0;
  }
  private u32(n: number) {
    return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
  }
  private u16(n: number) {
    return [n & 0xff, (n >>> 8) & 0xff];
  }
  private zip(files: { name: string; data: string }[]) {
    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    files.forEach((f) => {
      const nameBytes = enc.encode(f.name);
      const data = enc.encode(f.data);
      const crc = this.crc32(data);
      const size = data.length;
      const local = ([] as number[]).concat(
        [0x50, 0x4b, 0x03, 0x04],
        this.u16(20),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u32(crc),
        this.u32(size),
        this.u32(size),
        this.u16(nameBytes.length),
        this.u16(0)
      );
      const localBuf = new Uint8Array(local.length + nameBytes.length + data.length);
      localBuf.set(local, 0);
      localBuf.set(nameBytes, local.length);
      localBuf.set(data, local.length + nameBytes.length);
      parts.push(localBuf);
      const cd = ([] as number[]).concat(
        [0x50, 0x4b, 0x01, 0x02],
        this.u16(20),
        this.u16(20),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u32(crc),
        this.u32(size),
        this.u32(size),
        this.u16(nameBytes.length),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u16(0),
        this.u32(0),
        this.u32(offset)
      );
      const cdBuf = new Uint8Array(cd.length + nameBytes.length);
      cdBuf.set(cd, 0);
      cdBuf.set(nameBytes, cd.length);
      central.push(cdBuf);
      offset += localBuf.length;
    });
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const eocd = new Uint8Array(
      ([] as number[]).concat(
        [0x50, 0x4b, 0x05, 0x06],
        this.u16(0),
        this.u16(0),
        this.u16(files.length),
        this.u16(files.length),
        this.u32(cdSize),
        this.u32(offset),
        this.u16(0)
      )
    );
    const totalLen = parts.reduce((a, b) => a + b.length, 0) + cdSize + eocd.length;
    const out = new Uint8Array(totalLen);
    let p = 0;
    parts.forEach((b) => {
      out.set(b, p);
      p += b.length;
    });
    central.forEach((b) => {
      out.set(b, p);
      p += b.length;
    });
    out.set(eocd, p);
    return out;
  }
  exportZIP() {
    const md = this.reportMarkdown();
    const json = JSON.stringify(this.reportPayload(), null, 2);
    const readme =
      '# Volt Report Bundle\n\nIncluded:\n- volt-report-p7.md — human-readable Markdown\n- volt-report-p7.json — structured reasoning trail\n- README.md — this file\n\nProblem 7: Keeping Buildings Hot & Cold · SDG 13 & 11\n';
    const zip = this.zip([
      { name: 'volt-report-p7.md', data: md },
      { name: 'volt-report-p7.json', data: json },
      { name: 'README.md', data: readme },
    ]);
    this.download('volt-report-p7.zip', 'application/zip', new Blob([zip], { type: 'application/zip' }));
    this.toastMsg('Downloaded volt-report-p7.zip · 3 files');
  }
}

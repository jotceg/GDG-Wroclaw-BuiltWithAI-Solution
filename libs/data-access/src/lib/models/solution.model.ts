/**
 * Mirrors backend `solutions` table.
 *
 * CONTRACT NOTE (BE <-> FE): the backend column `method` is a free string.
 * The locked second method is **5 Whys**, so the FE expects `'triz' | 'fivewhys'`.
 * Denys's current model comment still says `'alternative' (biomimicry)` — that is
 * stale (biomimicry was superseded). Align on `'fivewhys'` at integration time.
 */
export type SolutionMethod = 'triz' | 'fivewhys';

export interface Solution {
  id: string;
  problemId: string;
  method: SolutionMethod;
  /** TRIZ inventive-principle code (e.g. '10') or root-cause id; may be absent. */
  principleCode?: string;
  /** TRIZ principle name, or the root cause for a 5 Whys countermeasure. */
  principleName: string;
  title: string;
  description: string;
}

export const isTriz = (s: Pick<Solution, 'method'>): boolean => s.method === 'triz';

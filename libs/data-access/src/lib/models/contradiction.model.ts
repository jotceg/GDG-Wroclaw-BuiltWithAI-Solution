/**
 * Mirrors backend `contradictions` table.
 * TRIZ maps the problem onto two of the 39 engineering parameters:
 * one we want to improve, one that worsens as a result.
 */
export interface Contradiction {
  id: string;
  problemId: string;
  /** Code 1-39 of the parameter to improve. */
  improvingParamCode: number;
  improvingParamName: string;
  /** Code 1-39 of the parameter that degrades. */
  worseningParamCode: number;
  worseningParamName: string;
  /** Natural-language statement of the technical contradiction. */
  explanation: string;
}

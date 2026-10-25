export type IndicatorCode = 'IND-01' | 'IND-02' | 'IND-03';

export interface IndicatorHistoryItem {
  attemptId: string;
  courseTitle: string;
  date: string;
  numerator: number;
  denominator: number;
  value: number | null;
}

/** Indicador de las fichas de registro calculado con las evaluaciones del estudiante. */
export interface MyIndicator {
  code: IndicatorCode;
  number: number;
  dimension: string;
  name: string;
  unit: '%' | 'min';
  formula: string;
  numeratorLabel: string;
  denominatorLabel: string;
  betterWhen: 'higher' | 'lower';
  evaluations: number;
  participants: number;
  totalNumerator: number;
  totalDenominator: number;
  value: number | null;
  history: IndicatorHistoryItem[];
}

export interface MyIndicatorsResponse {
  variable: string;
  indicators: MyIndicator[];
}

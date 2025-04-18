// Types for discipline and language
export interface Discipline {
  label: string;
  value: string;
}

export interface Language {
  label: string;
  value: string;
}

// Type for an ENEM exam
export interface EnemExam {
  title: string;
  year: number;
  disciplines: Discipline[];
  languages?: Language[];
  questions: {
    title: string;
    index: number;
    discipline: string;
    language?: string;
  }[];
}

// Index type: year -> EnemExam
export type EnemExamIndex = Record<number, EnemExam>;

/**
 * Indexes ENEM exams by year.
 * @param exams Array of ENEM exams
 * @returns An object mapping year to EnemExam
 */
export function indexEnemExams(exams: EnemExam[]): EnemExamIndex {
  return exams.reduce<EnemExamIndex>((acc, exam) => {
    acc[exam.year] = exam;
    return acc;
  }, {});
}

/**
 * Fetch exam data from the public directory
 * @returns Promise resolving to array of ENEM exams
 */
export async function fetchExams(): Promise<EnemExam[]> {
  try {
    const response = await fetch("/exams.json");

    if (!response.ok) {
      throw new Error(`Failed to fetch exams: ${response.statusText}`);
    }

    const exams = await response.json();
    return exams as EnemExam[];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

/**
 * Build an index of exams from fetched data
 * @returns Promise resolving to an indexed object of exams
 */
export async function fetchExamsIndex(): Promise<EnemExamIndex> {
  const exams = await fetchExams();
  return indexEnemExams(exams);
}

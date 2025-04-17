import { create } from "zustand";
import {
  allExams,
  enemIndex,
  type EnemExam,
  type EnemExamIndex,
  type Discipline,
  type Language,
} from "../libenem";

// Question details interface based on the JSON files in public/year/questions/*/details.json
export interface QuestionDetails {
  title: string;
  index: number;
  year: number;
  language: string;
  discipline: string;
  context: string;
  files: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: {
    letter: string;
    text: string;
    file: string | null;
    isCorrect: boolean;
  }[];
}

// Interface for our store state
interface EnemStoreState {
  // Exam data
  exams: EnemExam[];
  examsIndex: EnemExamIndex;

  // Current selections
  selectedYear: number | null;
  selectedDisciplines: string[]; // Changed from selectedDiscipline to an array
  selectedLanguage: string | null;

  // Questions data
  questions: Record<string, QuestionDetails>;
  currentQuestion: QuestionDetails | null;

  // Loading states
  isLoadingExams: boolean;
  isLoadingQuestions: boolean;
  isLoadingQuestion: boolean;

  // Errors
  examError: string | null;
  questionError: string | null;

  // Actions
  fetchExams: () => Promise<void>;
  setSelectedYear: (year: number | null) => void;
  setSelectedDisciplines: (disciplines: string[]) => void; // Updated to handle multiple disciplines
  addSelectedDiscipline: (discipline: string) => void; // New method to add a discipline
  removeSelectedDiscipline: (discipline: string) => void; // New method to remove a discipline
  setSelectedLanguage: (language: string | null) => void;
  fetchQuestions: (
    year: number,
    disciplines: string[],
    language?: string
  ) => Promise<void>; // Updated to accept array of disciplines
  fetchQuestionDetails: (
    year: number,
    questionId: string
  ) => Promise<QuestionDetails | null>;
  resetStore: () => void;
}

export const useEnemStore = create<EnemStoreState>((set, get) => ({
  // Initial state
  exams: [],
  examsIndex: {},
  selectedYear: null,
  selectedDisciplines: [], // Updated to an array
  selectedLanguage: null,
  questions: {},
  currentQuestion: null,
  isLoadingExams: false,
  isLoadingQuestions: false,
  isLoadingQuestion: false,
  examError: null,
  questionError: null,

  // Fetch all exams
  fetchExams: async () => {
    set({ isLoadingExams: true, examError: null });

    try {
      // We already have the exams data imported from libenem.ts
      // In a real app, we might fetch this from an API
      set({
        exams: allExams,
        examsIndex: enemIndex,
        isLoadingExams: false,
      });
    } catch (error) {
      set({
        examError:
          error instanceof Error ? error.message : "Failed to fetch exams",
        isLoadingExams: false,
      });
    }
  },

  // Set selected year
  setSelectedYear: (year) => {
    set({ selectedYear: year });

    // Reset disciplines and language if year changes
    if (year !== get().selectedYear) {
      set({
        selectedDisciplines: [],
        selectedLanguage: null,
        questions: {},
        currentQuestion: null,
      });
    }
  },

  // Set selected disciplines
  setSelectedDisciplines: (disciplines) => {
    set({ selectedDisciplines: disciplines });

    // Reset questions if disciplines change
    if (
      JSON.stringify(disciplines) !== JSON.stringify(get().selectedDisciplines)
    ) {
      set({
        questions: {},
        currentQuestion: null,
      });
    }
  },

  // Add a selected discipline
  addSelectedDiscipline: (discipline) => {
    const currentDisciplines = get().selectedDisciplines;
    if (!currentDisciplines.includes(discipline)) {
      set({ selectedDisciplines: [...currentDisciplines, discipline] });
    }
  },

  // Remove a selected discipline
  removeSelectedDiscipline: (discipline) => {
    const currentDisciplines = get().selectedDisciplines;
    set({
      selectedDisciplines: currentDisciplines.filter((d) => d !== discipline),
    });
  },

  // Set selected language
  setSelectedLanguage: (language) => {
    set({ selectedLanguage: language });

    // Reset questions if language changes
    if (language !== get().selectedLanguage) {
      set({
        questions: {},
        currentQuestion: null,
      });
    }
  },

  // Fetch questions for a specific year, disciplines and optional language
  fetchQuestions: async (year, disciplines, language) => {
    set({
      isLoadingQuestions: true,
      questionError: null,
      selectedYear: year,
      selectedDisciplines: disciplines,
      selectedLanguage: language || null,
    });

    try {
      // First, fetch the year details file which contains metadata about all questions
      const detailsPath = `/${year}/details.json`;
      const response = await fetch(detailsPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }

      const yearDetails = await response.json();

      // Filter questions based on selected disciplines and language
      const filteredQuestions = yearDetails.questions.filter(
        (question: any) => {
          // Check if question matches selected disciplines
          const disciplineMatch = disciplines.includes(question.discipline);

          // Check for language match if specified
          if (language) {
            // For language subjects, we need exact language match
            return disciplineMatch && question.language === language;
          }

          // For non-language subjects, only consider questions without a language
          return disciplineMatch && question.language === null;
        }
      );

      // Get question IDs to fetch details for - handle language-specific IDs correctly
      const questionIds = filteredQuestions.map((q: any) => {
        // For language-specific questions, use the format "index-language"
        if (q.language) {
          return `${q.index}-${q.language}`;
        }
        // For regular questions, just use the index as string
        return String(q.index);
      });

      // Load question details for all filtered questions in batch
      const questionDetailsMap = await fetchQuestionsDetailsBatch(
        year,
        questionIds
      );

      set({
        questions: questionDetailsMap,
        isLoadingQuestions: false,
      });
    } catch (error) {
      set({
        questionError:
          error instanceof Error ? error.message : "Failed to fetch questions",
        isLoadingQuestions: false,
      });
    }
  },

  // Fetch a specific question's details
  fetchQuestionDetails: async (year, questionId) => {
    set({ isLoadingQuestion: true, questionError: null });

    try {
      // Construct path to fetch question details based on question ID format
      let path;

      // Check if this is a language-specific question (format: "index-language")
      if (questionId.includes("-")) {
        const [index, language] = questionId.split("-");
        path = `/${year}/questions/${index}/details-${language}.json`;
      } else {
        path = `/${year}/questions/${questionId}/details.json`;
      }

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch question details: ${response.statusText}`
        );
      }

      const rawQuestionDetails = await response.json();

      // Process and normalize the question details to ensure consistency
      // Add missing properties and ensure proper structure
      const questionDetails = normalizeQuestionDetails(
        rawQuestionDetails,
        questionId,
        year
      );

      set({
        currentQuestion: questionDetails,
        questions: {
          ...get().questions,
          [questionId]: questionDetails,
        },
        isLoadingQuestion: false,
      });

      return questionDetails;
    } catch (error) {
      set({
        questionError:
          error instanceof Error
            ? error.message
            : "Failed to fetch question details",
        isLoadingQuestion: false,
      });
      return null;
    }
  },

  // Reset the store to initial state
  resetStore: () => {
    set({
      selectedYear: null,
      selectedDisciplines: [],
      selectedLanguage: null,
      questions: {},
      currentQuestion: null,
      examError: null,
      questionError: null,
    });
  },
}));

// Utility functions for the store
export function getAvailableDisciplines(year: number | null): Discipline[] {
  if (!year) return [];
  return enemIndex[year]?.disciplines || [];
}

export function getAvailableLanguages(year: number | null): Language[] {
  if (!year) return [];
  return enemIndex[year]?.languages || [];
}

// Helper function to build path to question
export function buildQuestionPath(year: number, questionId: string): string {
  // Handle language-specific question IDs (format: "index-language")
  if (questionId.includes("-")) {
    const [index, language] = questionId.split("-");
    return `/${year}/questions/${index}/details-${language}.json`;
  }
  // Regular question
  return `/${year}/questions/${questionId}/details.json`;
}

// Helper function to build question ID from components
export function buildQuestionId(index: number, language?: string): string {
  return language ? `${index}-${language}` : `${index}`;
}

// Helper function to normalize question details from JSON
function normalizeQuestionDetails(
  rawDetails: any,
  questionId: string,
  year: number
): QuestionDetails {
  // Ensure basic properties exist
  const details: QuestionDetails = {
    title: rawDetails.title || `Questão ${questionId} - ENEM ${year}`,
    index: rawDetails.index || parseInt(questionId, 10),
    year: rawDetails.year || year,
    language: rawDetails.language || null,
    discipline: rawDetails.discipline || null,
    context: rawDetails.context || "",
    files: Array.isArray(rawDetails.files) ? rawDetails.files : [],
    correctAlternative: rawDetails.correctAlternative || "",
    alternativesIntroduction: rawDetails.alternativesIntroduction || "",
    alternatives: [],
  };

  // Process alternatives with error handling
  if (Array.isArray(rawDetails.alternatives)) {
    const letters = ["A", "B", "C", "D", "E"];

    details.alternatives = rawDetails.alternatives.map(
      (alt: any, idx: number) => {
        // Normalize each alternative
        const normalized = {
          letter: alt.letter || letters[idx],
          text: alt.text || null,
          file: alt.file || null,
          isCorrect: typeof alt.isCorrect === "boolean" ? alt.isCorrect : false,
        };

        // If we have correctAlternative but not isCorrect property, set isCorrect based on letter
        if (details.correctAlternative && !("isCorrect" in alt)) {
          normalized.isCorrect =
            normalized.letter === details.correctAlternative;
        }

        return normalized;
      }
    );
  }

  // If we have isCorrect properties but no correctAlternative, derive it
  if (!details.correctAlternative) {
    const correctAlt = details.alternatives.find((alt) => alt.isCorrect);
    if (correctAlt) {
      details.correctAlternative = correctAlt.letter;
    }
  }

  return details;
}

// Helper function to fetch all questions for a year from the details.json file
export async function fetchAllYearQuestions(
  year: number
): Promise<QuestionDetails[]> {
  try {
    // We try to fetch the year details file which contains a list of all questions
    const detailsPath = `/${year}/details.json`;
    const response = await fetch(detailsPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch year details: ${response.statusText}`);
    }

    const yearDetails = await response.json();

    // Check if the details contains a questions array
    if (!Array.isArray(yearDetails.questions)) {
      throw new Error(`Invalid year details format: questions array not found`);
    }

    // Return the questions
    return yearDetails.questions.map((question: any) => {
      // Normalize the question data to match our QuestionDetails interface
      return {
        title: question.title || `Questão ${question.index} - ENEM ${year}`,
        index: question.index || 0,
        year: year,
        language: question.language || null,
        discipline: question.discipline || null,
        context: "", // Context needs to be loaded separately
        files: [], // Files need to be loaded separately
        correctAlternative: "", // Will be loaded when fetching question details
        alternativesIntroduction: "", // Will be loaded when fetching question details
        alternatives: [], // Will be loaded when fetching question details
      };
    });
  } catch (error) {
    console.error(`Error fetching all questions for year ${year}:`, error);
    return [];
  }
}

// Function to load question details in batch for better performance
export async function fetchQuestionsDetailsBatch(
  year: number,
  questionIds: string[]
): Promise<Record<string, QuestionDetails>> {
  const results: Record<string, QuestionDetails> = {};

  // Create an array of promises to fetch question details in parallel
  const fetchPromises = questionIds.map(async (questionId) => {
    try {
      // Handle different question ID formats
      let path;

      // Check if this is a language-specific question (format: "index-language")
      if (questionId.includes("-")) {
        // For language-specific questions, need to handle the path correctly
        const [index, language] = questionId.split("-");
        path = `/${year}/questions/${index}/details-${language}.json`;
      } else {
        // Regular question
        path = `/${year}/questions/${questionId}/details.json`;
      }

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch question ${questionId}: ${response.statusText}`
        );
      }

      const rawData = await response.json();
      return {
        id: questionId,
        data: normalizeQuestionDetails(rawData, questionId, year),
      };
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error);
      return { id: questionId, data: null };
    }
  });

  // Wait for all fetches to complete
  const fetchedQuestions = await Promise.all(fetchPromises);

  // Process results
  for (const result of fetchedQuestions) {
    if (result.data) {
      results[result.id] = result.data;
    }
  }

  return results;
}

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to validate and fix question JSON files
 * 
 * This script checks all question JSON files in the public directory and fixes common issues:
 * - Missing letters in alternatives
 * - Missing isCorrect properties
 * - Inconsistent structure
 */

const PUBLIC_DIR = path.join(__dirname, '../public');
const YEARS = ['2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Count of issues fixed
let issuesFixed = 0;
let filesProcessed = 0;
let filesWithIssues = 0;

/**
 * Normalize a question details JSON file
 */
function normalizeQuestionFile(filePath) {
  try {
    // Read the file
    const data = fs.readFileSync(filePath, 'utf8');
    const question = JSON.parse(data);
    let hasIssues = false;
    
    // Get the question ID from the path
    const match = filePath.match(/questions\/(\d+)\/details\.json$/);
    const questionId = match ? match[1] : 'unknown';
    const year = filePath.includes('/public/') ? filePath.split('/public/')[1].split('/')[0] : 'unknown';
    
    // Ensure basic properties exist
    if (!question.title) {
      question.title = `Questão ${questionId} - ENEM ${year}`;
      hasIssues = true;
    }
    
    if (!question.index) {
      question.index = parseInt(questionId, 10);
      hasIssues = true;
    }
    
    if (!question.year) {
      question.year = parseInt(year, 10);
      hasIssues = true;
    }
    
    // Check alternatives
    if (Array.isArray(question.alternatives)) {
      if (question.alternatives.length > 0) {
        let hasCorrect = false;
        
        for (let i = 0; i < question.alternatives.length; i++) {
          const alt = question.alternatives[i];
          
          // Ensure letter exists
          if (!alt.letter) {
            alt.letter = LETTERS[i];
            hasIssues = true;
          }
          
          // Ensure isCorrect exists
          if (typeof alt.isCorrect !== 'boolean') {
            // If correctAlternative is set, use it to determine isCorrect
            if (question.correctAlternative) {
              alt.isCorrect = alt.letter === question.correctAlternative;
            } else {
              alt.isCorrect = false;
            }
            hasIssues = true;
          }
          
          if (alt.isCorrect) {
            hasCorrect = true;
          }
        }
        
        // If correctAlternative is not set but we have an isCorrect: true, derive it
        if (!question.correctAlternative && hasCorrect) {
          const correctAlt = question.alternatives.find(alt => alt.isCorrect);
          if (correctAlt && correctAlt.letter) {
            question.correctAlternative = correctAlt.letter;
            hasIssues = true;
          }
        }
        
        // If correctAlternative is set but no alternative has isCorrect: true, fix it
        if (question.correctAlternative && !hasCorrect) {
          const correctAlt = question.alternatives.find(alt => 
            alt.letter === question.correctAlternative);
          if (correctAlt) {
            correctAlt.isCorrect = true;
            hasIssues = true;
          }
        }
      }
    } else {
      // If alternatives is not an array, create an empty one
      question.alternatives = [];
      hasIssues = true;
    }
    
    // Write back the normalized data if there were changes
    if (hasIssues) {
      fs.writeFileSync(filePath, JSON.stringify(question, null, 4), 'utf8');
      filesWithIssues++;
      issuesFixed++;
    }
    
    filesProcessed++;
    return hasIssues;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all question files in a year directory
 */
function processYearDirectory(yearPath) {
  try {
    const questionsDir = path.join(yearPath, 'questions');
    
    if (!fs.existsSync(questionsDir)) {
      console.log(`No questions directory found for ${path.basename(yearPath)}`);
      return;
    }
    
    const questionDirs = fs.readdirSync(questionsDir);
    
    for (const questionId of questionDirs) {
      const questionPath = path.join(questionsDir, questionId);
      if (fs.statSync(questionPath).isDirectory()) {
        const detailsPath = path.join(questionPath, 'details.json');
        
        if (fs.existsSync(detailsPath)) {
          normalizeQuestionFile(detailsPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing year directory ${yearPath}:`, error);
  }
}

/**
 * Main function to run the validation
 */
function validateQuestions() {
  console.log('Starting ENEM question validation...');
  
  for (const year of YEARS) {
    const yearPath = path.join(PUBLIC_DIR, year);
    
    if (fs.existsSync(yearPath) && fs.statSync(yearPath).isDirectory()) {
      console.log(`Processing ${year}...`);
      processYearDirectory(yearPath);
    }
  }
  
  console.log(`\nValidation complete!`);
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files with issues fixed: ${filesWithIssues}`);
  console.log(`Total issues fixed: ${issuesFixed}`);
}

// Run the validation
validateQuestions();
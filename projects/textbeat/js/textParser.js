/**
 * TextBeat - Text Parser Module
 * Handles syllable counting, vowel detection, and text analysis
 */

const TextParser = (function() {
    'use strict';

    /**
     * Count syllables in a word using vowel groups and common patterns
     * @param {string} word - The word to analyze
     * @returns {number} - Estimated syllable count
     */
    function countSyllables(word) {
        if (!word || word.length === 0) return 0;
        
        word = word.toLowerCase().trim();
        
        // Handle single letter words
        if (word.length === 1) {
            return /[aeiouy]/.test(word) ? 1 : 0;
        }
        
        // Remove non-alphabetic characters
        word = word.replace(/[^a-z]/g, '');
        
        // Special cases - common words with known syllable counts
        const specialCases = {
            'the': 1, 'are': 1, 'was': 1, 'were': 1, 'been': 1,
            'have': 1, 'has': 1, 'had': 1, 'does': 1, 'done': 1,
            'every': 2, 'very': 2, 'only': 2, 'over': 2,
            'people': 2, 'little': 2, 'simple': 2
        };
        
        if (specialCases[word]) {
            return specialCases[word];
        }
        
        let syllableCount = 0;
        
        // Count vowel groups (consecutive vowels count as one syllable)
        const vowelGroups = word.match(/[aeiouy]+/g);
        if (vowelGroups) {
            syllableCount = vowelGroups.length;
        }
        
        // Subtract for silent 'e' at the end
        if (word.endsWith('e') && syllableCount > 1) {
            // Check if it's truly silent
            const beforeE = word.charAt(word.length - 2);
            if (!/[aeiouy]/.test(beforeE)) {
                syllableCount--;
            }
        }
        
        // Add for common suffixes that add syllables
        const addSyllableSuffixes = [
            /tion$/, /sion$/, /cion$/,  // -tion, -sion
            /cial$/, /tial$/,            // -cial, -tial
            /ious$/, /eous$/,            // -ious, -eous
            /ient$/,                     // -ient
            /ier$/,                      // -ier
            /iest$/                      // -iest
        ];
        
        for (const suffix of addSyllableSuffixes) {
            if (suffix.test(word)) {
                syllableCount++;
                break;
            }
        }
        
        // Handle words ending in 'le' (like 'table', 'simple')
        if (word.endsWith('le') && word.length > 2) {
            const beforeLe = word.charAt(word.length - 3);
            if (!/[aeiouy]/.test(beforeLe)) {
                syllableCount++;
            }
        }
        
        // Ensure at least one syllable
        return Math.max(1, syllableCount);
    }

    /**
     * Detect vowels in text and their positions
     * @param {string} text - The text to analyze
     * @returns {Array} - Array of vowel objects with type and position
     */
    function detectVowels(text) {
        const vowels = [];
        const cleanText = text.toLowerCase();
        const vowelMap = {
            'a': 'kick',
            'e': 'kick',
            'i': 'snare',
            'o': 'tom',
            'u': 'hihat',
            'y': 'cymbal'
        };
        
        let position = 0;
        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            
            // Only count vowels in alphabetic words
            if (/[a-z]/.test(char)) {
                if (vowelMap[char]) {
                    vowels.push({
                        vowel: char,
                        drumType: vowelMap[char],
                        position: position,
                        index: i
                    });
                }
                position++;
            } else if (/\s/.test(char)) {
                // Reset position on whitespace
                position = 0;
            }
        }
        
        return vowels;
    }

    /**
     * Estimate stress patterns in a word
     * @param {string} word - The word to analyze
     * @returns {Array} - Array of stress levels (0-1) for each syllable
     */
    function analyzeStress(word) {
        const syllableCount = countSyllables(word);
        const stress = [];
        
        if (syllableCount === 1) {
            return [1.0];
        }
        
        // Simple stress pattern: first syllable usually stressed in English
        // Alternate between stressed and unstressed
        for (let i = 0; i < syllableCount; i++) {
            if (i === 0) {
                stress.push(1.0); // First syllable stressed
            } else if (i % 2 === 0) {
                stress.push(0.7); // Even syllables moderately stressed
            } else {
                stress.push(0.5); // Odd syllables less stressed
            }
        }
        
        return stress;
    }

    /**
     * Analyze punctuation for rhythm breaks
     * @param {string} text - The text to analyze
     * @returns {Array} - Array of break positions
     */
    function analyzePunctuation(text) {
        const breaks = [];
        const breakChars = /[.,!?;:—–-]/g;
        let match;
        
        while ((match = breakChars.exec(text)) !== null) {
            breaks.push({
                position: match.index,
                type: match[0],
                strength: getPunctuationStrength(match[0])
            });
        }
        
        return breaks;
    }

    /**
     * Get the strength of a punctuation mark for rhythm breaks
     * @param {string} char - The punctuation character
     * @returns {number} - Strength value (0-1)
     */
    function getPunctuationStrength(char) {
        const strengthMap = {
            '.': 1.0,
            '!': 1.0,
            '?': 1.0,
            ';': 0.8,
            ':': 0.7,
            ',': 0.5,
            '—': 0.6,
            '–': 0.6,
            '-': 0.4
        };
        
        return strengthMap[char] || 0.5;
    }

    /**
     * Main parsing function - analyzes text and returns rhythm data
     * @param {string} text - The input text
     * @returns {Object} - Parsed text data with syllables, vowels, and rhythm info
     */
    function parseText(text) {
        if (!text || text.trim().length === 0) {
            return {
                text: '',
                words: [],
                totalSyllables: 0,
                totalVowels: 0,
                vowels: [],
                breaks: [],
                complexity: 0
            };
        }
        
        // Split into words
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        // Analyze each word
        const wordData = words.map(word => {
            const syllables = countSyllables(word);
            const stress = analyzeStress(word);
            
            return {
                word: word,
                syllables: syllables,
                stress: stress
            };
        });
        
        // Detect all vowels
        const vowels = detectVowels(text);
        
        // Analyze punctuation breaks
        const breaks = analyzePunctuation(text);
        
        // Calculate total syllables
        const totalSyllables = wordData.reduce((sum, w) => sum + w.syllables, 0);
        
        // Calculate complexity (syllables per word average)
        const complexity = words.length > 0 ? totalSyllables / words.length : 0;
        
        return {
            text: text,
            words: wordData,
            totalSyllables: totalSyllables,
            totalVowels: vowels.length,
            vowels: vowels,
            breaks: breaks,
            complexity: complexity
        };
    }

    /**
     * Generate rhythm metadata from parsed text
     * @param {Object} parsedData - The parsed text data
     * @returns {Object} - Rhythm metadata for pattern generation
     */
    function generateRhythmData(parsedData) {
        const { totalSyllables, vowels, complexity, breaks } = parsedData;
        
        // Determine rhythm density based on complexity
        let density = 'medium';
        if (complexity < 1.5) {
            density = 'sparse';
        } else if (complexity > 2.5) {
            density = 'dense';
        }
        
        // Group vowels by drum type
        const drumGroups = {
            kick: [],
            snare: [],
            tom: [],
            hihat: [],
            cymbal: []
        };
        
        vowels.forEach(v => {
            if (drumGroups[v.drumType]) {
                drumGroups[v.drumType].push(v);
            }
        });
        
        // Calculate distribution percentages
        const distribution = {};
        Object.keys(drumGroups).forEach(drum => {
            distribution[drum] = vowels.length > 0 
                ? drumGroups[drum].length / vowels.length 
                : 0;
        });
        
        return {
            syllableCount: totalSyllables,
            vowelCount: vowels.length,
            density: density,
            drumGroups: drumGroups,
            distribution: distribution,
            breaks: breaks,
            hasBreaks: breaks.length > 0
        };
    }

    /**
     * Get statistics about the parsed text
     * @param {Object} parsedData - The parsed text data
     * @returns {Object} - Statistics object
     */
    function getStatistics(parsedData) {
        return {
            characterCount: parsedData.text.length,
            wordCount: parsedData.words.length,
            syllableCount: parsedData.totalSyllables,
            vowelCount: parsedData.totalVowels,
            averageSyllablesPerWord: parsedData.complexity.toFixed(2),
            complexity: parsedData.complexity < 1.5 ? 'Simple' : 
                       parsedData.complexity > 2.5 ? 'Complex' : 'Moderate'
        };
    }

    // Public API
    return {
        countSyllables,
        detectVowels,
        analyzeStress,
        analyzePunctuation,
        parseText,
        generateRhythmData,
        getStatistics
    };
})();

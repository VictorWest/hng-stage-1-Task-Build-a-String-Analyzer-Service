import crypto from "crypto"

export const stringValueExists = (word: string, stringValuesArray: any[]): boolean => {
    return stringValuesArray.some(item => item.value === word)
}

export const isPalindrome = (word: string): boolean => {
    word = word.toLowerCase()
    let reverseWord: string[] = []

    for(let i = word.length - 1; i >= 0; i--){
        reverseWord.push(word[i])
    }
    return reverseWord.join("") === word
}

export const getUniqueCharacters = (word: string): number => {
    return new Set([...word]).size
}

export const getWordCount = (word: string): number => {
    if (word === "") return 0

    word = word.replace(/\s+/g, ' ').trim()
    let count = 1

    for(let i = 0; i < word.length; i++){
        if (word[i] === " ") count ++
    }
    return count
}

export const getSha256Hash = (word: string): string => {
    const hash = crypto.createHash('sha256')
    hash.update(word)

    return hash.digest('hex')
}

export const characterFrequencyMap = (word: string) => {
    word = word.replace(/\s+/g, '').trim()
    const uniqueChars = new Set([...word])
    let charDict = {}
    let count = 0

    uniqueChars.forEach((item) => {
        for (let i = 0; i < word.length; i++){
            if (item === word[i]) count++
        }
        charDict = { ...charDict, [item]: count }
        count = 0
    })
    return charDict
}

export const acceptedQueries = ["is_palindrome", "min_length", "max_length", "word_count", "contains_character"]

export const applyFilters = (stringValuesArray: any[], filters: any) => {
    return stringValuesArray.filter(item => {
        if (filters.is_palindrome && !item.properties.is_palindrome) return false
        if (filters.min_length && item.properties.length < filters.min_length) return false
        if (filters.max_length && item.properties.length > filters.max_length) return false
        if (filters.word_count && item.properties.word_count !== filters.word_count) return false
        if (filters.contains_character && !item.value.includes(filters.contains_character)) return false
        return true
    })
}

export const parseNaturalLanguageQuery = (query: string) => {
    const q = query.toLowerCase().trim()
    const filters: any = {}

    if (q.includes("palindrome") || q.includes("palindromic")){
        filters.is_palindrome = true;
    }

    if (q.includes("single word")) filters.word_count = 1;
    else if (q.includes("two word")) filters.word_count = 2;
    else if (q.includes("three word")) filters.word_count = 3;

    const longerMatch = q.match(/longer than (\d+)/)
    const shortMatch = q.match(/shorter than (\d+)/)

    if (longerMatch) filters.min_length = parseInt(longerMatch[1]) + 1
    if (shortMatch) filters.max_length = parseInt(shortMatch[1]) - 1

    const containMatch = q.match(/containing the letter (\w)/) || q.match(/contain[s]? the letter (\w)/);
    if (containMatch) filters.contains_character = containMatch[1];

    if(q.includes("first vowel")) filters.contains_character = 'a'

    return filters
}
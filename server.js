import express from "express"
import { acceptedQueries, applyFilters, characterFrequencyMap, getSha256Hash, getUniqueCharacters, getWordCount, isPalindrome, parseNaturalLanguageQuery, stringValueExists } from "./helpers.ts"

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let stringValuesArray = []

app.get('/strings', (req, res) => {
    let filtersApplied = {}

    for (const key in req.query){
        if (!acceptedQueries.includes(key)) return res.status(400).send({ message: "Invalid query parameter values or types"})
        if ((key === "min_length" || key === "max_length") && req.query[key] && Number.isNaN(Number(req.query[key]))) return res.status(400).send({ message: "Invalid query parameter values or types"})
        
        filtersApplied = req.query[key] && {...filtersApplied, [key]: req.query[key]}
    }

    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query

    const filters = {
        is_palindrome: is_palindrome === 'true',
        min_length: min_length ? parseInt(min_length) : undefined,
        max_length: max_length ? parseInt(max_length) : undefined,
        word_count: word_count ? parseInt(word_count) : undefined,
        contains_character: contains_character || undefined
    }

    const data = applyFilters(stringValuesArray, filters)

    const result = {
        data,
        "count": data.length,
        "filters_applied": filtersApplied
    }
    return res.status(200).send(result)
})

app.post('/strings', (req, res) => {
    try {
        const { value } = req.body
        if (typeof value !== "string") return res.status(422).json({ message: "Invalid data type for 'value' (must be string)"})
        if (stringValueExists(value, stringValuesArray)) return res.status(409).json({ message: "String already exists in the system"})
        
        const hash = getSha256Hash(value)
        const stringValue = { 
            "id": hash,
            "value": value,
            "properties": {
                "length": value.length,
                "is_palindrome": isPalindrome(value),
                "unique_characters": getUniqueCharacters(value),
                "word_count": getWordCount(value),
                "sha256_hash": hash,
                "character_frequency_map": characterFrequencyMap(value)                
            },
            "created_at": new Date()
        }
        stringValuesArray = [ ...stringValuesArray, stringValue ]
        return res.status(201).send(stringValue)
    } catch (error) {
        if (error.name === "TypeError") {
            res.status(400).json({ message: "Invalid request body or missing 'value' field"})
        }
        console.log(error)
        res.status(500).json({ message: error })
    }    
    
})

app.get('/strings/filter-by-natural-language', (req, res) => {
    const { query } = req.query

    if (!query) {
        return res.status(400).send({ message: "Missing query parameter 'query'" })
    }

    try {
        const parsedFilters = parseNaturalLanguageQuery(query)

        if (!parsedFilters || Object.keys(parsedFilters).length === 0) {
            return res.status(400).json({ messge: "Unable to parse natural language query" })
        }

        if (parsedFilters.max_length && parsedFilters.min_length && parsedFilters.min_length > parsedFilters.max_length){
            return res.status(422).json({ message: "Query parsed but resulted in conflicting filters" })
        }

        const results = stringValuesArray.filter(item => {
            console.log(item)
            if (parsedFilters.is_palindrome && !item.properties.is_palindrome) return false
            if (parsedFilters.min_length && item.properties.length < parsedFilters.min_length) return false
            if (parsedFilters.max_length && item.properties.length > parsedFilters.max_length) return false
            if (parsedFilters.word_count && item.properties.word_count !== parsedFilters.word_count) return false
            if (parsedFilters.contains_character && !item.value.includes(parsedFilters.contains_character)) return false
            
            return true
        })

        const finalResult =  {
            "data": results,
            "count": results.length,
            "interpreted_query": {
                "original": query,
                "parsed_filters": parsedFilters
            }
        }
        return res.status(200).json(finalResult)
    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: "Unable to parse natural language query" })
    }
})

app.get('/strings/:string_value', (req, res) => {
    const stringValue = req.params.string_value

    const item = stringValuesArray.find(item => item.value === stringValue)

    if (item) return res.status(200).send(item)
    return res.status(404).json({ message: "String does not exist in the system" })
})

app.delete('/strings/:string_value', (req, res) => {
    const stringValue = req.params.string_value
    const itemToDelete = stringValuesArray.find(item => item.value === stringValue)

    if (!itemToDelete) return res.status(404).json({ message: "String does not exist in the system" })
    
    stringValuesArray = stringValuesArray.filter(item => item.value !== stringValue)

    return res.status(204)
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
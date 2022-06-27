const { readFile, writeFile } = require('fs/promises')
const async = require('async')
const { v4: uuidv4 } = require('uuid')

const makeQuestionRepository = fileName => {
  const queue = async.queue(async task => await task(), 1)
  
  const readRepository = async () => JSON.parse(await readFile(fileName, { encoding: 'utf-8' }))

  const writeRepository = repository => writeFile(fileName, JSON.stringify(repository))
  
  const checkEntryFormat = (entry) => (
    typeof(entry.author) == "string" &&
    typeof(entry.summary) == "string" &&
    entry.author &&
    entry.summary
  )

  const getQuestions = () => queue.pushAsync(readRepository)

  const getQuestionById = questionId => queue.pushAsync(async () => {
    const repository = await readRepository()
    let result = repository.find(question => question.id == questionId);
    if(!result) return {err: "No question with the provided ID"}
    delete result.answers
    delete result.id
    return result
  })

  const addQuestion = question => queue.pushAsync(async () => {
    let repository = await readRepository()
    const questionId = uuidv4()
    if(!checkEntryFormat(question)) return {err: "Missing author or/and summary field(s)"}
    repository.push({
      id: questionId,
      author: question.author,
      summary: question.summary,
      answers: []
    })
    await writeRepository(repository)
    return {id: questionId}
  })

  const getAnswers = questionId => queue.pushAsync(async () => {
    const repository = await readRepository()
    let result = repository.find(question => question.id == questionId);
    if(!result) return {err: "No question with the provided ID"}
    return result.answers
  })

  const getAnswer = async (questionId, answerId) => queue.pushAsync(async () => {
    const repository = await readRepository()
    let result = repository.find(question => question.id == questionId);
    if(!result) return {err: "No question with the provided ID"}
    result = result.answers.find(answer => answer.id == answerId);
    if(!result) return {err: "No answer with the provided ID"}
    delete result.id
    return result
  })

  const addAnswer = async (questionId, answer) => queue.pushAsync(async () => {
    let repository = await readRepository()
    let result = repository.find(question => question.id == questionId);
    if(!result) return {err: "No question with the provided ID"}
    let answerId = uuidv4()
    if(!checkEntryFormat(answer)) return {err: "Missing author or/and summary field(s)"}
    result.answers.push({
      id: answerId,
      author: answer.author,
      summary: answer.summary,
    })
    await writeRepository(repository)
    return {id: answerId}
  })

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }

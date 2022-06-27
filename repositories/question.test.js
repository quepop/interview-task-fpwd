const { writeFile, readFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))

    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  })

  test('should return the list of questions as in the repository file', async () => {
    const questionsFile = JSON.parse(await readFile(TEST_QUESTIONS_FILE_PATH, { encoding: 'utf-8' }))
    expect(await questionRepo.getQuestions()).toEqual(questionsFile)
  })

  test('shoud return the question with the specified ID', async () => {
    let question = (await questionRepo.getQuestions())[0]
    const query = await questionRepo.getQuestionById(question.id)
    delete question.id
    delete question.answers
    expect(query).toEqual(question)
  })

  test('should not return any questions (should return an error)', async () => {
    const query = await questionRepo.getQuestionById("")
    expect(query).toHaveProperty(["err"])
  })
  
  test('should add the question and return it\'s ID', async () => {
    const questionBody = {
      author: "author",
      summary: "summary"
    }
    const questionId = await questionRepo.addQuestion(questionBody)
    let question = await questionRepo.getQuestionById(questionId.id)
    delete question.answers
    delete question.id
    expect(question).toEqual(questionBody)
  })

  test('should not add the question (shoud return an error)', async () => {
    const questionBody = {
      author: "",
      summary: ""
    }
    const questionErr = await questionRepo.addQuestion(questionBody)
    expect(questionErr).toHaveProperty(["err"])
  })

  test('should add the answer and return it\'s ID', async () => {
    const answerBody = {
      author: "author",
      summary: "summary"
    }
    const questionId = (await questionRepo.getQuestions())[0].id
    const answerId = await questionRepo.addAnswer(questionId, answerBody)
    let answer = await questionRepo.getAnswer(questionId, answerId.id)
    delete answer.id
    expect(answer).toEqual(answerBody)
  })

  test('should not add the answer (shoud return an error) v1', async () => {
    const answerErr = await questionRepo.addAnswer("", "")
    expect(answerErr).toHaveProperty(["err"])
  })

  test('should not add the answer (shoud return an error) v2', async () => {
    const questionId = (await questionRepo.getQuestions())[0].id
    const answerErr = await questionRepo.addAnswer(questionId, "")
    expect(answerErr).toHaveProperty(["err"])
  })

  test('should not return an answer (shoud return an error) v1', async () => {
    const answerErr = await questionRepo.getAnswer("", "")
    expect(answerErr).toHaveProperty(["err"])
  })

  test('should not return an answer (shoud return an error) v2', async () => {
    const questionId = (await questionRepo.getQuestions())[0].id
    const answerErr = await questionRepo.getAnswer(questionId, "")
    expect(answerErr).toHaveProperty(["err"])
  })

  test('should not return any answers (shoud return an error)', async () => {
    const answerErr = await questionRepo.getAnswers("")
    expect(answerErr).toHaveProperty(["err"])
  })

  test('should return all the answers from the specified question', async () => {
    const question = (await questionRepo.getQuestions())[0]
    const answers = await questionRepo.getAnswers(question.id)
    expect(answers).toEqual(question.answers)
  })
})

const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const question = await req.repositories.questionRepo.getQuestionById(req.params.questionId)
  res.json(question)
})

app.post('/questions', async (req, res) => {
  const questionId = await req.repositories.questionRepo.addQuestion(req.body)
  res.json(questionId)
})

app.get('/questions/:questionId/answers', async (req, res) => {
  const answers = await req.repositories.questionRepo.getAnswers(req.params.questionId)
  res.json(answers)
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
  const answer = await req.repositories.questionRepo.getAnswer(req.params.questionId, req.params.answerId)
  res.json(answer)
})

app.post('/questions/:questionId/answers', async (req, res) => {
  const answers = await req.repositories.questionRepo.addAnswer(req.params.questionId, req.body)
  res.json(answers)
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
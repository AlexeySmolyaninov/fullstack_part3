require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/person')

const app = express()

app
  .use(express.static('build'))
  .use(cors())
  .use(express.json())
  .use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))

/*
let persons = [
  {id: 1, name: 'Arto Hellas', number: '040-123456'},
  {id: 2, name: 'Ada Lovelace', number: '39-44-5323523'},
  {id: 3, name: 'Dan Abramov', number: '12-43-234345'},
  {id: 4, name: 'Mary Poppendick', number: '39-23-6423122'}
]
*/

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => res.send(result))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(result => res.send(result))
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if(!body.name || !body.number)
    return res.status(400).send({ error: 'property name or number is missing' })

  const newPerson = new Person({ ...body })
  newPerson.save()
    .then(result => res.send(result))
    .catch(err => next(err))
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(result => {
      const content = `<p>Phonebook has info for ${result.length} people</p>
      <p>${new Date().toString()}</p>`
      res.send(content)
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    //name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then(result => res.send(result))
    .catch(err => next(err))
})

const errorHandler = (err, req, res, next) => {
  console.error(err)
  if(err.name === 'CastError')
    return res.status(400).send({ error: 'ID is not correct' })
  else if(err.name === 'MongoError')
    return res.status(409).json({ error: err.message })
  else if(err.name === 'ValidationError')
    return res.status(400).json({ error: err.message })

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server has started and reachable from port ${PORT}`)
})
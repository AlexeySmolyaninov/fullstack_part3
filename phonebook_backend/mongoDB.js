const mongoose = require('mongoose')

//mongoose.connection.on('open', () => console.log('MongoDB connection is OPEN'))
//mongoose.connection.on('close', () => console.log('mongoDB connection is CLOSED'))

if(process.argv.length < 3){
  console.log('- If you want to view persons list provide just a DB\'s pw')
  console.log('- If you want to create a new person to the phonebook provide pw, name and number')
  process.exit(1)
}

const [pw, name, number] = process.argv.slice(2)

const url = `mongodb+srv://admin:${pw}@cluster0.v1l7u.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(!name){
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => console.log(`${person.name} ${person.number}`))
  })
    .finally(() => mongoose.connection.close())
}
else {
  const newPerson = new Person({
    name: name,
    number: number
  })

  newPerson.save()
    .then(result => console.log(`added ${result.name} number ${result.number} to phonebook`))
    .finally(() => mongoose.connection.close())
}
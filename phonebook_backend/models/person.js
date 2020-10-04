const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

//listeners
mongoose.connection.on('open', () => console.log('MongoDB connection is OPEN'))
mongoose.connection.on('close', () => console.log('mongoDB connection is CLOSED'))


const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, index: true, unique: true, required: true, uniqueCaseInsensitive: true },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /(\d.*){8,}/.test(v)
      },
      message: () => 'Number doesn\'t include at list 8 digits!'
    }
  }
})
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
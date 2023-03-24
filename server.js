var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
var cors = require('cors')
const PORT = process.env.PORT || 8000;


app.use(cors())
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

var dbUrl = 'mongodb+srv://charan:charan123@task1.igebbo3.mongodb.net/?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    firstname: String,
    profileNote: Array
})

var eamilidvspassword = mongoose.model('emailidvspassword', {
    emailId: {
        type: String,
        unique: true // `email` must be unique
    },
    password: String,
})

var eamilidvsphoto = mongoose.model('emailidvsphoto', {
    emailId: {
        type: String,
        unique: true // `email` must be unique
    },
    image: String,
})

var clientvsdetails = mongoose.model('clientvsdetails', {
    clientid: String,
    emailId: String,
    firstname: String,
    lastname: String,
    designation: String,
    phoneno: String,
    state: String,
    city: String,
    profileNote: String,
    asowner_teamid:Array,
    asparticipant_taskid:Array,
    direct_taskid:Array,

})

var taskdetails = mongoose.model('taskdetails', {
    taskid: String,
    taskName: String,
    taskLeader: String,
    milestone: Array,
    teamParticipants:Array

})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})
app.get('/', (req, res) => {
    // Message.find({}, (err, messages) => {
        res.send("hello")
    // })
})

// app.get('/messages/:user', (req, res) => {
//     var user = req.params.user
//     Message.find({name: user}, (err, messages) => {
//         res.send(messages)
//     })
// })

app.post('/signUp', async (req, res) => {

    try {
        let message1 = new eamilidvspassword(req.body)

        let savedMessage1 = await message1.save()

        let temp = req.body
        temp.clientid=savedMessage1._id.toString()
        let message2 =  clientvsdetails(temp)
        let savedMessage2 = await message2.save()

        console.log(savedMessage2)

        console.log('saved')

        res.sendStatus(200)
    } catch (error) {

        if (error.code==11000)
          {  res.send("duplicate")
            return console.error("Duplicate")
          }
        else{
          res.sendStatus(500)
          return console.error(error)
        }
    } finally {
        console.log('message post called')
    }
})

app.post('/login', async (req, res) => {

    try {
        eamilidvspassword.collection.dropIndexes()
        let message1 = new eamilidvspassword(req.body, { '_id': 0 })
        var status = await eamilidvspassword.findOne(message1)
        if (status) {
            var clientidnew = await clientvsdetails.findOne({ emailId: status.emailId }).select({clientid:1,_id:0})
            res.send({ status: 'accepted', instanceKey: '123456789',clientid:clientidnew.clientid})
        }

        else
            res.send({ status: 'rejected', instanceKey: '' })


    } catch (error) {

        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('Login post called')
    }
})


app.post('/:user/clientlist', async (req, res) => {

    try {
        var user = req.params.user
        console.log(user)

        // let message1 = new eamilidvspassword(req.body, { '_id': 0})
        var status1 = await clientvsdetails.find({}).select({
            _id:0,
            clientid: 1,
            emailId: 1,
            firstname: 1,
            lastname: 1,
});
        if(status1)
        {
            res.send({ status: status1, instanceKey: '123456789' })
        }

        else
            res.send({ status: 'nc', instanceKey: '123456789' })

        
    } catch (error) {

            res.sendStatus(500)
            return console.error(error)
    } finally {
        console.log('Clientlist post called')
    }
})

// {
//   taskid: '641db832fe0ca39d6764b720',
//   taskName: '1',
//   taskLeader: '',
//   milestone: [ '2', '1' ],
//   teamParticipants: [
//     '641da3108c602a4a614e6177',
//     '641c33dd550394cd577483a4',
//     '641da9738c602a4a614e6185'
//   ],
//   _id: new ObjectId("641db832fe0ca39d6764b721"),
//   __v: 0
// }

app.post('/:user/clientdirecttaskids', async (req, res) => {

    try {
        var user = req.params.user
        console.log(user)
        // let cid = JSON.parse(req.body)
        let cid = new clientvsdetails(req.body)
        var status1 = await clientvsdetails.findOne({ clientid: cid.clientid}).select({
            _id: 0,
            direct_taskid:1
        });
        console.log(status1.direct_taskid)
        if (status1) {
            res.send({ status: status1.direct_taskid, instanceKey: '123456789' })
        }

        else
            res.send({ status: 'nc', instanceKey: '123456789' })


    } catch (error) {

        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('Clientlist post called')
    }
})

app.post('/:user/gettaskdetails', async (req, res) => {

    try {
        var user = req.params.user
        console.log(user)

        // let message1 = new eamilidvspassword(req.body, { '_id': 0})
        let tid = new taskdetails(req.body)
        var status1 = await taskdetails.find({ taskid: tid.taskid }, { '_id': 0 });
        // console.log(status1)
        if (status1) {
            res.send({ status: status1, instanceKey: '123456789' })
        }

        else
            res.send({ status: 'nc', instanceKey: '123456789' })


    } catch (error) {

        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('Clientlist post called')
    }
})

app.post('/:user/createdirecttask', async (req, res) => {

    try {
        var user = req.params.user
        console.log(user)
        var id = new mongoose.Types.ObjectId();
        let s1 = req.body
        s1.taskid=id.toString()
        let message1 = new taskdetails(s1)
        let savedMessage1 = await message1.save()


        // console.log(savedMessage1)

        if (savedMessage1) {
            savedMessage1.teamParticipants.forEach(async function (item) {
                var eachclient = await clientvsdetails.find({clientid:item})
                // console.log(eachclient[0])
                eachclient[0].direct_taskid.push(savedMessage1.taskid)
                var res1 = await eachclient[0].save()
                console.log(res1)

            })
            return res.send({ status:"accepted", instanceKey: '123456789' })
            console.log(status1);
        }

        else
            return res.send({ status: 'rejected', instanceKey: '123456789' })
            


    } catch (error) {

        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('Clientlist post called')
    }
})

// app.post('/messages', async (req, res) => {

//     try {
//         var message = new Message(req.body)

//         var savedMessage = await message.save()

//         console.log('saved')

//         var censored = await Message.findOne({ message: 'badword' })

//         if (censored)
//             await Message.remove({ _id: censored.id })
//         else
//             io.emit('message', req.body)

//         res.sendStatus(200)
//     } catch (error) {
//         res.sendStatus(500)
//         return console.error(error)
//     } finally {
//         console.log('message post called')
//     }
// })




io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl);

var server = http.listen(PORT, () => {
    console.log('server is listening on port', server.address().port)
})
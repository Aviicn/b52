const express = require('express')
const path = require('path')
const { start } = require('repl')
const app = express()
const port = 5000

app.set("view engine", "hbs")
app.set("views", path.join(__dirname, 'src/views'))

app.use("/assets", express.static('src/assets'))
app.use(express.urlencoded({ extended: false }))

app.get('/', home)
app.get('/contact', contact)
app.post('/delete-card/:id', deleteCard)

app.get('/add-project', addProjectView)
app.post('/add-project', addProject)

app.get('/update-project/:id', updateProjectView)
app.post('/update-project', updateProject)

app.get('/detail/:id', detail)
app.get('/testimonials', testimonials)

const data = []

function home(req, res) {
    res.render('index', { data });
}

function contact(req, res) {
    res.render('contact')
}

function addProjectView(req, res) {
    res.render('add-project')
}

function addProject(req, res) {
    const name = req.body.name
    const start = req.body.startDate
    const end = req.body.endDate
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const desc = req.body.desc
    const checkbox = req.body.checkbox
    const checkboxes = ['nodeJs', 'nextJs', 'reactJs', 'typeScript'].filter(checkbox => req.body[checkbox])
    
    // Hitung selisih dalam hari
    const days = dayDifference(startDate , endDate)

    // Menentukan unit durasi berdasarkan selisih waktu
    const { duration, unit } = chooseDuration(days)

    // Ambil icon yang dipilih
    const icons = {
        nodeJs: checkboxes.includes('nodeJs') ? "/assets/img/nodejs.png" : '',
        nextJs: checkboxes.includes('nextJs') ? "/assets/img/nextjs.png" : '',
        reactJs: checkboxes.includes('reactJs') ? "/assets/img/react.png"  : '',
        typeScript: checkboxes.includes('typeScript') ? "/assets/img/typescirpt.png" : ''
    }

    const dataProject = {name, start, end, startDate, endDate, desc, checkboxes, duration, unit, icons}

    data.unshift(dataProject)
    res.redirect('/')
}
function updateProjectView(req, res) {
    const id = req.params.id
    const dataFilter = data[parseInt(id)]
    dataFilter.id = parseInt(id)

    res.render('update-project', {data: dataFilter }) 
}

function updateProject(req, res) {
    const name = req.body.name
    const start = req.body.startDate
    const end = req.body.endDate
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const desc = req.body.desc
    const checkbox = req.body.checkbox
    const checkboxes = ['nodeJs', 'nextJs', 'reactJs', 'typeScript'].filter(checkbox => req.body[checkbox])
    const id = req.body.id
    
    data[parseInt(id)] = {
        name,
        start,
        end,
        desc,
        checkboxes
    }

    // Hitung selisih dalam hari
    const days = dayDifference(startDate , endDate)

    // Menentukan unit durasi berdasarkan selisih waktu
    const { duration, unit } = chooseDuration(days)

    // Ambil icon yang dipilih
    const icons = {
        nodeJs: checkboxes.includes('nodeJs') ? "/assets/img/nodejs.png" : '',
        nextJs: checkboxes.includes('nextJs') ? "/assets/img/nextjs.png" : '',
        reactJs: checkboxes.includes('reactJs') ? "/assets/img/react.png"  : '',
        typeScript: checkboxes.includes('typeScript') ? "/assets/img/typescirpt.png" : ''
    }

    const dataProject = {name, start, end, startDate, endDate, desc, checkboxes, duration, unit, icons}

    res.redirect('/')
}

function deleteCard(req, res) {
    const id = req.params.id
    
    data.splice(id, 1)
    res.redirect('/')
}

function detail(req, res) {
    const id = parseInt(req.params.id)

    if(id >= 0 && id < data.length) {
        const project = data[id]
        res.render('detail', {data: project, start: project.start, end: project.end})
    } else {
        res.status(404).send('Project not found!')
    }
}

function testimonials(req, res) {
    res.render('testimonials')
}

function dayDifference (start, end) {
    const timeDiff = end.getTime() - start.getTime()
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24))
}

function chooseDuration(days) {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    const remainingDays = days % 30

    if(years > 0) {
        return { duration: years, unit: 'tahun'}
    } else if (months > 0) {
        return { duration: months, unit: 'bulan'}
    } else {
        return { duration: remainingDays, unit: 'hari'}
    }
}

app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`)
})
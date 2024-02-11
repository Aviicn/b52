const express = require('express')
const path = require('path')
const app = express()
const port = 5000
const config = require('./src/config/config.json')
const { Sequelize, QueryTypes } = require('sequelize')
const sequelize = new Sequelize(config.development)
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')

const multer = require('multer')

// preparation
const file = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""))
  }
})

const upload = multer({
  storage: file
})

app.set("view engine", "hbs")
app.set("views", path.join(__dirname, 'src/views'))

app.use("/assets", express.static('src/assets'))
app.use('/uploads', express.static('src/uploads'))

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: 'verysecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}))



app.get('/', home)
app.get('/contact', checkAuth, contact)
app.post('/delete-card/:id', checkAuth, deleteCard)

app.get('/add-project', checkAuth, addProjectView)
app.post('/add-project', checkAuth, upload.single("image"), addProject)

app.get('/update-project/:id', checkAuth, updateProjectView)
app.post('/update-project', checkAuth, upload.single("image"), updateProject)

app.get('/detail/:id', checkAuth, detail)
app.get('/testimonials', checkAuth, testimonials)

app.get('/register', registerView)
app.post('/register', register)

app.get('/login', loginView)
app.post('/login', login)

const data = [];

async function home(req, res) {

  const isLogin = req.session.isLogin
  const user = req.session.user
  let userID = 0
  if (isLogin) { userID = req.session.user.id }
  const query = `SELECT blogs.id, blogs.name, blogs.start_date,
  blogs.end_date, blogs.description, blogs.technologies,
  blogs.image, users.name AS author, blogs."createdAt", blogs."updatedAt" FROM blogs LEFT JOIN users ON blogs.userid = users.id WHERE blogs.userid=`+ userID

  const projects = await sequelize.query(query, { type: QueryTypes.SELECT })

  const projectsWithInfo = projects.map(project => {
    const days = dayDifference(new Date(project.start_date), new Date(project.end_date));
    const { duration, unit } = chooseDuration(days);

    const icons = {
      nodeJs: project.technologies.includes('nodeJs') ? "/assets/img/nodejs.png" : '',
      nextJs: project.technologies.includes('nextJs') ? "/assets/img/nextjs.png" : '',
      reactJs: project.technologies.includes('reactJs') ? "/assets/img/react.png" : '',
      typeScript: project.technologies.includes('typeScript') ? "/assets/img/typescirpt.png" : ''
    };
    return {
      ...project,
      technologies: project.technologies.join(', '),
      duration,
      unit,
      icons
    }
  })



  console.log("test", projectsWithInfo)
  res.render('index', { data: projectsWithInfo, user: req.session.user, isLogin: isLogin,loggedInUser : user })
}

function contact(req, res) {
  const isLogin = req.session.isLogin
  const user = req.session.user

  res.render('contact', { isLogin: isLogin, user: user })
}

function addProjectView(req, res) {
  const isLogin = req.session.isLogin
  const user = req.session.user

  res.render('add-project', { isLogin: isLogin, user: user })
}

async function addProject(req, res) {
  const { name, start, end, description } = req.body
  const checkboxes = ['nodeJs', 'nextJs', 'reactJs', 'typeScript'].filter(checkbox => req.body[checkbox])

  //const image = 'react.png'
  const image = req.file.filename
  const userid = req.session.user.id

  const query = `INSERT INTO blogs(name, start_date, end_date, description, technologies, image, userid) VALUES('${name}', '${start}', '${end}', '${description}', ARRAY['${checkboxes.join("','")}'], '${image}', '${userid}')`
  const obj = await sequelize.query(query, { type: QueryTypes.INSERT })


  console.log('data berhasil diinsert', obj)
  res.redirect('/')
}

async function updateProjectView(req, res) {
  const { id } = req.params

  const query = `SELECT * FROM blogs WHERE id=${id}`
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT })

  const isLogin = req.session.isLogin
  const user = req.session.user

  const icons = {
    nodeJs: obj[0].technologies.includes('nodeJs') ? "/assets/img/nodejs.png" : '',
    nextJs: obj[0].technologies.includes('nextJs') ? "/assets/img/nextjs.png" : '',
    reactJs: obj[0].technologies.includes('reactJs') ? "/assets/img/react.png" : '',
    typeScript: obj[0].technologies.includes('typeScript') ? "/assets/img/typescirpt.png" : ''
  }
  console.log("XXXX ", { ...obj[0], icons })

  res.render('update-project', { data: { ...obj[0], icons }, isLogin: isLogin, user: user })

}


async function updateProject(req, res) {
  const { name, start, end, description, id } = req.body
  const checkboxes = ['nodeJs', 'nextJs', 'reactJs', 'typeScript'].filter(checkbox => req.body[checkbox])

  const image = req.file.filename

  const updateQuery = `UPDATE blogs SET name='${name}', start_date='${start}', end_date='${end}', description='${description}', technologies=ARRAY['${checkboxes.join("','")}'], image='${image}'  WHERE id=${id}`;
  const updateResult = await sequelize.query(updateQuery, { type: QueryTypes.UPDATE });

  console.log('berhasil diupdate', updateResult)

  res.redirect('/')
}

async function deleteCard(req, res) {
  const { id } = req.params

  const query = `DELETE FROM blogs WHERE id=${id}`
  const obj = await sequelize.query(query, { type: QueryTypes.DELETE })

  console.log(obj)

  res.redirect('/')
}

async function detail(req, res) {
  const { id } = req.params

  const query = `SELECT * FROM blogs WHERE id=${id}`
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT })

  console.log("log ", obj)

  const formattedStartDate = new Date(obj[0].start_date).toISOString().split('T')[0];
  const formattedEndDate = new Date(obj[0].end_date).toISOString().split('T')[0];

  const days = dayDifference(new Date(obj[0].start_date), new Date(obj[0].end_date))
  const { duration, unit } = chooseDuration(days)

  const icons = {
    nodeJs: obj[0].technologies.includes('nodeJs') ? "/assets/img/nodejs.png" : '',
    nextJs: obj[0].technologies.includes('nextJs') ? "/assets/img/nextjs.png" : '',
    reactJs: obj[0].technologies.includes('reactJs') ? "/assets/img/react.png" : '',
    typeScript: obj[0].technologies.includes('typeScript') ? "/assets/img/typescirpt.png" : ''
  }

  console.log('detail project:', obj[0]);
  const isLogin = req.session.isLogin;
  const user = req.session.user;

  res.render('detail', {
    data: {
      ...obj[0],
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      duration,
      unit,
      icons
    },
    isLogin: isLogin,
    user: user
  });

}

function testimonials(req, res) {
  const isLogin = req.session.isLogin
  const user = req.session.user

  res.render('testimonials', { isLogin: isLogin, user: user })
}

async function register(req, res) {
  const { name, email, password } = req.body

  console.log('Name', name)
  console.log('Email', email)
  console.log('Password', password)

  const salt = 10

  bcrypt.hash(password, salt, async (err, hash) => {
    if (err) {
      console.error("Password failed to be encrypted! ")
      req.flash('danger', 'Register failed : password failed to be encrypted!')
      return res.redirect('/register')
    }
    console.log('Hash result :', hash)
    const query = `INSERT INTO users(name, email, password) VALUES ('${name}', '${email}', '${hash}')`
    await sequelize.query(query, { type: QueryTypes.INSERT })
    req.flash('success', 'Register success!')

    res.render('index')
  })
}

function registerView(req, res) {
  res.render('register')
}

async function login(req, res) {
  const { email, password } = req.body
  const query = `SELECT * FROM users WHERE email='${email}'`
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT })

  if (!obj.length) {
    console.error('user not registered!')
    req.flash('danger', 'Login failed : email is wrong!')
    return res.redirect('login')
  }

  bcrypt.compare(password, obj[0].password, (err, result) => {
    if (err) {
      req.flash('danger', 'Login failed : Internal Server Error!')
      console.error("Login : Internal Server Error!")
      return res.redirect('/login')
    }

    if (!result) {
      console.error('Password is wrong!')
      req.flash('danger', 'Login failed : password is wrong!')
      return res.redirect('/login')
    }

    console.log('Login success!')
    req.flash('success', 'Login success!')
    req.session.isLogin = true
    req.session.user = {
      id: obj[0].id,
      name: obj[0].name,
      email: obj[0].email
    }

    res.redirect('/')
  })
}

function loginView(req, res) {
  res.render('login')
}

// Middleware untuk memeriksa apakah pengguna sudah login atau belum
function checkAuth(req, res, next) {
  if (req.session.isLogin) {
    // Jika pengguna sudah login, lanjutkan ke route berikutnya
    next()
  } else {
    // Jika pengguna belum login, redirect ke halaman login
    req.flash('danger', 'You must be logged in to access this page.')
    res.redirect('/login')
  }
}

// Ketika tombol logout diklik
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err)
    }
    res.redirect('/')
  })
})

function dayDifference(start, end) {
  const timeDiff = end.getTime() - start.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

function chooseDuration(days) {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  if (years > 0) {
    return { duration: years, unit: "tahun" };
  } else if (months > 0) {
    return { duration: months, unit: "bulan" };
  } else {
    return { duration: remainingDays, unit: "hari" };
  }
}

app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});

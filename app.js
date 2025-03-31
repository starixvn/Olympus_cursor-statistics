const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const { getStatistics } = require('./services/cursor-statistics')
const expressCache = require('cache-express')
const app = express()
const port = process.env.PORT || 5000

// Set EJS as templating engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Set up express-ejs-layouts
app.use(expressLayouts)
app.set('layout', 'layout')
app.set('layout extractMetas', true)

// Set default layout variables
app.locals.style = ''
app.locals.script = ''
app.locals.meta = ''
app.locals.body = ''

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.get('/', expressCache({ timeOut: 300000 }), async (req, res) => {
  try {
    const statistics = await getStatistics()
    res.render('index', {
      title: 'Home',
      statistics: statistics,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.render('index', {
      title: 'Home',
      error: 'Failed to fetch Cursor statistics',
    })
  }
})

// Health check route
app.get('/healthcheck', (req, res) => {
  res.send('ok')
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

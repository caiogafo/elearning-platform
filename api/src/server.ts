import app from './app'

const PORT = process.env.PORT ?? 3333

app.listen(PORT, () => {
  console.log(`🚀 EduFlow API running on http://localhost:${PORT}`)
})

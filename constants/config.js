const corsOptions = {
  origin: ['https://chat-box-beryl.vercel.app', process.env.CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}

const TOKEN = 'token'

export { corsOptions, TOKEN }

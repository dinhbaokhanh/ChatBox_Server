const corsOptions = {
  origin: [process.env.CLIENT_URL, 'https://chat-box-beryl.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}

const TOKEN = 'token'

export { corsOptions, TOKEN }

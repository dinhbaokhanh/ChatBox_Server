const corsOptions = {
  origin: [process.env.CLIENT_URL, 'https://chatbox-server-l5wn.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}

const TOKEN = 'token'

export { corsOptions, TOKEN }

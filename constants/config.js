const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chatbox-server-l5wn.onrender.com',
    process.env.CLIENT_URL,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}

const TOKEN = 'token'

export { corsOptions, TOKEN }

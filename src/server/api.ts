import express from 'express'
import axios from 'axios'

const router = express.Router()

router.get('/lookup/:licensePlate', async (req, res) => {
  try {
    const { licensePlate } = req.params
    const response = await axios.get(`https://www.tjekbil.dk/api/v3/dmr/regnrnew/${licensePlate}?sl=true`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.tjekbil.dk/nummerplade/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the data' })
  }
})

export const apiRouter = router
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { licensePlate } = params;
		const response = await axios.get(`https://www.tjekbil.dk/api/v3/dmr/regnrnew/${licensePlate}?sl=true`, {
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.9',
				'Referer': 'https://www.tjekbil.dk/nummerplade/',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		});
		return json(response.data);
	} catch (err) {
		console.error(err);
		throw error(500, 'An error occurred while fetching the data');
	}
};
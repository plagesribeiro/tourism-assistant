import type { LocationInfo } from '../stores/location';
import {
	addFilteredPlaces,
	clearFilteredPlaces,
	type FilteredResponse
} from '../stores/places';
import type { SearchParams } from '../stores/searchParams';

export async function getLocationInfo(
	location: google.maps.LatLng
): Promise<LocationInfo> {
	const data = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat()},${location.lng()}&key=${
			import.meta.env.VITE_GOOGLE_MAPS_API_KEY
		}`
	);

	const response = await data.json();

	if (response.error_message) {
		console.error('ERROR: ', response.error_message);
	}

	const addressComponents = response.results[0].address_components;
	const country = addressComponents.find((c: any) =>
		c.types.includes('country')
	);
	const city = addressComponents.find((c: any) =>
		c.types.includes('administrative_area_level_2')
	);
	const address = addressComponents.find((c: any) =>
		c.types.includes('route')
	);
	const number = addressComponents.find((c: any) =>
		c.types.includes('street_number')
	);
	const postalCode = addressComponents.find((c: any) =>
		c.types.includes('postal_code')
	);
	const state = addressComponents.find((c: any) =>
		c.types.includes('administrative_area_level_1')
	);

	return {
		country: country.long_name,
		city: city.long_name,
		address: address.long_name,
		number: number.long_name,
		postalCode: postalCode.long_name,
		state: state.long_name,
		lat: location.lat(),
		lng: location.lng()
	};
}

export async function getPlaceInfo(placeId: string): Promise<any> {
	const data = await fetch(
		`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${
			import.meta.env.VITE_GOOGLE_MAPS_API_KEY
		}`
	);

	const response = await data.json();

	if (response.error_message) {
		console.error('ERROR: ', response.error_message);
	}

	return response.result;
}

export async function getPredictions(
	input: string,
	location: google.maps.LatLng | null = null
): Promise<any[]> {
	const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
	if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
		console.error('API Key não encontrada!');
		return [];
	}

	let data: any = {};
	let response;
	const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${
		import.meta.env.VITE_GOOGLE_MAPS_API_KEY
	}&sessiontoken=${Math.random()}`;
	const locationParam =
		location?.lat() && location.lng()
			? `&location=${location.lat()},${location.lng()}&radius=10000`
			: '';

	try {
		response = await fetch(proxyUrl + url + locationParam);
		data = await response.json();

		if (data.error_message) {
			console.error('ERROR: ', data.error_message);
			return [];
		}

		if (data.predictions) {
			return data.predictions as any[];
		} else {
			return [];
		}
	} catch (error) {
		console.error('Erro na requisição:', error);
		return [];
	}
}

export async function getLatLngFromPlaceId(placeId: string): Promise<any> {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${
		import.meta.env.VITE_GOOGLE_MAPS_API_KEY
	}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.status === 'OK') {
			const location = data.results[0].geometry.location;
			return location; // { lat: ..., lng: ... }
		} else {
			console.error('Erro na Geocodificação:', data.status);
			return null;
		}
	} catch (error) {
		console.error('Erro na requisição:', error);
		return null;
	}
}

export async function searchPlaces(
	searchParams: SearchParams | undefined,
	lat: number,
	lng: number
): Promise<void> {
	clearFilteredPlaces();
	if (!searchParams) {
		return;
	}
	const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

	try {
		const results: any[] = [];
		let next_page_token = undefined;

		for (let i = 0; i < 4; i++) {
			const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json
						?${
							next_page_token
								? `pagetoken=${next_page_token}`
								: `location=${lat},${lng}
									&radius=10000
									&rankby=prominence
									&keyword=${searchParams.search_maps}
									${searchParams.open_now ? '&opennow=true' : ''}
									${searchParams.max_price ? `&maxprice=${searchParams.max_price}` : ''}`
						}
						&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

			const response = await fetch(proxyUrl + url);
			const data = await response.json();

			if (data.status !== 'OK') {
				console.error('Erro na Geocodificação:', data.status);
				i = 3;
			} else {
				results.push(...data.results);
				if (!data?.next_page_token) {
					i = 3;
					next_page_token = undefined;
				}
				next_page_token = data.next_page_token;
			}
		}

		await filterAndCleanPlaces(
			searchParams,
			results.map((place: any) => place.place_id),
			lat,
			lng
		);
	} catch (error) {
		console.error('Exrro na requisição:', error);
		return;
	}
}

export async function filterAndCleanPlaces(
	searchParams: SearchParams | undefined,
	placesId: string[],
	lat: number,
	lng: number
): Promise<void> {
	const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

	try {
		let filteredResults: FilteredResponse[] = [];
		const placesIdChunks = [];
		const chunkSize = 20;
		const maxTimeInSeconds = (searchParams?.max_time_in_minutes ?? 15) * 60;
		for (let i = 0; i < placesId.length; i += chunkSize) {
			placesIdChunks.push(placesId.slice(i, i + chunkSize));
		}
		for (const chunk of placesIdChunks) {
			const url = `https://maps.googleapis.com/maps/api/distancematrix/json
						?origins=${lat},${lng}
						&destinations=place_id:${chunk.join('|place_id:')}
						&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
			const response = await fetch(proxyUrl + url);
			const data = await response.json();
			if (data.status === 'OK') {
				await data.rows[0].elements.forEach(
					async (element: any, index: any) => {
						if (element.duration.value <= maxTimeInSeconds) {
							const obj = await getPlaceInfo(chunk[index]);
							console.log(obj);
							addFilteredPlaces([
								{
									time_text: element.duration.text,
									time_value: element.duration.value,
									distance_text: element.distance.text,
									distance_value: element.distance.value,
									name: obj.name,
									photos: obj.photos,
									place_id: obj.place_id,
									rating: obj.rating,
									user_ratings_total: obj.user_ratings_total,
									icon: obj.icon,
									reviews: obj.reviews,
									url: obj.url
								} as FilteredResponse
							]);
						}
					}
				);
			}
		}
	} catch (error) {
		console.error('Erro na requisição:', error);
		return;
	}
}

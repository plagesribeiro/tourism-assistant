import type { LocationInfo } from '../stores/location';

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
			? `&location=${location.lat()},${location.lng()}&radius=20000`
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

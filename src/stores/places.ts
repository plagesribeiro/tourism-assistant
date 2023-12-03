import { writable } from 'svelte/store';

export type FilteredResponse = {
	time_text: string;
	time_value: number;
	distance_text: string;
	distance_value: number;
	name: string;
	photos: any[];
	place_id: string;
	rating: number;
	user_ratings_total: number;
	icon: string;
	reviews: any[];
	url: string;
};

export const filteredPlaces = writable<FilteredResponse[]>([]);

export const addFilteredPlaces = (places: FilteredResponse[]) => {
	filteredPlaces.update((current) => [...current, ...places]);
};

export const clearFilteredPlaces = () => {
	filteredPlaces.set([]);
};

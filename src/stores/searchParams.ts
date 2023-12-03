import { writable } from 'svelte/store';

type SearchParams = {
	search_maps: string;
	max_price: number;
	route_options: string[];
	max_time_in_minutes: number;
	description: string;
};

export const searchParams = writable<SearchParams | undefined>(undefined);

export const setSearchParams = (params: SearchParams) => {
	searchParams.set(params);
};

export const resetSearchParams = () => {
	searchParams.set(undefined);
};

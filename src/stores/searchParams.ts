import { writable } from 'svelte/store';

export type SearchParams = {
	search_maps: string;
	max_price?: number;
	max_time_in_minutes?: number;
	description: string;
	open_now?: boolean;
};

export const searchParams = writable<SearchParams | undefined>(undefined);

export const setSearchParams = (params: SearchParams) => {
	searchParams.set(params);
};

export const resetSearchParams = () => {
	searchParams.set(undefined);
};

import { writable } from 'svelte/store';

export type LocationInfo = {
	country: string;
	city: string;
	address: string;
	number: string;
	postalCode: string;
	state: string;
	lat: number;
	lng: number;
};

export const startLocation = writable<LocationInfo | undefined>(undefined);

<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getLatLngFromPlaceId,
		getLocationInfo,
		getPredictions
	} from '../services/maps';
	import { startLocation } from '../stores/location';

	let map: google.maps.Map;
	let currentMarker: google.maps.Marker | null = null;
	let location: google.maps.LatLng | null = null;

	onMount(async () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					const location = new google.maps.LatLng(latitude, longitude);
					const response = await getLocationInfo(location);
					initMap(latitude, longitude);

					startLocation.set(response);
				},
				() => {
					console.error('Não foi possível obter a sua localização.');
				}
			);
		} else {
			console.error('Geolocalização não é suportada neste navegador.');
		}
	});

	function initMap(lat: number, lng: number): void {
		const mapElement = document.getElementById('map');
		if (!mapElement) {
			console.error('Elemento do mapa não encontrado!');
			return;
		}
		const location = new google.maps.LatLng(lat, lng);
		map = new google.maps.Map(mapElement, {
			center: location,
			zoom: 15
		});

		currentMarker = new google.maps.Marker({
			position: location,
			map: map
		});

		map.addListener('click', (e: any) => {
			updateLocation(e.latLng);
		});
	}

	async function updateLocation(location: google.maps.LatLng | undefined) {
		if (!location) {
			console.error('Erro: Local não encontrado.');
			return;
		}
		if (currentMarker) {
			currentMarker.setPosition(location);
		} else {
			currentMarker = new google.maps.Marker({
				position: location,
				map: map
			});
		}
		map.panTo(location);

		startLocation.set(await getLocationInfo(location));
	}

	let searchInput = '';
	let dropdownOptions: any[] = [];

	let searchTimeout: any = null;

	async function searchLocation() {
		if (searchInput.length <= 2) {
			dropdownOptions = [];
			return;
		}

		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			const location =
				$startLocation?.lat && $startLocation?.lng
					? new google.maps.LatLng($startLocation.lat, $startLocation.lng)
					: null;
			dropdownOptions = await getPredictions(searchInput, location);
		}, 500);
	}

	async function selectLocation(option: any) {
		const placeId = option.place_id;
		const resp = await getLatLngFromPlaceId(placeId);

		const location = new google.maps.LatLng(resp.lat, resp.lng);
		updateLocation(location);

		searchInput = '';
		dropdownOptions = [];
	}
</script>

<div class="flex flex-col w-full p-4 h-full">
	<div class="search-container h-fit w-full">
		<input
			type="text"
			class="input input-bordered w-full"
			bind:value={searchInput}
			placeholder="Pesquisar endereço..."
			on:keydown={searchLocation}
		/>

		{#if dropdownOptions.length > 0}
			<div class="dropdown dropdown-open w-full">
				<ul
					class="absolute dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full"
				>
					{#each dropdownOptions as option}
						<button
							class="p-2 hover:bg-base-200 rounded-box cursor-pointer w-full text-start"
							on:click={async () => await selectLocation(option)}
						>
							{option.description}
						</button>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<div class="w-full h-full my-4" id="map" />
</div>

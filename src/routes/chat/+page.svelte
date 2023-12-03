<script lang="ts">
	import { onMount } from 'svelte';

	let map: google.maps.Map;

	onMount(() => {
		const mapElement = document.getElementById('map');

		if (!mapElement) {
			console.error('Elemento do mapa não encontrado!');
			return;
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					initMap(latitude, longitude, mapElement);
				},
				() => {
					console.error('Não foi possível obter a sua localização.');
				}
			);
		} else {
			console.error('Geolocalização não é suportada neste navegador.');
		}
	});

	function initMap(lat: number, lng: number, mapElement: HTMLElement): void {
		const location = new google.maps.LatLng(lat, lng);
		map = new google.maps.Map(mapElement, {
			center: location,
			zoom: 8
		});
		new google.maps.Marker({
			position: location,
			map: map
		});
	}
</script>

<svelte:head>
	<script
		src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAQCicyfslJ818oTe0nX6ZSQnRFGBzc9uI"
	></script>
</svelte:head>

<div id="map" style="height: 400px;"></div>

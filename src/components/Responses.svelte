<script lang="ts">
	import { onMount } from 'svelte';
	import { searchParams } from '../stores/searchParams';
	import { searchPlaces } from '../services/maps';
	import { startLocation } from '../stores/location';
	import { filteredPlaces } from '../stores/places';
	import Fa from 'svelte-fa';
	import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

	let loading = false;
	onMount(async () => {
		loading = true;
		// searchParams.set({
		// 	search_maps: 'restaurante japonês temático',
		// 	description:
		// 		'Quero ir em um restaurante japonês bem temático e parecido com o Japão. Estou disposto a pagar até 4 em uma escala de 1 a 5 e que fique a até 35 minutos daqui de carro ou a pé',
		// 	max_time_in_minutes: 40,
		// 	open_now: true
		// });

		// startLocation.set({
		// 	lat: -19.9189055034198,
		// 	lng: -43.97726217291283,
		// 	address:
		// 		'Rua dos Inconfidentes, 911 - Savassi, Belo Horizonte - MG, 30140-120, Brasil',
		// 	city: 'Belo Horizonte',
		// 	state: 'MG',
		// 	country: 'Brasil',
		// 	number: '911',
		// 	postalCode: '30140-120'
		// });

		await searchPlaces(
			$searchParams,
			$startLocation?.lat ?? 0,
			$startLocation?.lng ?? 0
		);

		loading = false;
	});
</script>

<div class="w-full h-full flex items-center justify-center">
	{#if loading}
		<span class="loading loading-dots loading-lg"></span>
	{:else if $filteredPlaces.length === 0}
		<div role="alert" class="alert alert-warning">
			<Fa icon={faCircleExclamation} />
			<span
				>Infelizmente não econtrei sugestões, tente novamente talvez sendo
				um pouco menos exigente com tempo e preço</span
			>
		</div>
	{:else}
		<div class=" flex flex-wrap items-center justify-center gap-4 w-full">
			{#each $filteredPlaces as place}
				<div class="card shadow-lg compact bg-base-100">
					<a class="card-body" href={place.url} target="_blank">
						<h2 class="card-title">{place.name}</h2>
						<img src={place.icon} class="w-8 h-8" alt={place.name} />
						<p class="card-subtitle">Nota:{' '}{place.rating}</p>
						<p class="card-subtitle">
							Qtd. Avaliações:{' '}{place.user_ratings_total}
						</p>
						<p class="card-subtitle">Tempo:{' '}{place.time_text}m</p>
						<p class="card-subtitle">
							Distância:{' '}{place.distance_text}m
						</p>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import { searchParams } from '../stores/searchParams';
</script>

<div class="w-full h-full flex items-center justify-center">
	AQUI VAO ESTAR AS SUAS INDICAÇÕES
	<br />
	OS PARAMETROS A SEREM PESQUISADOS SÃO:
	<br />
	{$searchParams?.search_maps}
	<br />
	{$searchParams?.description}
	<br />
	{$searchParams?.max_price}
	<br />
	{$searchParams?.max_time_in_minutes}
	<br />
	{$searchParams?.route_options}
</div>

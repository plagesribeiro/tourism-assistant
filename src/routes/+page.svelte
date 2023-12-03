<script lang="ts">
	import '../app.css';
	import SelectLocation from '../components/SelectLocation.svelte';
	import Header from '../components/Header.svelte';
	import { currentStep, steps } from '../stores/steps';
	import ChatComponent from '../components/ChatComponent.svelte';
	import Responses from '../components/Responses.svelte';
</script>

<svelte:head>
	<script
		src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAQCicyfslJ818oTe0nX6ZSQnRFGBzc9uI"
	></script>
</svelte:head>

<div class="flex flex-col h-full w-full">
	<!-- Lado Esquerdo: Chat -->
	<!-- <ChatComponent {messages} /> -->
	<Header />
	{#if $steps[$currentStep].id === 'select_start_location'}
		<SelectLocation />
	{/if}

	{#if $steps[$currentStep].id === 'chat_with_bot'}
		<ChatComponent />
	{/if}

	{#if $steps[$currentStep].id === 'get_responses'}
		<Responses />
	{/if}

	<!-- Lado Direito: Mapa -->
	<!-- MAPA -->
	<!--  -->
</div>

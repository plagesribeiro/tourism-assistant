<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faArrowLeft,
		faArrowRight
	} from '@fortawesome/free-solid-svg-icons';
	import { currentStep, nextStep, previousStep, steps } from '../stores/steps';
	import { startLocation } from '../stores/location';
</script>

<div
	class="w-full h-fit flex p-4 justify-center gap-4 items-center bg-base-200"
>
	<button
		class={`btn btn-primary ${$currentStep !== 0 ? '' : 'hidden'}`}
		on:click={previousStep}
	>
		<Fa icon={faArrowLeft} size={'1.5x'} />
	</button>
	<p class="font-semibold text-lg">
		{$steps[$currentStep].description}
	</p>
	<button
		class={`btn btn-primary ${
			$currentStep !== $steps.length - 1 ? '' : 'hidden'
		}
		${
			$startLocation === null ||
			$startLocation === undefined ||
			typeof $startLocation.lat !== 'number' ||
			typeof $startLocation.lng !== 'number'
				? 'btn-disabled'
				: ''
		}
		${$steps[$currentStep].id === 'chat_with_bot' ? 'hidden' : ''}
		`}
		on:click={nextStep}
	>
		<Fa icon={faArrowRight} size={'1.5x'} />
	</button>
</div>

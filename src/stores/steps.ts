import { derived, writable } from 'svelte/store';

export type Steps = {
	id: string;
	description: string;
}[];

export const steps = writable<Steps>([
	{
		id: 'select_start_location',
		description: 'Selecione o ponto de partida'
	},
	{
		id: 'chat_with_bot',
		description: 'Converse com o bot'
	},
	{
		id: 'get_responses',
		description: 'Veja as respostas'
	}
]);

export const currentStep = writable(0);

export const nextStep = () => {
	currentStep.update((n) => n + 1);
};

export const previousStep = () => {
	currentStep.update((n) => n - 1);
};

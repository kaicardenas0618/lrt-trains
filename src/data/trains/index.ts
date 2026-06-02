import type { TrainTypeConfig } from '../../types/trains';

const cityTrainModules = import.meta.glob('./cities/*.json', {
	eager: true,
	import: 'default',
}) as Record<string, TrainTypeConfig[]>;

export const trains = Object.values(cityTrainModules).flat();
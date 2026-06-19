/**
 * LRT Trains for Subway Builder
 * Entry point for the mod.
 */

import { trains } from './data/trains';

const MOD_ID = 'lrt-trains';
const MOD_VERSION = 'v1.1.1';
const TAG = '[LRT Trains]';

const api = window.SubwayBuilderAPI;

if (!api) {
  console.error(`${TAG} SubwayBuilderAPI not found.`);
} else {
  console.log(`${TAG} v${MOD_VERSION} | API v${api.version}`);

  let initialized = false;

  api.hooks.onMapReady(() => {
    if (initialized) return;
    initialized = true;

    try {
      let registeredCount = 0;

      for (const train of trains) {
        api.trains.registerTrainType(train);
        registeredCount++;

        console.log(`${TAG} Registered train: ${train.id}`);
      }

      api.ui.showNotification(
        `${TAG} ${registeredCount} train(s) loaded.`,
        'success'
      );

      console.log(`${TAG} Initialized successfully.`);
    } catch (err) {
      console.error(`${TAG} Failed to initialize:`, err);

      api.ui.showNotification(
        `${MOD_ID} failed to load. Check console for details.`,
        'error'
      );
    }
  });
}

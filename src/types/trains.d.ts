/** Subway Builder Modding API v1.4.0 */

import type { ElevationType } from './core';

// =============================================================================
// TRAIN TYPE STATS
// =============================================================================

/**
 * Elevation types supported by the train-cost API.
 *
 * `TRENCHED` and `RAMP` were added in the v1.4.0 elevation model. They are
 * included here even if an older `./core` declaration has not been updated yet.
 */
export type TrainElevationType =
  | ElevationType
  | 'DEEP_BORE'
  | 'STANDARD_TUNNEL'
  | 'CUT_AND_COVER'
  | 'TRENCHED'
  | 'AT_GRADE'
  | 'RAMP'
  | 'ELEVATED';

/** Road classes used by automatic grade crossings. */
export type GradeCrossingRoadClass = 'highway' | 'major' | 'medium' | 'minor';

/**
 * Combined-direction trains-per-hour caps for grade crossings by road class.
 *
 * A `null` value forbids crossings of that road class.
 */
export interface GradeCrossingTphLimit {
  highway: number | null;
  major: number | null;
  medium: number | null;
  minor: number | null;
}

/** Visual appearance settings for a train type. */
export interface TrainTypeAppearance {
  /** Hex color for the train, e.g. "#FF0000" */
  color: string;
}

/** Performance and cost statistics for a train type. */
export interface TrainTypeStats {
  /** Maximum acceleration rate (m/s^2) */
  maxAcceleration: number;
  /** Maximum deceleration rate (m/s^2) */
  maxDeceleration: number;
  /** Maximum speed (m/s) */
  maxSpeed: number;
  /** Maximum speed when approaching a local station (m/s) */
  maxSpeedLocalStation: number;
  /** Passenger capacity per car */
  capacityPerCar: number;
  /** Length of each car (meters) */
  carLength: number;
  /** Minimum number of cars per train */
  minCars: number;
  /** Maximum number of cars per train */
  maxCars: number;
  /** Number of cars in a car set (purchase unit) */
  carsPerCarSet: number;
  /** Cost per car */
  carCost: number;
  /** Width of the train (meters) */
  trainWidth: number;
  /** Minimum station platform length */
  minStationLength: number;
  /** Maximum station platform length */
  maxStationLength: number;
  /** Base cost per track segment */
  baseTrackCost: number;
  /** Base cost per station */
  baseStationCost: number;
  /** Hourly operational cost per train */
  trainOperationalCostPerHour: number;
  /** Hourly operational cost per car */
  carOperationalCostPerHour: number;

  /**
   * Maximum trains-per-hour ceiling for any route using this train type.
   *
   * Routes that traverse a grade crossing may be capped lower based on the
   * crossing's occupancy window.
   */
  tphLimit: number;

  /**
   * Flat speed cap (m/s) applied to tracks of type `scissors-crossover`.
   *
   * This is used instead of deriving speed from the polyline curve radius.
   */
  crossoverSpeed: number;

  /** Cost for a scissors crossover. Kept for compatibility with existing train definitions. */
  scissorsCrossoverCost: number;
  /** Clearance required around the track/train. */
  trackClearance: number;
  /** Maximum lateral acceleration (m/s^2) used for curve speed calculations. */
  maxLateralAcceleration: number;
  /** Minimum horizontal turn radius (meters). */
  minTurnRadius: number;
  /** Minimum horizontal turn radius inside stations (meters). */
  minStationTurnRadius: number;
  /** Maximum slope/grade percentage. */
  maxSlopePercentage: number;
  /** Spacing between parallel tracks (meters). */
  parallelTrackSpacing: number;
  /** Station dwell/stop time (seconds). */
  stopTimeSeconds: number;
  /** Yearly or scaled maintenance cost per meter of track, depending on game economy. */
  trackMaintenanceCostPerMeter?: number;
  /** Yearly or scaled maintenance cost per station, depending on game economy. */
  stationMaintenanceCostPerYear?: number;
}

// =============================================================================
// TRAIN TYPE CONFIGURATION
// =============================================================================

/**
 * Configuration for a custom train type, used with
 * `window.SubwayBuilderAPI.trains.registerTrainType()`.
 *
 * Elevation multipliers affect construction costs at different depths/heights:
 * - DEEP_BORE: < -24m
 * - STANDARD_TUNNEL: -24m to -10m
 * - CUT_AND_COVER: -10m to -5m
 * - TRENCHED: -5m to -1m
 * - AT_GRADE: -1m to 0m
 * - RAMP: 1m to 4m
 * - ELEVATED: >= 5m
 *
 * Boundary values belong to the structural type. For example, `elev <= -5`
 * is `CUT_AND_COVER`, and `elev >= 5` is `ELEVATED`.
 */
export interface TrainTypeConfig {
  /** Unique identifier for this train type */
  id: string;
  /** Display name */
  name: string;
  /** Description of this train type */
  description: string;
  /** Performance and cost statistics */
  stats: TrainTypeStats;
  /** Track types this train can run on, e.g. ["heavy-metro"] */
  compatibleTrackTypes: string[];
  /** Visual appearance settings */
  appearance: TrainTypeAppearance;

  /** Cost multipliers for each elevation type */
  elevationMultipliers?: Partial<Record<TrainElevationType, number>>;

  /**
   * If true, tracks for this type can cross roads at grade via auto-spawned gates.
   *
   * For the full v1.4.0 grade-crossing model, pair this with
   * `gradeCrossingBaseCost`, `gradeCrossingMaintenancePerYear`, and
   * `gradeCrossingTphLimit`.
   */
  allowGradeCrossing?: boolean;

  /** Alias for `allowGradeCrossing`. */
  canCrossRoads?: boolean;

  /**
   * Base build cost per grade crossing.
   *
   * Multiplied internally by road class, lane count, and an oblique-angle factor.
   */
  gradeCrossingBaseCost?: number;

  /**
   * Real-world yearly maintenance per built grade crossing.
   *
   * The game scales this internally by its time/economy multiplier.
   */
  gradeCrossingMaintenancePerYear?: number;

  /**
   * Combined-direction TPH ceiling on every grade crossing this train type uses,
   * broken out by road class.
   *
   * A `null` entry forbids crossings of that road class.
   */
  gradeCrossingTphLimit?: GradeCrossingTphLimit;

  /**
   * Base surcharge per portal, charged at underground structural transitions.
   *
   * Portals fire at open <-> `CUT_AND_COVER` (-5m) and
   * `CUT_AND_COVER` <-> `STANDARD_TUNNEL` (-10m). Omit or set to `0` to
   * disable the surcharge.
   */
  portalCost?: number;

  /**
   * Base surcharge per ramp, charged when crossing into `ELEVATED`.
   *
   * Omit or set to `0` to disable the surcharge.
   */
  rampCost?: number;

  /** Manufacturer metadata. Prefer `manufacturer`; `Manufacturer` is kept for legacy files. */
  manufacturer?: string[];
  /** Legacy/custom manufacturer metadata casing. */
  Manufacturer?: string[];
}

/**
 * Partial update payload for `modifyTrainType()`.
 *
 * `stats` and `appearance` are partial so callers can patch only the fields
 * they want to change.
 */
export type TrainTypeUpdate = Partial<
  Omit<TrainTypeConfig, 'stats' | 'appearance'>
> & {
  stats?: Partial<TrainTypeStats>;
  appearance?: Partial<TrainTypeAppearance>;
};

/** Trains API surface exposed by Subway Builder. */
export interface TrainsAPI {
  /** Register a new custom train type. */
  registerTrainType(config: TrainTypeConfig): void;
  /** Modify an existing built-in or custom train type. */
  modifyTrainType(id: string, update: TrainTypeUpdate): void;
  /** Get all registered train types by id. */
  getTrainTypes(): Record<string, TrainTypeConfig>;
  /** Get a specific train type by id. */
  getTrainType(id: string): TrainTypeConfig | undefined;
}

/** Alias for TrainTypeConfig. */
export type TrainType = TrainTypeConfig;

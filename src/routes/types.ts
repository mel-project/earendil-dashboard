// a mapping from strings to numbers with constraints to allow iteration
export type Debts = [string, number][];

export type RelayGraph = [string[], [string, string][]];

export type TimeSeries = [number, number][];

export type TimeSeriesMap = { [key: string]: TimeSeries };

export type Bandwidths = { [key: string]: [number, number] };

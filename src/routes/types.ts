export type GraphInfo = {
	myFingerprint: string;
	relays: string[];
	adjacencies: [string, string][];
	neighbors: string[];
};

export type Debts = { [key: string]: number };

export interface TimeSeriesPoint {
	date: Date;
	value: number;
}

export enum Direction {
	Up,
	Down
}

export interface TimeSeries {
	series: TimeSeriesPoint[];
	direction: Direction;
}

export type ErrorState = string | null;

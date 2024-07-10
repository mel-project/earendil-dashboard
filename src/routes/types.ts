export type Debts = [string, number][];

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

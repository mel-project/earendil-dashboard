export type Debts = [string, number][];

export type RelayGraph = [string[], [string, string][]];

export type TimeSeries = [number, number][];

export type TimeSeriesMap = { [key: string]: TimeSeries };

export type Bandwidths = { [key: string]: [number, number] };

type JrpcId = number | string;

interface JrpcRequest {
	jsonrpc: string;
	method: string;
	params: any[];
	id: JrpcId;
}

interface JrpcResponse {
	jsonrpc: string;
	result?: any;
	error?: JrpcError;
	id: JrpcId;
}

interface JrpcError {
	code: number;
	message: string;
	data?: any;
}

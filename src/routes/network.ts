import { Direction } from '../routes/types';

const EARENDIL_CONTROL = 'http://dashboard.earendil.network/rpc-testing';

// sends rpc requests to an Earendil node server where `method` is the control protocol
export async function rpcRequest(method, params = []) {
	const response = await fetch(EARENDIL_CONTROL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method,
			params,
			id: Date.now()
		})
	});

	console.log(response);

	if (!response.ok) {
		throw new Error(`HTTP error: status ${response.status}`);
	}

	const result = await response.json();

	console.log(result);

	if (result.error) {
		throw new Error(result.error.message || 'RPC call failed');
	}

	return result.result;
}

export async function fetchDebts(): Promise<Debts> {
	const debts = await rpcRequest('debts');
	console.log('debts:', debts);
	return debts;
}

export async function fetchTimeseriesStats(
	neighbor: string,
	start: number,
	end: number,
	direction: Direction
): Promise<TimeSeries> {
	neighbor = '14154070117b3c1a71fa2fc6bc7d20e5afc93fbe98a13b86b013d0a91215f74f';
	start = 0;
	end = 2820637023988;
	direction = Direction.Down;

	const key = direction === Direction.Down ? neighbor + '|down' : neighbor + '|up';
	const stats = await rpcRequest('timeseries_stats', [key, start, end]);
	const series: TimeSeriesPoint[] = stats.map(([timestamp, value]) => ({
		date: new Date(timestamp),
		value: value
	}));

	return {
		series,
		direction
	};
}

export async function fetchNeighbors() {
	const mockNeighbors = ['alicia', 'roberto', 'carlos', 'david'];

	await new Promise((resolve) => setTimeout(resolve, 50));

	return mockNeighbors;
}

export async function fetchRelayGraphviz(): Promise<string> {
	const relay_graph = await rpcRequest('relay_graphviz');
	return relay_graph;
}

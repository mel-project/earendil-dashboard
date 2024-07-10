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
	const mockDebts: Debts = [
		['alicia', 100.5],
		['roberto', 200.75],
		['carlos', -150.25],
		['david', 300.0]
	];

	await new Promise((resolve) => setTimeout(resolve, 50));

	return mockDebts;
}

export async function fetchTimeseriesStats(
	neighbor: string,
	start: number,
	end: number,
	direction: Direction
): Promise<TimeSeries> {
	console.log(neighbor, direction);
	// neighbor = '14154070117b3c1a71fa2fc6bc7d20e5afc93fbe98a13b86b013d0a91215f74f';
	// start = 0;
	// end = 2820637023988;
	// direction = Direction.Down;

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

// export async function fetchTimeseriesStats(
// 	key: string,
// 	start: number,
// 	end: number,
// 	direction: Direction
// ): Promise<TimeSeries> {
// 	const mockTimeSeries: Record<string, [number, number][]> = {
// 		'4b7a641b77c2d6ceb8b3fecec2b2978dfe81ae045ed9a25ed78b828009c4967a': [
// 			[1612323200000, 500],
// 			[1221209600000, 800],
// 			[1621294321000, 700]
// 		],
// 		roberto: [
// 			[124123200000, 300],
// 			[1621209600000, 400],
// 			[1346296000000, 600]
// 		],
// 		carlos: [
// 			[1621178700000, 500],
// 			[1621209870000, 800],
// 			[13451296000000, 700]
// 		],
// 		david: [
// 			[1444123200000, 300],
// 			[1621275600000, 400],
// 			[1621296346000, 600]
// 		]
// 	};

// 	await new Promise((resolve) => setTimeout(resolve, 50));

// 	const series: TimeSeriesPoint[] = mockTimeSeries[key].map(([timestamp, value]) => ({
// 		date: new Date(timestamp),
// 		value: value
// 	}));

// 	return {
// 		series: series,
// 		direction: direction
// 	};
// }

export async function fetchNeighbors() {
	const mockNeighbors = ['alicia', 'roberto', 'carlos', 'david'];

	await new Promise((resolve) => setTimeout(resolve, 50));

	return mockNeighbors;
}

export async function fetchRelayGraphviz(): Promise<string> {
	const relay_graph = await rpcRequest('relay_graphviz');
	return relay_graph;
}

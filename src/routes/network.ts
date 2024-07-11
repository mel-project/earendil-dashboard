import { Direction } from '../routes/types';
import { arrayToHexString } from './utils';

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

	if (!response.ok) {
		throw new Error(`HTTP error: status ${response.status}`);
	}

	const result = await response.json();

	console.log(method, params, result);

	if (result.error) {
		throw new Error(result.error.message || 'RPC call failed');
	}

	return result.result;
}

export async function fetchDebts(): Promise<Debts> {
	const debts = await rpcRequest('get_debt_summary');
	return debts;
}

export async function fetchTimeseriesStats(
	neighbor: string,
	start: number,
	end: number,
	direction: Direction
): Promise<TimeSeries> {
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

export async function fetchRelayGraphInfo(): GraphInfo {
	const info = await rpcRequest('relay_graph_info');
	const myFingerprint = arrayToHexString(info.my_fingerprint);
	const relays = info.relays.map(arrayToHexString);
	const adjacencies = info.adjacencies.map((pair) => pair.map(arrayToHexString));
	const neighbors = info.neighbors.map(arrayToHexString);

	return {
		myFingerprint,
		relays,
		adjacencies,
		neighbors
	};
}

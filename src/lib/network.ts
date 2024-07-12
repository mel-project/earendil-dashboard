import { Direction } from './types';
import { arrayToHex } from './utils';

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
	const myFingerprint = arrayToHex(info.my_fingerprint);
	const relays = info.relays.map(arrayToHex);
	const adjacencies = info.adjacencies.map((pair) => pair.map(arrayToHex));
	const neighbors = info.neighbors.map(arrayToHex);

	return {
		myFingerprint,
		relays,
		adjacencies,
		neighbors
	};
}

<script lang="ts">
	import { onMount } from 'svelte';
	import { type Node, Network, type Data, type Edge } from 'vis-network';
	import type { Bandwidths, Debts, RelayGraph, TimeSeries, TimeSeriesMap } from './types';
	import { rpcRequest } from './utils';

	let neighbors: string[] = [];
	let debts: Debts = [];
	let bandwidthStats = {} as Bandwidths;
	let network = null;

	async function fetchDebts(): Promise<Debts> {
		// const response = await fetch('/api/debts');
		// debts = await response.json();

		const mockDebts: Debts = [
			['alicia', 100.5],
			['roberto', 200.75],
			['carlos', -150.25],
			['david', 300.0]
		];

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return mockDebts;
	}

	async function fetchTimeseriesStats(
		key: string,
		start: number,
		end: number
	): Promise<TimeSeries> {
		const mockTimeSeries: TimeSeriesMap = {
			alicia: [
				[1621123200000, 500],
				[1621209600000, 800],
				[1621296000000, 700]
			],
			roberto: [
				[1621123200000, 300],
				[1621209600000, 400],
				[1621296000000, 600]
			],
			carlos: [
				[1621123200000, 500],
				[1621209600000, 800],
				[1621296000000, 700]
			],
			david: [
				[1621123200000, 300],
				[1621209600000, 400],
				[1621296000000, 600]
			]
		};

		// await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockTimeSeries[key];
	}

	async function fetchNeighbors() {
		const mockNeighbors = ['alicia', 'roberto', 'carlos', 'david'];

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return mockNeighbors;
	}

	async function fetchRelayGraph(): Promise<RelayGraph> {
		// const relayGraph: RelayGraph = [['abc', '123'], [['abc', '123']]];

		// await new Promise((resolve) => setTimeout(resolve, 1000));

		// return relayGraph;
		const relay_graph: RelayGraph = await rpcRequest('relay_graph');

		return relay_graph;
	}

	function toData(relayGraph: RelayGraph): Data {
		const [relays, adjacencies] = relayGraph;
		const nodes: Node[] = relays.map((id) => ({ id }));
		const edges: Edge[] = adjacencies.map(([from, to]) => ({ from, to }));
		const data: Data = {
			nodes,
			edges
		};

		return data;
	}

	async function createNetwork() {
		const container = document.getElementById('network')!;
		let options = {
			autoResize: true,
			height: '100%',
			width: '100%',
			locale: 'en'
			// locales: locales,
			// clickToUse: false,
			// configure: {...},    // defined in the configure module.
			// edges: {...},        // defined in the edges module.
			// nodes: {...},        // defined in the nodes module.
			// groups: {...},       // defined in the groups module.
			// layout: {...},       // defined in the layout module.
			// interaction: {...},  // defined in the interaction module.
			// manipulation: {...}, // defined in the manipulation module.
			// physics: {...},      // defined in the physics module.
		};
		const relayGraph = await fetchRelayGraph();
		let network = new Network(container, toData(relayGraph), options);

		network.on('click', (params) => {
			if (params.nodes.length === 1) {
				const nodeId = params.nodes[0];
				const node = neighbors.find((neighbor) => neighbor === nodeId);
				// Display modal with node information
				console.log('Clicked node:', node);
			}
		});
	}

	function calculateBandwidth(timeSeries: TimeSeries): number {
		if (timeSeries.length < 2) {
			return 0; // return 0 if there are fewer than 2 data points
		}

		let oldestTime = Infinity;
		let newestTime = -Infinity;
		let totalBytes = 0;

		for (const [timestamp, bytes] of timeSeries) {
			oldestTime = Math.min(oldestTime, timestamp);
			newestTime = Math.max(newestTime, timestamp);
			totalBytes += bytes;
		}

		const timeDiff = (newestTime - oldestTime) / 1000; // convert milliseconds to seconds
		const bandwidth = totalBytes / timeDiff;

		return bandwidth;
	}

	onMount(async () => {
		neighbors = await fetchNeighbors();
		debts = await fetchDebts();
		network = await createNetwork();

		for (const neigh of neighbors) {
			const start = 1;
			const end = 2;
			const timeSeriesUp = await fetchTimeseriesStats(neigh, start, end);
			const timeSeriesDown = await fetchTimeseriesStats(neigh, start, end);
			const bandwidthUp = calculateBandwidth(timeSeriesUp);
			const bandwidthDown = calculateBandwidth(timeSeriesDown);
			bandwidthStats[neigh] = [bandwidthUp, bandwidthDown];
		}
	});
</script>

<div class="container">
	<div class="section debts">
		<h2>Debts</h2>
		<ul>
			{#each debts as [neighbor, amount]}
				<li>
					<div class="card">
						<h3>{neighbor}</h3>
						<p>{amount} micromel</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<div class="section relay-graph">
		<h2>Relay Graph</h2>
		<div id="network"></div>
	</div>

	<div class="section bandwidth">
		<h2>Bandwidth</h2>
		<ul>
			{#each neighbors as neigh}
				<li>
					<div class="card">
						<h3>{neigh}</h3>
						<p>Bandwidth up: {bandwidthStats[neigh]?.[0] ?? 'Loading...'} bytes/second</p>
						<p>Bandwidth down: {bandwidthStats[neigh]?.[1] ?? 'Loading...'} bytes/second</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.container {
		display: flex;
	}

	.section {
		flex: 1;
		padding: 1rem;
	}

	.card {
		background-color: #f0f0f0;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	ul {
		list-style-type: none;
	}
</style>

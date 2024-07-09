<script lang="ts">
	import { onMount } from 'svelte';
	import { type Node, Network, type Data, type Edge } from 'vis-network';
	import type { Bandwidth, Debts, RelayGraph } from './types';

	let debts: Debts = [];
	let bandwidthStats: Bandwidth = [];
	let neighbors: string[] = [];
	let network = null;

	async function fetchDebts(): Promise<Debts> {
		// const response = await fetch('/api/debts');
		//   debts = await response.json();

		const mockDebts: Debts = [
			['node0', 100.5],
			['node1', 200.75],
			['node2', 150.25],
			['node3', 300.0]
		];

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return mockDebts;
	}

	async function fetchTimeseriesStats(key: string, start: number, end: number): Promise<Bandwidth> {
		const mockStats: Bandwidth = [
			[17, 38],
			[1, 2],
			[24, 96]
		];

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return mockStats;
	}

	async function fetchNeighbors() {
		const response = await fetch('/api/get_neighbors');
		neighbors = await response.json();
	}

	async function fetchRelayGraph(): Promise<RelayGraph> {
		const relayGraph: RelayGraph = [['abc', '123'], [['abc', '123']]];

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return relayGraph;
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

	onMount(async () => {
		network = await createNetwork();
		debts = await fetchDebts();
		// bandwidthStats = await fetchTimeseriesStats();
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
			{#each bandwidthStats as stat}
				<li>
					<div class="card">
						<h3>{stat[0]}</h3>
						<p>Bandwidth: {stat[1]}</p>
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
</style>

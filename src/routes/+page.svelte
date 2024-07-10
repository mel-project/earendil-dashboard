<script lang="ts">
	import { onMount } from 'svelte';
	import { Direction, type Debts } from './types';
	import { parseGraphviz } from './utils';
	import { fetchDebts, fetchRelayGraphviz, fetchTimeseriesStats } from './network';
	import VisGraph from '$lib/VisGraph.svelte';
	import TimeSeries from '$lib/TimeSeries.svelte';

	let graphHeight = 600;
	let graphWidth = 1000;

	let myId = '';
	let myNeighbors: string[] = [];
	let myDebts: Debts = [];
	let nodes: string[] = [];
	let edges: [string, string][] = [];

	onMount(async () => {
		const relayGraph = await fetchRelayGraphviz();
		const { longId, relays, adjacencies, neighbors } = parseGraphviz(relayGraph);

		myId = longId;
		nodes = relays;
		edges = adjacencies;
		myNeighbors = neighbors;
		myDebts = await fetchDebts();
	});
</script>

<div class="container">
	<section class="section debts">
		<h2>Debts</h2>
		<ul>
			{#each myDebts as [neighbor, amount]}
				<li>
					<article class="card">
						<h3>{neighbor}</h3>
						<p>{amount} micromel</p>
					</article>
				</li>
			{/each}
		</ul>
	</section>

	<section class="section relay-graph">
		<h2>Relay Graph</h2>
		{#if edges && edges.length > 0}
			<VisGraph {nodes} {edges} height={graphHeight} width={graphWidth} />
		{:else}
			"Loading..."
		{/if}
	</section>

	<section class="section bandwidth">
		<h2>Bandwidth</h2>
		<ul>
			{#each myNeighbors as neighbor}
				<li>
					<TimeSeries {neighbor} direction={Direction.Down} />
					<TimeSeries {neighbor} direction={Direction.Up} />
				</li>
			{/each}
		</ul>
	</section>
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

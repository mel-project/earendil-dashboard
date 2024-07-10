<script lang="ts">
	import { onMount } from 'svelte';
	import type { BandwidthMap, Debts, TimeSeries, TimeSeriesMap } from './types';
	import { parseGraphviz } from './utils';
	import { fetchDebts, fetchRelayGraphviz, fetchTimeseriesStats } from './network';
	import Graph from '$lib/Graph.svelte';

	// height and width of relay graph
	let height = 600;
	let width = 1000;

	let myId = '';
	let myNeighbors: string[] = [];
	let myDebts: Debts = [];
	let bandwidthStats = {} as BandwidthMap;
	let nodes: string[] = [];
	let edges: [string, string][] = [];

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
		const relayGraph = await fetchRelayGraphviz();
		const { longId, relays, adjacencies, neighbors } = parseGraphviz(relayGraph);

		myId = longId;
		nodes = relays;
		edges = adjacencies;
		myNeighbors = neighbors;
		myDebts = await fetchDebts();

		for (const neigh of myNeighbors) {
			const start = Date.now();
			const end = start - 15000; // 15-second interval
			const timeSeriesUp = await fetchTimeseriesStats(neigh, start, end);
			const timeSeriesDown = await fetchTimeseriesStats(neigh, start, end);

			const bandwidthUp = calculateBandwidth(timeSeriesUp);
			const bandwidthDown = calculateBandwidth(timeSeriesDown);
			bandwidthStats[neigh] = [bandwidthUp, bandwidthDown];
		}
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
			<Graph {nodes} {edges} {height} {width} />
		{:else}
			"Loading..."
		{/if}
	</section>

	<section class="section bandwidth">
		<h2>Bandwidth</h2>
		<ul>
			{#each myNeighbors as neighbor}
				<li>
					<article class="card">
						<h3>{neighbor ?? 'Loading...'}</h3>
						{#if !bandwidthStats[neighbor]}
							<p>Loading...</p>
						{:else}
							<p>Up: {bandwidthStats[neighbor][0]} bytes/second</p>
							<p>Down: {bandwidthStats[neighbor][1]} bytes/second</p>
						{/if}
					</article>
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

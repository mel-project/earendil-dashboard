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

<div class="container-fluid">
	<div class="row">
		<!-- <div class="col-md-3">
			<section class="mt-4">
				<h2>Debts</h2>
				<ul class="list-unstyled">
					{#each myDebts as [neighbor, amount]}
						<li class="mb-3">
							<div class="card">
								<div class="card-body">
									<h5 class="card-title">{neighbor}</h5>
									<p class="card-text">{amount} micromel</p>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<div class="col-md-6">
			<section class="mt-4">
				<h2>Relay Graph</h2>
				<div class="card">
					<div class="card-body">
						{#if edges && edges.length > 0}
							<VisGraph {nodes} {edges} height={graphHeight} width={graphWidth} />
						{:else}
							<p class="text-center">Loading...</p>
						{/if}
					</div>
				</div>
			</section>
		</div> -->

		<div class="col">
			<section class="mt-4">
				<h2>Bandwidth</h2>
				{#each myNeighbors as neighbor}
					<div class="mb-3">
						<div class="card">
							<div class="card-body">
								<TimeSeries
									{neighbor}
									direction={Direction.Down}
									title="Timeseries down"
									unit="bytes/second"
								/>
							</div>
						</div>
					</div>
					<div class="mb-3">
						<div class="card">
							<div class="card-body">
								<TimeSeries
									{neighbor}
									direction={Direction.Up}
									title="Timeseries up"
									unit="bytes/second"
								/>
							</div>
						</div>
					</div>
				{/each}
			</section>
		</div>
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

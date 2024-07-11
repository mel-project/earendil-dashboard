<script lang="ts">
	import { onMount } from 'svelte';
	import { Direction, type Debts } from './types';
	import { fetchDebts, fetchRelayGraphInfo } from './network';
	import VisGraph from '$lib/VisGraph.svelte';
	import TimeSeries from '$lib/TimeSeries.svelte';

	let myId = '';
	let myNeighbors: string[] = [];
	let myDebts: Debts = {};
	let nodes: string[] = [];
	let edges: [string, string][] = [];

	onMount(async () => {
		const { myFingerprint, relays, adjacencies, neighbors } = await fetchRelayGraphInfo();

		myId = myFingerprint;
		nodes = relays;
		edges = adjacencies;
		myNeighbors = neighbors;
		myDebts = await fetchDebts();
	});
</script>

<div class="container-fluid">
	<div class="row">
		<section class="col-md-2">
			<h2>Debts</h2>
			<ul class="list-unstyled">
				{#each Object.entries(myDebts) as [neighbor, amount]}
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

		<section class="col-md-6">
			<h2>Relay Graph</h2>
			<div class="card">
				<div class="card-body">
					{#if edges && edges.length > 0}
						<VisGraph {nodes} {edges} />
					{:else}
						<p class="text-center">Loading...</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="col-md-4">
			<h2>Bandwidth</h2>
			{#each myNeighbors as neighbor}
				<div class="mb-3">
					<div class="card">
						<div class="card-body">
							<TimeSeries
								{neighbor}
								direction={Direction.Down}
								title="Bandwith Down"
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
								title="Bandwidth Up"
								unit="bytes/second"
							/>
						</div>
					</div>
				</div>
			{/each}
		</section>
	</div>
</div>

<style>
	.card {
		background-color: #f0f0f0;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	ul {
		list-style-type: none;
	}
</style>

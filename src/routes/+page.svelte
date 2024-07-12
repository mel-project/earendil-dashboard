<script lang="ts">
	import { onMount } from 'svelte';
	import { Direction, type Debts } from '../lib/types';
	import { fetchDebts, fetchRelayGraphInfo } from '../lib/network';
	import VisGraph from '$lib/VisGraph.svelte';
	import TimeSeries from '$lib/TimeSeries.svelte';

	let myId = '';
	let myNeighbors: string[] = [];
	let myDebts: Debts = {};
	let nodes: string[] = [];
	let edges: [string, string][] = [];
	let isLoading = true;

	onMount(async () => {
		try {
			const { myFingerprint, relays, adjacencies, neighbors } = await fetchRelayGraphInfo();

			myId = myFingerprint;
			nodes = relays;
			edges = adjacencies;
			myNeighbors = neighbors;
			myDebts = await fetchDebts();
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			isLoading = false;
		}
	});
</script>

{#if isLoading}
	<p>Loading...</p>
{:else}
	<div class="container-fluid">
		<div class="row">
			{#if Object.keys(myDebts).length > 0}
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
			{/if}

			{#if edges.length > 0 && nodes.length > 0}
				<section class="col-md-6">
					<h2>Relay Graph</h2>
					<div class="card">
						<div class="card-body">
							<VisGraph {nodes} {edges} />
						</div>
					</div>
				</section>
			{/if}

			{#if myId}
				<section class="col-md-4">
					<h2>Bandwidth</h2>
					<div class="mb-3">
						<div class="card">
							<div class="card-body">
								<TimeSeries
									node={myId}
									direction={Direction.Down}
									title="Bandwidth Down"
									unit="bytes/second"
								/>
							</div>
						</div>
					</div>
					<div class="mb-3">
						<div class="card">
							<div class="card-body">
								<TimeSeries
									node={myId}
									direction={Direction.Up}
									title="Bandwidth Up"
									unit="bytes/second"
								/>
							</div>
						</div>
					</div>

					{#each myNeighbors as neighbor}
						<div class="mb-3">
							<div class="card">
								<div class="card-body">
									<TimeSeries
										node={neighbor}
										direction={Direction.Down}
										title="Bandwidth Down"
										unit="bytes/second"
									/>
								</div>
							</div>
						</div>
						<div class="mb-3">
							<div class="card">
								<div class="card-body">
									<TimeSeries
										node={neighbor}
										direction={Direction.Up}
										title="Bandwidth Up"
										unit="bytes/second"
									/>
								</div>
							</div>
						</div>
					{/each}
				</section>
			{/if}
		</div>
	</div>
{/if}

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

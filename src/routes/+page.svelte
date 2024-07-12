<script lang="ts">
	import { onMount } from 'svelte';
	import { Direction, type Debts } from '../lib/types';
	import { fetchDebts, fetchRelayGraphInfo } from '../lib/network';
	import VisGraph from '$lib/VisGraph.svelte';
	import Bandwidth from '$lib/Bandwidth.svelte';
	import Debt from '$lib/Debts.svelte';

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
			<!-- Debts -->
			<section class="col-md-2">
				<h2>Debts</h2>
				<Debt debts={myDebts} />
			</section>

			<!-- Relay Graph -->
			{#if edges.length > 0 && nodes.length > 0}
				<section class="col-md-6">
					<h2>Relay Graph</h2>
					<div class="card">
						<div class="card-body">
							<VisGraph mainNode={myId} {nodes} {edges} />
						</div>
					</div>
				</section>
			{/if}

			<!-- Bandwidth -->
			{#if myId}
				<section class="col-md-4">
					<h2>Bandwidth</h2>

					<Bandwidth
						node={myId}
						direction={Direction.Down}
						title="Bandwidth Down"
						unit="bytes/second"
					/>

					<Bandwidth
						node={myId}
						direction={Direction.Up}
						title="Bandwidth Up"
						unit="bytes/second"
					/>

					{#each myNeighbors as neighbor}
						<Bandwidth
							node={neighbor}
							direction={Direction.Down}
							title="Bandwidth Down"
							unit="bytes/second"
						/>
						<Bandwidth
							node={neighbor}
							direction={Direction.Up}
							title="Bandwidth Up"
							unit="bytes/second"
						/>
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
</style>

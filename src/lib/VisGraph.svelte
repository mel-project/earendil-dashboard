<script lang="ts">
	import { onMount } from 'svelte';
	import { Network } from 'vis-network';
	import 'vis-network/styles/vis-network.css';

	export let nodes: string[] = [];
	export let edges: [string, string][] = [];

	let container: HTMLElement;

	onMount(() => {
		const visNodes = nodes.map((node, index) => ({
			id: index,
			label: node
		}));

		const visEdges = edges.map(([from, to]) => ({
			from: nodes.indexOf(from),
			to: nodes.indexOf(to)
		}));

		const data = {
			nodes: visNodes,
			edges: visEdges
		};

		const options = {
			nodes: {
				shape: 'dot',
				size: 30
			},
			edges: {
				length: 200
			},
			physics: {
				enabled: true,
				solver: 'forceAtlas2Based'
			}
		};

		new Network(container, data, options);
	});
</script>

<div bind:this={container} style="width: 100%; height: 75rem;"></div>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
	}

	div {
		border: 1px solid #ccc;
		box-sizing: border-box;
	}
</style>

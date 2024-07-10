<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let nodes: string[];
	export let edges: [string, string][] = [];
	export let linkDistance: number = 200;
	export let height: number = 600;
	export let width: number = 1000;

	interface Node extends d3.SimulationNodeDatum {
		id: string;
	}

	interface Link extends d3.SimulationLinkDatum<Node> {
		source: string | Node;
		target: string | Node;
	}

	let svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

	$: d3Nodes = nodes.map((id) => ({ id }));
	$: d3Links = edges.map((edge) => ({
		source: edge[0],
		target: edge[1]
	}));

	onMount(() => {
		svg = d3.select('#network-graph');
		updateGraph();
	});

	$: if (svg) {
		updateGraph();
	}

	function updateGraph() {
		svg.selectAll('*').remove();

		const simulation = d3
			.forceSimulation<Node>(d3Nodes)
			.force(
				'link',
				d3
					.forceLink<Node, Link>(d3Links)
					.id((d) => d.id)
					.distance(linkDistance)
			)
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2));

		const link = svg
			.append('g')
			.attr('class', 'links')
			.selectAll<SVGLineElement, Link>('line')
			.data(d3Links)
			.enter()
			.append('line')
			.attr('stroke', '#999')
			.attr('stroke-opacity', 0.6);

		const node = svg
			.append('g')
			.attr('class', 'nodes')
			.selectAll<SVGCircleElement, Node>('circle')
			.data(d3Nodes)
			.enter()
			.append('circle')
			.attr('r', 20)
			.attr('fill', '#69b3a2')
			.call(
				d3
					.drag<SVGCircleElement, Node>()
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended)
			);

		node.append('title').text((d) => d.id);

		simulation.nodes(d3Nodes).on('tick', ticked);

		simulation.force<d3.ForceLink<Node, Link>>('link')!.links(d3Links);

		function ticked() {
			link
				.attr('x1', (d) => (d.source as unknown as Node as any).x)
				.attr('y1', (d) => (d.source as unknown as Node as any).y)
				.attr('x2', (d) => (d.target as unknown as Node as any).x)
				.attr('y2', (d) => (d.target as unknown as Node as any).y);

			node.attr('cx', (d) => (d as any).x).attr('cy', (d) => (d as any).y);
		}

		function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			(d as any).fx = (d as any).x;
			(d as any).fy = (d as any).y;
		}

		function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
			(d as any).fx = event.x;
			(d as any).fy = event.y;
		}

		function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
			if (!event.active) simulation.alphaTarget(0);
			(d as any).fx = null;
			(d as any).fy = null;
		}
	}
</script>

<svg id="network-graph" {width} {height}></svg>

<style>
	svg {
		border: 2px solid #807148;
	}
</style>

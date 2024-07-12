<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import uPlot, { type Options, type AlignedData } from 'uplot';
	import { Direction, type ErrorState, type TimeSeries, type TimeSeriesPoint } from '$lib/types';
	import { fetchTimeseriesStats } from '$lib/network';
	import { shortId } from './utils';

	export let node: string = '';
	export let direction: Direction;
	export let title = '';
	export let unit = '';
	export let label = 'Value';
	export let stroke = 'black';
	export let fill = 'rgba(0, 0, 0, 0.1)';
	export let stepped = false;

	let isLoading: Writable<boolean> = writable(true);
	let error: Writable<ErrorState> = writable(null);
	let chart: uPlot | null = null;
	let container: HTMLElement;

	const formatData = (timeSeries: TimeSeries): AlignedData => {
		return [
			timeSeries.series.map((point) => point.date.getTime() / 1000.0),
			timeSeries.series.map((point) => (isNaN(point.value) ? 0.0 : point.value))
		];
	};

	function getSize() {
		let { width, height } = container.getBoundingClientRect();
		return {
			width: width,
			height: height
		};
	}

	onMount(async () => {
		try {
			isLoading.set(true);
			error.set(null);

			const start = 0;
			const end = Date.now();
			const timeSeries = await fetchTimeseriesStats(node, start, end, direction);

			if (timeSeries.series.length < 2) {
				throw new Error('Insufficient data points');
			}

			let data: AlignedData = formatData(timeSeries);
			let size = getSize();

			let maxDigits = Math.ceil(
				Math.log10(
					timeSeries.series
						.map((s: TimeSeriesPoint) => s.value)
						.reduce((a: number, b: number) => Math.max(a, b), 0.0)
				)
			);

			let opts: Options = {
				title,
				id: `${node}-${title}`,
				class: 'timeseries',
				width: size.width,
				height: size.height,
				padding: [0, 0, 0, Math.max((maxDigits - 4) * 8, 0)],
				series: [
					{},
					{
						// initial toggled state (optional)
						show: true,

						spanGaps: false,

						// in-legend display
						label: label,
						value: (self, rawValue, seriesIdx, idx) => {
							console.log(`Raw value:`, rawValue, `Series:`, seriesIdx, `Index:`, idx);
							if (rawValue === null || rawValue === undefined || idx === null) {
								return 'N/A ' + (unit ? unit : '');
							}
							return rawValue.toFixed(4) + (unit ? ' ' + unit : '');
						},

						// series style
						stroke: stroke,
						width: 1,
						fill: fill,
						dash: [10, 0],

						paths: stepped ? uPlot.paths.stepped?.({}) ?? undefined : undefined
					}
				],
				cursor: {
					drag: {
						setScale: false,
						x: true,
						y: false
					}
				},
				hooks: {
					init: [
						(u) => {
							u.over.ondblclick = (e: MouseEvent) => {
								console.log('Fetching data for full range');

								u.setData(data);
							};
						}
					],
					setScale: [
						(u: uPlot) => {
							console.log('setScale', u);
						}
					],
					setSelect: [
						async (u: any) => {
							let min = u.posToVal(u.select.left, 'x');
							let max = u.posToVal(u.select.left + u.select.width, 'x');
							isLoading.set(true);
							try {
								console.log(u.select);
								console.log('Fetching data for range...', { min, max });
								const timeSeries = await fetchTimeseriesStats(node, start, end, direction);
								u.setData(formatData(timeSeries), true);
							} finally {
								isLoading.set(false);
								u.setSelect({ width: 0, height: 0 }, false);
							}
						}
					]
				}
			};

			console.log('Data passed to uPlot:', data);
			let u = new uPlot(opts, data, container);

			window.addEventListener('resize', (e) => {
				u.setSize(getSize());
			});
		} catch (e) {
			console.error('Error fetching time series data:', e);
			if (e instanceof Error) {
				error.set(e.message);
			} else {
				error.set(String(e));
			}
		} finally {
			isLoading.set(false);
		}
	});
</script>

{#if !$error}
	<div id="container" style="minHeight: 20rem" class:loading={$isLoading} bind:this={container}>
		<h4>{shortId(node)}</h4>
		{#if $isLoading}
			<p class="message">Loading...</p>
		{/if}
	</div>
{/if}

<style>
	#container {
		margin: 1rem;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	.loading {
		opacity: 0.4;
	}

	:global(.uplot) {
		position: relative;
		border: 1px solid #eee;
	}

	:global(.u-legend) {
		position: absolute !important;
		top: -40px !important;
		right: 2px;
		border: 1px solid #ddd;
		padding: 5px;
		background-color: rgba(255, 255, 255, 0.8);
	}
</style>

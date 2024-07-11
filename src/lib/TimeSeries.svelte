<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import uPlot, { type Options, type AlignedData } from 'uplot';
	import {
		Direction,
		type ErrorState,
		type TimeSeries,
		type TimeSeriesPoint
	} from '../routes/types';
	import { fetchTimeseriesStats } from '../routes/network';

	export let neighbor: string = '';
	export let direction: Direction;
	export let title = '';
	export let unit = '';
	export let label = 'Value';
	export let height = '20rem';
	export let stroke = 'black';
	export let fill = 'rgba(0, 0, 0, 0.1)';
	export let stepped = false;

	// Create the stores with proper typing
	let isLoading: Writable<boolean> = writable(true);
	let error: Writable<ErrorState> = writable(null);
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

			const start = Date.now();
			const end = start - 3_600_000; // 1-hour interval
			const timeSeries = await fetchTimeseriesStats(neighbor, start, end, direction);

			if (timeSeries.series.length < 2) {
				throw new Error('Insufficient data points');
			}

			let data: AlignedData = formatData(timeSeries);
			console.log('Formatted data:', data);
			let size = getSize();
			console.log('*** SIZE ***', size, container);

			let maxDigits = Math.ceil(
				Math.log10(
					timeSeries.series
						.map((s: TimeSeriesPoint) => s.value)
						.reduce((a: number, b: number) => Math.max(a, b), 0.0)
				)
			);

			let opts: Options = {
				title,
				id: neighbor + '-' + title,
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
								return 'N/A' + (unit ? ' ' + unit : '');
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
								const timeSeries = await fetchTimeseriesStats(neighbor, start, end, direction);
								u.setData(formatData(timeSeries), true);
								console.log('Fetched');
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

<div id="container" style="height: {height}" class:loading={$isLoading} bind:this={container}>
	<!-- <h4>{neighbor}</h4>
	{#if $isLoading}
		<p class="message">Loading...</p>
	{:else if $error}
		<p class="message">{$error}</p>
	{/if} -->
</div>

<style>
	#container {
		border: 1px solid #ccc;
		padding: 10px;
		border-radius: 5px;
	}

	h4 {
		border-bottom: 2px solid #333;
		padding-bottom: 5px;
	}

	.message {
		padding: 5px;
		margin-top: 10px;
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
		top: 10px !important;
		left: 15%;
		border: 1px solid #ddd;
		padding: 5px;
		background-color: rgba(255, 255, 255, 0.8);
	}
</style>

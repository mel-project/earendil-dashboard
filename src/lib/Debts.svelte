<script lang="ts">
	import type { Debts } from './types';
	import { shortId } from './utils';

	export let debts: Debts = {};

	let totalDebt = 0;

	$: {
		totalDebt = Object.values(debts).reduce((sum, debt) => sum + debt, 0);
	}

	function formatAmount(microMEL: number): string {
		const MEL = microMEL / 1_000_000; // Convert microMEL to MEL
		return (
			new Intl.NumberFormat('en-US', {
				style: 'decimal',
				minimumFractionDigits: 6,
				maximumFractionDigits: 6
			}).format(MEL) + ' MEL'
		);
	}
</script>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Debtor</th>
				<th class="text-end">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(debts) as [debtor, amount]}
				<tr>
					<td>{shortId(debtor)}</td>
					<td class="text-end">{formatAmount(amount)}</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr class="table-info">
				<th>Total</th>
				<th class="text-end">{formatAmount(totalDebt)}</th>
			</tr>
		</tfoot>
	</table>
</div>

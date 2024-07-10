// Relay graphviz parsing helper functions:
export function parseGraphviz(graphviz: string): {
	longId: string;
	relays: string[];
	adjacencies: [string, string][];
	neighbors: string[];
} {
	const lines = graphviz.split('\n');
	const shortId = parseShortId(lines);
	let relays = parseRelays(lines);
	const adjacencies = parseAdjacencies(lines);
	const neighbors = parseNeighbors(lines, shortId);
	const longId = '31cbce9d7613a2e927df71df8f9d01b66bcf5a2b7c22614d2766d6a2cab1cd44';

	// add ourselves to relays
	relays.push(longId);

	return { longId, relays, adjacencies, neighbors };
}

function parseShortId(lines: string[]): string {
	const myIdLine = lines.find((line) => line.includes('[relay]'));
	if (!myIdLine) return '';
	return myIdLine.match(/"([^"]+)"/)?.[1].split('\\n')[0] ?? '';
}

function parseRelays(lines: string[]): string[] {
	return lines
		.filter((line) => line.includes('label='))
		.map((line) => {
			const match = line.match(/"([^"]+)"\s+\[label=/);
			return match ? match[1] : null;
		})
		.filter((relay): relay is string => relay !== null);
}

function parseAdjacencies(lines: string[]): [string, string][] {
	return lines
		.filter((line) => line.includes(' -- '))
		.filter((line) => !line.includes('..'))
		.map((line) => {
			const matches = line.match(/"[^"]+"/g);
			if (matches && matches.length >= 2) {
				const from = matches[0].replace(/"/g, '');
				const to = matches[1].replace(/"/g, '');
				return [from, to] as [string, string];
			}
			return null;
		})
		.filter((adjacency): adjacency is [string, string] => adjacency !== null);
}

function parseNeighbors(lines: string[], shortId: string): string[] {
	const neighbors: string[] = [];
	let myConnectionsSection = false;

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (trimmedLine === '# all my connections') {
			myConnectionsSection = true;
			continue;
		}

		if (myConnectionsSection) {
			if (trimmedLine.startsWith('"') && trimmedLine.includes('--')) {
				const parts = trimmedLine.split('--').map((part) => part.trim().replace(/"/g, ''));
				const neighbor = parts.find((part) => !part.includes('..') && part !== shortId);

				if (neighbor) {
					neighbors.push(neighbor.replace(';', ''));
				}
			} else if (trimmedLine === '}') {
				// End of the graph definition
				break;
			}
		}
	}

	return neighbors;
}

function findLongId(neighbors: string[], shortId: string): string {
	return neighbors.find((neighbor) => neighbor.startsWith(shortId.slice(0, 4))) || '';
}

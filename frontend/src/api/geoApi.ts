import { getRequest } from './api';

export interface GeoApiNode {
	id: number;
	name: string;
	type: 'country' | 'federal_district' | 'region' | 'city';
	count?: number;
	children?: GeoApiNode[];
}

let geoDataCache: GeoApiNode[] | null = null;
let geoDataRequest: Promise<GeoApiNode[]> | null = null;

export async function getGeoData(): Promise<GeoApiNode[]> {
	if (geoDataCache) {
		return geoDataCache;
	}

	if (geoDataRequest) {
		return geoDataRequest;
	}

	geoDataRequest = (async () => {
		const response = await getRequest<GeoApiNode[]>('/geo');

		if (response.status >= 200 && response.status < 300 && Array.isArray(response.data)) {
			geoDataCache = response.data;
			return response.data;
		}

		throw new Error(response.message ?? `Failed to load geo data (status ${response.status})`);
	})();

	try {
		return await geoDataRequest;
	} finally {
		geoDataRequest = null;
	}
}

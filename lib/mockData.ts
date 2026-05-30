export interface HexFeatureProperties {
  hexId: string;
  regionName: string;
  province: string;
  soilSaturation: number;
  currentRainfall: number;
  slopeAngle: number;
  overallRiskScore: number;
  population: number;
  lastUpdated: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  hexId: string;
  region: string;
}

// Generate a proper hexagonal polygon in geographic coordinates
// Uses cos(lat) correction so hexagons appear regular on a Mercator map
function makeHex(lat: number, lng: number, size: number): number[][] {
  const pts: number[][] = [];
  const cosLat = Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const dLat = size * Math.sin(angle);
    const dLng = (size * Math.cos(angle)) / cosLat;
    pts.push([lng + dLng, lat + dLat]);
  }
  pts.push(pts[0]); // close the ring
  return pts;
}

function hex(
  id: string,
  lat: number,
  lng: number,
  size: number,
  props: Omit<HexFeatureProperties, 'hexId'>
) {
  return {
    type: 'Feature' as const,
    properties: { hexId: id, ...props },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [makeHex(lat, lng, size)],
    },
  };
}

// Comprehensive Indonesian hazard hexagons covering all major regions
// Size 0.8 degrees gives visible hexes at zoom 5, with overlap at zoom 7+
const H = 0.8;

const indonesianHexes = [
  // ---- SUMATRA ----
  hex('SUM01', 3.5, 98.7, H, {
    regionName: 'Medan Corridor',
    province: 'North Sumatra',
    soilSaturation: 55, currentRainfall: 11.5, slopeAngle: 7,
    overallRiskScore: 0.32, population: 489000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM02', 2.0, 99.3, H, {
    regionName: 'Tapanuli Highlands',
    province: 'North Sumatra',
    soilSaturation: 68, currentRainfall: 19.2, slopeAngle: 18,
    overallRiskScore: 0.48, population: 143000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM03', 0.5, 101.4, H, {
    regionName: 'Pekanbaru Basin',
    province: 'Riau',
    soilSaturation: 87, currentRainfall: 36.8, slopeAngle: 12,
    overallRiskScore: 0.72, population: 312000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM04', -0.5, 100.4, H, {
    regionName: 'Padang Pariaman',
    province: 'West Sumatra',
    soilSaturation: 95, currentRainfall: 52.1, slopeAngle: 40,
    overallRiskScore: 0.93, population: 87000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM05', -1.2, 100.6, H, {
    regionName: 'Solok Highlands',
    province: 'West Sumatra',
    soilSaturation: 91, currentRainfall: 46.3, slopeAngle: 38,
    overallRiskScore: 0.89, population: 54000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM06', -2.0, 102.3, H, {
    regionName: 'Kerinci Valley',
    province: 'Jambi',
    soilSaturation: 83, currentRainfall: 33.7, slopeAngle: 29,
    overallRiskScore: 0.76, population: 61000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM07', -1.5, 104.0, H, {
    regionName: 'Jambi Lowlands',
    province: 'Jambi',
    soilSaturation: 62, currentRainfall: 18.4, slopeAngle: 5,
    overallRiskScore: 0.35, population: 178000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM08', -3.0, 104.5, H, {
    regionName: 'Palembang Plain',
    province: 'South Sumatra',
    soilSaturation: 48, currentRainfall: 9.2, slopeAngle: 3,
    overallRiskScore: 0.22, population: 520000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM09', -4.0, 105.2, H, {
    regionName: 'Lampung Coast',
    province: 'Lampung',
    soilSaturation: 56, currentRainfall: 13.0, slopeAngle: 6,
    overallRiskScore: 0.29, population: 245000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM10', -5.5, 105.3, H, {
    regionName: 'Bengkulu Uplands',
    province: 'Bengkulu',
    soilSaturation: 79, currentRainfall: 28.1, slopeAngle: 22,
    overallRiskScore: 0.64, population: 92000, lastUpdated: '2026-05-28T08:00:00Z',
  }),
  hex('SUM11', -3.8, 102.8, H, {
    regionName: 'Rejang Lebong',
    province: 'Bengkulu',
    soilSaturation: 74, currentRainfall: 22.5, slopeAngle: 15,
    overallRiskScore: 0.52, population: 108000, lastUpdated: '2026-05-28T08:00:00Z',
  }),

  // ---- JAVA ----
  hex('JAV01', -6.2, 106.8, H, {
    regionName: 'Jakarta Metro',
    province: 'DKI Jakarta',
    soilSaturation: 92, currentRainfall: 41.3, slopeAngle: 2,
    overallRiskScore: 0.81, population: 3200000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV02', -6.4, 107.0, H, {
    regionName: 'Bekasi Flood Plain',
    province: 'West Java',
    soilSaturation: 89, currentRainfall: 38.6, slopeAngle: 3,
    overallRiskScore: 0.79, population: 890000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV03', -6.9, 107.6, H, {
    regionName: 'Bandung Uplands',
    province: 'West Java',
    soilSaturation: 94, currentRainfall: 48.2, slopeAngle: 32,
    overallRiskScore: 0.91, population: 124000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV04', -7.1, 107.8, H, {
    regionName: 'Garut Highlands',
    province: 'West Java',
    soilSaturation: 88, currentRainfall: 39.5, slopeAngle: 28,
    overallRiskScore: 0.85, population: 89000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV05', -6.75, 107.5, H, {
    regionName: 'Sumedang Basin',
    province: 'West Java',
    soilSaturation: 82, currentRainfall: 31.0, slopeAngle: 22,
    overallRiskScore: 0.78, population: 67000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV06', -7.2, 107.9, H, {
    regionName: 'Cianjur South',
    province: 'West Java',
    soilSaturation: 90, currentRainfall: 44.7, slopeAngle: 35,
    overallRiskScore: 0.88, population: 78000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV07', -7.35, 108.1, H, {
    regionName: 'Tasikmalaya Ridge',
    province: 'West Java',
    soilSaturation: 76, currentRainfall: 28.9, slopeAngle: 25,
    overallRiskScore: 0.65, population: 93000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV08', -6.45, 107.1, H, {
    regionName: 'Purwakarta Valley',
    province: 'West Java',
    soilSaturation: 58, currentRainfall: 14.3, slopeAngle: 5,
    overallRiskScore: 0.38, population: 155000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV09', -6.6, 107.3, H, {
    regionName: 'Subang Lowlands',
    province: 'West Java',
    soilSaturation: 71, currentRainfall: 22.1, slopeAngle: 8,
    overallRiskScore: 0.55, population: 201000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('JAV10', -7.3, 109.7, H, {
    regionName: 'Banyumas Slope',
    province: 'Central Java',
    soilSaturation: 86, currentRainfall: 37.4, slopeAngle: 27,
    overallRiskScore: 0.82, population: 71000, lastUpdated: '2026-05-28T08:03:00Z',
  }),
  hex('JAV11', -7.1, 110.4, H, {
    regionName: 'Magelang Foothills',
    province: 'Central Java',
    soilSaturation: 79, currentRainfall: 29.8, slopeAngle: 21,
    overallRiskScore: 0.68, population: 98000, lastUpdated: '2026-05-28T08:03:00Z',
  }),
  hex('JAV12', -7.55, 110.85, H, {
    regionName: 'Wonogiri Reservoir',
    province: 'Central Java',
    soilSaturation: 62, currentRainfall: 16.2, slopeAngle: 10,
    overallRiskScore: 0.44, population: 187000, lastUpdated: '2026-05-28T08:03:00Z',
  }),
  hex('JAV13', -7.0, 111.0, H, {
    regionName: 'Semarang Coastal',
    province: 'Central Java',
    soilSaturation: 88, currentRainfall: 35.2, slopeAngle: 4,
    overallRiskScore: 0.77, population: 510000, lastUpdated: '2026-05-28T08:03:00Z',
  }),
  hex('JAV14', -7.8, 110.3, H, {
    regionName: 'Wonosobo Plateau',
    province: 'Central Java',
    soilSaturation: 84, currentRainfall: 34.1, slopeAngle: 26,
    overallRiskScore: 0.80, population: 82000, lastUpdated: '2026-05-28T08:03:00Z',
  }),
  hex('JAV15', -7.6, 112.0, H, {
    regionName: 'Surabaya Delta',
    province: 'East Java',
    soilSaturation: 83, currentRainfall: 32.8, slopeAngle: 6,
    overallRiskScore: 0.73, population: 680000, lastUpdated: '2026-05-28T08:02:00Z',
  }),
  hex('JAV16', -8.0, 112.5, H, {
    regionName: 'Malang Uplands',
    province: 'East Java',
    soilSaturation: 77, currentRainfall: 26.4, slopeAngle: 19,
    overallRiskScore: 0.62, population: 340000, lastUpdated: '2026-05-28T08:02:00Z',
  }),
  hex('JAV17', -8.3, 114.0, H, {
    regionName: 'Banyuwangi Coast',
    province: 'East Java',
    soilSaturation: 45, currentRainfall: 8.1, slopeAngle: 9,
    overallRiskScore: 0.21, population: 175000, lastUpdated: '2026-05-28T08:02:00Z',
  }),

  // ---- BALI & NUSA TENGGARA ----
  hex('BAL01', -8.35, 115.1, H, {
    regionName: 'Denpasar Basin',
    province: 'Bali',
    soilSaturation: 60, currentRainfall: 15.0, slopeAngle: 8,
    overallRiskScore: 0.31, population: 290000, lastUpdated: '2026-05-28T07:55:00Z',
  }),
  hex('NTT01', -8.6, 116.1, H, {
    regionName: 'Lombok Highlands',
    province: 'West Nusa Tenggara',
    soilSaturation: 53, currentRainfall: 10.2, slopeAngle: 14,
    overallRiskScore: 0.28, population: 135000, lastUpdated: '2026-05-28T07:55:00Z',
  }),
  hex('NTT02', -9.5, 119.5, H, {
    regionName: 'Flores Central',
    province: 'East Nusa Tenggara',
    soilSaturation: 41, currentRainfall: 5.4, slopeAngle: 20,
    overallRiskScore: 0.19, population: 87000, lastUpdated: '2026-05-28T07:55:00Z',
  }),
  hex('NTT03', -10.2, 123.6, H, {
    regionName: 'Kupang Coast',
    province: 'East Nusa Tenggara',
    soilSaturation: 32, currentRainfall: 2.8, slopeAngle: 11,
    overallRiskScore: 0.14, population: 62000, lastUpdated: '2026-05-28T07:55:00Z',
  }),

  // ---- KALIMANTAN (Borneo) ----
  hex('KAL01', 1.5, 109.0, H, {
    regionName: 'Pontianak Lowlands',
    province: 'West Kalimantan',
    soilSaturation: 78, currentRainfall: 27.5, slopeAngle: 3,
    overallRiskScore: 0.58, population: 230000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL02', 0.0, 110.5, H, {
    regionName: 'Ketapang Interior',
    province: 'West Kalimantan',
    soilSaturation: 85, currentRainfall: 35.1, slopeAngle: 8,
    overallRiskScore: 0.69, population: 67000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL03', -1.0, 111.0, H, {
    regionName: 'Sukamara Basin',
    province: 'Central Kalimantan',
    soilSaturation: 81, currentRainfall: 30.8, slopeAngle: 4,
    overallRiskScore: 0.63, population: 45000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL04', -2.5, 112.5, H, {
    regionName: 'Palangka Raya',
    province: 'Central Kalimantan',
    soilSaturation: 76, currentRainfall: 24.3, slopeAngle: 2,
    overallRiskScore: 0.51, population: 185000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL05', -3.5, 114.5, H, {
    regionName: 'Banjarmasin Delta',
    province: 'South Kalimantan',
    soilSaturation: 92, currentRainfall: 42.6, slopeAngle: 5,
    overallRiskScore: 0.83, population: 420000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL06', -4.0, 115.5, H, {
    regionName: 'Kotabaru Coast',
    province: 'South Kalimantan',
    soilSaturation: 65, currentRainfall: 17.3, slopeAngle: 10,
    overallRiskScore: 0.42, population: 98000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL07', 2.5, 116.0, H, {
    regionName: 'Tarakan Flood Zone',
    province: 'North Kalimantan',
    soilSaturation: 88, currentRainfall: 38.9, slopeAngle: 6,
    overallRiskScore: 0.75, population: 112000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL08', 1.0, 116.5, H, {
    regionName: 'Berau Watershed',
    province: 'East Kalimantan',
    soilSaturation: 72, currentRainfall: 21.0, slopeAngle: 9,
    overallRiskScore: 0.47, population: 78000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL09', -1.2, 116.5, H, {
    regionName: 'Balikpapan Lowlands',
    province: 'East Kalimantan',
    soilSaturation: 69, currentRainfall: 19.5, slopeAngle: 7,
    overallRiskScore: 0.43, population: 310000, lastUpdated: '2026-05-28T07:50:00Z',
  }),
  hex('KAL10', -3.0, 117.0, H, {
    regionName: 'Kotabumi Ridge',
    province: 'East Kalimantan',
    soilSaturation: 57, currentRainfall: 12.8, slopeAngle: 14,
    overallRiskScore: 0.33, population: 95000, lastUpdated: '2026-05-28T07:50:00Z',
  }),

  // ---- SULAWESI ----
  hex('SUL01', 1.5, 124.5, H, {
    regionName: 'Gorontalo Basin',
    province: 'Gorontalo',
    soilSaturation: 71, currentRainfall: 22.8, slopeAngle: 13,
    overallRiskScore: 0.53, population: 89000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL02', 0.5, 123.5, H, {
    regionName: 'Buol Coast',
    province: 'Central Sulawesi',
    soilSaturation: 64, currentRainfall: 16.5, slopeAngle: 11,
    overallRiskScore: 0.41, population: 56000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL03', -1.4, 120.1, H, {
    regionName: 'Poso Lake Area',
    province: 'Central Sulawesi',
    soilSaturation: 80, currentRainfall: 30.5, slopeAngle: 20,
    overallRiskScore: 0.71, population: 43000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL04', -0.9, 121.5, H, {
    regionName: 'Palu Valley',
    province: 'Central Sulawesi',
    soilSaturation: 93, currentRainfall: 49.7, slopeAngle: 35,
    overallRiskScore: 0.92, population: 95000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL05', -5.1, 119.45, H, {
    regionName: 'Gowa Uplands',
    province: 'South Sulawesi',
    soilSaturation: 73, currentRainfall: 24.1, slopeAngle: 16,
    overallRiskScore: 0.58, population: 129000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL06', -5.5, 120.3, H, {
    regionName: 'Makassar Coast',
    province: 'South Sulawesi',
    soilSaturation: 67, currentRainfall: 18.6, slopeAngle: 5,
    overallRiskScore: 0.39, population: 520000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL07', -3.8, 120.0, H, {
    regionName: 'Wajo Lowlands',
    province: 'South Sulawesi',
    soilSaturation: 75, currentRainfall: 23.0, slopeAngle: 9,
    overallRiskScore: 0.55, population: 105000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL08', -4.2, 122.0, H, {
    regionName: 'Kolaka Slopes',
    province: 'Southeast Sulawesi',
    soilSaturation: 59, currentRainfall: 14.2, slopeAngle: 17,
    overallRiskScore: 0.37, population: 72000, lastUpdated: '2026-05-28T07:45:00Z',
  }),

  // ---- MALUKU ----
  hex('MAL01', -3.2, 128.2, H, {
    regionName: 'Ambon Island',
    province: 'Maluku',
    soilSaturation: 70, currentRainfall: 20.5, slopeAngle: 22,
    overallRiskScore: 0.56, population: 98000, lastUpdated: '2026-05-28T07:40:00Z',
  }),
  hex('MAL02', -7.5, 131.3, H, {
    regionName: 'Tanimbar Coast',
    province: 'Maluku',
    soilSaturation: 42, currentRainfall: 6.1, slopeAngle: 8,
    overallRiskScore: 0.18, population: 31000, lastUpdated: '2026-05-28T07:40:00Z',
  }),
  hex('MAL03', -3.5, 130.5, H, {
    regionName: 'Seram Interior',
    province: 'Maluku',
    soilSaturation: 66, currentRainfall: 17.8, slopeAngle: 25,
    overallRiskScore: 0.49, population: 41000, lastUpdated: '2026-05-28T07:40:00Z',
  }),

  // ---- PAPUA ----
  hex('PAP01', -2.5, 133.5, H, {
    regionName: 'Nabire Lowlands',
    province: 'Central Papua',
    soilSaturation: 82, currentRainfall: 33.5, slopeAngle: 10,
    overallRiskScore: 0.67, population: 58000, lastUpdated: '2026-05-28T07:35:00Z',
  }),
  hex('PAP02', -4.0, 136.0, H, {
    regionName: 'Wamena Highlands',
    province: 'Highland Papua',
    soilSaturation: 91, currentRainfall: 45.2, slopeAngle: 42,
    overallRiskScore: 0.94, population: 34000, lastUpdated: '2026-05-28T07:35:00Z',
  }),
  hex('PAP03', -3.5, 140.5, H, {
    regionName: 'Jayapura Coast',
    province: 'Papua',
    soilSaturation: 74, currentRainfall: 25.1, slopeAngle: 18,
    overallRiskScore: 0.52, population: 145000, lastUpdated: '2026-05-28T07:35:00Z',
  }),
  hex('PAP04', -6.5, 140.0, H, {
    regionName: 'Merauke Floodplain',
    province: 'South Papua',
    soilSaturation: 50, currentRainfall: 10.5, slopeAngle: 2,
    overallRiskScore: 0.25, population: 42000, lastUpdated: '2026-05-28T07:35:00Z',
  }),
  hex('PAP05', -2.0, 138.0, H, {
    regionName: 'Biak Island',
    province: 'Papua',
    soilSaturation: 61, currentRainfall: 15.8, slopeAngle: 12,
    overallRiskScore: 0.36, population: 52000, lastUpdated: '2026-05-28T07:35:00Z',
  }),

  // ---- ACEH ----
  hex('ACE01', 4.5, 97.0, H, {
    regionName: 'Banda Aceh Coast',
    province: 'Aceh',
    soilSaturation: 63, currentRainfall: 16.5, slopeAngle: 9,
    overallRiskScore: 0.40, population: 265000, lastUpdated: '2026-05-28T08:10:00Z',
  }),
  hex('ACE02', 3.5, 97.8, H, {
    regionName: 'Pidie Highlands',
    province: 'Aceh',
    soilSaturation: 78, currentRainfall: 27.3, slopeAngle: 24,
    overallRiskScore: 0.66, population: 95000, lastUpdated: '2026-05-28T08:10:00Z',
  }),
  hex('ACE03', 2.5, 96.5, H, {
    regionName: 'Singkil Swamp',
    province: 'Aceh',
    soilSaturation: 95, currentRainfall: 50.3, slopeAngle: 1,
    overallRiskScore: 0.84, population: 38000, lastUpdated: '2026-05-28T08:10:00Z',
  }),

  // ---- BANTEN & WEST JAVA EXTENSION ----
  hex('BNT01', -6.0, 106.0, H, {
    regionName: 'Serang Lowlands',
    province: 'Banten',
    soilSaturation: 72, currentRainfall: 20.5, slopeAngle: 4,
    overallRiskScore: 0.53, population: 320000, lastUpdated: '2026-05-28T08:05:00Z',
  }),
  hex('BNT02', -6.8, 105.8, H, {
    regionName: 'Lebak Uplands',
    province: 'Banten',
    soilSaturation: 85, currentRainfall: 34.2, slopeAngle: 30,
    overallRiskScore: 0.82, population: 64000, lastUpdated: '2026-05-28T08:05:00Z',
  }),

  // ---- DI YOGYAKARTA ----
  hex('YOG01', -7.8, 110.4, H, {
    regionName: 'Merapi Slopes',
    province: 'DI Yogyakarta',
    soilSaturation: 90, currentRainfall: 42.5, slopeAngle: 35,
    overallRiskScore: 0.87, population: 186000, lastUpdated: '2026-05-28T08:03:00Z',
  }),

  // ---- RIAU ISLANDS ----
  hex('RIU01', 1.0, 104.0, H, {
    regionName: 'Batam Island',
    province: 'Riau Islands',
    soilSaturation: 42, currentRainfall: 7.8, slopeAngle: 4,
    overallRiskScore: 0.17, population: 245000, lastUpdated: '2026-05-28T08:00:00Z',
  }),

  // ---- BANGKA BELITUNG ----
  hex('BBT01', -2.7, 107.0, H, {
    regionName: 'Pangkal Pinang',
    province: 'Bangka Belitung Islands',
    soilSaturation: 48, currentRainfall: 9.5, slopeAngle: 5,
    overallRiskScore: 0.23, population: 135000, lastUpdated: '2026-05-28T08:00:00Z',
  }),

  // ---- WEST KALIMANTAN BORDER ----
  hex('KAL11', 0.5, 108.0, H, {
    regionName: 'Sambas Border',
    province: 'West Kalimantan',
    soilSaturation: 73, currentRainfall: 21.5, slopeAngle: 10,
    overallRiskScore: 0.46, population: 82000, lastUpdated: '2026-05-28T07:50:00Z',
  }),

  // ---- NORTH SULAWESI ----
  hex('SUL09', 1.5, 125.0, H, {
    regionName: 'Manado Volcanic Zone',
    province: 'North Sulawesi',
    soilSaturation: 87, currentRainfall: 38.2, slopeAngle: 33,
    overallRiskScore: 0.86, population: 175000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
  hex('SUL10', 0.3, 127.5, H, {
    regionName: 'Talaud Islands',
    province: 'North Sulawesi',
    soilSaturation: 38, currentRainfall: 5.8, slopeAngle: 15,
    overallRiskScore: 0.16, population: 28000, lastUpdated: '2026-05-28T07:45:00Z',
  }),
];

export const mockGeoJSON = {
  type: 'FeatureCollection' as const,
  features: indonesianHexes,
};

export const mockAlerts: AlertItem[] = [
  {
    id: 'ALT001',
    timestamp: '08:04 AM',
    message: 'Automated Warning dispatched to BPBD West Java for Hexagon #JAV03 — Bandung Uplands',
    severity: 'critical',
    hexId: 'JAV03',
    region: 'Bandung Uplands',
  },
  {
    id: 'ALT002',
    timestamp: '08:01 AM',
    message: 'BMKG Rainfall threshold exceeded — Padang Pariaman Hex #SUM04',
    severity: 'critical',
    hexId: 'SUM04',
    region: 'Padang Pariaman',
  },
  {
    id: 'ALT003',
    timestamp: '07:57 AM',
    message: 'Landslide probability model update: Cianjur South risk elevated to 88%',
    severity: 'critical',
    hexId: 'JAV06',
    region: 'Cianjur South',
  },
  {
    id: 'ALT004',
    timestamp: '07:52 AM',
    message: 'Palu Valley seismic activity spike — landslide risk critical at 92%',
    severity: 'critical',
    hexId: 'SUL04',
    region: 'Palu Valley',
  },
  {
    id: 'ALT005',
    timestamp: '07:48 AM',
    message: 'Evacuation advisory issued for 34,000 residents — Wamena Highlands',
    severity: 'critical',
    hexId: 'PAP02',
    region: 'Wamena Highlands',
  },
  {
    id: 'ALT006',
    timestamp: '07:40 AM',
    message: 'Sentinel-1 SAR pass confirmed increased soil moisture — Banyumas Slope',
    severity: 'high',
    hexId: 'JAV10',
    region: 'Banyumas Slope',
  },
  {
    id: 'ALT007',
    timestamp: '07:35 AM',
    message: 'Jakarta Metro flood drainage at 92% capacity — monitor rising',
    severity: 'high',
    hexId: 'JAV01',
    region: 'Jakarta Metro',
  },
  {
    id: 'ALT008',
    timestamp: '07:30 AM',
    message: 'Singkil Swamp flood stage exceeded — Aceh monitoring activated',
    severity: 'high',
    hexId: 'ACE03',
    region: 'Singkil Swamp',
  },
  {
    id: 'ALT009',
    timestamp: '07:22 AM',
    message: 'Merapi lahar probability rising — DI Yogyakarta alert level raised',
    severity: 'high',
    hexId: 'YOG01',
    region: 'Merapi Slopes',
  },
  {
    id: 'ALT010',
    timestamp: '07:15 AM',
    message: 'JMA Himawari cloud cluster approaching West Sumatra coast — monitoring',
    severity: 'medium',
    hexId: 'SUM04',
    region: 'West Sumatra',
  },
  {
    id: 'ALT011',
    timestamp: '07:08 AM',
    message: 'Manado volcanic zone soil displacement detected — North Sulawesi',
    severity: 'medium',
    hexId: 'SUL09',
    region: 'Manado Volcanic Zone',
  },
  {
    id: 'ALT012',
    timestamp: '07:00 AM',
    message: 'Banjarmasin Delta tidal surge forecast — South Kalimantan watch',
    severity: 'medium',
    hexId: 'KAL05',
    region: 'Banjarmasin Delta',
  },
];

export function generateForecastData(baseRisk: number) {
  const data = [];
  const dangerThreshold = 0.75;
  for (let h = 0; h <= 72; h += 3) {
    let risk = baseRisk;
    if (h < 6) {
      risk = baseRisk * (0.9 + Math.random() * 0.1);
    } else if (h < 24) {
      const progress = (h - 6) / 18;
      risk = baseRisk + (0.15 * progress) + (Math.random() * 0.03 - 0.015);
    } else if (h < 48) {
      const progress = (h - 24) / 24;
      risk = Math.min(0.98, baseRisk + 0.2 + 0.1 * progress + (Math.random() * 0.04 - 0.02));
    } else {
      const progress = (h - 48) / 24;
      risk = Math.min(0.99, baseRisk + 0.3 - 0.05 * progress + (Math.random() * 0.04 - 0.02));
    }
    data.push({
      hour: h,
      risk: Math.max(0, Math.min(1, risk)),
      threshold: dangerThreshold,
    });
  }
  return data;
}

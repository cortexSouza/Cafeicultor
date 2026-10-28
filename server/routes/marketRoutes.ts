import { Router, Request, Response } from 'express';
import { CoffeeMarketConsolidator } from '../services/coffeeMarketConsolidator';

export const marketRouter = Router();

/**
 * GET /api/market/coffee-consolidated
 * Primary endpoint for Mobile Application and Agrotech clients.
 *
 * Query params:
 *   - forceRefresh: "true" | "false" (optional)
 */
marketRouter.get('/coffee-consolidated', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.forceRefresh === 'true';
    const data = await CoffeeMarketConsolidator.getConsolidatedMarketData(forceRefresh);

    // Provide Cache-Control headers for mobile caching proxies and CDN
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[MarketRoutes] Error serving coffee consolidated data:', err);
    // Never crash mobile client: return emergency fallback structure
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 'ERROR',
      currency: {
        usdToBrl: 5.7640,
        source: 'EMERGENCY_RESCUE',
      },
      market: {
        arabicaNY: {
          centsPerLb: 288.65,
          calculatedParityBRLPerSack: 2199.78,
          unit: 'cents/lb',
        },
        robustaLondon: {
          usdPerTon: 4720.00,
          calculatedParityBRLPerSack: 1632.36,
          unit: 'USD/Ton',
        },
        cepeaPhysical: {
          arabicaBRLPerSack: 1915.50,
          conilonBRLPerSack: 1448.20,
          lastUpdate: new Date().toISOString().split('T')[0],
        },
      },
      metadata: {
        conversionFactors: {
          lbsPerSack: 132.277,
          sacksPerTon: 16.6667,
        },
        sourceDetails: {
          upstreamErrors: [err?.message || 'Internal processing error'],
        },
      },
    });
  }
});

/**
 * Health & Readiness Probe for Kubernetes / Cloud Run
 */
marketRouter.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'UP',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

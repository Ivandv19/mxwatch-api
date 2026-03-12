import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { eq, sql } from 'drizzle-orm';
import { db, healthCheck } from './db';
import { cartels, states, regionalPresence } from './db/schema';

const app = new Hono();

// Middlewares globales
app.use('*', logger());
app.use(
  '/*',
  cors({
    origin: ['https://mxwatch.mgdc.site', 'http://localhost:3000'],
  })
);

const api = app.basePath('/api');

// -----------------------------------------------------------------------------
// Middleware de health check (opcional pero útil)
// -----------------------------------------------------------------------------
api.get('/health', async (c) => {
  const isHealthy = await healthCheck();
  return c.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  }, isHealthy ? 200 : 503);
});

// -----------------------------------------------------------------------------
// 1. Obtener datos completos del mapa
// -----------------------------------------------------------------------------
api.get('/map', async (c) => {
  try {
    const presenceRecords = await db.query.states.findMany({
      with: {
        presences: {
          with: { cartel: true },
          // Ordenar por dominancia (los dominantes primero)
          orderBy: (presences, { desc }) => [desc(presences.isDominant)]
        }
      },
      orderBy: (states, { asc }) => [asc(states.name)]
    });

    const result = presenceRecords.map((stateRecord) => ({
      stateSlug: stateRecord.slug,
      stateName: stateRecord.name,
      cartels: stateRecord.presences.map((p) => ({
        id: p.cartel.id,
        name: p.cartel.name,
        color: p.cartel.color,
        isDominant: p.isDominant,
        slug: p.cartel.slug,
      }))
    }));

    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /map:', error);
    return c.json({
      success: false,
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, 500);
  }
});

// -----------------------------------------------------------------------------
// 2. Obtener lista básica de todos los cárteles
// -----------------------------------------------------------------------------
api.get('/cartels', async (c) => {
  try {
    const allCartels = await db.query.cartels.findMany({
      orderBy: (cartels, { asc }) => [asc(cartels.name)]
    });

    return c.json({
      success: true,
      data: allCartels,
      count: allCartels.length
    });
  } catch (error) {
    console.error('Error in /cartels:', error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// -----------------------------------------------------------------------------
// 3. Obtener detalle completo de un cártel por slug
// -----------------------------------------------------------------------------
api.get('/cartel/:slug', async (c) => {
  try {
    const cartelSlug = c.req.param('slug');

    const cartelRecord = await db.query.cartels.findFirst({
      where: eq(cartels.slug, cartelSlug),
      with: {
        presences: {
          with: {
            state: true, // Incluir estado para contexto geográfico
            factions: { with: { faction: true } },
            leaders: { with: { leader: true } },
            armedWings: { with: { armedWing: true } },
            economies: { with: { economy: true } }
          }
        }
      }
    });

    if (!cartelRecord) {
      return c.json({ success: false, error: 'Cartel not found' }, 404);
    }

    // Usar Map y Set para datos únicos
    const uniqueFactions = new Map<any, any>();
    const uniqueLeaders = new Map<any, any>();
    const uniqueArmedWings = new Map<any, any>();
    const uniqueEconomies = new Map<any, any>();
    const statePresence: any[] = [];

    cartelRecord.presences.forEach((presence: any) => {
      // Guardar presencia por estado
      statePresence.push({
        state: presence.state.name,
        isDominant: presence.isDominant,
        note: presence.localIntelligenceNote
      });

      // Facciones únicas
      presence.factions.forEach((pf: any) => {
        uniqueFactions.set(pf.faction.id, {
          name: pf.faction.name,
          focus: pf.faction.focus
        });
      });

      // Líderes únicos
      presence.leaders.forEach((pl: any) => {
        uniqueLeaders.set(pl.leader.id, {
          name: pl.leader.name,
          alias: pl.leader.alias
        });
      });

      // Brazos armados únicos
      presence.armedWings?.forEach((aw: any) => {
        uniqueArmedWings.set(aw.armedWing.id, {
          name: aw.armedWing.name
        });
      });

      // Actividades económicas únicas
      presence.economies?.forEach((pe: any) => {
        uniqueEconomies.set(pe.economy.id, {
          name: pe.economy.name
        });
      });
    });

    return c.json({
      success: true,
      data: {
        id: cartelRecord.id,
        name: cartelRecord.name,
        slug: cartelRecord.slug,
        color: cartelRecord.color,
        globalStatus: cartelRecord.globalStatus,
        foreignDesignation: cartelRecord.foreignDesignation,
        fifaRiskLevel: cartelRecord.fifaRiskLevel,
        presence: {
          states: statePresence,
          totalStates: statePresence.length,
          dominantStates: statePresence.filter(s => s.isDominant).length
        },
        factions: Array.from(uniqueFactions.values()),
        leaders: Array.from(uniqueLeaders.values()),
        armedWings: Array.from(uniqueArmedWings.values()),
        economicActivities: Array.from(uniqueEconomies.values())
      }
    });
  } catch (error) {
    console.error('Error in /cartel/:slug:', error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// -----------------------------------------------------------------------------
// 4. Obtener inteligencia de un estado específico
// -----------------------------------------------------------------------------
api.get('/state/:name', async (c) => {
  try {
    const stateName = decodeURIComponent(c.req.param('name'));

    const stateRecord = await db.query.states.findFirst({
      where: eq(states.name, stateName),
      with: {
        presences: {
          with: {
            cartel: true,
            factions: { with: { faction: true } },
            leaders: { with: { leader: true } },
            armedWings: { with: { armedWing: true } },
            economies: { with: { economy: true } }
          },
          orderBy: (presences, { desc }) => [desc(presences.isDominant)]
        }
      }
    });

    if (!stateRecord) {
      return c.json({ success: false, error: 'State not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        stateName: stateRecord.name,
        stateSlug: stateRecord.slug,
        totalCartels: stateRecord.presences.length,
        dominantCartels: stateRecord.presences.filter(p => p.isDominant).length,
        cartels: stateRecord.presences.map((p) => ({
          id: p.cartel.id,
          name: p.cartel.name,
          slug: p.cartel.slug,
          color: p.cartel.color,
          isDominant: p.isDominant,
          localIntelligenceNote: p.localIntelligenceNote,
          globalStatus: p.cartel.globalStatus,
          foreignDesignation: p.cartel.foreignDesignation,
          factions: p.factions.map((f) => ({
            id: f.faction.id,
            name: f.faction.name,
            focus: f.faction.focus
          })),
          leaders: p.leaders.map((l) => ({
            id: l.leader.id,
            name: l.leader.name,
            alias: l.leader.alias
          })),
          armedWings: p.armedWings?.map((aw) => ({
            id: aw.armedWing.id,
            name: aw.armedWing.name
          })) || [],
          economicActivities: p.economies?.map((e) => ({
            id: e.economy.id,
            name: e.economy.name
          })) || []
        }))
      }
    });
  } catch (error) {
    console.error('Error in /state/:name:', error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// -----------------------------------------------------------------------------
// 5. Endpoint adicional: Buscar por presencia dominante
// -----------------------------------------------------------------------------
api.get('/dominant-presence', async (c) => {
  try {
    const dominantPresence = await db.query.regionalPresence.findMany({
      where: eq(regionalPresence.isDominant, true),
      with: {
        state: true,
        cartel: true
      },
      orderBy: (presence, { asc }) => [asc(presence.stateId)]
    });

    const result = dominantPresence.map((p) => ({
      state: p.state.name,
      cartel: p.cartel.name,
      cartelColor: p.cartel.color
    }));

    return c.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error in /dominant-presence:', error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Exportar tipo para Hono RPC
export type AppType = typeof api;

export default {
  port: 3001,
  fetch: app.fetch,
};
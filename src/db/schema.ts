import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    primaryKey,
    index,
    pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -----------------------------------------------------------------------------
// 0. Enums para valores fijos
// -----------------------------------------------------------------------------
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

// Helper para timestamps (consistencia en todas las tablas)
const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
};

// -----------------------------------------------------------------------------
// 1. Definir tablas de catálogos base (Entidades principales funcionales sin dependencias fuertes)
// -----------------------------------------------------------------------------

export const states = pgTable('states', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(), // Ej. "tamaulipas" para TopoJSON
    ...timestamps,
}, (table) => ({
    slugIdx: index('states_slug_idx').on(table.slug),
    nameIdx: index('states_name_idx').on(table.name),
}));

export const cartels = pgTable('cartels', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 50 }).notNull(), // Hex color for the map
    globalStatus: varchar('global_status', { length: 255 }),
    foreignDesignation: varchar('foreign_designation', { length: 255 }),
    fifaRiskLevel: varchar('fifa_risk_level', { length: 100 }), // FIFA risk level
    ...timestamps,
}, (table) => ({
    slugIdx: index('cartels_slug_idx').on(table.slug),
    nameIdx: index('cartels_name_idx').on(table.name),
}));

export const factions = pgTable('factions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    focus: varchar('focus', { length: 255 }), // Ej: "Frontera chica", "Tráfico Fentanilo"
    ...timestamps,
}, (table) => ({
    nameIdx: index('factions_name_idx').on(table.name),
}));

export const armedWings = pgTable('armed_wings', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    ...timestamps,
}, (table) => ({
    nameIdx: index('armed_wings_name_idx').on(table.name),
}));

export const leaders = pgTable('leaders', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    alias: varchar('alias', { length: 255 }),
    ...timestamps,
}, (table) => ({
    nameIdx: index('leaders_name_idx').on(table.name),
    aliasIdx: index('leaders_alias_idx').on(table.alias),
}));

export const alliances = pgTable('alliances', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    ...timestamps,
}, (table) => ({
    nameIdx: index('alliances_name_idx').on(table.name),
}));

export const economicActivities = pgTable('economic_activities', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(), // Ej: "Narcotráfico", "Extorsión Limón"
    ...timestamps,
}, (table) => ({
    nameIdx: index('economic_activities_name_idx').on(table.name),
}));

// -----------------------------------------------------------------------------
// 2. Definir tabla central de presencia regional (Conecta estados y cárteles)
// -----------------------------------------------------------------------------

export const regionalPresence = pgTable('regional_presence', {
    id: uuid('id').defaultRandom().primaryKey(),
    stateId: uuid('state_id').notNull().references(() => states.id, { onDelete: 'cascade' }),
    cartelId: uuid('cartel_id').notNull().references(() => cartels.id, { onDelete: 'cascade' }),
    allianceId: uuid('alliance_id').references(() => alliances.id, { onDelete: 'set null' }),
    isDominant: boolean('is_dominant').default(false).notNull(),
    localIntelligenceNote: text('local_intelligence_note'), // "Ej: Disputando la garita con CDN"
    ...timestamps,
}, (table) => ({
    // Índices para consultas frecuentes
    stateIdx: index('regional_presence_state_idx').on(table.stateId),
    cartelIdx: index('regional_presence_cartel_idx').on(table.cartelId),
    allianceIdx: index('regional_presence_alliance_idx').on(table.allianceId),
    dominantIdx: index('regional_presence_dominant_idx').on(table.isDominant),
    // Índice compuesto para búsquedas por estado y cartel
    stateCartelIdx: index('regional_presence_state_cartel_idx').on(table.stateId, table.cartelId),
}));

// -----------------------------------------------------------------------------
// 3. Definir tablas intermedias para relaciones de muchos a muchos (Detalle táctico/regional)
// -----------------------------------------------------------------------------

// Relacionar presencia regional con facciones
export const presenceFactions = pgTable('presence_factions',
    {
        presenceId: uuid('presence_id').notNull().references(() => regionalPresence.id, { onDelete: 'cascade' }),
        factionId: uuid('faction_id').notNull().references(() => factions.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.presenceId, t.factionId] }),
        // Índices adicionales
        factionIdx: index('presence_factions_faction_idx').on(t.factionId),
    })
);

// Relacionar presencia regional con brazos armados
export const presenceArmedWings = pgTable('presence_armed_wings',
    {
        presenceId: uuid('presence_id').notNull().references(() => regionalPresence.id, { onDelete: 'cascade' }),
        armedWingId: uuid('armed_wing_id').notNull().references(() => armedWings.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.presenceId, t.armedWingId] }),
        armedWingIdx: index('presence_armed_wings_wing_idx').on(t.armedWingId),
    })
);

// Relacionar presencia regional con líderes locales
export const presenceLeaders = pgTable('presence_leaders',
    {
        presenceId: uuid('presence_id').notNull().references(() => regionalPresence.id, { onDelete: 'cascade' }),
        leaderId: uuid('leader_id').notNull().references(() => leaders.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.presenceId, t.leaderId] }),
        leaderIdx: index('presence_leaders_leader_idx').on(t.leaderId),
    })
);

// Relacionar presencia regional con actividades económicas
export const presenceEconomies = pgTable('presence_economies',
    {
        presenceId: uuid('presence_id').notNull().references(() => regionalPresence.id, { onDelete: 'cascade' }),
        economyId: uuid('economy_id').notNull().references(() => economicActivities.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.presenceId, t.economyId] }),
        economyIdx: index('presence_economies_economy_idx').on(t.economyId),
    })
);

// -----------------------------------------------------------------------------
// 4. Definir estructuras para incidentes y eventos operativos (Características futuras)
// -----------------------------------------------------------------------------

export const incidents = pgTable('incidents', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    severity: severityEnum('severity').notNull(), // Usando enum en lugar de varchar
    stateId: uuid('state_id').notNull().references(() => states.id, { onDelete: 'cascade' }),
    date: timestamp('date').defaultNow().notNull(),
    ...timestamps,
}, (table) => ({
    stateIdx: index('incidents_state_idx').on(table.stateId),
    severityIdx: index('incidents_severity_idx').on(table.severity),
    dateIdx: index('incidents_date_idx').on(table.date),
    stateDateIdx: index('incidents_state_date_idx').on(table.stateId, table.date),
}));

// Pivot table para incidentes que involucran carteles
export const incidentCartels = pgTable('incident_cartels',
    {
        incidentId: uuid('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
        cartelId: uuid('cartel_id').notNull().references(() => cartels.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.incidentId, t.cartelId] }),
        cartelIdx: index('incident_cartels_cartel_idx').on(t.cartelId),
        incidentIdx: index('incident_cartels_incident_idx').on(t.incidentId),
    })
);

// -----------------------------------------------------------------------------
// 5. Configurar relaciones del ORM (Permite realizar consultas anidadas complejas eficientemente)
// -----------------------------------------------------------------------------

// Relaciones para regionalPresence
export const regionalPresenceRelations = relations(regionalPresence, ({ one, many }) => ({
    state: one(states, {
        fields: [regionalPresence.stateId],
        references: [states.id],
    }),
    cartel: one(cartels, {
        fields: [regionalPresence.cartelId],
        references: [cartels.id],
    }),
    alliance: one(alliances, {
        fields: [regionalPresence.allianceId],
        references: [alliances.id],
    }),
    factions: many(presenceFactions),
    armedWings: many(presenceArmedWings),
    leaders: many(presenceLeaders),
    economies: many(presenceEconomies),
}));

// Relaciones para estados
export const statesRelations = relations(states, ({ many }) => ({
    presences: many(regionalPresence),
    incidents: many(incidents),
}));

// Relaciones para cárteles
export const cartelsRelations = relations(cartels, ({ many }) => ({
    presences: many(regionalPresence),
    incidents: many(incidentCartels),
}));

// Relaciones para facciones
export const factionsRelations = relations(factions, ({ many }) => ({
    presences: many(presenceFactions),
}));

// Relaciones para brazos armados
export const armedWingsRelations = relations(armedWings, ({ many }) => ({
    presences: many(presenceArmedWings),
}));

// Relaciones para líderes
export const leadersRelations = relations(leaders, ({ many }) => ({
    presences: many(presenceLeaders),
}));

// Relaciones para alianzas
export const alliancesRelations = relations(alliances, ({ many }) => ({
    presences: many(regionalPresence),
}));

// Relaciones para actividades económicas
export const economicActivitiesRelations = relations(economicActivities, ({ many }) => ({
    presences: many(presenceEconomies),
}));

// Relaciones para incidentes
export const incidentsRelations = relations(incidents, ({ one, many }) => ({
    state: one(states, {
        fields: [incidents.stateId],
        references: [states.id],
    }),
    cartels: many(incidentCartels),
}));

// -----------------------------------------------------------------------------
// 6. Relaciones para las tablas pivote (Para que el bidireccional funcione perfecto)
// -----------------------------------------------------------------------------

export const presenceFactionsRelations = relations(presenceFactions, ({ one }) => ({
    presence: one(regionalPresence, {
        fields: [presenceFactions.presenceId],
        references: [regionalPresence.id]
    }),
    faction: one(factions, {
        fields: [presenceFactions.factionId],
        references: [factions.id]
    }),
}));

export const presenceArmedWingsRelations = relations(presenceArmedWings, ({ one }) => ({
    presence: one(regionalPresence, {
        fields: [presenceArmedWings.presenceId],
        references: [regionalPresence.id]
    }),
    armedWing: one(armedWings, {
        fields: [presenceArmedWings.armedWingId],
        references: [armedWings.id]
    }),
}));

export const presenceLeadersRelations = relations(presenceLeaders, ({ one }) => ({
    presence: one(regionalPresence, {
        fields: [presenceLeaders.presenceId],
        references: [regionalPresence.id]
    }),
    leader: one(leaders, {
        fields: [presenceLeaders.leaderId],
        references: [leaders.id]
    }),
}));

export const presenceEconomiesRelations = relations(presenceEconomies, ({ one }) => ({
    presence: one(regionalPresence, {
        fields: [presenceEconomies.presenceId],
        references: [regionalPresence.id]
    }),
    economy: one(economicActivities, {
        fields: [presenceEconomies.economyId],
        references: [economicActivities.id]
    }),
}));

export const incidentCartelsRelations = relations(incidentCartels, ({ one }) => ({
    incident: one(incidents, {
        fields: [incidentCartels.incidentId],
        references: [incidents.id]
    }),
    cartel: one(cartels, {
        fields: [incidentCartels.cartelId],
        references: [cartels.id]
    }),
}));
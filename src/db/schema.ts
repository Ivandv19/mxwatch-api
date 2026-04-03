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

/**
 * ESQUEMA DE BASE DE DATOS - mxwatch-api
 * Define la estructura de tablas relacionales para el monitoreo de seguridad.
 * Utiliza Drizzle ORM con tipado estricto para PostgreSQL.
 */

// -----------------------------------------------------------------------------
// 0. DEFINICIÓN DE ENUMS Y HELPERS
// -----------------------------------------------------------------------------

/**
 * severityEnum: Clasificación de riesgo/gravedad para incidentes.
 */
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

/**
 * timestamps: Helper reutilizable para columnas de auditoría cronológica.
 */
const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
};

// -----------------------------------------------------------------------------
// 1. TABLAS DE CATÁLOGOS BASE (ENTIDADES MAESTRAS)
// -----------------------------------------------------------------------------

/**
 * states: División territorial (Estados de México).
 * Conecta los registros con la geometría de TopoJSON mediante el 'slug'.
 */
export const states = pgTable('states', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(), // Nombre amigable
    slug: varchar('slug', { length: 255 }).notNull().unique(), // Key para el mapa (ej. "sinaloa")
    ...timestamps,
}, (table) => ({
    slugIdx: index('states_slug_idx').on(table.slug),
    nameIdx: index('states_name_idx').on(table.name),
}));

/**
 * cartels: Organizaciones delictivas documentadas.
 * Almacena metadatos globales como color en el mapa y nivel de riesgo internacional.
 */
export const cartels = pgTable('cartels', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 50 }).notNull(), // Asignación visual en el mapa
    globalStatus: varchar('global_status', { length: 255 }), // Estatus operativo actual
    foreignDesignation: varchar('foreign_designation', { length: 255 }), // Designación por agencias externas (OFAC, DEA)
    fifaRiskLevel: varchar('fifa_risk_level', { length: 100 }), // Riesgo de seguridad en contexto internacional
    ...timestamps,
}, (table) => ({
    slugIdx: index('cartels_slug_idx').on(table.slug),
    nameIdx: index('cartels_name_idx').on(table.name),
}));

/**
 * factions: Células o facciones específicas operando bajo el mando de un cártel mayor.
 */
export const factions = pgTable('factions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    focus: varchar('focus', { length: 255 }), // Área de especialización delictiva o territorial
    ...timestamps,
}, (table) => ({
    nameIdx: index('factions_name_idx').on(table.name),
}));

/**
 * armedWings: Grupos de sicarios o brazos armados con identidad propia.
 */
export const armedWings = pgTable('armed_wings', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    ...timestamps,
}, (table) => ({
    nameIdx: index('armed_wings_name_idx').on(table.name),
}));

/**
 * leaders: Personajes clave identificados en la estructura criminal.
 */
export const leaders = pgTable('leaders', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    alias: varchar('alias', { length: 255 }), // Apodo o nombre clave operativo
    ...timestamps,
}, (table) => ({
    nameIdx: index('leaders_name_idx').on(table.name),
    aliasIdx: index('leaders_alias_idx').on(table.alias),
}));

/**
 * alliances: Coaliciones o frentes compartidos entre múltiples cárteles.
 */
export const alliances = pgTable('alliances', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    ...timestamps,
}, (table) => ({
    nameIdx: index('alliances_name_idx').on(table.name),
}));

/**
 * economicActivities: Mercados ilícitos o lícitos controlados por las organizaciones.
 */
export const economicActivities = pgTable('economic_activities', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(), // Ej: "Extorsión al sector aguacatero"
    ...timestamps,
}, (table) => ({
    nameIdx: index('economic_activities_name_idx').on(table.name),
}));

// -----------------------------------------------------------------------------
// 2. TABLA CENTRAL DE PRESENCIA TERRITORIAL (NÚCLEO DE LA PLATAFORMA)
// -----------------------------------------------------------------------------

/**
 * regionalPresence: Punto de unión entre Estados y Cárteles.
 * Define quién tiene el control, si hay disputa y notas tácticas de inteligencia local.
 */
export const regionalPresence = pgTable('regional_presence', {
    id: uuid('id').defaultRandom().primaryKey(),
    stateId: uuid('state_id').notNull().references(() => states.id, { onDelete: 'cascade' }),
    cartelId: uuid('cartel_id').notNull().references(() => cartels.id, { onDelete: 'cascade' }),
    allianceId: uuid('alliance_id').references(() => alliances.id, { onDelete: 'set null' }),
    isDominant: boolean('is_dominant').default(false).notNull(), // Control hegemónico vs presencia en disputa
    localIntelligenceNote: text('local_intelligence_note'), // Observaciones tácticas actualizadas
    ...timestamps,
}, (table) => ({
    stateIdx: index('regional_presence_state_idx').on(table.stateId),
    cartelIdx: index('regional_presence_cartel_idx').on(table.cartelId),
    allianceIdx: index('regional_presence_alliance_idx').on(table.allianceId),
    dominantIdx: index('regional_presence_dominant_idx').on(table.isDominant),
    stateCartelIdx: index('regional_presence_state_cartel_idx').on(table.stateId, table.cartelId),
}));

// -----------------------------------------------------------------------------
// 3. TABLAS PIVOTE (RELACIONES MUCHOS-A-MUCHOS)
// -----------------------------------------------------------------------------

/**
 * presenceFactions: Vincula facciones específicas con la presencia de un cártel en un estado.
 */
export const presenceFactions = pgTable('presence_factions',
    {
        presenceId: uuid('presence_id').notNull().references(() => regionalPresence.id, { onDelete: 'cascade' }),
        factionId: uuid('faction_id').notNull().references(() => factions.id, { onDelete: 'cascade' }),
        ...timestamps,
    },
    (t) => ({
        pk: primaryKey({ columns: [t.presenceId, t.factionId] }),
        factionIdx: index('presence_factions_faction_idx').on(t.factionId),
    })
);

/**
 * presenceArmedWings: Grupos de choque vinculados a una zona de operación.
 */
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

/**
 * presenceLeaders: Estructura de mando identificada operando en la región.
 */
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

/**
 * presenceEconomies: Detalle de economías ilícitas controladas regionalmente.
 */
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
// 4. TABLAS DE EVENTOS OPERATIVOS (CARACTERÍSTICAS FUTURAS)
// -----------------------------------------------------------------------------

/**
 * incidents: Reportes tácticos de incidentes de seguridad individuales.
 */
export const incidents = pgTable('incidents', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    severity: severityEnum('severity').notNull(),
    stateId: uuid('state_id').notNull().references(() => states.id, { onDelete: 'cascade' }),
    date: timestamp('date').defaultNow().notNull(),
    ...timestamps,
}, (table) => ({
    stateIdx: index('incidents_state_idx').on(table.stateId),
    severityIdx: index('incidents_severity_idx').on(table.severity),
    dateIdx: index('incidents_date_idx').on(table.date),
    stateDateIdx: index('incidents_state_date_idx').on(table.stateId, table.date),
}));

/**
 * incidentCartels: Relación de cárteles involucrados en un incidente específico.
 */
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
// 5. CONFIGURACIÓN DE RELACIONES DRIZZLE (FACILITA CONSULTAS ANIDADAS)
// -----------------------------------------------------------------------------

/**
 * Configuración de relaciones para la tabla central de presencia regional.
 */
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

/**
 * Relaciones inversas y adicionales para Catálogos.
 */
export const statesRelations = relations(states, ({ many }) => ({
    presences: many(regionalPresence),
    incidents: many(incidents),
}));

export const cartelsRelations = relations(cartels, ({ many }) => ({
    presences: many(regionalPresence),
    incidents: many(incidentCartels),
}));

export const factionsRelations = relations(factions, ({ many }) => ({
    presences: many(presenceFactions),
}));

export const armedWingsRelations = relations(armedWings, ({ many }) => ({
    presences: many(presenceArmedWings),
}));

export const leadersRelations = relations(leaders, ({ many }) => ({
    presences: many(presenceLeaders),
}));

export const alliancesRelations = relations(alliances, ({ many }) => ({
    presences: many(regionalPresence),
}));

export const economicActivitiesRelations = relations(economicActivities, ({ many }) => ({
    presences: many(presenceEconomies),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
    state: one(states, {
        fields: [incidents.stateId],
        references: [states.id],
    }),
    cartels: many(incidentCartels),
}));

// -----------------------------------------------------------------------------
// 6. RELACIONES PARA TABLAS PIVOTE (ESTRUCTURA BIDIRECCIONAL)
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
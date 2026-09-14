// Downloads the backend Swagger document and rewrites it into a spec ng-openapi-gen handles well:
// short schema names instead of .NET assembly-qualified generics, generated operationIds,
// single-item `allOf` wrappers unwrapped, and non-nullable properties marked as required.
//
// Usage: node scripts/openapi-normalize.mjs [url-or-file]
//   defaults to $TOFAN_OPENAPI_URL, then to the production Swagger endpoint.

import { readFile, writeFile } from 'node:fs/promises';

const DEFAULT_SOURCE = 'https://api.157.90.117.20.sslip.io/swagger/v1/swagger.json';
const OUTPUT = 'openapi/tofan-api.json';
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];
const COLLECTION_TYPES = new Set([
  'IReadOnlyList',
  'IReadOnlyCollection',
  'IEnumerable',
  'ICollection',
  'IList',
  'List',
]);
const SCHEMA_REF_PREFIX = '#/components/schemas/';

const source = process.argv[2] ?? process.env.TOFAN_OPENAPI_URL ?? DEFAULT_SOURCE;
const spec = await load(source);

const schemaNames = renameSchemas(spec);
rewriteRefs(spec, schemaNames);
unwrapSingleAllOf(spec);
markNonNullablePropertiesRequired(spec.components.schemas);
assignOperationIds(spec.paths);
delete spec.servers;

await writeFile(OUTPUT, `${JSON.stringify(spec, null, 2)}\n`);
console.log(
  `${OUTPUT}: ${Object.keys(spec.paths).length} paths, ${Object.keys(spec.components.schemas).length} schemas (from ${source})`,
);

async function load(location) {
  if (/^https?:\/\//.test(location)) {
    const response = await fetch(location);
    if (!response.ok) {
      throw new Error(`GET ${location} failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  return JSON.parse(await readFile(location, 'utf8'));
}

function renameSchemas(document) {
  const renamed = new Map();
  const taken = new Map();

  for (const originalName of Object.keys(document.components.schemas)) {
    const shortName = toShortName(parseTypeName(originalName));
    if (taken.has(shortName)) {
      throw new Error(
        `Schema name collision on "${shortName}":\n  ${taken.get(shortName)}\n  ${originalName}`,
      );
    }
    taken.set(shortName, originalName);
    renamed.set(originalName, shortName);
  }

  document.components.schemas = Object.fromEntries(
    Object.entries(document.components.schemas).map(([name, schema]) => [
      renamed.get(name),
      schema,
    ]),
  );
  return renamed;
}

// Parses `Namespace.Type`1[[Arg, Assembly, Version=...],[Arg2, ...]]` into { name, args }.
function parseTypeName(text) {
  const tick = text.indexOf('`');
  if (tick === -1) {
    return { name: lastSegment(text.split(',')[0].trim()), args: [] };
  }

  const name = lastSegment(text.slice(0, tick));
  const argsStart = text.indexOf('[', tick);
  const args = [];
  let depth = 0;
  let argStart = -1;

  for (let i = argsStart; i < text.length; i++) {
    const char = text[i];
    if (char === '[') {
      depth++;
      if (depth === 2) {
        argStart = i + 1;
      }
    } else if (char === ']') {
      if (depth === 2) {
        args.push(parseTypeName(stripAssembly(text.slice(argStart, i))));
      }
      depth--;
      if (depth === 0) {
        break;
      }
    }
  }

  return { name, args };
}

function stripAssembly(qualifiedName) {
  let depth = 0;
  for (let i = 0; i < qualifiedName.length; i++) {
    const char = qualifiedName[i];
    if (char === '[') depth++;
    else if (char === ']') depth--;
    else if (char === ',' && depth === 0) return qualifiedName.slice(0, i);
  }
  return qualifiedName;
}

function lastSegment(dottedName) {
  return dottedName.split('.').pop();
}

function toShortName({ name, args }) {
  if (args.length === 0) {
    return name;
  }
  const base = COLLECTION_TYPES.has(name) ? 'List' : name;
  return args.map(toShortName).join('') + base;
}

function rewriteRefs(node, schemaNames) {
  if (Array.isArray(node)) {
    node.forEach((item) => rewriteRefs(item, schemaNames));
    return;
  }
  if (node === null || typeof node !== 'object') {
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string' && value.startsWith(SCHEMA_REF_PREFIX)) {
      const target = decodeURIComponent(value.slice(SCHEMA_REF_PREFIX.length));
      const shortName = schemaNames.get(target);
      if (shortName === undefined) {
        throw new Error(`Unresolved $ref: ${value}`);
      }
      node[key] = SCHEMA_REF_PREFIX + shortName;
    } else {
      rewriteRefs(value, schemaNames);
    }
  }
}

// `{ allOf: [{ $ref }] }` → `{ $ref }`, unless the wrapper carries `nullable`, which a sibling
// of `$ref` cannot express in OpenAPI 3.0.
function unwrapSingleAllOf(node) {
  if (Array.isArray(node)) {
    node.forEach(unwrapSingleAllOf);
    return;
  }
  if (node === null || typeof node !== 'object') {
    return;
  }
  for (const value of Object.values(node)) {
    unwrapSingleAllOf(value);
  }
  if (Array.isArray(node.allOf) && node.allOf.length === 1 && node.nullable !== true) {
    const [only] = node.allOf;
    delete node.allOf;
    Object.assign(node, only);
  }
}

// The backend uses nullable reference types, so Swagger flags every optional member with
// `nullable: true`; everything else is always present in the JSON.
function markNonNullablePropertiesRequired(schemas) {
  for (const schema of Object.values(schemas)) {
    if (schema.type !== 'object' || !schema.properties || schema.required) {
      continue;
    }
    const required = Object.entries(schema.properties)
      .filter(([, property]) => property.nullable !== true && property.readOnly !== true)
      .map(([name]) => name);
    if (required.length > 0) {
      schema.required = required;
    }
  }
}

// `POST /workout-plans/{id}/activate` → `postWorkoutPlansByIdActivate`
function assignOperationIds(paths) {
  const used = new Set();
  for (const [path, operations] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const operation = operations[method];
      if (!operation || operation.operationId) {
        continue;
      }
      const operationId = method + path.split('/').filter(Boolean).map(toPascalSegment).join('');
      if (used.has(operationId)) {
        throw new Error(
          `Duplicate operationId "${operationId}" for ${method.toUpperCase()} ${path}`,
        );
      }
      used.add(operationId);
      operation.operationId = operationId;
    }
  }
}

function toPascalSegment(segment) {
  const parameter = segment.match(/^\{(.+)\}$/);
  const words = (parameter ? `by-${parameter[1]}` : segment).split(/[-_]/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const validYear = (value) => {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null;
};

export const formatCategory = (value) => {
  if (value === null || value === undefined || value === '') return 'Não informado';
  return String(value)
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase('pt-BR'));
};

export const buildCategorySeries = (items, field, limit = 6) => {
  const counts = new Map();
  items.forEach((item) => {
    const rawValues = Array.isArray(item?.[field]) ? item[field] : [item?.[field]];
    const values = rawValues.length ? rawValues : [null];
    values.forEach((value) => {
      const label = formatCategory(value);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= limit) return { labels: sorted.map(([label]) => label), series: sorted.map(([, count]) => count) };

  const visible = sorted.slice(0, limit - 1);
  const others = sorted.slice(limit - 1).reduce((total, [, count]) => total + count, 0);
  return {
    labels: [...visible.map(([label]) => label), 'Outros'],
    series: [...visible.map(([, count]) => count), others],
  };
};

export const buildAnnualActivity = ({ producoes = [], orientacoes = [], projetos = [] }, limit = 12) => {
  const definitions = [
    { name: 'Produções', items: producoes, field: 'ano' },
    { name: 'Orientações', items: orientacoes, field: 'ano' },
    { name: 'Projetos iniciados', items: projetos, field: 'ano_inicio' },
  ];
  const years = [...new Set(definitions.flatMap(({ items, field }) => items
    .map((item) => validYear(item?.[field]))
    .filter((year) => year !== null)))]
    .sort((a, b) => a - b)
    .slice(-limit);

  return {
    years: years.map(String),
    series: definitions.map(({ name, items, field }) => {
      const counts = items.reduce((result, item) => {
        const year = validYear(item?.[field]);
        if (year !== null) result.set(year, (result.get(year) || 0) + 1);
        return result;
      }, new Map());
      return { name, data: years.map((year) => counts.get(year) || 0) };
    }),
  };
};

const yearsFrom = (collections, limit = 11) => [...new Set(collections.flatMap(({ items, field }) =>
  items.map((item) => validYear(item?.[field])).filter((year) => year !== null),
))].sort((a, b) => a - b).slice(-limit);

export const buildStackedByYear = (items, yearField, categoryField, options = {}) => {
  const filtered = options.filter ? items.filter(options.filter) : items;
  const years = yearsFrom([{ items: filtered, field: yearField }], options.limit);
  const categories = [...new Set(filtered.map((item) => formatCategory(item?.[categoryField])))];
  const identities = new Map();

  filtered.forEach((item, index) => {
    const year = validYear(item?.[yearField]);
    if (year === null || !years.includes(year)) return;
    const category = formatCategory(item?.[categoryField]);
    const identity = options.identity
      ? options.identity(item) || `registro-${index}`
      : `registro-${index}`;
    const key = `${year}:${category}`;
    if (!identities.has(key)) identities.set(key, new Set());
    identities.get(key).add(identity);
  });

  return {
    years: years.map(String),
    series: categories.map((category) => ({
      name: category,
      data: years.map((year) => identities.get(`${year}:${category}`)?.size || 0),
    })),
  };
};

export const buildFacultyMembership = (
  faculty,
  sucupiraLastValidatedYear,
  currentYear = new Date().getFullYear(),
  limit = 11,
) => {
  const lastValidatedYear = validYear(sucupiraLastValidatedYear) || currentYear;
  const memberships = faculty.map((member) => member?.vinculos_programa?.mestrado)
    .filter((membership) => membership && validYear(membership.ano_inicio) !== null)
    .map((membership) => {
      const start = validYear(membership.ano_inicio);
      const reportedEnd = validYear(membership.ano_fim);
      const remainsCurrent = reportedEnd === null || reportedEnd >= lastValidatedYear;
      return {
        start,
        end: remainsCurrent ? currentYear : reportedEnd,
        category: formatCategory(membership.categoria),
      };
    });
  const firstYear = memberships.length ? Math.min(...memberships.map(({ start }) => start)) : currentYear;
  const years = Array.from({ length: Math.max(0, currentYear - firstYear + 1) }, (_, index) => firstYear + index).slice(-limit);
  const categories = [...new Set(memberships.map(({ category }) => category))];

  return {
    years: years.map(String),
    series: categories.map((category) => ({
      name: category,
      data: years.map((year) => memberships.filter((membership) =>
        membership.category === category && membership.start <= year && membership.end >= year).length),
    })),
  };
};

const productionMatches = (production, term) => {
  const asArray = (value) => Array.isArray(value) ? value : [value];
  const classification = [...asArray(production?.natureza), ...asArray(production?.tipos), ...asArray(production?.categorias_especificas)]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
  return classification.includes(term);
};

export const buildProductionByYear = (productions, kind, limit = 11) => {
  const filtered = productions.filter((item) => productionMatches(item, kind));
  const years = yearsFrom([{ items: productions, field: 'ano' }], limit);
  const counts = filtered.reduce((result, item) => {
    const year = validYear(item?.ano);
    if (year !== null) result.set(year, (result.get(year) || 0) + 1);
    return result;
  }, new Map());
  return {
    years: years.map(String),
    series: [{ name: kind === 'tecn' ? 'Produções técnicas' : 'Produções bibliográficas', data: years.map((year) => counts.get(year) || 0) }],
  };
};

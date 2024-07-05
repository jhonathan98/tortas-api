const Tools = require("./tools");

/**
 * Obtener resultados paginados con opciones de búsqueda
 * @param {*} model - Modelo Sequelize.
 * @param {*} parameters - Parámetros de paginación.
 * @param {*} filters - Filtros de búsqueda.
 * @param {*} attributes - Atributos a incluir en la consulta.
 * @param {*} include - Relaciones a incluir en la consulta.
 * @param {*} customOptions.autoAttributes - Activado para crear atributos con expresiones Sequelize.literal para las propiedades incluidas.
 * @param {*} customOptions.transform - Aplicar transformación si se proporciona una función de transformación.
 * @param {*} customOptions.flat - Aplicar si se quiere quitar los objetos de relación en el resutlado de la consulta
 */
const getPaginatedAndOrderedDynamic = async (model, parameters = {}, filters = {}, attributes = [], include = [], customOptions = { autoAttributes: true, transform: null, flat: true }) => {
  // Obtener la página y el tamaño de página de los parámetros
  const page = parseInt(parameters.numPage, 10) || 1;
  const pageSize = parseInt(parameters.sizePage, 10) || 10;

  let order = [];
  let searchs = [];
  let seenNamesTable = new Set();
  let seenNamesColumn = new Set();

  if(filters.hasOwnProperty('filtersTable') && filters.hasOwnProperty('filtersColumn')){
    // Recorrer "filtersTable" y agregar al array "searchs"
    filters.filtersTable.forEach(filter => Tools.addOrUpdateFilterSearchs(filter, searchs, seenNamesTable, true));
    // Recorrer "filtersColumn" y agregar al array "searchs"
    filters.filtersColumn.forEach(filter => Tools.addOrUpdateFilterSearchs(filter, searchs, seenNamesColumn, false));
  }

  if(filters.hasOwnProperty('orderBy')){
    // Agrega los parámetros del orderBy al order
    Tools.createOrder(filters.orderBy, order, include);
  }

  // Configurar opciones iniciales para la paginación
  let options = {
    offset: getOffset(page, pageSize),
    limit: pageSize,
  };

  // Configurar condiciones de búsqueda (condicionesOr)
  let condicionesOr = {};

  // Agrega el término de búsqueda al objeto de búsqueda
  Tools.createTypeCondition(searchs, include, condicionesOr, model);

  // Agregar condicionesOr a las opciones si hay condiciones
  if (condicionesOr) {
    options = {
      ...options,
      where: condicionesOr,
    };
  }

  // Construye un array de atributos con expresiones Sequelize.literal para las propiedades incluidas.
  if (customOptions?.autoAttributes && include?.length) {
    Tools.buildAttributesWithIncludes(include, attributes);
  }

  // Agregar orden a las opciones si hay orden
  if (order?.length) {
    options["order"] = order;
  }

  // Agregar atributos a las opciones si hay atributos
  if (attributes?.length) {
    options['attributes'] = attributes;
  }

  // Agregar includes a las opciones si hay includes
  if (include?.length) {
    options['include'] = include;
  }

  // Realizar la consulta findAndCountAll con las opciones configuradas
  let { count, rows } = await model.findAndCountAll(options);

  // Aplicar transformación si se proporciona una función de transformación
  if (customOptions?.transform && typeof customOptions?.transform === 'function') {
    rows = customOptions.transform(rows);
  }

  if (customOptions?.flat && rows?.length > 0) {
    // Eliminar propiedades de relaciones anidadas dinámicamente
    rows.map(row => Tools.cleanPropertiesRows(row));
  }

  // Devolver los resultados paginados y la información de paginación
  return {
    list: count > 0 ? rows : [],
    paged: createPaginationResponse(page, pageSize, count),
  };
};

/**
 * Calcula el numero de registros hasta que se mostraran
 * @param {*} page - Página actual
 * @param {*} pageSize - Numero de registros por pagina
 * @returns {Number} - Numero de registros hasta que se mostraran
 */
const getOffset = (page, pageSize) => {
  return page > 0 && pageSize > 0 ? pageSize * (page - 1) : page;
};

/**
 * Calcula el numero de paginas
 * @param {*} pageSize - Numero de registros por pagina
 * @param {*} count - Numero de registos en la tabla
 * @returns {Number} - Numero de paginas
 */
const getTotalPage = (pageSize, count) => {
  return count > 0 && pageSize > 0 ? Math.ceil(count / pageSize) : 0;
};

/**
 * Calcula el índice del primer registro en la página actual.
 * @param {*} page - Página actual
 * @param {*} pageSize - Numero de registros por pagina
 * @returns {Number} - Numero de registros desde que se mostraran
 */
const getRecordsFrom = (page, pageSize) => {
  return getRecordsTo(page, pageSize) > 0 && pageSize > 0
    ? ((getRecordsTo(page, pageSize) - pageSize) + 1) || 1
    : 0;
};

/**
 * Calcula el índice del último registro en la página actual.
 * @param {*} page - Página actual
 * @param {*} pageSize - Numero de registros por pagina
 * @returns {Number} - Numero de registros hasta que se esta mostrando
 */
const getRecordsTo = (page, pageSize) => {
  return pageSize > 0 && page > 0 ? pageSize * page : 0;
};

/**
 * Creacion de los resultados paginados y la información de paginación
 * @param {*} page - Página actual
 * @param {*} pageSize - Numero de registros por pagina
 * @param {*} count - Numero de registos en la tabla
 */
const createPaginationResponse = (page, pageSize, count) => {
  return {
    page: page,
    pageSize: pageSize,
    totalPages: getTotalPage(pageSize, count),
    maxCount: count,
    recordsFrom: getRecordsFrom(page, pageSize),
    recordsTo: getRecordsTo(page, pageSize),
  };
};

module.exports = {
  getPaginatedAndOrderedDynamic,
};

const i18n = require('i18n');

const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

/**
 * Agrega o actualiza un filtro en una lista de búsquedas.
 * @param {object} filter El filtro a agregar o actualizar.
 * @param {object[]} searchs La lista de búsquedas donde se agregará o actualizará el filtro.
 * @param {object*} seenNames Un conjunto que almacena los nombres de los filtros ya vistos.
 */
const addOrUpdateFilterSearchs = (filter, searchs, seenNames, isPriority) => {
  const name = filter.name;
  // Verificar si el nombre ya está en seenNames
  if (seenNames.has(name)) {
    // Buscar el filtro existente en searchs
    const existingFilterIndex = searchs.findIndex(f => f.name === name);
    // Si existe, actualizar el filtro existente con nuevos values
    if (existingFilterIndex !== -1) {
      const existingFilter = searchs[existingFilterIndex];
      // Filtrar los nuevos values para agregar solo los que no están en searchs.values
      const newValues = filter.values.filter(value => !existingFilter.values.includes(value));
      // Agregar los nuevos values al searchs.values
      existingFilter.values.push(...newValues);
      // Actualizar el filtro en searchs
      searchs[existingFilterIndex] = existingFilter;
    } else {
      // Si no existe, agregar el nuevo filtro
      searchs.push({
        ...filter,
        priority: isPriority
      });
    }
  } else {
    seenNames.add(name);
    searchs.push({
      ...filter,
      priority: isPriority
    });
  }
};

/**
 * Crea una ordenación para la consulta basada en los parámetros dados.
 * @param {object} paramsOrder Objeto que contiene los parámetros de ordenación.
 * @param {object[]} order Array que almacena las condiciones de ordenación.
 * @param {object[]} include Objeto que indica las relaciones a incluir en la consulta.
 */
const createOrder = (paramsOrder, order, include) => {
  if (paramsOrder.orderBy && paramsOrder.direcOrder) {
    // Verificar si el nombre contiene un punto (.) para manejar relaciones
    if (typeof paramsOrder.orderBy === 'string' && paramsOrder.orderBy.includes('.')) {
      createOrderRelation(order, paramsOrder, include);
    } else if (Array.isArray(paramsOrder.orderBy) && paramsOrder.orderBy.every(Array.isArray)) {
      // Si es un array de arrays, agregarlo directamente a la cláusula order
      order.push(...paramsOrder.orderBy.map(([column, direction]) => [column, direction.toUpperCase()]));
    } else {
      // Si no es un array de arrays ni una cadena, probablemente sea un literal de Sequelize o string
      order.push([paramsOrder.orderBy, paramsOrder.direcOrder.toUpperCase()]);
    }
  }
};

/**
 * Crea condiciones de filtrado para consultas basadas en un conjunto de criterios de búsqueda.
 * @param {object[]} searchs - Conjunto de criterios de búsqueda.
 * @param {object[]} include - Inclusión de relaciones para la consulta.
 * @param {object[]} condicionesOr - Condiciones de tipo OR para la consulta.
 * @param {object} model - Modelo Sequelize.
 */
const createTypeCondition = (searchs, include, condicionesOr, model) => {
  if (searchs && searchs.length > 0) {
    // Recorrer los filtros y agregar condiciones al objeto "where"
    searchs.forEach((filter) => {
      const { name, values, operator, priority } = filter;
      // Verificar si el nombre contiene un punto (.) para manejar relaciones
      if (name.includes('.')) {
        createConditionRelation(name, values, operator, include);
      } else if ((Array.isArray(values) && values.every(val => isValidDate(val))) || (typeof values === 'string' && isValidDate(values))) {
        createConditionDate(name, values, condicionesOr, model);
      } else {
        createCondition(name, values, operator, condicionesOr, priority);
      }
    });
  }
};

/**
 * Crea una condición para una consulta de base de datos, según el nombre del campo, los valores y el operador especificados.
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {number} operator - El código numérico que representa el operador de comparación a aplicar.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const createCondition = (name, values, operator, condicionesOr, priority = true) => {
  condicionesOr[Op.and] = [
    ...condicionesOr[Op.and] || []
  ];

  let priorityCondition = priority ? Op.and : Op.or;

  switch (operator) {
    case 0: // Igual (=)
      handleEqualCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 1: // No igual (<>)
      condicionesOr[Op.and].push({ [name]: { [Op.ne]: values } });
      break;
    case 2: // Menor que (<)
      condicionesOr[Op.and].push({ [name]: { [Op.lt]: values } });
      break;
    case 3: // Menor o igual que (<=)
      condicionesOr[Op.and].push({ [name]: { [Op.lte]: values } });
      break;
    case 4: // Mayor que (>)
      condicionesOr[Op.and].push({ [name]: { [Op.gt]: values } });
      break;
    case 5: // Mayor o igual que (>=)
      handleGreaterThanOrEqualCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 6: // Contiene (LIKE)
      handleLikeCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 7: // No contiene (NOT LIKE)
      handleNotLikeCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 8: // Comienza con (StartsWith)
      handleStartsWithCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 9: // No comienza con (NotStartsWith)
      handleNotStartsWithCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 10: // Termina con (EndsWith)
      handleEndsWithCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 11: // No termina con (NotEndsWith)
      handleNotEndsWithCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 12: // Contiene (Any)
      condicionesOr[Op.and].push({ [name]: { [Op.contains]: values } });
      break;
    case 13: // Contiene (Any)
      condicionesOr[Op.and].push({ [name]: { [Op.any]: values } });
      break;
    case 14: // Contiene (JSONB)
      handleJsonbCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    case 15: // Operación dinámica (CUSTOM)
      handleCustomOperation(name, values, condicionesOr[Op.and], priorityCondition);
      break;
    default:
      handleDefaultCondition(name, values, condicionesOr[Op.and], priorityCondition);
      break;
  };
};

/**
 * Igual (=) :: Aplica la condición de igualdad al campo especificado.
 * Si los valores son un array y contienen más de un elemento, utiliza la condición "IN".
 * De lo contrario, asigna directamente el valor al campo.
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleEqualCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionEqual = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionEqual[priorityCondition] = [
        { [name]: { [Op.in]: values } }
      ];
    } else {
      conditionEqual[priorityCondition] = [
        { [name]: values[0] }
      ];
    }
  } else {
    conditionEqual[priorityCondition] = [
      { [name]: values }
    ];
  }
  condicionesOr.push(conditionEqual);
};

/**
 * Mayor o igual que (>=) :: Lógica para el operador mayor o igual que
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleGreaterThanOrEqualCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionGreaterThanOrEqual = {};
  if (Array.isArray(values)) {
    conditionGreaterThanOrEqual[priorityCondition] = [
      { [name]: { [Op.gte]: values } }
    ];
  } else {
    conditionGreaterThanOrEqual[Op.or] = [
      ...conditionGreaterThanOrEqual[Op.or] || [],
      { [name]: { [Op.gte]: values, [Op.ne]: null } }
    ];
  }
  condicionesOr.push(conditionGreaterThanOrEqual);
};

/**
 * Contiene (LIKE) :: Lógica para el operador de Contiene (LIKE)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleLikeCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionLike = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionLike[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.iLike]: `%${val}%` })) } }
      ];
    } else {
      conditionLike[priorityCondition] = [
        { [name]: { [Op.iLike]: `%${values[0]}%` } }
      ];
    }
  } else {
    conditionLike[priorityCondition] = [
      { [name]: { [Op.iLike]: `%${values}%` } }
    ];
  }
  condicionesOr.push(conditionLike);
};

/**
 * No contiene (NOT LIKE) :: Lógica para el operador de No contiene (NOT LIKE)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleNotLikeCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionNotLike = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionNotLike[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.notILike]: `%${val}%` })) } }
      ];
    } else {
      conditionNotLike[priorityCondition] = [
        { [name]: { [Op.notILike]: `%${values[0]}%` } }
      ];
    }
  } else {
    conditionNotLike[priorityCondition] = [
      { [name]: { [Op.notILike]: `%${values}%` } }
    ];
  }
  condicionesOr.push(conditionNotLike);
};

/**
 * Comienza con (StartsWith) :: Lógica para el operador de comienza con (EndsWith)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleStartsWithCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionStartsWith = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionStartsWith[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.iLike]: `${val}%` })) } }
      ];
    } else {
      conditionStartsWith[priorityCondition] = [
        { [name]: { [Op.iLike]: `${values[0]}%` } }
      ];
    }
  } else {
    conditionStartsWith[priorityCondition] = [
      { [name]: { [Op.iLike]: `${values}%` } }
    ];
  }
  condicionesOr.push(conditionStartsWith);
};

/**
 * No comienza con (NotStartsWith) :: Lógica para el operador de No termina con (NotEndsWith)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleNotStartsWithCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionNotStartsWith = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionNotStartsWith[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.notILike]: `${val}%` })) } }
      ];
    } else {
      conditionNotStartsWith[priorityCondition] = [
        { [name]: { [Op.notILike]: `${values[0]}%` } }
      ];
    }
  } else {
    conditionNotStartsWith[priorityCondition] = [
      { [name]: { [Op.notILike]: `${values}%` } }
    ];
  }
  condicionesOr.push(conditionNotStartsWith);
};

/**
 * Termina con (EndsWith) :: Lógica para el operador cuando termina con (EndsWith)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleEndsWithCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionEndsWith = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionEndsWith[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.iLike]: `%${val}` })) } }
      ];
    } else {
      conditionEndsWith[priorityCondition] = [
        { [name]: { [Op.iLike]: `%${values[0]}` } }
      ];
    }
  } else {
    conditionEndsWith[priorityCondition] = [
      { [name]: { [Op.iLike]: `%${values}` } }
    ];
  }
  condicionesOr.push(conditionEndsWith);
};

/**
 * No termina con (NotEndsWith) :: Lógica para el operador de No termina con (NotEndsWith)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleNotEndsWithCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionNotEndsWith = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionNotEndsWith[priorityCondition] = [
        { [name]: { [Op.or]: values.map(val => ({ [Op.notILike]: `%${val}` })) } }
      ];
    } else {
      conditionNotEndsWith[priorityCondition] = [
        { [name]: { [Op.notILike]: `%${values[0]}` } }
      ];
    }
  } else {
    conditionNotEndsWith[priorityCondition] = [
      { [name]: { [Op.notILike]: `%${values}` } }
    ];
  }
  condicionesOr.push(conditionNotEndsWith);
};

/**
 * Contiene (JSONB) :: Lógica para el operador de Contiene (JSONB)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleJsonbCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionJsonb = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionJsonb[Op.or] = [
        ...conditionJsonb[Op.or] || [],
        ...values.map(value => ({
          [Op.and]: Sequelize.literal(`"${capitalizeFirstLetter(name)}"::text LIKE '%${value}%'`),
        }))
      ];
    } else {
      conditionJsonb[Op.or] = [
        ...conditionJsonb[Op.or] || [],
        { [Op.and]: Sequelize.literal(`"${capitalizeFirstLetter(name)}"::text LIKE '%${values[0]}%'`) }
      ];
    }
  } else {
    conditionJsonb[Op.or] = [
      ...conditionJsonb[Op.or] || [],
      { [Op.and]: Sequelize.literal(`"${capitalizeFirstLetter(name)}"::text LIKE '%${values}%'`) }
    ];
  }
  condicionesOr.push(conditionJsonb);
};

/**
 * Operación dinámica (CUSTOM) :: Lógica para el operador de Operación dinámica (CUSTOM)
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleCustomOperation = (name, values, condicionesOr, priorityCondition) => {
  let conditionCustom = {};
  conditionCustom[Op.or] = [
    ...conditionCustom[Op.or] || [],
    ...values
  ];
  condicionesOr.push(conditionCustom);
};

/**
 * Caso predeterminado :: Lógica para el caso predeterminado
 * @param {string} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {Array|string} values - Los valores con los cuales comparar el campo.
 * @param {object} condicionesOr - El objeto de condiciones OR en el cual se almacenarán las condiciones generadas.
 */
const handleDefaultCondition = (name, values, condicionesOr, priorityCondition) => {
  let conditionDefault = {};
  if (Array.isArray(values)) {
    if (values.length > 1) {
      conditionDefault[priorityCondition] = [
        { [name]: { [Op.in]: values } }
      ];
    } else {
      conditionDefault[priorityCondition] = [
        { [name]: { [Op.iLike]: `%${values[0]}%` } }
      ];
    }
  } else {
    conditionDefault[priorityCondition] = [
      { [name]: { [Op.iLike]: `%${values}%` } }
    ];
  }
  condicionesOr.push(conditionDefault);
};

/**
 * Función para agregar condiciones de fechas al objeto de búsqueda
 * @param {*} name - El nombre del campo sobre el cual se aplicará la condición.
 * @param {*} values - Valores para la condición de búsqueda.
 * @param {*} condicionesOr - El objeto de condiciones OR al que se agregarán las condiciones de fecha.
 * @param {object} model - Modelo Sequelize.
 */
const createConditionDate = (name, values, conditionOr, model) => {
  if (Array.isArray(values)) {
    const [startDate, endDate] = values;
    if (values.length > 1) {
      conditionBetweenDate(name, startDate, endDate, conditionOr);
    } else {
      conditionSingleDate(name, startDate, conditionOr, model);
    }
  } else if (typeof values === 'string') {
    conditionSingleDate(name, values, conditionOr, model);
  }
};

/**
 * Formatea una cadena de fecha del formato "DD/MM/YYYY" al formato "YYYY-MM-DD".
 * @param {string} dateString La cadena de fecha en formato "DD/MM/YYYY".
 * @returns {string} La cadena de fecha formateada en formato "YYYY-MM-DD".
 */
const formatDateString = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const formattedDate = (day && month && year) ? `${year}-${month}-${day}` : dateString;
  return formattedDate;
};

/**
 * Crea una condición de rango de fecha para una consulta.
 * @param {string} name El nombre del campo de fecha.
 * @param {string} startDate La fecha de inicio del rango.
 * @param {string} endDate La fecha de fin del rango.
 * @param {object} conditionOr El objeto de condiciones OR al que se agregarán las condiciones de fecha.
 */
const conditionBetweenDate = (name, startDate, endDate, conditionOr) => {
  const formattedStartDate = formatDateString(startDate);
  const formattedEndDate = formatDateString(endDate);
  conditionOr[Op.and] = [
    ...conditionOr[Op.and] || [],
    Sequelize.literal(`DATE("${name}" AT TIME ZONE 'America/Bogota') BETWEEN '${formattedStartDate}'::DATE AND '${formattedEndDate}'::DATE`)
  ];
};

/**
 * Crea una condición de fecha individual para una consulta.
 * @param {string} name El nombre del campo de fecha.
 * @param {string} dateString La fecha en formato "DD/MM/YYYY".
 * @param {object} conditionOr El objeto de condiciones OR al que se agregarán las condiciones de fecha.
 * @param {object} model - Modelo Sequelize.
 */
const conditionSingleDate = (name, dateString, conditionOr, model) => {
  const formattedDate = formatDateString(dateString);
  const nameLower = capitalizeFirstLower(name);
  const fieldDataType = model.rawAttributes[nameLower].type.constructor.key;

  let literalFilter;

  if (fieldDataType === 'DATEONLY') {
    literalFilter = Sequelize.literal(`DATE("${name}") = '${formattedDate}'::DATE`);
  } else {
    literalFilter = Sequelize.literal(`DATE("${name}" AT TIME ZONE 'America/Bogota') = '${formattedDate}'::DATE`);
  }

  conditionOr[Op.and] = [
    ...conditionOr[Op.and] || [],
    literalFilter
  ];
};

/**
 * Función para agregar condiciones de búsqueda a las relaciones incluidas en Sequelize.
 * @param {string} name - Nombre de la propiedad o relación a la que se aplicarán las condiciones.
 * @param {Array} values - Valores para la condición de búsqueda.
 * @param {number} operator - Operador para la condición de búsqueda.
 * @param {Array} include - Array de objetos de inclusión de Sequelize.
 */
const createConditionRelation = (name, values, operator, include) => {
  /**
   * Función interna para agregar condiciones de búsqueda a las relaciones incluidas de forma recursiva.
   * @param {Object} objectInclude - Objeto de inclusión de Sequelize.
   * @param {string} name - Nombre de la propiedad o relación.
   * @param {Array} values - Valores para la condición de búsqueda.
   * @param {number} operator - Operador para la condición de búsqueda.
   */
  const addConditionsRelationOr = (objectInclude, name, values, operator) => {
    // Obtener el nombre de la relación o el nombre del modelo si no hay un alias
    const relationKey = objectInclude.as || (objectInclude.model.name.charAt(0).toLowerCase() + objectInclude.model.name.slice(1));
    const relationNames = name.split('.');
    const relationNameLast = relationNames[relationNames.length - 2];
    const propertyName = relationNames[relationNames.length - 1];

    if (relationKey === relationNameLast) {
      // Verificar si el objeto incluye ya tiene condiciones where
      if (!objectInclude.where) {
        objectInclude.where = {};
      }

      // Crear la condición
      createCondition(propertyName, values, operator, objectInclude.where);
    }

    // Verificar si el objeto tiene una propiedad "include" y es un array
    if (objectInclude.include && Array.isArray(objectInclude.include)) {
      // Recorrer cada objeto dentro de la propiedad "include" y llamar a la función recursiva
      objectInclude.include.forEach((subInclude) => {
        addConditionsRelationOr(subInclude, name, values, operator);
      });
    }
  }

  // Aplicar la función recursiva a cada objeto en el array
  include.forEach((objectInclude) => {
    addConditionsRelationOr(objectInclude, name, values, operator);
  });
};

/**
 * Función para crea una cláusula ORDER BY para propiedades anidadas.
 * @param {*} order - La cláusula ORDER BY actual.
 * @param {*} orderBy - Objeto que contiene información sobre la propiedad y la dirección del orden.
 */
const createOrderRelation = (order = [], orderBy = {}, include = []) => {
  // Función para verificar si un objeto o alguno de sus objetos internos tiene la propiedad "as" con un valor específico
  const hasPropertyAs = (objInclude, asName = '') => {
    // Verificar si el objeto actual tiene la propiedad "as" con el valor específico
    if (objInclude.as && objInclude.as === asName) {
      return true;
    }
    // Si el objeto tiene un array "include", verificar recursivamente cada elemento dentro de "include"
    if (objInclude.include && Array.isArray(objInclude.include)) {
      // Verificar recursivamente para cada elemento dentro de include
      for (const subObjectInclude of objInclude.include) {
        if (hasPropertyAs(subObjectInclude, asName)) {
          return true;
        }
      }
    }
    // La propiedad "as" no se encontró en este objeto o sus objetos internos
    return false;
  };
  // Divide la cadena orderBy en nombres de relaciones
  const relationNames = orderBy.orderBy.split('.');
  // Remueve y devuelve el último elemento
  const propertyName = relationNames.pop();
  // Verificar cada nombre de relación y capitalizar la primera letra si no se encuentra en ninguna propiedad "as"
  relationNames.forEach((relName, index) => {
    // Verificar si algún elemento en "include" tiene la propiedad "as" con el valor de "relName"
    const hasAsName = include.some(objInclude => hasPropertyAs(objInclude, relName));
    // Si no se encontró ninguna propiedad "as" con el valor de "relName", capitalizar la primera letra
    if (!hasAsName) {
      relationNames[index] = capitalizeFirstLetter(relName);
    }
  });
  // Construye la expresión de atributo
  const attributeExpression = `"${relationNames.join('->')}"."${capitalizeFirstLetter(propertyName)}"`;
  // Agrega la cláusula ORDER BY al array order
  order.push([Sequelize.literal(attributeExpression), orderBy.direcOrder.toUpperCase()]);
};

/**
 * Capitaliza la primera letra de una cadena.
 * @param {string} string - La cadena a capitalizar.
 * @returns {string} La cadena con la primera letra en mayúscula.
 */
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Capitaliza la primera letra de una cadena.
 * @param {string} string - La cadena a capitalizar.
 * @returns {string} La cadena con la primera letra en minuscula.
 */
const capitalizeFirstLower = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
 * Construye un array de atributos con expresiones Sequelize.literal para las propiedades incluidas.
 * @param {Array} include - Configuración de las propiedades incluidas.
 * @param {Array} [attributes=[]] - Array opcional de atributos existentes a los que se agregarán los nuevos atributos construidos.
 *
 * @example
 * const include = [
 *   {
 *     model: Model_1,
 *     as: "model_1",
 *     attributes: ["id", "title"],
 *     include: [
 *       {
 *         model: Model_2,
 *         as: "model_2",
 *         attributes: ["id", "title"],
 *       }
 *     ]
 *   }
 * ];
 *
 * const attributes = [];
 * buildAttributesWithIncludes(include, attributes);
 *
 * @returns {void}
 */
const buildAttributesWithIncludes = (include = [], attributes = []) => {
  /**
   * Construye los atributos para una propiedad incluida.
   * @param {Object} objectInclude - Configuración de la propiedad incluida.
   * @param {string} [prefixLiteral=''] - Prefijo para los nombres de atributos.
   * @returns {void}
   */
  const buildIncludeAttributes = (objectInclude, prefixLiteral = '') => {
    // Verificar si objectInclude.as está definido, de lo contrario, agregar "s" al final de objectInclude.model.name
    const modelName = objectInclude.as || (objectInclude.model.name);

    if (objectInclude.attributes && Array.isArray(objectInclude.attributes)) {
      objectInclude.attributes.forEach((attribute) => {
        // Capitaliza la primera letra del atributo
        const attributeLetter = Array.isArray(attribute) ? capitalizeFirstLetter(attribute[1]): capitalizeFirstLetter(attribute);
        const alias = `${(objectInclude.as || capitalizeFirstLower(objectInclude.model.name))}${attributeLetter}`;
        // Construir la expresión del atributo considerando la estructura anidada solo si hay includes anidados
        const attributeExpression = prefixLiteral ? `"${prefixLiteral}->${modelName}"."${attributeLetter}"` : `"${modelName}"."${attributeLetter}"`;
        attributes.push([Sequelize.literal(attributeExpression), alias]);
      });
    }

    // Verificar si el objeto tiene una propiedad "include" y es un array, construye sus atributos de manera recursiva
    if (objectInclude.include && Array.isArray(objectInclude.include)) {
      // Construir el nuevo prefijoLiteral para la recursión
      const subPrefixLiteral = prefixLiteral ? `${prefixLiteral}->${modelName}` : `${modelName}`;
      // Recorrer cada objeto dentro de la propiedad "include" y llamar a la función recursiva
      objectInclude.include.forEach((subObjectInclude) => {
        buildIncludeAttributes(subObjectInclude, subPrefixLiteral);
      });
    }
  };

  // Itera sobre las propiedades incluidas y construye sus atributos
  include.forEach((objectInclude) => {
    buildIncludeAttributes(objectInclude);
  });
};

/**
 * Eliminar propiedades de relaciones anidadas dinámicamente
 * @param {*} row
 */
const cleanPropertiesRows = (row) => {
  // Obtener las propiedades relacionadas
  const relatedKeys = row._options.includeMap ? Object.keys(row._options.includeMap) : [];
  // Filtrar y eliminar las propiedades relacionadas
  Object.keys(row.dataValues).filter(key => relatedKeys.includes(key)).forEach(key => delete row.dataValues[key]);
};

/**
 * Función para validar si una cadena es una fecha válida
 * @param {*} dateString
 * @returns
 */
const isValidDate = (dateString) => {
  if (typeof dateString !== 'string') {
    return false; // No es una cadena, por lo tanto no es una fecha válida
  }
  const regexDate = /^\d{2}\/\d{2}\/\d{4}$/;
  const [day, month, year] = dateString.split("/");
  const formattedDate = new Date(`${month}/${day}/${year}`);
  return regexDate.test(dateString) && !isNaN(Date.parse(formattedDate));
};

/**
 * Aplica la lógica de los filtros a un filtro específico.
 * @param {Object} filter - El filtro al que se aplicará la lógica.
 */
const applyColumnsFiltersLogic = (filter) => {
  // Extraer el nombre y los valores del filtro
  const { name, values } = filter;
  // Verificar si el filtro se refiere a "createdAt" o "updatedAt"
  if (name === "createdAt" || name === "updatedAt") {
    // Verificar si los valores son un array
    if (Array.isArray(values)) {
      // Obtener la fecha de inicio del array de valores
      const startDate = new Date(values[0]);
      // Obtener el día, mes y año de la fecha
      const day = startDate.getDate();
      const month = (startDate.getMonth() + 1);
      const year = startDate.getFullYear();
      // Formatear la fecha en el formato "DD/MM/YYYY"
      const formattedDate = `${(day < 10 ? '0' : '')}${day}/${(month < 10 ? '0' : '')}${month}/${year}`;
      // Actualizar los valores del filtro con la fecha formateada
      filter.values = formattedDate;
    }
  }
};

/**
 * Establece valores por defecto para orderBy y direcOrder en el objeto filters si no están definidos o son inválidos.
 * @param {*} filters - Objeto que contiene los filtros, incluyendo orderBy y direcOrder.
 * @param {*} defaultOrderBy - Valor por defecto para orderBy si no está definido o es inválido.
 * @param {*} defaultDirecOrder - Valor por defecto para direcOrder si no está definido o es inválido.
 */
const setDefaultOrderBy = (filters, defaultOrderBy = 'id', defaultDirecOrder = 'ASC') => {
  // Verificar si filters.orderBy está definido y si orderBy y direcOrder tienen valores válidos
  if (
    (!filters?.orderBy?.orderBy || !filters?.orderBy?.direcOrder) || // Si filters.orderBy no está definido o alguna de sus propiedades no está definida
    (filters.orderBy.orderBy === null || filters.orderBy.orderBy === "") || // Si orderBy es null o una cadena vacía
    (filters.orderBy.direcOrder === null || filters.orderBy.direcOrder === "") // Si direcOrder es null o una cadena vacía
  ) {
    // Establecer los valores por defecto proporcionados o los valores predeterminados de 'id' y 'ASC'
    filters.orderBy = {
      orderBy: defaultOrderBy,
      direcOrder: defaultDirecOrder
    };
  }
};

/**
 * Método para definir las columnas del Excel de manera dinámica y agregar los datos a las filas del Excel.
 * @param {*} model - Modelo Sequelize.
 * @param {*} rows - Un array que contiene los datos de la consulta para el modelo Sequelize.
 * @param {*} include - Un array que contiene las columnas del Excel.
 * @param {*} customOptions - Un objeto que representa las opciones custom.
 */
const createColumnsAndRowsToExcel = (model, rows, include, customOptions) => {
  // Obtener el nombre del modelo desde el objeto Sequelize
  const modelName = model.tableName;
  // Obtener traducciones según el idioma actual
  const columnHeaders = i18n.__(`${modelName}`)['ColumnHeaders'];

  // Configurar iniciales para el return
  let excelColumns = [];
  let excelRows = [];

  // Verificar si la consulta retornó resultados
  if (rows && rows.length > 0) {
    // Crear un array de strings con las claves excluyendo objetos (Relaciones)
    const attributesKeys = Object.keys(rows[0].dataValues).filter(function(key) {
      return !rows[0]._options.includeMap[key];
    });
    // Definir las columnas del Excel de manera dinámica
    excelColumns = createExcelColumns(attributesKeys, include, columnHeaders, customOptions);
    // Agregar los datos a las filas del Excel
    excelRows = createExcelRows(rows, attributesKeys, include, customOptions);
  }

  // Devolver los resultados paginados y la información de paginación
  return { excelColumns, excelRows };
};

/**
 * Definir las columnas y de relaciones del Excel de manera dinámica
 * @param {*} columns - Un array que contiene las columnas del Excel.
 * @param {*} relations - Un array que contiene las columnas del Excel.
 * @param {*} columnHeaders - Un objeto que representa la cabecera para cada columna del excel.
 * @param {*} customOptions - Un objeto que representa las opciones custom.
 * @returns {Array} - Un array que contiene las columnas y relaciones definidas.
 */
const createExcelColumns = (columns, relations, columnHeaders, customOptions) => {
  const excelColumns = [];

  const processRelation = (relation) => {
    // Obtener el nombre de la relación o el nombre del modelo si no hay un alias
    const relationKey = relation.as || capitalizeFirstLower(relation.model.name);

    // Verificar si la relación está presente en el registro
    if (relationKey && relation.attributes && relation.attributes.length >= 1) {
      excelColumns.push({
        header: (columnHeaders[relationKey] || relationKey).toUpperCase(),
        key: relationKey,
        width: 20
      });
    }

    // Verificar si la relación tiene un include
    if (relation.include && relation.include.length > 0) {
      relation.include.forEach(innerRelation => {
        processRelation(innerRelation);
      });
    }
  };

  // Definir las columnas del Excel de manera dinámica para las columnas principales
  columns.forEach(column => {
    excelColumns.push({
      header: (columnHeaders[column] || column).toUpperCase(),
      key: column,
      width: 20 // Puedes ajustar el ancho según tus necesidades
    });
  });

  // Agregar las columnas de las relaciones al Excel
  if (customOptions?.autoInclude) {
    relations.forEach(relation => {
      processRelation(relation);
    });
  }

  return excelColumns;
};

/**
 * Agregar los datos a las filas del Excel
 * @param {*} records - Un array de registros que se agregarán a las filas del Excel.
 * @param {*} columns - Un array que contiene las columnas del Excel.
 * @param {*} relations - Un objeto que representa las relaciones entre las columnas y los datos.
 * @param {*} customOptions - Un objeto que representa las opciones custom.
 */
const createExcelRows = (records, columns, relations, customOptions) => {
  const excelRows = [];

  const processRelation = (record, relation, excelRow) => {
    // Obtener el nombre de la relación o el nombre del modelo si no hay un alias
    const relationKey = relation.as || relation.model.name;

    // Verificar si la relación está presente en el registro
    if (record[relationKey] && relation.attributes && relation.attributes.length >= 1) {
      const relationData = record[relationKey].dataValues;
      const concatenatedAttributes = relation.attributes.map(attribute => relationData[attribute]).join(' - ');
      const key = relation.as ? `${relation.as}` : capitalizeFirstLower(`${relation.model.name}`);
      excelRow[key] = concatenatedAttributes;
    }

    // Verificar si la relación tiene un include
    if (relation.include && relation.include.length > 0) {
      relation.include.forEach(innerRelation => {
        processRelation(record[relationKey], innerRelation, excelRow);
      });
    }
  };

  // Agregar los datos a las filas del Excel
  records.forEach(record => {
    const excelRow = {};

    // Agregar las columnas principales
    columns.forEach(column => {
      excelRow[column] = record[column] || record.dataValues[column];
    });

    // Agregar las columnas de las relaciones
    if (customOptions?.autoInclude) {
      relations.forEach(relation => {
        processRelation(record, relation, excelRow);
      });
    }

    // Agregar la fila al Excel
    excelRows.push(excelRow);
  });

  return excelRows;
};

module.exports = {
  addOrUpdateFilterSearchs,
  createOrder,
  createTypeCondition,
  buildAttributesWithIncludes,
  cleanPropertiesRows,
  capitalizeFirstLetter,
  capitalizeFirstLower,
  applyColumnsFiltersLogic,
  setDefaultOrderBy,
  createColumnsAndRowsToExcel,
  formatDateString,
};
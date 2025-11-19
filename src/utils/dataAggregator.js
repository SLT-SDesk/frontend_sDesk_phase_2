// utils/dataAggregator.js
// Utility functions to aggregate incident data by status and category hierarchy

/**
 * Aggregates incident data by status and category hierarchy.
 * @param {Array} incidents - Array of incident objects.
 * @param {Array} mainCategories - Array of main category objects.
 * @param {Array} categories - Array of category objects.
 * @param {Array} categoryItems - Array of category item objects.
 * @returns {Object} Aggregated data object.
 */
export function aggregateIncidentData({
  incidents,
  mainCategories,
  categories,
  categoryItems,
}) {
  // Helper: group by key
  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      const k = item[key];
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});

  // Total counts
  const totalClosed = incidents.filter((i) => i.status === "Closed").length;
  const totalOthers = incidents.length - totalClosed;

  // Main Category-wise
  const mainCategoryCounts = {};
  mainCategories.forEach((mc) => {
    const relatedCategories = categories.filter(
      (c) => c.mainCategoryId === mc.id
    );
    const relatedCategoryIds = relatedCategories.map((c) => c.id);
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.mainCategory.id === mc.id)
      .map((item) => item.name);
    const countClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const countOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    mainCategoryCounts[mc.id] = {
      name: mc.name,
      closed: countClosed,
      others: countOthers,
    };
  });

  // Category-wise
  const categoryCounts = {};
  categories.forEach((cat) => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.id === cat.id)
      .map((item) => item.name);
    const countClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const countOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    categoryCounts[cat.id] = {
      name: cat.name,
      closed: countClosed,
      others: countOthers,
    };
  });

  // Category Item-wise
  const categoryItemCounts = {};
  categoryItems.forEach((item) => {
    const countClosed = incidents.filter(
      (i) => i.category === item.name && i.status === "Closed"
    ).length;
    const countOthers = incidents.filter(
      (i) => i.category === item.name && i.status !== "Closed"
    ).length;
    categoryItemCounts[item.id] = {
      name: item.name,
      closed: countClosed,
      others: countOthers,
    };
  });

  return {
    total: { closed: totalClosed, others: totalOthers },
    mainCategory: mainCategoryCounts,
    category: categoryCounts,
    categoryItem: categoryItemCounts,
  };
}

export function getTeamWiseSummary({ incidents, categories, categoryItems }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };

  const categorySummary = categories.map(cat => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.id === cat.id)
      .map((item) => item.name);
    const catClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const catOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    return {
      team: cat.name,
      total: catClosed + catOthers,
      closed: catClosed,
      others: catOthers,
    };
  });

  return [allTeam, ...categorySummary];
}

//get main category wise summary export function
export function getMainCategoryWiseSummary({ incidents, mainCategories, categories, categoryItems }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };

  const mainCategorySummary = mainCategories.map(mc => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.mainCategory.id === mc.id)
      .map((item) => item.name);
    const mcClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const mcOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;

    return {
      team: mc.name,
      total: mcClosed + mcOthers,
      closed: mcClosed,
      others: mcOthers,
    };
  });

  return [allTeam, ...mainCategorySummary];
}

//Pie Chart Component data
export function getPieChartData({ incidents, mainCategories, categories, categoryItems }){
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };

  const mainCategorySummary = mainCategories.map(mc => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.mainCategory.id === mc.id)
      .map((item) => item.name);
    const mcClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const mcOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;

    return {
      name: mc.name,
      value: (mcClosed + mcOthers) / incidents.length * 100,
      total: mcClosed + mcOthers
    };
  });

  return [...mainCategorySummary];
}

export function getCategoryitemWiseSummary({ incidents, categoryItems }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };

  const categoryItemSummary = categoryItems.map(ci => {
    const ciClosed = incidents.filter(
      (i) => i.category === ci.name && i.status === "Closed"
    ).length;
    const ciOthers = incidents.filter(
      (i) => i.category === ci.name && i.status !== "Closed"
    ).length;

    return {
      cId: ci.id,
      cItem: ci.name,
      total: ciClosed + ciOthers,
      percentage: incidents.length ? ((ciClosed + ciOthers) / incidents.length * 100).toFixed(2) : 0,
    };
  });

  return [...categoryItemSummary];
}

export function getDistributionTableData({ incidents, categories, categoryItems, selectedTeam }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };
if (selectedTeam === "All Teams") return [];
  const relatedCategories = categories.filter(cat => cat.mainCategory.name === selectedTeam);
  const categorySummary = relatedCategories.map(cat => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.id === cat.id)
      .map((item) => item.name);
    const catClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const catOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    return {
      id: cat.id,
      category: cat.name,
      incidentCount: catClosed + catOthers,
      percentage: incidents.length ? ((catClosed + catOthers) / incidents.length * 100).toFixed(2) : 0,
    };
  });

  return [...categorySummary];
}

export function getBarChartData({ incidents, categories, categoryItems, selectedTeam }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };

  if (selectedTeam === "All Teams") return [];
  const relatedCategories = categories.filter(cat => cat.mainCategory.name === selectedTeam);
  const categorySummary = relatedCategories.map(cat => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.id === cat.id)
      .map((item) => item.name);
    const catClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const catOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    return {
      name: cat.name,
      value: (catClosed + catOthers) / incidents.length * 100,
    };
  });

  return [...categorySummary];
}

export function getSelectedCategoryItemsDatabyCategoryId({ incidents, categories, categoryItems, categoryId }) {
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  if (!selectedCategory) return [];
  const relatedCategoryItemsNames = categoryItems
    .filter((ci) => ci.subCategory.id === selectedCategory.id)
    .map((item) => item.name);
  const categoryItemSummary = categoryItems
    .filter(ci => relatedCategoryItemsNames.includes(ci.name))
    .map(ci => {
      const ciClosed = incidents.filter(
        (i) => i.category === ci.name && i.status === "Closed"
      ).length;
      const ciOthers = incidents.filter(
        (i) => i.category === ci.name && i.status !== "Closed"
      ).length;
      return {
        id: ci.id,
        category: ci.name,
        incidentCount: ciClosed + ciOthers,
        percentage: incidents.length ? ((ciClosed + ciOthers) / incidents.length * 100).toFixed(2) : 0,
        category_item_code: ci.category_code,
        createdAt: ci.createdAt,
        updatedAt: ci.updatedAt,
        subCategoryId: ci.subCategory.id,
        mainCategoryId: ci.subCategory.mainCategory.id,
      };
    });

  return [...categoryItemSummary];
}

//monthly summary of each main categories and all teams result as broadforward, carriedforward, closed , others
export function getMonthlySummary({ incidents, mainCategories, categoryItems, months }) {
  const monthlySummary = {
    allTeams: {
      BF: Array(months.length).fill(0),
      CF: Array(months.length).fill(0),
      Closed: Array(months.length).fill(0),
      Reported: Array(months.length).fill(0),
    },
  };

  mainCategories.forEach((category) => {
    monthlySummary[category.id] = {
      name: category.name,
      BF: Array(months.length).fill(0),
      CF: Array(months.length).fill(0),
      Closed: Array(months.length).fill(0),
      Reported: Array(months.length).fill(0),
    };
  });

  incidents.forEach((incident) => {
    const monthIndex = months.indexOf(new Date(incident.update_on).toLocaleString('default', { month: 'long' }));
    if (monthIndex === -1) return;

    const categoryItem = categoryItems.find(ci => ci.name === incident.category);
    const categoryId = categoryItem ? categoryItem.subCategory.mainCategory.id : null;
    if (monthlySummary[categoryId]) {
      monthlySummary[categoryId][incident.status][monthIndex]++;
    }
    monthlySummary.allTeams[incident.status][monthIndex]++;
  });

  return [...monthlySummary];
}

//get incidents filtered by main category name
export function filterIncidentsByMainCategory({ incidents, mainCategories, categoryItems, mainCategoryName }) {
  const mainCategory = mainCategories.find(mc => mc.name === mainCategoryName);
  if (!mainCategory) return [];
  const relatedCategoryItemsNames = categoryItems
    .filter((ci) => (ci.subCategory.mainCategory.id) === (mainCategory.id))
    .map((item) => item.name);
  return incidents.filter((i) => relatedCategoryItemsNames.includes(i.category));
}

//
export function getDistributionTableAllData({ incidents, categories, categoryItems, selectedTeam }) {
  const closed = incidents.filter(i => i.status === "Closed").length;
  const others = incidents.length - closed;
  const allTeam = { team: "All Team", total: incidents.length, closed, others };
if (selectedTeam === "All Teams") return [];
  const relatedCategories = categories.filter(cat => cat.mainCategory.name === selectedTeam);
  const categorySummary = relatedCategories.map(cat => {
    const relatedCategoryItemsNames = categoryItems
      .filter((ci) => ci.subCategory.id === cat.id)
      .map((item) => item.name);
    const catClosed = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status === "Closed"
    ).length;
    const catOthers = incidents.filter(
      (i) => relatedCategoryItemsNames.includes(i.category) && i.status !== "Closed"
    ).length;
    return {
      id: cat.id,
      category: cat.name,
      incidentCount: catClosed + catOthers,
      percentage: incidents.length ? ((catClosed + catOthers) / incidents.length * 100).toFixed(2) : 0,
      category_code: cat.category_code,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      mainCategoryId: cat.mainCategory.id,
    };
  });

  return [...categorySummary];
}
import Transaction from '../transactions/transaction.model.js';
import Sale from '../sales/sale.model.js';
import Product from '../products/product.model.js';

/*
|--------------------------------------------------------------------------
| Date Range
|--------------------------------------------------------------------------
*/

const getDateRange = ({
  from,
  to,
} = {}) => {
  const now = new Date();

  let startDate;
  let endDate;

  if (from) {
    startDate = new Date(from);
  } else {
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  if (to) {
    endDate = new Date(to);
  } else {
    endDate = now;
  }

  // Make sure the entire "to" day is included.
  endDate.setHours(
    23,
    59,
    59,
    999
  );

  return {
    startDate,
    endDate,
  };
};

/*
|--------------------------------------------------------------------------
| Financial Report
|--------------------------------------------------------------------------
*/

const getFinancialReport = async (
  query = {}
) => {
  const {
    startDate,
    endDate,
  } = getDateRange(query);

  const result =
    await Transaction.aggregate([
      {
        $match: {
          // IMPORTANT:
          // Transaction model uses `date`,
          // not `transactionDate`.
          date: {
            $gte: startDate,
            $lte: endDate,
          },

          type: {
            $in: [
              'income',
              'expense',
            ],
          },
        },
      },

      {
        $group: {
          _id: '$type',

          total: {
            $sum: '$amount',
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

  const income =
    result.find(
      (item) =>
        item._id === 'income'
    );

  const expense =
    result.find(
      (item) =>
        item._id === 'expense'
    );

  const totalIncome =
    income?.total || 0;

  const totalExpenses =
    expense?.total || 0;

  return {
    period: {
      from: startDate,
      to: endDate,
    },

    income: totalIncome,

    expenses: totalExpenses,

    netProfit:
      totalIncome -
      totalExpenses,

    incomeTransactions:
      income?.count || 0,

    expenseTransactions:
      expense?.count || 0,
  };
};

/*
|--------------------------------------------------------------------------
| Sales Report
|--------------------------------------------------------------------------
*/

const getSalesReport = async (
  query = {}
) => {
  const {
    startDate,
    endDate,
  } = getDateRange(query);

  const result =
    await Sale.aggregate([
      {
        $match: {
          saleDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: null,

          totalSales: {
            $sum: 1,
          },

          revenue: {
            $sum: '$totalAmount',
          },

          cost: {
            $sum: '$totalCost',
          },

          profit: {
            $sum: '$totalProfit',
          },
        },
      },
    ]);

  const data =
    result[0] || {};

  return {
    period: {
      from: startDate,
      to: endDate,
    },

    totalSales:
      data.totalSales || 0,

    revenue:
      data.revenue || 0,

    cost:
      data.cost || 0,

    profit:
      data.profit || 0,
  };
};

/*
|--------------------------------------------------------------------------
| Expense Report
|--------------------------------------------------------------------------
*/

const getExpenseReport = async (
  query = {}
) => {
  const {
    startDate,
    endDate,
  } = getDateRange(query);

  const result =
    await Transaction.aggregate([
      {
        $match: {
          // IMPORTANT:
          // Transaction model uses `date`.
          date: {
            $gte: startDate,
            $lte: endDate,
          },

          type: 'expense',
        },
      },

      {
        $group: {
          _id: '$category',

          total: {
            $sum: '$amount',
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $lookup: {
          from: 'categories',

          localField: '_id',

          foreignField: '_id',

          as: 'category',
        },
      },

      {
        $unwind: {
          path: '$category',

          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,

          category: {
            $ifNull: [
              '$category.name',
              'Uncategorized',
            ],
          },

          total: 1,

          count: 1,
        },
      },

      {
        $sort: {
          total: -1,
        },
      },
    ]);

  return {
    period: {
      from: startDate,
      to: endDate,
    },

    categories: result,
  };
};

/*
|--------------------------------------------------------------------------
| Product Performance Report
|--------------------------------------------------------------------------
*/

const getProductReport = async (
  query = {}
) => {
  const {
    startDate,
    endDate,
  } = getDateRange(query);

  const result =
    await Sale.aggregate([
      {
        $match: {
          saleDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $unwind: '$items',
      },

      {
        $group: {
          _id: '$items.product',

          quantitySold: {
            $sum: '$items.quantity',
          },

          revenue: {
            $sum: '$items.subtotal',
          },

          profit: {
            $sum: '$items.profit',
          },
        },
      },

      {
        $lookup: {
          from: 'products',

          localField: '_id',

          foreignField: '_id',

          as: 'product',
        },
      },

      {
        $unwind: '$product',
      },

      {
        $project: {
          _id: 0,

          product: {
            id: '$product._id',

            name: '$product.name',

            sku: '$product.sku',

            unit: '$product.unit',
          },

          quantitySold: 1,

          revenue: 1,

          profit: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

  return {
    period: {
      from: startDate,
      to: endDate,
    },

    products: result,
  };
};

/*
|--------------------------------------------------------------------------
| Inventory Report
|--------------------------------------------------------------------------
*/

const getInventoryReport =
  async () => {
    const products =
      await Product.find()
        .select(
          'name sku unit quantity costPrice sellingPrice lowStockThreshold'
        )
        .sort({
          quantity: 1,
        })
        .lean();

    const report =
      products.map(
        (product) => {
          const quantity =
            product.quantity || 0;

          const costPrice =
            product.costPrice || 0;

          const sellingPrice =
            product.sellingPrice || 0;

          const threshold =
            product.lowStockThreshold ||
            0;

          let status =
            'in_stock';

          if (quantity <= 0) {
            status =
              'out_of_stock';
          } else if (
            quantity <= threshold
          ) {
            status =
              'low_stock';
          }

          return {
            product: {
              id: product._id,

              name: product.name,

              sku: product.sku,

              unit: product.unit,
            },

            quantity,

            status,

            inventoryCost:
              quantity *
              costPrice,

            inventoryValue:
              quantity *
              sellingPrice,
          };
        }
      );

    const summary =
      report.reduce(
        (acc, item) => {
          acc.totalProducts += 1;

          acc.inventoryCost +=
            item.inventoryCost;

          acc.inventoryValue +=
            item.inventoryValue;

          if (
            item.status ===
            'low_stock'
          ) {
            acc.lowStock += 1;
          }

          if (
            item.status ===
            'out_of_stock'
          ) {
            acc.outOfStock += 1;
          }

          return acc;
        },
        {
          totalProducts: 0,
          lowStock: 0,
          outOfStock: 0,
          inventoryCost: 0,
          inventoryValue: 0,
        }
      );

    return {
      summary,

      products: report,
    };
  };

/*
|--------------------------------------------------------------------------
| Overview Report
|--------------------------------------------------------------------------
*/

const getOverviewReport = async (
  query = {}
) => {
  const [
    financial,
    sales,
    expenses,
    products,
    inventory,
  ] = await Promise.all([
    getFinancialReport(query),

    getSalesReport(query),

    getExpenseReport(query),

    getProductReport(query),

    getInventoryReport(),
  ]);

  return {
    financial,
    sales,
    expenses,
    products,
    inventory,
  };
};

export default {
  getFinancialReport,
  getSalesReport,
  getExpenseReport,
  getProductReport,
  getInventoryReport,
  getOverviewReport,
};
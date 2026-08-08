import Transaction from '../transactions/transaction.model.js';
import Sale from '../sales/sale.model.js';
import Product from '../products/product.model.js';
import Account from '../accounts/account.model.js';
import FinancialGoal from '../financial-goals/financial-goal.model.js';

const getDateRange = (from, to) => {
  const endDate = new Date();

  endDate.setHours(23, 59, 59, 999);

  if (to) {
    const parsedTo = new Date(to);

    if (Number.isNaN(parsedTo.getTime())) {
      const error = new Error(
        'Invalid "to" date'
      );

      error.statusCode = 400;

      throw error;
    }

    parsedTo.setHours(23, 59, 59, 999);

    return {
      startDate: from
        ? new Date(from)
        : new Date(0),

      endDate: parsedTo,
    };
  }

  if (from) {
    const parsedFrom = new Date(from);

    if (
      Number.isNaN(
        parsedFrom.getTime()
      )
    ) {
      const error = new Error(
        'Invalid "from" date'
      );

      error.statusCode = 400;

      throw error;
    }

    return {
      startDate: parsedFrom,
      endDate,
    };
  }

  /*
   * Default:
   * Current calendar month.
   */
  const startDate = new Date();

  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate,
  };
};

const getFinancialSummary = async (
  startDate,
  endDate
) => {
  const result =
    await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
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

  let totalRevenue = 0;
  let totalExpenses = 0;
  let incomeTransactions = 0;
  let expenseTransactions = 0;

  for (const item of result) {
    if (item._id === 'income') {
      totalRevenue = item.total;
      incomeTransactions =
        item.count;
    }

    if (item._id === 'expense') {
      totalExpenses = item.total;
      expenseTransactions =
        item.count;
    }
  }

  return {
    totalRevenue,
    totalExpenses,

    netProfit:
      totalRevenue -
      totalExpenses,

    incomeTransactions,
    expenseTransactions,
  };
};

const getAccountSummary = async () => {
  const result =
    await Account.aggregate([
      {
        $group: {
          _id: null,

          totalBalance: {
            $sum: '$balance',
          },

          totalAccounts: {
            $sum: 1,
          },
        },
      },
    ]);

  return {
    totalAccounts:
      result[0]?.totalAccounts || 0,

    totalBalance:
      result[0]?.totalBalance || 0,
  };
};

const getSalesSummary = async (
  startDate,
  endDate
) => {
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

  return {
    totalSales:
      result[0]?.totalSales || 0,

    revenue:
      result[0]?.revenue || 0,

    cost:
      result[0]?.cost || 0,

    profit:
      result[0]?.profit || 0,
  };
};

const getInventorySummary = async () => {
  const result =
    await Product.aggregate([
      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1,
          },

          inventoryValue: {
            $sum: {
              $multiply: [
                '$quantity',
                '$costPrice',
              ],
            },
          },

          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $lte: [
                        '$quantity',
                        '$lowStockThreshold',
                      ],
                    },
                    {
                      $gt: [
                        '$quantity',
                        0,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          outOfStock: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    '$quantity',
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  return {
    totalProducts:
      result[0]?.totalProducts || 0,

    inventoryValue:
      result[0]?.inventoryValue || 0,

    lowStock:
      result[0]?.lowStock || 0,

    outOfStock:
      result[0]?.outOfStock || 0,
  };
};

const getTopProducts = async (
  startDate,
  endDate
) => {
  return Sale.aggregate([
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
      $sort: {
        revenue: -1,
      },
    },

    {
      $limit: 5,
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
          _id: '$product._id',

          name: '$product.name',

          sku: '$product.sku',

          unit: '$product.unit',
        },

        quantitySold: 1,

        revenue: 1,

        profit: 1,
      },
    },
  ]);
};

const getLowStockProducts = async () => {
  return Product.find({
    $expr: {
      $and: [
        {
          $lte: [
            '$quantity',
            '$lowStockThreshold',
          ],
        },
        {
          $gt: [
            '$quantity',
            0,
          ],
        },
      ],
    },
  })
    .select(
      'name sku unit quantity lowStockThreshold'
    )
    .sort({
      quantity: 1,
    })
    .limit(5)
    .lean();
};

const getFinancialGoalSummary =
  async () => {
    const result =
      await FinancialGoal.aggregate([
        {
          $group: {
            _id: '$status',

            count: {
              $sum: 1,
            },

            targetAmount: {
              $sum: '$targetAmount',
            },

            currentAmount: {
              $sum: '$currentAmount',
            },
          },
        },
      ]);

    const summary = {
      active: 0,
      completed: 0,
      cancelled: 0,

      totalTargetAmount: 0,
      totalCurrentAmount: 0,
    };

    for (const item of result) {
      summary[item._id] =
        item.count;

      summary.totalTargetAmount +=
        item.targetAmount;

      summary.totalCurrentAmount +=
        item.currentAmount;
    }

    return summary;
  };

const getRecentTransactions =
  async () => {
    return Transaction.find()
      .populate(
        'account',
        'name type'
      )
      .sort({
        transactionDate: -1,
      })
      .limit(5)
      .select(
        'type amount description transactionDate account'
      )
      .lean();
  };

const getRecentSales = async () => {
  return Sale.find()
    .populate(
      'items.product',
      'name sku unit'
    )
    .populate(
      'account',
      'name type'
    )
    .sort({
      saleDate: -1,
    })
    .limit(5)
    .select(
      'items totalAmount totalProfit saleDate account'
    )
    .lean();
};

const getDashboard = async (
  query = {}
) => {
  const {
    from,
    to,
  } = query;

  const {
    startDate,
    endDate,
  } = getDateRange(
    from,
    to
  );

  /*
   * Execute independent queries
   * concurrently.
   */
  const [
    financialSummary,
    accountSummary,
    salesSummary,
    inventorySummary,
    topProducts,
    lowStockProducts,
    financialGoals,
    recentTransactions,
    recentSales,
  ] = await Promise.all([
    getFinancialSummary(
      startDate,
      endDate
    ),

    getAccountSummary(),

    getSalesSummary(
      startDate,
      endDate
    ),

    getInventorySummary(),

    getTopProducts(
      startDate,
      endDate
    ),

    getLowStockProducts(),

    getFinancialGoalSummary(),

    getRecentTransactions(),

    getRecentSales(),
  ]);

  return {
    period: {
      from: startDate,
      to: endDate,
    },

    summary: financialSummary,

    accounts: accountSummary,

    sales: salesSummary,

    inventory: inventorySummary,

    financialGoals,

    topProducts,

    lowStockProducts,

    recentTransactions,

    recentSales,
  };
};

export default {
  getDashboard,
};
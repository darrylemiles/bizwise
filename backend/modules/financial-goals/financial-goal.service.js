import FinancialGoal from './financial-goal.model.js';
import Account from '../accounts/account.model.js';

const createFinancialGoal = async (
  goalData,
  userId
) => {
  const account =
    await Account.findById(goalData.account);

  if (!account) {
    const error = new Error(
      'Account not found'
    );

    error.statusCode = 404;

    throw error;
  }

  const goal =
    await FinancialGoal.create({
      ...goalData,
      currentAmount: 0,
      createdBy: userId,
    });

  return goal.populate([
    {
      path: 'account',
      select: 'name type balance',
    },
    {
      path: 'createdBy',
      select: 'name username',
    },
  ]);
};

const getFinancialGoals = async ({
  page = 1,
  limit = 10,
  status,
}) => {
  const currentPage = Math.max(
    Number(page),
    1
  );

  const currentLimit = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const skip =
    (currentPage - 1) *
    currentLimit;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const [
    goals,
    total,
  ] = await Promise.all([
    FinancialGoal.find(filter)
      .populate(
        'account',
        'name type balance'
      )
      .populate(
        'createdBy',
        'name username'
      )
      .sort({
        deadline: 1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    FinancialGoal.countDocuments(filter),
  ]);

  return {
    data: goals,

    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(
        total / currentLimit
      ),
      hasNextPage:
        currentPage <
        Math.ceil(
          total / currentLimit
        ),
      hasPreviousPage:
        currentPage > 1,
    },
  };
};

const getFinancialGoalById = async (
  id
) => {
  const goal =
    await FinancialGoal.findById(id)
      .populate(
        'account',
        'name type balance'
      )
      .populate(
        'createdBy',
        'name username'
      );

  if (!goal) {
    const error = new Error(
      'Financial goal not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return goal;
};

const updateFinancialGoal = async (
  id,
  goalData
) => {
  const goal =
    await FinancialGoal.findById(id);

  if (!goal) {
    const error = new Error(
      'Financial goal not found'
    );

    error.statusCode = 404;

    throw error;
  }

  if (goalData.account) {
    const account =
      await Account.findById(
        goalData.account
      );

    if (!account) {
      const error = new Error(
        'Account not found'
      );

      error.statusCode = 404;

      throw error;
    }
  }

  /*
   * Don't allow currentAmount
   * to be modified here.
   */
  Object.assign(goal, goalData);

  /*
   * Automatically mark completed
   * when target is reached.
   */
  if (
    goal.currentAmount >=
    goal.targetAmount
  ) {
    goal.status = 'completed';
  }

  await goal.save();

  return goal.populate([
    {
      path: 'account',
      select: 'name type balance',
    },
    {
      path: 'createdBy',
      select: 'name username',
    },
  ]);
};

const contributeToGoal = async (
  id,
  amount
) => {
  const goal =
    await FinancialGoal.findById(id);

  if (!goal) {
    const error = new Error(
      'Financial goal not found'
    );

    error.statusCode = 404;

    throw error;
  }

  if (goal.status !== 'active') {
    const error = new Error(
      'Only active goals can receive contributions'
    );

    error.statusCode = 400;

    throw error;
  }

  goal.currentAmount += amount;

  if (
    goal.currentAmount >=
    goal.targetAmount
  ) {
    goal.currentAmount =
      goal.targetAmount;

    goal.status = 'completed';
  }

  await goal.save();

  return goal.populate([
    {
      path: 'account',
      select: 'name type balance',
    },
  ]);
};

const deleteFinancialGoal = async (
  id
) => {
  const goal =
    await FinancialGoal.findById(id);

  if (!goal) {
    const error = new Error(
      'Financial goal not found'
    );

    error.statusCode = 404;

    throw error;
  }

  await goal.deleteOne();

  return goal;
};

export default {
  createFinancialGoal,
  getFinancialGoals,
  getFinancialGoalById,
  updateFinancialGoal,
  contributeToGoal,
  deleteFinancialGoal,
};
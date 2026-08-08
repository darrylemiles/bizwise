import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import Category from '../categories/category.model.js';

import {
  getPagination,
  buildPaginationMeta,
} from '../../utils/pagination.js';

const getTransactionBalanceChanges = ({
  type,
  amount,
  account,
  destinationAccount,
}) => {
  const changes = [];

  switch (type) {
    case 'income':
    case 'loan':
    case 'capital':
      changes.push({
        accountId: account,
        delta: amount,
      });
      break;

    case 'expense':
      changes.push({
        accountId: account,
        delta: -amount,
      });
      break;

    case 'transfer':
      changes.push(
        {
          accountId: account,
          delta: -amount,
        },
        {
          accountId: destinationAccount,
          delta: amount,
        }
      );
      break;
  }

  return changes;
};

const updateAccountBalance = async (
  accountId,
  delta,
  session
) => {
  const account = await Account.findById(accountId).session(
    session
  );

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  if (account.balance + delta < 0) {
    const error = new Error(
      `Insufficient balance in account "${account.name}"`
    );

    error.statusCode = 400;

    throw error;
  }

  account.balance += delta;

  await account.save({ session });
};

const validateCategory = async (categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;

    throw error;
  }
};

const validateTransferAccounts = async (
  accountId,
  destinationAccountId
) => {
  if (accountId === destinationAccountId) {
    const error = new Error(
      'Source and destination accounts must be different'
    );

    error.statusCode = 400;

    throw error;
  }

  const [sourceAccount, destinationAccount] =
    await Promise.all([
      Account.findById(accountId),
      Account.findById(destinationAccountId),
    ]);

  if (!sourceAccount) {
    const error = new Error('Source account not found');
    error.statusCode = 404;

    throw error;
  }

  if (!destinationAccount) {
    const error = new Error(
      'Destination account not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return {
    sourceAccount,
    destinationAccount,
  };
};

const createTransaction = async (
  transactionData,
  userId
) => {
  const session = await Transaction.startSession();

  try {
    session.startTransaction();

    const {
      type,
      amount,
      account,
      destinationAccount,
      category,
    } = transactionData;

    await validateCategory(category);

    if (type === 'transfer') {
      await validateTransferAccounts(
        account,
        destinationAccount
      );
    } else {
      const accountExists = await Account.exists({
        _id: account,
      });

      if (!accountExists) {
        const error = new Error('Account not found');
        error.statusCode = 404;

        throw error;
      }
    }

    const transaction = await Transaction.create(
      [
        {
          ...transactionData,
          createdBy: userId,
        },
      ],
      { session }
    );

    const balanceChanges =
      getTransactionBalanceChanges({
        type,
        amount,
        account,
        destinationAccount,
      });

    for (const change of balanceChanges) {
      await updateAccountBalance(
        change.accountId,
        change.delta,
        session
      );
    }

    await session.commitTransaction();

    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getTransactions = async (query) => {
  const {
    page,
    limit,
    skip,
  } = getPagination(query);

  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.account) {
    filter.account = query.account;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};

    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);

      endDate.setHours(23, 59, 59, 999);

      filter.date.$lte = endDate;
    }
  }

  const [transactions, total] =
    await Promise.all([
      Transaction.find(filter)
        .populate('account', 'name type balance')
        .populate(
          'destinationAccount',
          'name type balance'
        )
        .populate('category', 'name')
        .populate('createdBy', 'name username')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Transaction.countDocuments(filter),
    ]);

  return {
    data: transactions,
    pagination: buildPaginationMeta({
      page,
      limit,
      total,
    }),
  };
};

const getTransactionById = async (id) => {
  const transaction =
    await Transaction.findById(id)
      .populate('account', 'name type balance')
      .populate(
        'destinationAccount',
        'name type balance'
      )
      .populate('category', 'name')
      .populate('createdBy', 'name username');

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;

    throw error;
  }

  return transaction;
};

const deleteTransaction = async (id) => {
  const session = await Transaction.startSession();

  try {
    session.startTransaction();

    const transaction =
      await Transaction.findById(id).session(session);

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;

      throw error;
    }

    const balanceChanges =
      getTransactionBalanceChanges({
        type: transaction.type,
        amount: transaction.amount,
        account: transaction.account,
        destinationAccount:
          transaction.destinationAccount,
      });

    // Reverse the original transaction.
    for (const change of balanceChanges) {
      await updateAccountBalance(
        change.accountId,
        -change.delta,
        session
      );
    }

    await transaction.deleteOne({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export default {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
};
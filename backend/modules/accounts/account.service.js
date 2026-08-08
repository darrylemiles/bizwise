import Account from './account.model.js';

import {
  getPagination,
  buildPaginationMeta,
} from '../../utils/pagination.js';

const createAccount = async (accountData) => {
  const existingAccount = await Account.findOne({
    name: accountData.name,
  });

  if (existingAccount) {
    const error = new Error('Account already exists');
    error.statusCode = 409;

    throw error;
  }

  const account = await Account.create(accountData);

  return account;
};

const getAccounts = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  const [accounts, total] = await Promise.all([
    Account.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Account.countDocuments(filter),
  ]);

  return {
    data: accounts,
    pagination: buildPaginationMeta({
      page,
      limit,
      total,
    }),
  };
};

const getAccountById = async (id) => {
  const account = await Account.findById(id);

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;

    throw error;
  }

  return account;
};

const updateAccount = async (id, accountData) => {
  const account = await Account.findById(id);

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;

    throw error;
  }

  if (
    accountData.name &&
    accountData.name !== account.name
  ) {
    const existingAccount = await Account.findOne({
      name: accountData.name,
      _id: { $ne: id },
    });

    if (existingAccount) {
      const error = new Error('Account already exists');
      error.statusCode = 409;

      throw error;
    }
  }

  Object.assign(account, accountData);

  await account.save();

  return account;
};

const deleteAccount = async (id) => {
  const account = await Account.findById(id);

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;

    throw error;
  }

  await account.deleteOne();

  return account;
};

export default {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
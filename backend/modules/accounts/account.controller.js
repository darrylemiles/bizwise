import accountService from './account.service.js';

const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const result = await accountService.getAccounts(
      req.query
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account =
      await accountService.getAccountById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account =
      await accountService.updateAccount(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await accountService.deleteAccount(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
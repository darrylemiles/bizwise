import transactionService from './transaction.service.js';

const createTransaction = async (req, res, next) => {
  try {
    const transaction =
      await transactionService.createTransaction(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result =
      await transactionService.getTransactions(
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

const getTransactionById = async (
  req,
  res,
  next
) => {
  try {
    const transaction =
      await transactionService.getTransactionById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (
  req,
  res,
  next
) => {
  try {
    await transactionService.deleteTransaction(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
};
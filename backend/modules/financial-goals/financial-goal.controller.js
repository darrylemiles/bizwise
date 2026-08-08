import financialGoalService from './financial-goal.service.js';

const createFinancialGoal = async (
  req,
  res,
  next
) => {
  try {
    const goal =
      await financialGoalService.createFinancialGoal(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message:
        'Financial goal created successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

const getFinancialGoals = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await financialGoalService.getFinancialGoals(
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

const getFinancialGoalById = async (
  req,
  res,
  next
) => {
  try {
    const goal =
      await financialGoalService.getFinancialGoalById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

const updateFinancialGoal = async (
  req,
  res,
  next
) => {
  try {
    const goal =
      await financialGoalService.updateFinancialGoal(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        'Financial goal updated successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

const contributeToGoal = async (
  req,
  res,
  next
) => {
  try {
    const goal =
      await financialGoalService.contributeToGoal(
        req.params.id,
        req.body.amount
      );

    res.status(200).json({
      success: true,
      message:
        'Contribution added successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFinancialGoal = async (
  req,
  res,
  next
) => {
  try {
    await financialGoalService.deleteFinancialGoal(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        'Financial goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  createFinancialGoal,
  getFinancialGoals,
  getFinancialGoalById,
  updateFinancialGoal,
  contributeToGoal,
  deleteFinancialGoal,
};
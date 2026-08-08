import reportService from './report.service.js';

const getFinancialReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getFinancialReport(
        req.validated.query
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSalesReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getSalesReport(
        req.validated.query
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getExpenseReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getExpenseReport(
        req.validated.query
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getProductReport(
        req.validated.query
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getInventoryReport();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getOverviewReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getOverviewReport(
        req.validated.query
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getFinancialReport,
  getSalesReport,
  getExpenseReport,
  getProductReport,
  getInventoryReport,
  getOverviewReport,
};
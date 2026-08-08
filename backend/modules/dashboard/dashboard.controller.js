import dashboardService from './dashboard.service.js';

const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const dashboard =
      await dashboardService.getDashboard(
        req.query
      );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboard,
};
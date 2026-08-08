import saleService from './sale.service.js';

const createSale = async (
  req,
  res,
  next
) => {
  try {
    const sale =
      await saleService.createSale(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message:
        'Sale created successfully',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

const getSales = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await saleService.getSales(
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

const getSaleById = async (
  req,
  res,
  next
) => {
  try {
    const sale =
      await saleService.getSaleById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createSale,
  getSales,
  getSaleById,
};
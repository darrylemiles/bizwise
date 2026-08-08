import productService from './product.service.js';

const createProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await productService.createProduct(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await productService.getProducts(
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

const getProductById = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await productService.getProductById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await productService.updateProduct(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await productService.adjustStock(
        req.params.id,
        req.body.quantity,
        req.body.reason,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message:
        'Stock adjusted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    await productService.deleteProduct(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
};
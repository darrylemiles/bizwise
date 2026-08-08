import Product from './product.model.js';
import Category from '../categories/category.model.js';

import {
  getPagination,
  buildPaginationMeta,
} from '../../utils/pagination.js';

const generateSku = async () => {
  const lastProduct = await Product.findOne()
    .sort({ createdAt: -1 })
    .select('sku')
    .lean();

  let nextNumber = 1;

  if (lastProduct?.sku) {
    const match =
      lastProduct.sku.match(
        /^PRD-(\d+)$/
      );

    if (match) {
      nextNumber =
        Number(match[1]) + 1;
    }
  }

  return `PRD-${String(nextNumber).padStart(6, '0')}`;
};

const validateCategory = async (
  categoryId
) => {
  const category =
    await Category.findById(categoryId);

  if (!category) {
    const error = new Error(
      'Category not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return category;
};

const createProduct = async (
  productData
) => {
  await validateCategory(
    productData.category
  );

  const sku = await generateSku();

  const product =
    await Product.create({
      ...productData,
      sku,
    });

  return product;
};

const getProducts = async (query) => {
  const {
    page,
    limit,
    skip,
  } = getPagination(query);

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.$or = [
      {
        name: {
          $regex: query.search,
          $options: 'i',
        },
      },
      {
        sku: {
          $regex: query.search,
          $options: 'i',
        },
      },
    ];
  }

  const [
    products,
    total,
  ] = await Promise.all([
    Product.find(filter)
      .populate(
        'category',
        'name type'
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
  ]);

  return {
    data: products,

    pagination:
      buildPaginationMeta({
        page,
        limit,
        total,
      }),
  };
};

const getProductById = async (
  id
) => {
  const product =
    await Product.findById(id).populate(
      'category',
      'name type'
    );

  if (!product) {
    const error = new Error(
      'Product not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return product;
};

const updateProduct = async (
  id,
  productData
) => {
  const product =
    await Product.findById(id);

  if (!product) {
    const error = new Error(
      'Product not found'
    );

    error.statusCode = 404;

    throw error;
  }

  if (productData.category) {
    await validateCategory(
      productData.category
    );
  }

  Object.assign(
    product,
    productData
  );

  await product.save();

  return product;
};

const adjustStock = async (
  id,
  quantity,
  reason,
  userId
) => {
  const product =
    await Product.findById(id);

  if (!product) {
    const error = new Error(
      'Product not found'
    );

    error.statusCode = 404;

    throw error;
  }

  const newQuantity =
    product.quantity + quantity;

  if (newQuantity < 0) {
    const error = new Error(
      'Insufficient stock'
    );

    error.statusCode = 400;

    throw error;
  }

  product.quantity = newQuantity;

  await product.save();

  return {
    product,

    adjustment: {
      quantity,
      reason,
      adjustedBy: userId,
      adjustedAt: new Date(),
    },
  };
};

const deleteProduct = async (
  id
) => {
  const product =
    await Product.findById(id);

  if (!product) {
    const error = new Error(
      'Product not found'
    );

    error.statusCode = 404;

    throw error;
  }

  await product.deleteOne();

  return product;
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
};
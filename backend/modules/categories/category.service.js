import Category from './category.model.js';

import {
  getPagination,
  buildPaginationMeta,
} from '../../utils/pagination.js';

const createCategory = async (categoryData) => {
  const existingCategory = await Category.findOne({
    name: categoryData.name,
  });

  if (existingCategory) {
    const error = new Error('Category already exists');
    error.statusCode = 409;

    throw error;
  }

  const category = await Category.create(categoryData);

  return category;
};

const getCategories = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),

    Category.countDocuments(filter),
  ]);

  return {
    data: categories,
    pagination: buildPaginationMeta({
      page,
      limit,
      total,
    }),
  };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;

    throw error;
  }

  return category;
};

const updateCategory = async (id, categoryData) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;

    throw error;
  }

  if (
    categoryData.name &&
    categoryData.name !== category.name
  ) {
    const existingCategory = await Category.findOne({
      name: categoryData.name,
      _id: { $ne: id },
    });

    if (existingCategory) {
      const error = new Error('Category already exists');
      error.statusCode = 409;

      throw error;
    }
  }

  Object.assign(category, categoryData);

  await category.save();

  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;

    throw error;
  }

  await category.deleteOne();

  return category;
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
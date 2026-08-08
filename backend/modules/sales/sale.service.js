import mongoose from 'mongoose';

import Sale from './sale.model.js';
import Product from '../products/product.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

const createSale = async (
  saleData,
  userId
) => {
  const session =
    await mongoose.startSession();

  session.startTransaction();

  try {
    const {
      items,
      account: accountId,
      saleDate,
    } = saleData;

    /*
     * Prevent duplicate products inside
     * the same sale.
     */
    const productIds = items.map(
      (item) => item.product
    );

    const uniqueProductIds = new Set(
      productIds
    );

    if (
      uniqueProductIds.size !==
      productIds.length
    ) {
      const error = new Error(
        'A product can only appear once in a sale'
      );

      error.statusCode = 400;

      throw error;
    }

    /*
     * Verify account.
     */
    const account =
      await Account.findById(
        accountId
      ).session(session);

    if (!account) {
      const error = new Error(
        'Account not found'
      );

      error.statusCode = 404;

      throw error;
    }

    /*
     * Get all products involved in
     * the sale.
     */
    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },
      }).session(session);

    if (
      products.length !==
      productIds.length
    ) {
      const error = new Error(
        'One or more products were not found'
      );

      error.statusCode = 404;

      throw error;
    }

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    let totalAmount = 0;
    let totalCost = 0;

    const saleItems = [];

    /*
     * Calculate every item.
     */
    for (const item of items) {
      const product =
        productMap.get(
          item.product.toString()
        );

      /*
       * Check stock.
       */
      if (
        product.quantity <
        item.quantity
      ) {
        const error = new Error(
          `Insufficient stock for ${product.name}`
        );

        error.statusCode = 400;

        throw error;
      }

      const subtotal =
        item.quantity *
        product.sellingPrice;

      const itemCost =
        item.quantity *
        product.costPrice;

      const profit =
        subtotal - itemCost;

      totalAmount += subtotal;
      totalCost += itemCost;

      saleItems.push({
        product: product._id,
        quantity: item.quantity,

        // Snapshot current prices.
        unitPrice:
          product.sellingPrice,

        unitCost:
          product.costPrice,

        subtotal,
        profit,
      });

      /*
       * Deduct inventory.
       */
      product.quantity -=
        item.quantity;

      await product.save({
        session,
      });
    }

    const totalProfit =
      totalAmount - totalCost;

    /*
     * Create the income transaction.
     *
     * IMPORTANT:
     * Adjust these fields if your existing
     * Transaction model uses different names.
     */
    const [
      transaction,
    ] = await Transaction.create(
      [
        {
          type: 'income',

          amount: totalAmount,

          account: accountId,

          description: `Sale - ${saleItems.length} item(s)`,

          transactionDate:
            saleDate
              ? new Date(saleDate)
              : new Date(),

          createdBy: userId,
        },
      ],
      {
        session,
      }
    );

    /*
     * Update account balance.
     *
     * Adjust this if your Account service
     * already handles balance mutations.
     */
    account.balance += totalAmount;

    await account.save({
      session,
    });

    /*
     * Create sale record.
     */
    const [
      sale,
    ] = await Sale.create(
      [
        {
          items: saleItems,

          totalAmount,

          totalCost,

          totalProfit,

          account: accountId,

          transaction:
            transaction._id,

          saleDate:
            saleDate
              ? new Date(saleDate)
              : new Date(),

          createdBy: userId,
        },
      ],
      {
        session,
      }
    );

    await session.commitTransaction();

    /*
     * Return populated sale.
     */
    return Sale.findById(
      sale._id
    )
      .populate(
        'items.product',
        'name sku unit sellingPrice costPrice'
      )
      .populate(
        'account',
        'name type balance'
      )
      .populate(
        'transaction'
      );
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

const getSales = async ({
  page = 1,
  limit = 10,
}) => {
  const currentPage =
    Math.max(Number(page), 1);

  const currentLimit = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const skip =
    (currentPage - 1) *
    currentLimit;

  const [
    sales,
    total,
  ] = await Promise.all([
    Sale.find()
      .populate(
        'items.product',
        'name sku unit'
      )
      .populate(
        'account',
        'name type'
      )
      .populate(
        'createdBy',
        'name username'
      )
      .sort({
        saleDate: -1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Sale.countDocuments(),
  ]);

  return {
    data: sales,

    pagination: {
      page: currentPage,

      limit: currentLimit,

      total,

      totalPages: Math.ceil(
        total / currentLimit
      ),

      hasNextPage:
        currentPage <
        Math.ceil(
          total / currentLimit
        ),

      hasPreviousPage:
        currentPage > 1,
    },
  };
};

const getSaleById = async (
  id
) => {
  const sale =
    await Sale.findById(id)
      .populate(
        'items.product',
        'name sku unit'
      )
      .populate(
        'account',
        'name type balance'
      )
      .populate(
        'transaction'
      )
      .populate(
        'createdBy',
        'name username'
      );

  if (!sale) {
    const error = new Error(
      'Sale not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return sale;
};

export default {
  createSale,
  getSales,
  getSaleById,
};
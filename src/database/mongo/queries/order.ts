import OrderModel, { IOrder } from '../models/order'
import httpErrors from 'http-errors'
import { UpdateQuery } from 'mongoose'

/**
 * Get all orders
 *
 * @returns {Promise<IOrder[]>}
 */
export const getAllOrders = async (): Promise<IOrder[]> => {
  const orders = await OrderModel.find().populate('details.articleId')
  if (!orders) throw new httpErrors.NotFound('Orders not found')

  return orders
}

/**
 * Get one order
 *
 * @param {string} trackingNumber
 * @returns {Promise<IOrder>}
 */
export const getOneOrder = async (trackingNumber: string): Promise<IOrder> => {
  const order = await OrderModel.findById(trackingNumber).populate(
    'details.articleId'
  )
  if (!order) throw new httpErrors.NotFound('Order not found')

  return order
}

/**
 * Get one order by user id
 *
 * @param {string} userId
 * @returns {Promise<IOrder>}
 */
export const getOneOrderByUserId = async (userId: string): Promise<IOrder> => {
  const order = await OrderModel.findOne({ userId }).populate(
    'details.articleId'
  )
  if (!order) throw new httpErrors.NotFound('Order not found')

  return order
}

/**
 * Save order
 *
 * @param {IOrder} order
 * @returns {Promise<IOrder>}
 */
export const saveOrder = async (order: IOrder): Promise<IOrder> => {
  const newOrder = new OrderModel(order)

  return await newOrder.save()
}

/**
 * Update one order
 *
 * @param {string} trackingNumber
 * @param {IOrder} order
 * @returns {Promise<IOrder>}
 */
export const updateOneOrder = async (
  trackingNumber: string,
  order: UpdateQuery<IOrder>
): Promise<any> => {
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    trackingNumber,
    order,
    {
      new: true
    }
  )
  if (!updatedOrder) throw new httpErrors.NotFound('Order not found')

  return updatedOrder
}

/**
 * Cancel one order
 */
export const cancelOneOrder = async (
  trackingNumber: string
): Promise<IOrder> => {
  const order = await OrderModel.findByIdAndUpdate(
    trackingNumber,
    { status: 'cancelled' },
    { new: true }
  )
  if (!order) throw new httpErrors.NotFound('Order not found')

  return order
}

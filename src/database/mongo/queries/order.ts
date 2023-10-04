import OrderModel, { IOrder } from '../models/order'
import httpErrors from 'http-errors'
import { UpdateQuery } from 'mongoose'
import ArticleModel from '../models/article'
import { getAllArticlesByID } from './article'

/**
 * Get all orders
 */
export const getAllOrders = async () => {
  const orders = await OrderModel.find().populate('details.articleId')
  if (!orders) throw new httpErrors.NotFound('Orders not found')

  return orders
}

/**
 * Get one order
 *
 * @param {string} trackingNumber
 */
export const getOneOrder = async (trackingNumber: string) => {
  const order =
    await OrderModel.findById(trackingNumber).populate('details.articleId')
  if (!order) throw new httpErrors.NotFound('Order not found')

  return order
}

/**
 * Get one order by user id
 *
 * @param {string} userId
 */
export const getOneOrderByUserId = async (userId: string) => {
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
 */
export const saveOrder = async (order: IOrder): Promise<IOrder> => {
  const newOrder = new OrderModel(order)

  const savedOrder = await newOrder.save()
  if (!savedOrder) throw new httpErrors.InternalServerError('Order not saved')

  // Update order article stock
  try {
    const populatedOrder =
      await savedOrder.populate<IOrder>('details.articleId')

    const articleIds: string[] = Object.values(populatedOrder.details).map(
      detail => detail.articleId._id.toString()
    )

    const articles = await getAllArticlesByID(articleIds)
    if (articles.length === 0)
      throw new httpErrors.InternalServerError('Articles not found')

    articles.map(async article => {
      const detail = populatedOrder.details.find(
        det => det.articleId.id === article.id
      )
      if (!detail) throw new httpErrors.InternalServerError('Detail not found')

      const updatedArticle = await ArticleModel.findByIdAndUpdate(
        article._id,
        {
          $inc: { qtyStock: -detail.quantity }
        },
        { new: true }
      )
      if (!updatedArticle)
        throw new httpErrors.InternalServerError('Article not updated')
    })
  } catch (error) {
    throw new httpErrors.InternalServerError('Order not saved')
  }

  return savedOrder
}

/**
 * Update one order
 *
 * @param {string} trackingNumber
 * @param {IOrder} order
 */
export const updateOneOrder = async (
  trackingNumber: string,
  order: UpdateQuery<IOrder>
) => {
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

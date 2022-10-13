import ArticleModel, { IArticle } from '../models/article'
import { HydratedDocument } from 'mongoose'

/**
 * It saves an article to the database
 * @returns A promise that resolves to the saved article
 */
export const saveArticle: (
  article: IArticle
) => Promise<HydratedDocument<IArticle>> = async article => {
  const savedArticle = new ArticleModel(article)

  await savedArticle.save()

  return savedArticle
}

/**
 * It gets an article by its ID
 * @returns found article
 */
export const getArticleByID: (
  id: string
) => Promise<HydratedDocument<IArticle>> = async id => {
  const articles = await ArticleModel.find({ id, isDeleted: false })

  return articles[0]
}

/**
 * It gets all articles by its ID
 * @returns found articles
 */
export const getAllArticlesByID: (
  ids: string[]
) => Promise<HydratedDocument<IArticle>[]> = async ids => {
  const articles = await ArticleModel.find({
    id: { $in: ids },
    isDeleted: false
  })

  return articles
}

/**
 * It gets all articles
 * @returns found articles
 */
export const getAllArticles: () => Promise<
  HydratedDocument<IArticle>[]
> = async () => {
  const articles = await ArticleModel.find({ isDeleted: false })

  return articles
}

/**
 * It removes an article by its ID (soft delete)
 * @returns found article
 */
export const removeArticleByID: (
  id: string
) => Promise<HydratedDocument<IArticle> | null> = async id => {
  const article = await ArticleModel.findOneAndUpdate(
    { id },
    { isDeleted: true }
  )

  return article
}

/**
 * It updates an article if is not deleted by its ID
 * @returns updated article
 */
export const updateOneArticle: (
  id: string,
  article: IArticle
) => Promise<HydratedDocument<IArticle> | null> = async (id, article) => {
  const updatedArticle = await ArticleModel.findOneAndUpdate(
    { id, isDeleted: false },
    article,
    {
      new: true
    }
  )

  return updatedArticle
}

/**
 * It returns the first article that matches the query
 * @param {Object} query - The query object that will be used to find the article.
 * @returns found article
 */
export const getOneArticle: (
  query: object
) => Promise<HydratedDocument<IArticle>> = async query => {
  const articles = await ArticleModel.find(query)
  return articles[0]
}

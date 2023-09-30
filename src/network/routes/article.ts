import { Router } from 'express'
import auth from './utils/auth'
import {
  articleIDSchema,
  storeArticleSchema,
  updateArticleSchema
} from '../../schemas/article'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import ArticleRepository from '../../repositories/article'
import { IArticle } from '../../database/mongo/models/article'
import { ARTICLE_UNITIES_ENUM } from '../../utils/article'

const ArticleRouter = Router()

ArticleRouter.route('/article')
  .get(async (_req, res, next) => {
    try {
      const articleRepository = new ArticleRepository()

      response({
        error: false,
        message: await articleRepository.getAllArticles(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })
  .post(
    validatorCompiler(storeArticleSchema, 'body'),
    auth.verifyByRole('salesman'),
    async (req, res, next) => {
      try {
        /* eslint-disable */
        const {
          body: {
            sku,
            title,
            shortDescription,
            unity = ARTICLE_UNITIES_ENUM.ea,
            qtyStock = 0,
            unitPrice = 0,
            isVirtual = false,
            isAvailable = true
          }
        } = req

        const articleRepository = new ArticleRepository({
          sku,
          title,
          shortDescription,
          unity,
          qtyStock,
          unitPrice,
          isVirtual,
          isAvailable
        })

        response({
          error: false,
          message: await articleRepository.saveArticle(),
          res,
          status: 201
        })
      } catch (error) {
        next(error)
      }
    }
  )

ArticleRouter.route('/article/:id')
  .get(validatorCompiler(articleIDSchema, 'params'), async (req, res, next) => {
    const {
      params: { id }
    } = req

    try {
      const articleRepository = new ArticleRepository({ id })

      response({
        error: false,
        message: await articleRepository.getArticleByID(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })
  .delete(
    validatorCompiler(articleIDSchema, 'params'),
    auth.verifyByRole('salesman'),
    async (req, res, next) => {
      try {
        const {
          params: { id }
        } = req
        const articleRepository = new ArticleRepository({ id })

        response({
          error: false,
          message: (await articleRepository.removeArticleByID()) as IArticle,
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .patch(
    validatorCompiler(articleIDSchema, 'params'),
    validatorCompiler(updateArticleSchema, 'body'),
    auth.verifyByRole('salesman'),
    async (req, res, next) => {
      const {
        /* eslint-disable */
        body: {
          sku,
          title,
          shortDescription,
          unity,
          qtyStock,
          unitPrice,
          isVirtual,
          isAvailable
        },
        params: { id }
      } = req

      try {
        const articleRepository = new ArticleRepository({
          id,
          title,
          shortDescription,
          unity,
          qtyStock,
          unitPrice,
          isVirtual,
          isAvailable
        })

        response({
          error: false,
          message: (await articleRepository.updateOneArticle()) as IArticle,
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
export default ArticleRouter

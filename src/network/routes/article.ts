import { Router } from 'express'
import auth from './utils/auth'
import {
  articleIDSchema,
  storeArticleSchema,
  updateArticleSchema
} from '../../schemas/article'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import ArticleService from '../../services/article'
import { IArticle } from '../../database/mongo/models/article'

const ArticleRouter = Router()

ArticleRouter.route('/article')
  .get(async (req, res, next) => {
    try {
      const articleService = new ArticleService()

      response({
        error: false,
        message: await articleService.getAllArticles(),
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
        const {
          body: {
            sku,
            title,
            shortDescription,
            unity,
            qtyStock,
            unitPrice,
            isVirtual,
            isAvailable
          }
        } = req

        const articleService = new ArticleService({
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
          message: await articleService.saveArticle(),
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
      const articleService = new ArticleService({ id })

      response({
        error: false,
        message: await articleService.getArticleByID(),
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
        const articleService = new ArticleService({ id })

        response({
          error: false,
          message: (await articleService.removeArticleByID()) as IArticle,
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
        body: {
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
        const articleService = new ArticleService({ id })

        response({
          error: false,
          message: (await articleService.updateOneArticle()) as IArticle,
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

export default ArticleRouter

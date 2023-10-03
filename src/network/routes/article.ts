/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Router } from 'express'
import { verifyByRole } from './utils/auth'
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

type ArticleRequest = Request<
  { id: string },
  Record<string, never>,
  {
    sku: string
    title: string
    shortDescription: string
    unity: string
    qtyStock: number
    unitPrice: number
    isVirtual: boolean
    isAvailable: boolean
  }
>

const ArticleRouter: Router = Router()

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
    verifyByRole('salesman'),
    async (req: ArticleRequest, res, next) => {
      try {
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
    verifyByRole('salesman'),
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
    verifyByRole('salesman'),
    async (req: ArticleRequest, res, next) => {
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

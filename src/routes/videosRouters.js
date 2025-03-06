import express from 'express'
import checkToken from '../middlewares/checkToken.js'
import VideoController from '../controllers/videoController.js'
import multer from 'multer'

const routes = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

routes.get('/auth/videos', checkToken, VideoController.getVideos)
routes.get('/auth/video/:id', checkToken, VideoController.getVideo)
routes.post('/auth/uploadVideo', checkToken, upload.single('videoFile'), VideoController.uploadVideo)
routes.get('/auth/downloadVideo/:id', checkToken, VideoController.donwloadVideo)

export default routes
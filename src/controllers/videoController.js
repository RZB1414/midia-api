import { videoFiles } from '../config/dbConnect.js'
import mongoose from 'mongoose';

class VideoController {
    
    static async getVideos(req, res) {
        try {
            const videos = await videoFiles.find({}).toArray()
            if (!videos || videos.length === 0) {
                return res.status(200).json({ msg: "No videos found" });
            }
            res.status(200).json(videos);
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async getVideo(req, res) {
        const { id } = req.params
        try {
            const videoFound = await videoFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            res.status(200).json(videoFound)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async uploadVideo(req, res) {

        const { videoName, description, marker, userId } = req.body  
        console.log(req.body);
              
        if (!videoName) {
            return res.status(400).send('Name is required')
        }

        const videoFile = req.file
        if (!videoFile) {
            return res.status(400).send('File is required')
        }

        try {
            const uploadStream = videoFiles.openUploadStream(videoName, {
                contentType: videoFile.mimetype,
                metadata: { 
                description: description,
                marker: marker,
                userId: userId
                }
            })

            uploadStream.end(videoFile.buffer)
            uploadStream.on('finish', () => {
                res.status(200).send('File uploaded successfully')
            })            

            uploadStream.on('error', (error) => {
                res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
            })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async donwloadVideo(req, res) {
        const { id } = req.params
        try {
            const videoFound = await videoFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            if (!videoFound){
                return res.status(404).send('Video not found')
            }
            const video = videoFound[0]
            const downloadStream = videoFiles.openDownloadStream(video._id)
            res.set('Content-Type', video.contentType || 'video/mp4')
            res.set({
                'Content-Disposition': `attachment; filename="${video.filename}"`,
                'Content-Length': video.length,
                'Content-Type': video.contentType || 'video/mp4',
                'Description': video.metadata.description || '',
                'Marker': video.metadata.marker || '',
                'UserId': video.metadata.userId || ''
            })
            console.log(video);
            
            downloadStream.pipe(res)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }
}

export default VideoController
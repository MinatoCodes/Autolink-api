const express = require('express');
   const axios = require('axios');
   const fs = require('fs').promises;
   const path = require('path');
   const { ttdl, fbdown, twitter, youtube } = require('btch-downloader');

   const app = express();
   const port = process.env.PORT || 3000;

   // Middleware to parse JSON requests
   app.use(express.json());

   // Health check endpoint for monitoring
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
   });

   // Helper function to download video from URL
   async function downloadVideo(videoUrl, outputPath) {
     try {
       const response = await axios({
         url: videoUrl,
         method: 'GET',
         responseType: 'stream',
         timeout: 10000, // 10-second timeout for download
       });
       const writer = require('fs').createWriteStream(outputPath);
       response.data.pipe(writer);
       return new Promise((resolve, reject) => {
         writer.on('finish', resolve);
         writer.on('error', reject);
       });
     } catch (error) {
       throw new Error(`Failed to download video: ${error.message}`);
     }
   }

   // Generic handler for downloading videos
   const downloadHandler = async (req, res, downloader, platform) => {
     try {
       const { url } = req.body;
       if (!url) {
         return res.status(400).json({ error: 'URL is required' });
       }

       // Fetch video data
       const data = await downloader(url);
       if (!data.video || !data.video[0]) {
         return res.status(404).json({ error: `No video found for ${platform} URL` });
       }

       const videoUrl = data.video[0];
       const outputPath = path.join('/tmp', `temp_video_${Date.now()}.mp4`);

       // Download the video
       await downloadVideo(videoUrl, outputPath);

       // Send the file
       res.download(outputPath, 'video.mp4', async (err) => {
         if (err) {
           console.error(`Error sending ${platform} file:`, err);
           res.status(500).json({ error: `Failed to send ${platform} video` });
         }
         // Clean up the temporary file
         try {
           await fs.unlink(outputPath);
         } catch (cleanupError) {
           console.error(`Error cleaning up ${platform} file:`, cleanupError);
         }
       });
     } catch (error) {
       console.error(`${platform} error:`, error);
       res.status(500).json({ error: `Failed to process ${platform} video`, details: error.message });
     }
   };

   // Endpoint for TikTok video download
   app.post('/api/tiktok', (req, res) => downloadHandler(req, res, ttdl, 'TikTok'));

   // Endpoint for Facebook video download
   app.post('/api/facebook', (req, res) => downloadHandler(req, res, fbdown, 'Facebook'));

   // Endpoint for Twitter video download
   app.post('/api/twitter', (req, res) => downloadHandler(req, res, twitter, 'Twitter'));

   // Endpoint for YouTube video download
   app.post('/api/youtube', (req, res) => downloadHandler(req, res, youtube, 'YouTube'));

   // Start the server
   app.listen(port, () => {
     console.log(`Server running at http://localhost:${port}`);
   });

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { ttdl, fbdown, twitter, youtube } = require('btch-downloader');

const app = express();
const port = process.env.PORT || 10000;

// Middleware to parse JSON requests
app.use(express.json());

// Helper function to download video from URL
async function downloadVideo(videoUrl, outputPath) {
  const response = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'stream',
  });
  const writer = require('fs').createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Endpoint for TikTok video download
app.post('/api/tiktok', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await ttdl(url);
    if (!data.video || !data.video[0]) {
      return res.status(404).json({ error: 'No video found' });
    }
    const videoUrl = data.video[0];
    const outputPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
    
    // Download the video
    await downloadVideo(videoUrl, outputPath);
    
    // Send the file
    res.download(outputPath, 'video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send video' });
      }
      // Clean up the temporary file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process TikTok video', details: error.message });
  }
});

// Endpoint for Facebook video download
app.post('/api/facebook', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await fbdown(url);
    if (!data.video || !data.video[0]) {
      return res.status(404).json({ error: 'No video found' });
    }
    const videoUrl = data.video[0];
    const outputPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
    
    // Download the video
    await downloadVideo(videoUrl, outputPath);
    
    // Send the file
    res.download(outputPath, 'video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send video' });
      }
      // Clean up the temporary file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process Facebook video', details: error.message });
  }
});

// Endpoint for Twitter video download
app.post('/api/twitter', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await twitter(url);
    if (!data.video || !data.video[0]) {
      return res.status(404).json({ error: 'No video found' });
    }
    const videoUrl = data.video[0];
    const outputPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
    
    // Download the video
    await downloadVideo(videoUrl, outputPath);
    
    // Send the file
    res.download(outputPath, 'video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send video' });
      }
      // Clean up the temporary file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process Twitter video', details: error.message });
  }
});

// Endpoint for YouTube video download
app.post('/api/youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await youtube(url);
    if (!data.video || !data.video[0]) {
      return res.status(404).json({ error: 'No video found' });
    }
    const videoUrl = data.video[0];
    const outputPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
    
    // Download the video
    await downloadVideo(videoUrl, outputPath);
    
    // Send the file
    res.download(outputPath, 'video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send video' });
      }
      // Clean up the temporary file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process YouTube video', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

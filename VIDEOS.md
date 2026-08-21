# Video Compression Instructions

The original video files are too large for GitHub (307MB max file). Here's how to compress them:

## Current Video Sizes:
- `cctv-construction-zone.mp4` - 60MB ✓ (under limit)
- `city_drone_.mp4` - 307MB ✗ (needs compression)
- `people_walking_official.mp4` - 124MB ✗ (needs compression)

## Option 1: Online Compression (Easiest)
1. Go to https://www.freeconvert.com/video-compressor or https://www.ps2pdf.com/compress-mp4
2. Upload each video file
3. Choose target size: ~80MB for each
4. Download compressed versions
5. Replace the files in `/videos/` folder
6. Run: `git add videos/*.mp4 && git commit -m "Add compressed videos" && git push`

## Option 2: Install FFmpeg and Compress Locally
1. Download FFmpeg: https://www.gyan.dev/ffmpeg/builds/
2. Extract and add to PATH
3. Run these commands:

```bash
# Compress city_drone_.mp4 (307MB → ~80MB)
ffmpeg -i "/c/Users/swaga/Downloads/New folder/city_drone_.mp4" \
  -vcodec libx264 -crf 28 -preset medium \
  "/c/Users/swaga/dataglif-site/videos/city_drone_.mp4"

# Compress people_walking_official.mp4 (124MB → ~80MB)
ffmpeg -i "/c/Users/swaga/Downloads/New folder/people_walking_official.mp4" \
  -vcodec libx264 -crf 26 -preset medium \
  "/c/Users/swaga/dataglif-site/videos/people_walking_official.mp4"

# Copy the smaller file as-is
cp "/c/Users/swaga/Downloads/New folder/cctv-construction-zone.mp4" \
  "/c/Users/swaga/dataglif-site/videos/cctv-construction-zone.mp4"
```

## Option 3: Use GitHub Releases (No Compression Needed)
1. Go to: https://github.com/swagat69/dataglif-site/releases/new
2. Create a new release (e.g., "v1.0-assets")
3. Upload all 3 video files as release assets
4. Update `index.html` video sources to use the release URLs

After compressing and uploading, the site will work perfectly!

**Current Status:** Site is live at https://swagat69.github.io/dataglif-site/ but videos won't load until added.

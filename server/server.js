const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GET /api/folders/:id/media - List media in a folder
app.get('/api/folders/:id/media', (req, res) => {
  const { id } = req.params;
  db.get('SELECT path FROM folders WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Folder not found' });

    const folderPath = row.path;
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Physical folder path does not exist.' });
    }

    fs.readdir(folderPath, (err, files) => {
      if (err) return res.status(500).json({ error: err.message });

      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm'];
      const media = files
        .filter(file => mediaExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => {
          const extension = path.extname(file).toLowerCase();
          const type = ['.mp4', '.webm'].includes(extension) ? 'video' : 'image';
          return {
            name: file,
            type: type,
            streamUrl: `/stream?path=${encodeURIComponent(path.join(folderPath, file))}`
          };
        });

      res.json(media);
    });
  });
});

// GET /stream - Stream a media file
app.get('/stream', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send('Path is required');

  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const extension = path.extname(filePath).toLowerCase();
  const isVideo = ['.mp4', '.webm'].includes(extension);

  let contentType = 'application/octet-stream';
  if (extension === '.jpg' || extension === '.jpeg') contentType = 'image/jpeg';
  else if (extension === '.png') contentType = 'image/png';
  else if (extension === '.gif') contentType = 'image/gif';
  else if (extension === '.webp') contentType = 'image/webp';
  else if (extension === '.mp4') contentType = 'video/mp4';
  else if (extension === '.webm') contentType = 'video/webm';

  if (isVideo && range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// GET /api/folders - List all folders
app.get('/api/folders', (req, res) => {
  db.all('SELECT * FROM folders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/folders - Add a new folder
app.post('/api/folders', (req, res) => {
  const { name, path: folderPath } = req.body;
  if (!name || !folderPath) {
    return res.status(400).json({ error: 'Name and path are required' });
  }

  // Basic check if path exists
  if (!fs.existsSync(folderPath)) {
    return res.status(400).json({ error: 'The provided path does not exist on this machine.' });
  }

  db.run('INSERT INTO folders (name, path) VALUES (?, ?)', [name, folderPath], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, path: folderPath });
  });
});

// DELETE /api/folders/:id - Remove a folder
app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM folders WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Deleted successfully', changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

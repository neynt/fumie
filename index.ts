import express from 'express';
import http from 'http';
import multer from 'multer';
import child_process from 'child_process';
import path from 'path';

const app = express();
const server = new http.Server(app);
const base_url = 'https://i.neynt.ca/'
const upload = multer({ dest: '/tmp/fumie-uploads/' });

app.use(express.static('public'))
server.listen(8080, () => {
  console.log('Listening on :8080');
});

app.post('/upload', upload.single('image'), (req, res, next) => {
  const child = child_process.execFile(
    'python3',
    ['fumie.py', req.file.path, path.extname(req.file.originalname), '/home/neynt/i.neynt.ca/'],
    (error, stdout, stderr) => {
      console.log(stdout.trim());
      res.send(`${base_url}${stdout}`);
    },
  );
});

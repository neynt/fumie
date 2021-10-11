import express from 'express';
import http from 'http';
import multer from 'multer';
import child_process from 'child_process';
import path from 'path';
import config from './config';

const app = express();
const server = new http.Server(app);
const upload = multer({ dest: '/tmp/fumie-uploads/' });

app.use(express.static('public'))
server.listen(config.port, () => {
  console.log(`Listening on :${config.port}`);
});

function spawn(command: string, args: string[]): Promise<any> {
  return new Promise(resolve => {
    const child = child_process.spawn(command, args);
    const stdout : any[] = [];
    const stderr : any[] = [];
    child.stdout.on('data', data => {
      stdout.push(data);
    });
    child.stderr.on('data', data => {
      stderr.push(data);
    });
    child.on('close', _code => {
      if (stderr.length > 0) {
        console.log(stderr.join(''));
      }
      resolve(stdout.join(''));
    });
  });
}

app.post('/upload', upload.single('file'), async (req, res, _next) => {
  if (!req.file) {
    res.send('nothing uploaded');
    return;
  }
  const origin = req.headers.origin;
  if (!origin) {
    res.send('where are you from?');
    return;
  }
  if (!config.allowed_origins.has(origin)) {
    res.send('idk');
    return;
  }
  const tmp_file = req.file.path;
  const ext = path.extname(req.file.originalname) || '.txt';
  const hash = (await spawn('sha256sum', [tmp_file])).split(/(\s+)/)[0];
  const dest_file = config.file_root + hash + ext;
  console.log(req.headers);
  console.log(`${req.file.originalname} uploaded to ${dest_file}`);
  await spawn('mv', [tmp_file, dest_file]);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.send(`${config.base_url}${hash}${ext}`);
});

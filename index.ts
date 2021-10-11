import express from 'express';
import http from 'http';
import multer from 'multer';
import child_process from 'child_process';
import path from 'path';

const app = express();
const server = new http.Server(app);
const port = 8090;
const base_url = 'https://i.neynt.ca/'
const upload = multer({ dest: '/tmp/fumie-uploads/' });
const file_root = '/blk/neynt/i.neynt.ca/'

app.use(express.static('public'))
server.listen(port, () => {
  console.log(`Listening on :${port}`);
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

app.post('/upload', upload.single('image'), async (req, res, _next) => {
  if (!req.file) {
    console.log('no file uploaded');
    res.send('no file uploaded');
  }
  const tmp_file = req.file.path;
  const ext = path.extname(req.file.originalname) || '.txt';
  const hash = (await spawn('sha256sum', [tmp_file])).split(/(\s+)/)[0];
  const dest_file = file_root + hash + ext;
  console.log(`${req.file.originalname} uploaded to ${dest_file}`);
  await spawn('mv', [tmp_file, dest_file]);
  res.send(`${base_url}${hash}${ext}`);
});

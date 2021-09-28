const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const helmet = require('helmet');
const AWS = require('aws-sdk');
const shortid = require('shortid');
const extract = require('png-chunks-extract');
const text = require('png-chunk-text');
const fetch = require('node-fetch');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const {
  SERVER_PORT,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_REGION,
  S3_BUCKET,
  S3_KEY_PREFIX,
  S3_KEY_PREFIX_UPLOADS,
  CDN_DOMAIN,
  S3_DOMAIN,
} = process.env;

const app = express();
const corsOptions = {
  origin: 'http://localhost:3001',
};

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});
const s3 = new AWS.S3();

app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

const week = 604800000; // ms
app.use(
  session({
    secret: 'my_secret',
    resave: false,
    saveUninitialized: false,
    name: 'id',
    cookie: {
      maxAge: week,
    },
    store: new MemoryStore({
      checkPeriod: week,
      ttl: week,
    }),
  })
);

app.use(express.static(path.join(__dirname, '../build'), { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.post('/image', async (req, res) => {
  const imageBase64 = req.body.imageUri.replace('data:image/png;base64,', '');
  const imageData = Buffer.from(imageBase64, 'base64');
  console.log(imageData);

  const cleanedFilename = cleanFilename(req.body.filename); // eslint-disable-line
  const type = req.body.type === 'coupon' ? '' : '_starburst';
  const completeFilename = `${cleanedFilename}_${getFormattedDate()}${type}_${shortid.generate()}.png`; // eslint-disable-line
  console.log(completeFilename);

  const params = {
    Bucket: S3_BUCKET,
    Key: S3_KEY_PREFIX + completeFilename,
    Body: imageData,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'image/png',
  };

  s3.upload(params, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

app.post('/upload', (req, res) => {
  const { files } = req.body;

  const promises = files.map((file) => {
    const imageBase64 = file.imageUri.replace(/data:.*;base64,/, '');
    const imageData = Buffer.from(imageBase64, 'base64');
    const cleanedFilename = cleanFilename(file.filename); // eslint-disable-line
    const completeFilename = `${cleanedFilename}_${getFormattedDate()}_${shortid.generate()}.${file.extension}`; // eslint-disable-line
    console.log(completeFilename);

    let keyPrefix = S3_KEY_PREFIX_UPLOADS;
    if (file.contentType === 'image/png') {
      try {
        const chunks = extract(imageData);
        const textChunks = chunks
          .filter((chunk) => chunk.name === 'tEXt')
          .map((chunk) => text.decode(chunk.data));

        if (
          textChunks[0] &&
          textChunks[0].keyword &&
          textChunks[0].keyword === 'couponator'
        ) {
          keyPrefix = S3_KEY_PREFIX;
        }
      } catch {
        const err = new Error();
        // eslint-disable-next-line
        err.message = 'The file header is incorrect. Try resaving the file as the file type you intend.';
        err.type = 'BAD_HEADER';
        err.file = file.filename;
        return Promise.reject(err);
      }
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: keyPrefix + completeFilename,
      Body: imageData,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: file.contentType,
    };

    return s3.upload(params).promise();
  });

  Promise.allSettled(promises)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post('/getStateFromImage', async (req, res) => {
  let { url } = req.body;

  // validate we have a legitimate Couponator image
  if (!url.endsWith('.png')) {
    return res.json({
      type: 'error',
      // eslint-disable-next-line
      message: 'Invalid file type. Please provide a Couponator URL ending in .png.'
    });
  }
  if (!url.includes(CDN_DOMAIN) && !url.includes(S3_DOMAIN)) {
    return res.json({
      type: 'error',
      message: 'Are you sure this is a Couponator image?',
    });
  }
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  // the tEXt chunks in the PNG file don't show up sometimes when getting the CDN version
  // (probably something to do with CDN serving WebP??)
  // get the file straight from S3
  if (url.includes(`https://${CDN_DOMAIN}/`)) {
    // eslint-disable-next-line
    url = url.replace(`https://${CDN_DOMAIN}/`, `https://${S3_DOMAIN}`);
  }

  const imageFile = await fetch(url);
  const buffer = await imageFile.buffer();
  const base64 = buffer.toString('base64');

  const imageData = Buffer.from(base64, 'base64');
  try {
    const chunks = extract(imageData);
    const textChunks = chunks
      .filter((chunk) => chunk.name === 'tEXt')
      .map((chunk) => text.decode(chunk.data));

    if (
      textChunks[0]?.keyword === 'couponator' &&
      textChunks[1]?.keyword === 'encodedState'
    ) {
      // eslint-disable-next-line
      const decodedState = decodeURIComponent(Buffer.from(textChunks[1].text, 'base64').toString());
      const jsonState = JSON.parse(decodedState);
      return res.json({ type: 'success', data: jsonState });
    }
  } catch {
    return res.json({
      type: 'error',
      message: 'Invalid image.',
    });
  }

  res.json({
    type: 'error',
    message: `No data found from this file. It's either not a Couponator image or it's older than October 2020.`,
  });
});

const cleanFilename = (filename) => {
  const cleanedFilename = filename
    .replace(/\s|-/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');
  return cleanedFilename;
};

const getFormattedDate = () => {
  const dateParts = Intl.DateTimeFormat('en-us', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  return dateParts[4].value + dateParts[0].value + dateParts[2].value;
};

if (process.env.NODE_ENV !== 'production') {
  const credentials = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.cert')),
  };
  https
    .createServer(credentials, app)
    .listen(SERVER_PORT, () =>
      console.log(`Listening on port ${SERVER_PORT}...`)
    );
} else {
  app.listen(SERVER_PORT, () =>
    console.log(`Listening on port ${SERVER_PORT}...`)
  );
}

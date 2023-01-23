const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const{ nanoid }  = require('nanoid');
const monk = require('monk');
require('dotenv').config;

const {
  MONGO_URI = '',
} = process.env;

const db = monk(MONGO_URI);
const urls = db.get('urls');
urls.createIndex('slug');


const app = express();


app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));



const schema = yup.object().shape({
  slug: yup.string().trim().matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.get('/:id', async (req, res) => {
  // TODO: redirect url

  const { id: slug } = req.params;

  try {
    const url = await urls.findOne({ slug });
    if(url){
      res.redirect(url.url)
    }
    res.redirect(`/?error=${slug} not found`);
  } catch (error) {
    res.redirect(`/?error=Link not found`);
  }
})

app.post('/url', async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if(!slug){
      slug = nanoid(5);
    }
    else {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use 🍔");
      }
    }
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🍥' : error.stack,
  })
});

const port = process.env.PORT || 1337;

app.listen(port, ()=>{
  console.log(`Listening at http://localhost:${port}`);
});
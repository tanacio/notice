var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Discord Bot のアクセストークンとチャンネルIDの環境変数
require('dotenv').config();
const mailFrom = process.env.MAIL_FROM;
const mailPass = process.env.MAIL_PASS;
const mailTo = process.env.MAIL_TO;
const targetSite = process.env.TARGET_SITE;

let previousContent = ''; // 前回の内容を保存する変数

// メール送信の設定
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailFrom,
    pass: mailPass
  }
});

// メール送信関数
const sendEmail = (subject, text) => {
  const mailOptions = {
    from: mailFrom,
    to: mailTo,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// 定期チェック関数
const checkWebsite = async () => {
  try {
    const response = await axios.get(targetSite);
    const $ = cheerio.load(response.data);
    
    // 比較する特定の部分を選択（例：メインコンテンツ）
    let currentContent = $('body').text().trim(); // メインコンテンツを選択

    // 余分な空白や改行を削除
    currentContent = currentContent.replace(/\s+/g, ' ');

    if (previousContent && previousContent !== currentContent) {
      console.log('Content has changed!');
      sendEmail('Website Content Changed', 'The content of the website has changed.');
    } else {
      console.log('No changes detected.');
    }

    previousContent = currentContent; // 内容を更新
  } catch (error) {
    console.log('Error fetching website:', error);
  }
};

// 一定時間ごとにチェック
setInterval(checkWebsite, 20000); // 120秒ごとにチェック

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
